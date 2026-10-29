// Helpers that let study notes contain HTML/SVG, the custom <box>/<title>/<text>
// tags, {#each} loops and LaTeX maths without the plain-text converter
// mangling them.  Blocks are swapped for placeholders, the text is formatted,
// then the blocks are put back (see formatNotes.js).

// ---------- tiny, safe arithmetic evaluator (no eval) ----------
function evalExpr(src, vars) {
  const tokens = src.match(/\d*\.?\d+|[A-Za-z_]\w*|[()+\-*/%]/g) || [];
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  function primary() {
    const t = next();
    if (t === undefined) throw new Error("unexpected end");
    if (t === "(") {
      const v = addSub();
      if (next() !== ")") throw new Error("missing )");
      return v;
    }
    if (t === "-") return -primary();
    if (t === "+") return primary();
    if (/^[\d.]/.test(t)) return parseFloat(t);
    if (t in vars) return vars[t];
    throw new Error("unknown name " + t);
  }
  function mulDiv() {
    let v = primary();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = next();
      const r = primary();
      v = op === "*" ? v * r : op === "/" ? v / r : v % r;
    }
    return v;
  }
  function addSub() {
    let v = mulDiv();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const r = mulDiv();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  const out = addSub();
  if (pos < tokens.length) throw new Error("trailing tokens");
  return out;
}

const fmt = (n) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000));

