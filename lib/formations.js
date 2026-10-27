// Turns plain-text study notes (ALL-CAPS headings, "====" rulers, aligned
// columns, hard-wrapped lines) into clean Markdown for <TxtReader />.
// Notes that are already real Markdown are passed through untouched.

const CALLOUTS = {
  IMPORTANT: "Important",
  NOTE: "Note",
  TIP: "Tip",
  REMEMBER: "Remember",
  WARNING: "Warning",
  HINT: "Hint",
};

const RULER = /^\s*([=\-_*~#])\1{2,}\s*$/; // ====  ----  ____  ****
const BULLET = /^\s*[-•*●▪]\s+(.*)$/;
const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/;
const SUBSECTION = /^\s*\d+\.\d+(?:\.\d+)*[.)]?\s+(.+)$/;
const SECTION = /^\s*\d+[.)]\s+(.+)$/;

// no lowercase letters, at least 3 letters, not too long
const isCaps = (s) => /[A-Z]{2}/.test(s) && !/[a-z]/.test(s) && s.length <= 90;

const escapeInline = (s) => s.replace(/([\\`*_])/g, "\\$1");

function looksLikeMarkdown(text) {
  return /^#{1,6}\s+\S/m.test(text) || /\*\*[^*\n]+\*\*/.test(text) || /^\s*\|.+\|\s*$/m.test(text);
}

function splitCells(line) {
  return line.trim().split(/\s{2,}|\t+/).map((c) => c.trim()).filter((c) => c !== "");
}

function toTable(rows) {
  const n = rows[0].length;
  const cell = (c) => escapeInline(c === "-" ? "–" : c).replace(/\|/g, "\\|");
  const out = [];
  out.push("| " + rows[0].map(cell).join(" | ") + " |");
  out.push("| " + rows[0].map(() => "---").join(" | ") + " |");
  for (const r of rows.slice(1)) out.push("| " + r.map(cell).join(" | ") + " |");
  return out;
}

function isTableBlock(lines) {
  if (lines.length < 2) return null;
  const rows = lines.map(splitCells);
  const n = rows[0].length;
  if (n < 2) return null;
  if (!rows.every((r) => r.length === n)) return null;
  // header should not look like a sentence or a list item
  if (lines.some((l) => BULLET.test(l) || NUMBERED.test(l))) return null;
  return rows;
}

export function formatNotes(raw) {
  if (typeof raw !== "string") return "";
  let text = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\t/g, "    ");

  if (looksLikeMarkdown(text)) return text;

  // 1. Remove rulers, then split into blocks separated by blank lines.
  const lines = text.split("\n").map((l) => (RULER.test(l) ? "" : l.replace(/\s+$/, "")));
  const blocks = [];
  let cur = [];
  for (const l of lines) {
    if (l.trim() === "") {
      if (cur.length) blocks.push(cur), (cur = []);
    } else cur.push(l);
  }
  if (cur.length) blocks.push(cur);

  const out = [];
  const push = (...ls) => {
    out.push(...ls, "");
  };
  let seenTitle = false;
  let formulaNext = false;

  for (let block of blocks) {
    // 2. Table (aligned columns).
    const rows = isTableBlock(block);
    if (rows) {
      push(...toTable(rows));
      formulaNext = false;
      continue;
    }

    // 3. Walk the lines of the block.
    const codeThisBlock = formulaNext; // set by a "FORMULA:" label in the previous block
    formulaNext = false;
    let i = 0;
    const para = []; // consecutive plain lines
    const flushPara = () => {
      if (!para.length) return;
      // "Working out": any line starting with "=" -> monospace block
      if (para.some((l) => /^\s*=/.test(l)) || codeThisBlock) {
        push("```", ...para.map((l) => l.trim()), "```");
      } else {
        push(para.map((l, idx) => escapeInline(l.trim()) + (idx < para.length - 1 ? "  " : "")).join("\n"));
      }
      para.length = 0;
    };

    while (i < block.length) {
      const line = block[i];
      const t = line.trim();

      // Title (first line of file, all caps)
      if (!seenTitle) {
        seenTitle = true;
        if (isCaps(t) && !NUMBERED.test(t) && !/:$/.test(t)) {
          push("# " + escapeInline(t));
          i++;
          continue;
        }
      }

      // Numbered headings: "1. BANKING" / "2.1 SAVINGS ACCOUNT"
      const sub = t.match(SUBSECTION);
      if (sub && isCaps(sub[1])) {
        flushPara();
        push("### " + escapeInline(t.replace(/^(\d+(?:\.\d+)+)[.)]?\s+/, "$1  ")));
        i++;
        continue;
      }
      const sec = t.match(SECTION);
      if (sec && isCaps(sec[1])) {
        flushPara();
        push("## " + escapeInline(t));
        i++;
        continue;
      }

      // Bullets & numbered lists
      const b = line.match(BULLET);
      const n = line.match(NUMBERED);
      if (b || n) {
        flushPara();
        const items = [];
        while (i < block.length && (BULLET.test(block[i]) || NUMBERED.test(block[i]))) {
          const bb = block[i].match(BULLET);
          const nn = block[i].match(NUMBERED);
          items.push(bb ? "- " + escapeInline(bb[1].trim()) : nn[1] + ". " + escapeInline(nn[2].trim()));
          i++;
        }
        push(...items);
        continue;
      }

      // Labels such as "DEFINITION:", "ACCOUNT HOLDER:", "EXAMPLE 1: FIXED FEE", "TOPIC: ..."
      const labelMatch = t.match(/^([A-Z][A-Z0-9 ()/&',.\-]*?)\s*:\s*(.*)$/);
      if (labelMatch && isCaps(labelMatch[1]) && (labelMatch[2] === "" || isCaps(labelMatch[2]))) {
        const label = labelMatch[1].trim();
        const rest = labelMatch[2].trim();
        const key = label.split(/\s+/)[0];
        flushPara();

        // Callout: IMPORTANT: ...
        if (CALLOUTS[label] && rest === "") {
          const body = [];
          i++;
          while (i < block.length) body.push(block[i++].trim());
          push(
            ...body.map(
              (l, idx) => "> " + (idx === 0 ? `**${CALLOUTS[label]}:** ` : "") + escapeInline(l) + (idx < body.length - 1 ? "  " : "")
            )
          );
          if (!body.length) out.pop();
          continue;
        }

        // Glossary term: "ACCOUNT HOLDER:" followed by a sentence ending in "."
        const next = block[i + 1] ? block[i + 1].trim() : "";
        if (rest === "" && next && /[.!?]$/.test(next) && !BULLET.test(next) && !NUMBERED.test(next) && !/^=/.test(next)) {
          const def = [];
          i++;
          while (i < block.length && !BULLET.test(block[i]) && !NUMBERED.test(block[i])) def.push(block[i++].trim());
          push(`**${escapeInline(label)}:** ` + escapeInline(def.join(" ")));
          continue;
        }

        // TOPIC: SOMETHING  -> subtitle line
        if (key === "TOPIC" || key === "SUBJECT" || key === "GRADE") {
          push(`**${escapeInline(label)}:** ${escapeInline(rest)}`);
          i++;
          continue;
        }

        // Sub-heading
        push("#### " + escapeInline(rest ? `${label}: ${rest}` : label));
        formulaNext = /FORMULA/.test(label) && rest === "" && block.length === 1;
        i++;
        continue;
      }

      // Plain line
      para.push(line);
      i++;
    }
    flushPara();
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
