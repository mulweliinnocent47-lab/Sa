// lib/profileConfig.js
// ═══════════════════════════════════════════════════════════════════
//  THE PROFILE CONFIG  →  this file decides what is saved to Supabase.
//
//  To create the table, open README.md ("Profile table") or run
//  supabase/schema.sql. The columns there match PROFILE_FIELDS below.
//  Change PROFILE_TABLE if your table is called something else.
// ═══════════════════════════════════════════════════════════════════

export const PROFILE_TABLE = "profiles";

export const GRADES = [8, 9, 10, 11, 12];
export const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

// One entry per column. `user_id` (the Supabase auth user) is added automatically.
export const PROFILE_FIELDS = [
  { column: "username",  label: "Username",  type: "text",   required: true,  unique: true, max: 20, hint: "3-20 letters, numbers or _ . Shown on the leaderboard." },
  { column: "full_name", label: "Full name", type: "text",   required: false, max: 60 },
  { column: "grade",     label: "Grade",     type: "select", required: false, options: GRADES },
  { column: "school",    label: "School",    type: "text",   required: false, max: 80 },
  { column: "province",  label: "Province",  type: "select", required: false, options: PROVINCES },
];

export const USERNAME_RULE = /^[a-z0-9_]{3,20}$/;

/** "Thabo M!" -> "thabo_m" (lowercase, only a-z 0-9 _ , max 20) */
export function cleanUsername(raw = "") {
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

/** First guess at a username for a Supabase user: signup username, else the email name. */
export function usernameFromUser(user) {
  const meta = user?.user_metadata ?? {};
  let u = cleanUsername(meta.username || meta.name || (user?.email ?? "").split("@")[0] || "student");
  if (u.length < 3) u = (u + "_student").slice(0, 20);
  return u;
}

/** The name shown in the top bar. No database call: it comes from the session itself. */
export function displayNameFromUser(user) {
  const meta = user?.user_metadata ?? {};
  return meta.username || meta.name || (user?.email ?? "").split("@")[0] || "Student";
}

const clip = (v, max) => String(v ?? "").trim().slice(0, max);

/** Checks + cleans what the profile form sends. Returns { ok, value } or { ok:false, errors } */
export function validateProfile(input = {}) {
  const errors = {};
  const value = {};

  const username = cleanUsername(input.username);
  if (!USERNAME_RULE.test(username)) errors.username = "Use 3-20 letters, numbers or underscores.";
  else value.username = username;

  value.full_name = clip(input.full_name, 60) || null;
  value.school = clip(input.school, 80) || null;

  const grade = Number(input.grade);
  if (input.grade === "" || input.grade == null) value.grade = null;
  else if (GRADES.includes(grade)) value.grade = grade;
  else errors.grade = "Choose a grade from the list.";

  const province = clip(input.province, 40);
  if (!province) value.province = null;
  else if (PROVINCES.includes(province)) value.province = province;
  else errors.province = "Choose a province from the list.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
