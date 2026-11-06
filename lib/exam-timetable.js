// lib/exam-timetable.js
// NSC 2026 final exam timetable + countdown helpers.
// Edit the dates below if the department changes the timetable.
import { dayKey } from "@/lib/tasksConfig";

export const EXAM_YEAR = 2026;

export const TIMETABLE = [
  // WEEK 1
  { date: "13 Oct", day: "Tue", subject: "Computer Applications Technology — Paper 1 Practical", time: "09:00", length: "3 hrs" },
  { date: "13 Oct", day: "Tue", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu HL — Paper 1", time: "14:00", length: "2 hrs" },
  { date: "13 Oct", day: "Tue", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu FAL — Paper 1", time: "14:00", length: "2 hrs" },
  { date: "13 Oct", day: "Tue", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu SAL — Paper 1", time: "14:00", length: "2 hrs" },
  { date: "13 Oct", day: "Tue", subject: "Hebrew SAL — Paper 1", time: "14:00", length: "2 hrs" },
  { date: "13 Oct", day: "Tue", subject: "German HL, FAL, SAL — Paper 1", time: "14:00", length: "2 hrs" },

  { date: "14 Oct", day: "Wed", subject: "Information Technology — Paper 1 Practical", time: "09:00", length: "3 hrs" },
  { date: "14 Oct", day: "Wed", subject: "Arabic, French, Italian, Mandarin, Modern Greek, Serbian, Spanish SAL — Paper 1", time: "14:00", length: "2 hrs" },
  { date: "14 Oct", day: "Wed", subject: "Latin SAL — Paper 1", time: "14:00", length: "3 hrs" },
  { date: "14 Oct", day: "Wed", subject: "Portuguese HL, FAL, SAL — Paper 1", time: "14:00", length: "2 hrs" },

  { date: "15 Oct", day: "Thu", subject: "English HL — Paper 3", time: "09:00", length: "3 hrs" },
  { date: "15 Oct", day: "Thu", subject: "English FAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "15 Oct", day: "Thu", subject: "English SAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "15 Oct", day: "Thu", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu HL — Paper 2", time: "14:00", length: "2.5 hrs" },
  { date: "15 Oct", day: "Thu", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu FAL — Paper 2", time: "14:00", length: "2 hrs" },
  { date: "15 Oct", day: "Thu", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu SAL — Paper 2", time: "14:00", length: "2 hrs" },
  { date: "15 Oct", day: "Thu", subject: "Hebrew SAL — Paper 2", time: "14:00", length: "2 hrs" },
  { date: "15 Oct", day: "Thu", subject: "German HL — Paper 2", time: "14:00", length: "2.5 hrs" },
  { date: "15 Oct", day: "Thu", subject: "German FAL, SAL — Paper 2", time: "14:00", length: "2 hrs" },

  { date: "16 Oct", day: "Fri", subject: "Economics — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "16 Oct", day: "Fri", subject: "Mechanical Technology", time: "09:00", length: "3 hrs" },
  { date: "16 Oct", day: "Fri", subject: "Design — Paper 1", time: "14:00", length: "3 hrs" },

  // WEEK 2
  { date: "19 Oct", day: "Mon", subject: "isiZulu, isiXhosa, siSwati, isiNdebele HL — Paper 3", time: "09:00", length: "3 hrs" },
  { date: "19 Oct", day: "Mon", subject: "isiZulu, isiXhosa, siSwati, isiNdebele FAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "19 Oct", day: "Mon", subject: "isiZulu, isiXhosa, siSwati, isiNdebele SAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "19 Oct", day: "Mon", subject: "Agricultural Sciences — Paper 1", time: "14:00", length: "2.5 hrs" },

  { date: "20 Oct", day: "Tue", subject: "Afrikaans HL — Paper 3", time: "09:00", length: "3 hrs" },
  { date: "20 Oct", day: "Tue", subject: "Afrikaans FAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "20 Oct", day: "Tue", subject: "Afrikaans SAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "20 Oct", day: "Tue", subject: "History — Paper 1", time: "14:00", length: "3 hrs" },
  { date: "20 Oct", day: "Tue", subject: "Maritime Economics", time: "14:00", length: "3 hrs" },

  { date: "21 Oct", day: "Wed", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda HL — Paper 3", time: "09:00", length: "3 hrs" },
  { date: "21 Oct", day: "Wed", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda FAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "21 Oct", day: "Wed", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda SAL — Paper 3", time: "09:00", length: "2.5 hrs" },
  { date: "21 Oct", day: "Wed", subject: "South African Sign Language HL — Paper 3", time: "09:00", length: "3 hrs" },
  { date: "21 Oct", day: "Wed", subject: "Information Technology — Paper 2 Theory", time: "14:00", length: "3 hrs" },

  { date: "22 Oct", day: "Thu", subject: "Accounting — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "22 Oct", day: "Thu", subject: "Engineering Graphics and Design — Paper 1", time: "14:00", length: "3 hrs" },
  { date: "22 Oct", day: "Thu", subject: "Marine Sciences — Paper 1", time: "14:00", length: "2.5 hrs" },

  { date: "23 Oct", day: "Fri", subject: "Mathematics — Paper 1", time: "09:00", length: "3 hrs" },
  { date: "23 Oct", day: "Fri", subject: "Mathematical Literacy — Paper 1", time: "09:00", length: "3 hrs" },
  { date: "23 Oct", day: "Fri", subject: "Technical Mathematics — Paper 1", time: "09:00", length: "3 hrs" },
  { date: "23 Oct", day: "Fri", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu HL — Paper 3", time: "14:00", length: "2.5 hrs" },
  { date: "23 Oct", day: "Fri", subject: "Hindi, Gujarati, Tamil, Telugu, Urdu FAL — Paper 3", time: "14:00", length: "2.5 hrs" },
  { date: "23 Oct", day: "Fri", subject: "Portuguese, German HL — Paper 3", time: "14:00", length: "2.5 hrs" },
  { date: "23 Oct", day: "Fri", subject: "Portuguese, German FAL — Paper 3", time: "14:00", length: "2.5 hrs" },

  // WEEK 3
  { date: "26 Oct", day: "Mon", subject: "Mathematics — Paper 2", time: "09:00", length: "3 hrs" },
  { date: "26 Oct", day: "Mon", subject: "Mathematical Literacy — Paper 2", time: "09:00", length: "3 hrs" },
  { date: "26 Oct", day: "Mon", subject: "Technical Mathematics — Paper 2", time: "09:00", length: "3 hrs" },
  { date: "26 Oct", day: "Mon", subject: "Sport and Exercise Science", time: "14:00", length: "3 hrs" },

  { date: "27 Oct", day: "Tue", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda HL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "27 Oct", day: "Tue", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda FAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "27 Oct", day: "Tue", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda SAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "27 Oct", day: "Tue", subject: "South African Sign Language HL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "27 Oct", day: "Tue", subject: "Engineering Graphics and Design — Paper 2", time: "14:00", length: "3 hrs" },

  { date: "28 Oct", day: "Wed", subject: "English HL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "28 Oct", day: "Wed", subject: "English FAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "28 Oct", day: "Wed", subject: "English SAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "28 Oct", day: "Wed", subject: "Accounting — Paper 2", time: "14:00", length: "2 hrs" },

  { date: "29 Oct", day: "Thu", subject: "Geography — Paper 1 (Climate, Weather, Geomorphology and Map Work)", time: "09:00", length: "3 hrs" },
  { date: "29 Oct", day: "Thu", subject: "Computer Applications Technology — Paper 2 Theory", time: "14:00", length: "3 hrs" },

  { date: "30 Oct", day: "Fri", subject: "Physical Sciences (Physics) — Paper 1", time: "09:00", length: "3 hrs" },
  { date: "30 Oct", day: "Fri", subject: "Technical Sciences — Paper 1", time: "09:00", length: "3 hrs" },
  { date: "30 Oct", day: "Fri", subject: "Tourism", time: "14:00", length: "3 hrs" },

  // WEEK 4
  { date: "02 Nov", day: "Mon", subject: "Physical Sciences (Chemistry) — Paper 2", time: "09:00", length: "3 hrs" },
  { date: "02 Nov", day: "Mon", subject: "Technical Sciences — Paper 2", time: "09:00", length: "1.5 hrs" },
  { date: "02 Nov", day: "Mon", subject: "Religion Studies — Paper 1", time: "14:00", length: "2 hrs" },

  // 03–05 November: Non-examination days

  { date: "06 Nov", day: "Fri", subject: "isiZulu, isiXhosa, siSwati, isiNdebele HL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "06 Nov", day: "Fri", subject: "isiZulu, isiXhosa, siSwati, isiNdebele FAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "06 Nov", day: "Fri", subject: "isiZulu, isiXhosa, siSwati, isiNdebele SAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "06 Nov", day: "Fri", subject: "Consumer Studies", time: "14:00", length: "3 hrs" },
  { date: "06 Nov", day: "Fri", subject: "Hospitality Studies", time: "14:00", length: "3 hrs" },

  // WEEK 5
  { date: "10 Nov", day: "Tue", subject: "isiZulu, isiXhosa, siSwati, isiNdebele HL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "10 Nov", day: "Tue", subject: "isiZulu, isiXhosa, siSwati, isiNdebele FAL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "10 Nov", day: "Tue", subject: "isiZulu, isiXhosa, siSwati, isiNdebele SAL — Paper 2", time: "09:00", length: "1.5 hrs" },
  { date: "10 Nov", day: "Tue", subject: "Electrical Technology", time: "14:00", length: "3 hrs" },
  { date: "10 Nov", day: "Tue", subject: "Nautical Science — Paper 1", time: "14:00", length: "3 hrs" },

  { date: "11 Nov", day: "Wed", subject: "Afrikaans HL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "11 Nov", day: "Wed", subject: "Afrikaans FAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "11 Nov", day: "Wed", subject: "Afrikaans SAL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "11 Nov", day: "Wed", subject: "Business Studies — Paper 1", time: "14:00", length: "2 hrs" },

  { date: "12 Nov", day: "Thu", subject: "Geography — Paper 2 (Settlements, Economic Geography of SA and Map Work)", time: "09:00", length: "3 hrs" },
  { date: "12 Nov", day: "Thu", subject: "Religion Studies — Paper 2", time: "14:00", length: "2 hrs" },

  { date: "13 Nov", day: "Fri", subject: "Life Sciences — Paper 1", time: "09:00", length: "2.5 hrs" },
  { date: "13 Nov", day: "Fri", subject: "Arabic, French, Italian, Mandarin, Modern Greek, Serbian, Spanish SAL — Paper 2", time: "14:00", length: "2 hrs" },
  { date: "13 Nov", day: "Fri", subject: "Latin SAL — Paper 2", time: "14:00", length: "2 hrs" },
  { date: "13 Nov", day: "Fri", subject: "Portuguese HL — Paper 2", time: "14:00", length: "2.5 hrs" },
  { date: "13 Nov", day: "Fri", subject: "Portuguese FAL, SAL — Paper 2", time: "14:00", length: "2 hrs" },
  { date: "13 Nov", day: "Fri", subject: "Equine Studies", time: "14:00", length: "3 hrs" },

  // WEEK 6
  { date: "16 Nov", day: "Mon", subject: "Life Sciences — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "16 Nov", day: "Mon", subject: "Dramatic Arts", time: "14:00", length: "3 hrs" },
  { date: "16 Nov", day: "Mon", subject: "Civil Technology", time: "14:00", length: "3 hrs" },

  { date: "17 Nov", day: "Tue", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda HL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "17 Nov", day: "Tue", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda FAL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "17 Nov", day: "Tue", subject: "Sepedi, Sesotho, Setswana, Xitsonga, Tshivenda SAL — Paper 2", time: "09:00", length: "1.5 hrs" },
  { date: "17 Nov", day: "Tue", subject: "South African Sign Language HL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "17 Nov", day: "Tue", subject: "Agricultural Sciences — Paper 2", time: "14:00", length: "2.5 hrs" },
  { date: "17 Nov", day: "Tue", subject: "Nautical Science — Paper 2", time: "14:00", length: "3 hrs" },

  { date: "18 Nov", day: "Wed", subject: "Business Studies — Paper 2", time: "09:00", length: "2 hrs" },
  { date: "18 Nov", day: "Wed", subject: "Visual Arts — Paper 1", time: "14:00", length: "3 hrs" },

  { date: "19 Nov", day: "Thu", subject: "English HL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "19 Nov", day: "Thu", subject: "English FAL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "19 Nov", day: "Thu", subject: "English SAL — Paper 2", time: "09:00", length: "1.5 hrs" },
  { date: "19 Nov", day: "Thu", subject: "History — Paper 2", time: "14:00", length: "3 hrs" },

  { date: "20 Nov", day: "Fri", subject: "Afrikaans HL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "20 Nov", day: "Fri", subject: "Afrikaans FAL — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "20 Nov", day: "Fri", subject: "Afrikaans SAL — Paper 2", time: "09:00", length: "1.5 hrs" },
  { date: "20 Nov", day: "Fri", subject: "Economics — Paper 2", time: "14:00", length: "2 hrs" },

  // WEEK 7
  { date: "23 Nov", day: "Mon", subject: "Agricultural Technology", time: "09:00", length: "3 hrs" },
  { date: "23 Nov", day: "Mon", subject: "Music — Paper 1 Theory", time: "14:00", length: "3 hrs" },

  { date: "24 Nov", day: "Tue", subject: "Agricultural Management Practices", time: "09:00", length: "3 hrs" },
  { date: "24 Nov", day: "Tue", subject: "Marine Sciences — Paper 2", time: "09:00", length: "2.5 hrs" },
  { date: "24 Nov", day: "Tue", subject: "Dance Studies", time: "14:00", length: "3 hrs" },

  { date: "25 Nov", day: "Wed", subject: "Music — Paper 2 Comprehension", time: "09:00", length: "1.5 hrs" },

  { date: "26 Nov", day: "Thu", subject: "Computer Applications Technology — Paper 1 Rewrite Practical", time: "09:00", length: "3 hrs" },
  { date: "26 Nov", day: "Thu", subject: "Information Technology — Paper 1 Rewrite Practical", time: "09:00", length: "3 hrs" },
];

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

/** "13 Oct" -> "2026-10-13" (sortable, comparable as a string) */
export function examKey(e) {
  const [d, mon] = e.date.split(" ");
  return `${EXAM_YEAR}-${String(MONTHS[mon]).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const dayNumber = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
};

/** Exams that have not finished yet (today's papers included), in date order. */
export function upcomingExams(now = new Date()) {
  const today = dayKey(now);
  return TIMETABLE.filter((e) => examKey(e) >= today);
}

/** Everything the countdown banner needs. */
export function getCountdown(now = new Date()) {
  const today = dayKey(now);
  const keys = TIMETABLE.map(examKey).sort();
  const first = keys[0];
  const last = keys[keys.length - 1];

  if (today < first) {
    const days = dayNumber(first) - dayNumber(today);
    return { state: "before", big: String(days), unit: days === 1 ? "day" : "days", label: "until your first exam" };
  }
  if (today > last) {
    return { state: "after", big: "Done", unit: "", label: "The NSC finals are finished. Well done!" };
  }
  const next = keys.find((k) => k >= today);
  const days = dayNumber(next) - dayNumber(today);
  if (days === 0) {
    const n = keys.filter((k) => k === today).length;
    return { state: "today", big: "Today", unit: "", label: `${n} paper${n === 1 ? "" : "s"} on today. Good luck!` };
  }
  return { state: "during", big: String(days), unit: days === 1 ? "day" : "days", label: "until your next exam day" };
}
