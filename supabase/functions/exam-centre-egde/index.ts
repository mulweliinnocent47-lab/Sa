const API_URL =
  "https://tebqhqdihdasjedlbnrq.supabase.co/functions/v1/chat";

const API_KEY = Deno.env.get("AI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

const isText = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

/**
 * Extract useful text from many common AI response shapes.
 */
function pickText(obj: any): string {
  if (obj == null) return "";

  // Direct string
  if (typeof obj === "string") {
    return obj;
  }

  if (typeof obj !== "object") {
    return "";
  }

  const candidates = [
    obj.content,
    obj.text,
    obj.token,
    obj.response,
    obj.output,
    obj.message?.content,
    obj.delta?.content,
    obj.delta?.text,
    obj.choices?.[0]?.delta?.content,
    obj.choices?.[0]?.message?.content,
    obj.choices?.[0]?.text,

    // Some custom APIs wrap the answer in data
    obj.data?.content,
    obj.data?.text,
    obj.data?.response,
    obj.data?.output,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return "";
}

/**
 * Parse a normal JSON response OR an SSE response:
 *
 * Normal:
 * {"response":"hello"}
 *
 * SSE:
 * data: {"content":"hello"}
 * data: {"content":" world"}
 * data: [DONE]
 */
function parseChatResponse(raw: string): string {
  const text = raw.trim();

  if (!text) {
    return "";
  }

  // --------------------------------------------------
  // 1. Try normal JSON first
  // --------------------------------------------------
  try {
    const parsed = JSON.parse(text);

    const direct = pickText(parsed);

    if (direct) {
      return direct;
    }

    // Sometimes the API itself returns the AI JSON object
    // such as {"question":"..."}
    if (
      typeof parsed.question === "string" ||
      typeof parsed.correct === "boolean"
    ) {
      return JSON.stringify(parsed);
    }
  } catch {
    // Not normal JSON. Continue.
  }

  // --------------------------------------------------
  // 2. Parse Server-Sent Events
  // --------------------------------------------------
  if (text.includes("data:")) {
    let result = "";

    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) {
        continue;
      }

      const payload = trimmed.slice(5).trim();

      if (!payload || payload === "[DONE]") {
        continue;
      }

      try {
        const parsed = JSON.parse(payload);

        const extracted = pickText(parsed);

        if (extracted) {
          result += extracted;
          continue;
        }

        // In case the SSE event contains the actual JSON object
        if (
          typeof parsed.question === "string" ||
          typeof parsed.correct === "boolean"
        ) {
          result += JSON.stringify(parsed);
        }
      } catch (error) {
        console.error("Could not parse SSE payload:", payload);
      }
    }

    return result;
  }

  // --------------------------------------------------
  // 3. Last fallback: plain text
  // --------------------------------------------------
  return text;
}

/**
 * Ask the central chat Edge Function for a NON-STREAMING response.
 */
async function askAI(
  systemPrompt: string,
  message: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error("AI_API_KEY is not configured");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      message,
      apiKey: API_KEY,
      systemPrompt,
      stream: false,
    }),
  });

  const raw = await response.text();

  console.log("CHAT STATUS:", response.status);
  console.log("CHAT RAW RESPONSE:", raw.slice(0, 2000));

  if (!response.ok) {
    throw new Error(
      `Chat API returned ${response.status}: ${raw.slice(0, 500)}`
    );
  }

  const result = parseChatResponse(raw);

  console.log("EXTRACTED AI RESPONSE:", result.slice(0, 2000));

  return result;
}

/**
 * Extract the first complete JSON object from AI text.
 *
 * Handles:
 * {"question":"..."}
 *
 * and:
 * ```json
 * {"question":"..."}
 * ```
 *
 * and:
 * Here is the JSON:
 * {"question":"..."}
 */
function extractJson(text: string): any | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");

  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth++;
    }

    if (char === "}") {
      depth--;

      if (depth === 0) {
        const candidate = cleaned.slice(start, i + 1);

        try {
          return JSON.parse(candidate);
        } catch (error) {
          console.error("JSON extraction failed:", candidate);
          return null;
        }
      }
    }
  }

  return null;
}

// ==================================================
// PROAI-PROCTICE  —  generates a full practice session as JSON
// ==================================================

const ALLOWED_TYPES = ["multiple_choice", "short_answer", "calculation"] as const;
type QType = (typeof ALLOWED_TYPES)[number];

const DEFAULT_MARKS: Record<QType, number> = {
  multiple_choice: 1,
  short_answer: 2,
  calculation: 3,
};