function parseList(src) {
  return src
    .replace(/^\s*\[|\]\s*$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : s.replace(/^["']|["']$/g, "")));
}

// Replace {expr} using vars. Unknown expressions are left untouched.
function interpolate(body, vars) {
  // attr={expr} -> attr="value" (keep quotes so the HTML stays valid)
  body = body.replace(/=\{([^{}]+)\}/g, (m, expr) => {
    const v = interpolate("{" + expr + "}", vars);
    return v.startsWith("{") ? m : `="${v}"`;
  });
  return body.replace(/\{([^{}]+)\}/g, (m, expr) => {
    try {
      const v = evalExpr(expr.trim(), vars);
      return typeof v === "number" ? fmt(v) : String(v);
    } catch {
      try {
        const e = expr.trim();
        if (e in vars) return String(vars[e]);
      } catch {}
      return m;
    }
  });
}

// {#each [1,2,3] as x, i} ... {/each}   (supports nesting)
export function expandEach(src, vars = {}) {
  const re = /\{#each\s+(\[[^\]]*\])\s+as\s+(\w+)(?:\s*,\s*(\w+))?\s*\}/;
  let out = src;
  for (let guard = 0; guard < 50; guard++) {
    const m = re.exec(out);
    if (!m) break;
    // find the matching {/each}
    let depth = 1;
    let i = m.index + m[0].length;
    const openRe = /\{#each\b|\{\/each\}/g;
    openRe.lastIndex = i;
    let end = -1;
    let mm;
    while ((mm = openRe.exec(out))) {
      depth += mm[0].startsWith("{#each") ? 1 : -1;
      if (depth === 0) {
        end = mm.index;
        break;
      }
    }
    if (end < 0) break;
    const body = out.slice(m.index + m[0].length, end);
    const items = parseList(m[1]);
    const rendered = items
      .map((item, idx) => {
        const v = { ...vars, [m[2]]: item };
        if (m[3]) v[m[3]] = idx;
        return interpolate(expandEach(body, v), v);
      })
      .join("");
    out = out.slice(0, m.index) + rendered + out.slice(end + "{/each}".length);
  }
  return out;
}

// ---------- JSX-ish attributes -> HTML attributes ----------
function fixAttributes(tagSrc) {
  return tagSrc
    .replace(/\sclassName=/g, " class=")
    .replace(/\s([a-z]+(?:[A-Z][a-z0-9]*)+)=/g, (m, name) => {
      if (name === "viewBox" || name === "preserveAspectRatio") return m;
      return " " + name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + "=";
    })
    // attr={value} -> attr="value"
    .replace(/=\{\s*([^{}]*?)\s*\}/g, '="$1"');
}

function fixTagsInSvg(svg) {
  svg = interpolate(svg, {});
  return svg.replace(/<[a-zA-Z][^<>]*>/g, fixAttributes);
}

// <box ...> -> <div class="note-box">, <title>/<text> outside <svg> -> <p>
function convertCustomTags(html) {
  const parts = html.split(/(<svg[\s\S]*?<\/svg>)/g);
  return parts
    .map((part) => {
      if (/^<svg/.test(part)) return fixTagsInSvg(part).replace(/\s*\n\s*/g, " ");
      return part
        .replace(/<box\b([^>]*)>/g, (m, attrs) => {
          const a = fixAttributes(" " + interpolate(attrs, {}));
          const pad = /padding="?(\d+)/.exec(a);
          return `<div class="note-box${pad ? " pad-" + Math.min(+pad[1], 6) : ""}">`;
        })
        .replace(/<\/box>/g, "</div>")
        .replace(/<title\b([^>]*)>/g, (m, attrs) => {
          const s = /size="?(\w+)/.exec(attrs);
          return `<p class="note-title${s ? " size-" + s[1] : ""}">`;
        })
        .replace(/<\/title>/g, "</p>")
        .replace(/<text\b([^>]*)>/g, (m, attrs) => {
          const s = /size="?(\w+)/.exec(attrs);
          return `<p class="note-text${s ? " size-" + s[1] : ""}">`;
        })
        .replace(/<\/text>/g, "</p>");
    })
    .join("")
    .replace(/\s*\n\s*/g, " ");
}

const BLOCK_TAGS = "box|svg|table|figure";
const BLOCK_RE = new RegExp(`<(${BLOCK_TAGS})\\b[\\s\\S]*?<\\/\\1>`, "gi");

// Pull HTML/SVG/custom blocks and maths out of the text.
export function protect(text, store) {
  const hold = (value) => {
    store.push(value);
    return `\n\n@@blk${store.length - 1}@@\n\n`;
  };

  let t = text.replace(BLOCK_RE, (m) => hold({ kind: "html", value: convertCustomTags(expandEach(m)) }));

  // display maths: $$ ... $$   \[ ... \]   [ \n ... \n ]   [ \frac{..} ]
  const display = (tex) => hold({ kind: "display", value: tex.trim() });
  t = t.replace(/(^[ \t]*)?\$\$([\s\S]+?)\$\$([ \t]*$)?/gm, (m, pre, tex, post) => {
    if (pre !== undefined || post !== undefined || tex.includes("\n")) return display(tex);
    store.push({ kind: "inline", value: tex.trim() });
    return `@@blk${store.length - 1}@@`;
  });
  t = t.replace(/\\\[([\s\S]+?)\\\]/g, (m, tex) => display(tex));
  t = t.replace(/^[ \t]*\[[ \t]*\n([\s\S]*?)\n[ \t]*\][ \t]*$/gm, (m, tex) =>
    /\\[a-zA-Z]+|[=^_]/.test(tex) ? display(tex) : m
  );
  t = t.replace(/^[ \t]*\[[ \t]*(\\[^\n]*?)[ \t]*\][ \t]*$/gm, (m, tex) => display(tex));
  // inline maths \( ... \)
  t = t.replace(/\\\(([\s\S]+?)\\\)/g, (m, tex) => {
    store.push({ kind: "inline", value: tex.trim() });
    return `@@blk${store.length - 1}@@`;
  });
  return t;
}

export function restore(text, store) {
  return text.replace(/@@blk(\d+)@@/g, (m, i) => {
    const b = store[+i];
    if (!b) return m;
    if (b.kind === "html") return b.value;
    if (b.kind === "display") return `$$\n${b.value}\n$$`;
    return `$$${b.value}$$`;
  });
}

// ---------- tables written as "A| B| C" with no pipes at the edges ----------
const SEP_ROW = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

export function pipeCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function pipeRows(lines) {
  if (lines.length < 2 || !lines.every((l) => l.includes("|"))) return null;
  const sepAt = lines.findIndex((l, i) => i > 0 && SEP_ROW.test(l));
  const body = sepAt === -1 ? lines : lines.filter((_, i) => i !== sepAt);
  const rows = body.map(pipeCells);
  const n = rows[0].length;
  if (n < 2 || !rows.every((r) => r.length === n)) return null;
  return { rows, hadSeparator: sepAt !== -1 };
}
