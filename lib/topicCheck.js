// lib/topicCheck.js
// Gate for the planner topic. Replace the body with an AI/school-subject check
// when you are ready; the planner API already handles { ok:false, error }.
export function verifyTopic(subject, topic) {
  const t = String(topic ?? "").trim();
  if (t.length < 3) return { ok: false, error: "Enter a topic (at least 3 characters)." };
  if (t.length > 100) return { ok: false, error: "Keep the topic under 100 characters." };
  if (!/[a-zA-Z]{3}/.test(t)) return { ok: false, error: "That doesn't look like a school topic." };
  if (/https?:\/\/|www\.|@\w+\.\w+/i.test(t)) return { ok: false, error: "Topics can't contain links or emails." };
  return { ok: true };
}