const LETTERS = ["A", "B", "C", "D"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const MAX_ATTEMPTS = 3;
const DEADLINE_MS = 110_000; // stop retrying before the function times out

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** "10 questions" -> 10. Falls back to 10. Clamped 1..20. */
function resolveCount(body: any): number {
  const fromField = Number(body?.questionCount);
  const fromKind = Number(String(body?.kind ?? "").match(/\d+/)?.[0]);
  const n = Number.isFinite(fromField) && fromField > 0
    ? fromField
    : Number.isFinite(fromKind) && fromKind > 0
    ? fromKind
    : 10;
  return Math.min(20, Math.max(1, Math.floor(n)));
}

function resolveTypes(body: any): QType[] {
  const raw = body?.questionTypes ?? body?.types;
  const list = Array.isArray(raw) ? raw : [];
  const valid = list.filter((t: unknown): t is QType =>
    (ALLOWED_TYPES as readonly string[]).includes(String(t))
  );
  return valid.length ? [...new Set(valid)] : [...ALLOWED_TYPES];
}

function resolveTopics(body: any): string {
  const t = body?.topics;
  if (Array.isArray(t) && t.length) return t.map(String).join(", ");
  if (isText(t) && t !== "AI_SELECT_TOPICS") return t;
  return "AI_SELECT_TOPICS";
}

function buildSystemPrompt(opts: {
  grade: number;
  subject: string;
  curriculum: string;
  level: string;
  count: number;
  types: QType[];
  topics: string;
  title: string;
}): string {
  const { grade, subject, curriculum, level, count, types, topics, title } = opts;

  const topicRule =
    topics === "AI_SELECT_TOPICS"
      ? `Choose a wide spread of different Grade ${grade} ${subject} topics from the ${curriculum} curriculum. Do not repeat a topic more than twice.`
      : `Use these topics (spread the questions across them): ${topics}.`;

  const levelRule =
    level.toLowerCase() === "mixed"
      ? "Difficulty: a mix of Easy, Medium and Hard (roughly 3 Easy, 4 Medium, 3 Hard for 10 questions)."
      : `Difficulty: mostly "${level}". Set each question's "difficulty" to Easy, Medium or Hard honestly.`;

  return `
You are an expert South African Grade ${grade} ${subject} teacher and NSC examiner.

Create a practice session titled "${title}" using the ${curriculum} curriculum.

Create EXACTLY ${count} questions.

Allowed question types: ${types.join(", ")}.
${types.length > 1
    ? "Use a sensible mix of these types (about half multiple_choice, the rest short_answer and calculation)."
    : `Every question must be of type "${types[0]}".`}

${topicRule}
${levelRule}

Rules for each type:
- multiple_choice: exactly 4 options, each starting with its letter, like "A. 5x", "B. 6x", "C. 8x", "D. 10x". "correctAnswer" is ONLY the letter, e.g. "B". Only one option may be correct. marks = 1.
- short_answer: no "options". "correctAnswer" is a short final answer (a word, number or short phrase). marks = 2.
- calculation: no "options". "correctAnswer" is the final answer only (with units if needed). "explanation" must show the key working steps. marks = 3 or 4.

General rules:
- Every question must be self-contained and exam style.
- Every answer MUST be correct. Double-check all maths and facts.
- "explanation" is 1 to 3 short sentences (calculation may show steps).
- Write maths in plain text with Unicode symbols (x², √, ÷, ×, π, ≤). Do NOT use LaTeX.
- Do NOT use markdown. Do NOT use code fences.
- Do NOT repeat the same question.

Return ONLY valid JSON, with nothing before or after it, in exactly this structure:

{
  "questions": [
    {
      "type": "multiple_choice",
      "topic": "Algebra",
      "difficulty": "Easy",
      "question": "Simplify: 3x + 5x - 2x",
      "options": ["A. 5x", "B. 6x", "C. 8x", "D. 10x"],
      "correctAnswer": "B",
      "explanation": "Combine like terms: 3x + 5x - 2x = 6x.",
      "marks": 1
    },
    {
      "type": "short_answer",
      "topic": "Exponents",
      "difficulty": "Medium",
      "question": "Simplify: 2³ × 2⁴.",
      "correctAnswer": "128",
      "explanation": "Add the exponents: 2³ × 2⁴ = 2⁷ = 128.",
      "marks": 2
    }
  ]
}

Use valid JSON escaping. Do not add any other keys.
`.trim();
}

/** Validate + clean one AI question. Returns null if unusable. */
function normalizeQuestion(q: any, allowed: QType[]): Record<string, unknown> | null {
  if (!q || typeof q !== "object") return null;

  const type = String(q.type ?? "").trim() as QType;
  if (!allowed.includes(type)) return null;
  if (!isText(q.question) || !isText(q.explanation)) return null;

  const difficulty = DIFFICULTIES.find(
    (d) => d.toLowerCase() === String(q.difficulty ?? "").trim().toLowerCase()
  ) ?? "Medium";

  let marks = Math.round(Number(q.marks));
  if (!Number.isFinite(marks) || marks < 1 || marks > 10) marks = DEFAULT_MARKS[type];

  const base: Record<string, unknown> = {
    type,
    topic: isText(q.topic) ? q.topic.trim() : "General",
    difficulty,
    question: q.question.trim(),
  };

  if (type === "multiple_choice") {
    if (!Array.isArray(q.options) || q.options.length !== 4) return null;

    // Strip any "A." / "A)" prefix, then re-add a clean one.
    const texts = q.options.map((o: unknown) =>
      String(o ?? "").trim().replace(/^[A-Da-d][\.\)\:]\s*/, "")
    );
    if (texts.some((t: string) => !t)) return null;
    if (new Set(texts.map((t: string) => t.toLowerCase())).size !== 4) return null;

    const options = texts.map((t: string, i: number) => `${LETTERS[i]}. ${t}`);

    // correctAnswer may be "B", "B. 6x", or the option text itself.
    const rawAns = String(q.correctAnswer ?? "").trim();
    let letter = rawAns.match(/^([A-Da-d])(?:[\.\)\:\s]|$)/)?.[1]?.toUpperCase();
    if (!letter) {
      const idx = texts.findIndex(
        (t: string) => t.toLowerCase() === rawAns.replace(/^[A-Da-d][\.\)\:]\s*/, "").toLowerCase()
      );
      if (idx >= 0) letter = LETTERS[idx];
    }
    if (!letter || !LETTERS.includes(letter)) return null;

    return { ...base, options, correctAnswer: letter, explanation: q.explanation.trim(), marks };
  }

  // short_answer / calculation
  const correct = typeof q.correctAnswer === "number"
    ? String(q.correctAnswer)
    : q.correctAnswer;
  if (!isText(correct)) return null;

  return { ...base, correctAnswer: correct.trim(), explanation: q.explanation.trim(), marks };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const startedAt = Date.now();

  try {
    const body = await req.json();

    const id = String(body?.id ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const subject = String(body?.subject ?? "").trim();
    const level = String(body?.level ?? "Mixed").trim() || "Mixed";
    const grade = Number(body?.grade) || 12;
    const curriculum = String(body?.curriculum ?? "South African CAPS/NSC").trim();
    const minutes = Number(body?.minutes) || 15;

    if (!id || !title || !subject) {
      return json({ error: "id, title and subject are required" }, 400);
    }

    const count = resolveCount(body);
    const types = resolveTypes(body);
    const topics = resolveTopics(body);
    const shouldShuffle = body?.instructions?.shuffleQuestions !== false;

    const systemPrompt = buildSystemPrompt({
      grade, subject, curriculum, level, count, types, topics, title,
    });

    // ------------------------------------------------
    // Ask the AI. If some questions are invalid or missing,
    // ask again for just the missing number (max 3 attempts).
    // ------------------------------------------------
    const collected: Record<string, unknown>[] = [];
    const seen = new Set<string>();

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const missing = count - collected.length;
      if (missing <= 0) break;
      if (attempt > 1 && Date.now() - startedAt > DEADLINE_MS) break;

      const seed = Math.random().toString(36).slice(2, 10);
      const already = collected.length
        ? `\n\nDo NOT repeat these questions:\n${collected.map((c) => `- ${c.question}`).join("\n")}`
        : "";

      const raw = await askAI(
        // On a retry, change the count in the prompt to what is still missing.
        attempt === 1
          ? systemPrompt
          : systemPrompt.replace(`EXACTLY ${count} questions`, `EXACTLY ${missing} questions`),
        `Create ${missing} new question${missing === 1 ? "" : "s"} for "${title}".\nVariation seed: ${seed}${already}`
      );

      const parsed = extractJson(raw);
      const list = Array.isArray(parsed?.questions) ? parsed.questions : [];

      for (const item of list) {
        if (collected.length >= count) break;
        const clean = normalizeQuestion(item, types);
        if (!clean) continue;
        const key = String(clean.question).toLowerCase().replace(/\s+/g, " ");
        if (seen.has(key)) continue;
        seen.add(key);
        collected.push(clean);
      }

      console.log(`ATTEMPT ${attempt}: have ${collected.length}/${count}`);
    }

    if (collected.length < count) {
      console.error(`Only ${collected.length}/${count} valid questions`);
      return json({ error: "AI did not return enough valid questions. Please try again." }, 502);
    }

    const finalList = (shouldShuffle ? shuffle(collected) : collected).map((q, i) => ({
      id: `q${i + 1}`,
      ...q,
    }));

    const totalMarks = finalList.reduce((sum, q) => sum + Number(q.marks), 0);

    return json({
      sessionId: id,
      title,
      subject,
      grade,
      level,
      minutes,
      questions: finalList,
      totalMarks,
    });
  } catch (error) {
    console.error("PROAI-PROCTICE ERROR:", error);
    return json({ error: "Something went wrong" }, 500);
  }
});
