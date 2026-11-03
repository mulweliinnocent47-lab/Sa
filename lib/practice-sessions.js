// lib/practice-sessions.js
// One shared list so the Exam Centre AND the practice page agree on each session.

export const SESSIONS = [
  // MATHEMATICS
  { id: "maths-quick-10", subject: "Mathematics", title: "Mathematics quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "maths-mock-1", subject: "Mathematics", title: "Mathematics mock exam — Paper 1", kind: "Full paper", minutes: 180, level: "Hard" },
  { id: "maths-mock-2", subject: "Mathematics", title: "Mathematics mock exam — Paper 2", kind: "Full paper", minutes: 180, level: "Hard" },

  // MATHEMATICAL LITERACY
  { id: "math-lit-quick", subject: "Mathematical Literacy", title: "Mathematical Literacy quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "math-lit-mock-1", subject: "Mathematical Literacy", title: "Mathematical Literacy mock exam — Paper 1", kind: "Full paper", minutes: 180, level: "Hard" },
  { id: "math-lit-mock-2", subject: "Mathematical Literacy", title: "Mathematical Literacy mock exam — Paper 2", kind: "Full paper", minutes: 180, level: "Hard" },

  // PHYSICAL SCIENCES
  { id: "physics-quick", subject: "Physical Sciences", title: "Physical Sciences: Physics quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "physics-mock-1", subject: "Physical Sciences", title: "Physical Sciences mock exam — Paper 1", kind: "Full paper", minutes: 180, level: "Hard" },
  { id: "chemistry-mock-2", subject: "Physical Sciences", title: "Physical Sciences mock exam — Paper 2", kind: "Full paper", minutes: 180, level: "Hard" },

  // LIFE SCIENCES
  { id: "lifesci-topic-test", subject: "Life Sciences", title: "Life Sciences topic test", kind: "20 questions", minutes: 30, level: "Medium" },
  { id: "lifesci-mock-1", subject: "Life Sciences", title: "Life Sciences mock exam — Paper 1", kind: "Full paper", minutes: 150, level: "Hard" },
  { id: "lifesci-mock-2", subject: "Life Sciences", title: "Life Sciences mock exam — Paper 2", kind: "Full paper", minutes: 150, level: "Hard" },

  // ACCOUNTING
  { id: "accounting-quick", subject: "Accounting", title: "Accounting quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "accounting-mock-1", subject: "Accounting", title: "Accounting mock exam — Paper 1", kind: "Full paper", minutes: 120, level: "Hard" },
  { id: "accounting-mock-2", subject: "Accounting", title: "Accounting mock exam — Paper 2", kind: "Full paper", minutes: 120, level: "Hard" },

  // BUSINESS STUDIES
  { id: "business-quick", subject: "Business Studies", title: "Business Studies quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "business-mock-1", subject: "Business Studies", title: "Business Studies mock exam — Paper 1", kind: "Full paper", minutes: 120, level: "Hard" },
  { id: "business-mock-2", subject: "Business Studies", title: "Business Studies mock exam — Paper 2", kind: "Full paper", minutes: 120, level: "Hard" },

  // GEOGRAPHY
  { id: "geography-quick", subject: "Geography", title: "Geography quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "geography-mock-1", subject: "Geography", title: "Geography mock exam — Paper 1", kind: "Full paper", minutes: 180, level: "Hard" },
  { id: "geography-mock-2", subject: "Geography", title: "Geography mock exam — Paper 2", kind: "Full paper", minutes: 180, level: "Hard" },

  // HISTORY
  { id: "history-quick", subject: "History", title: "History quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "history-mock-1", subject: "History", title: "History mock exam — Paper 1", kind: "Full paper", minutes: 180, level: "Hard" },
  { id: "history-mock-2", subject: "History", title: "History mock exam — Paper 2", kind: "Full paper", minutes: 180, level: "Hard" },

  // ECONOMICS
  { id: "economics-quick", subject: "Economics", title: "Economics quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "economics-mock-1", subject: "Economics", title: "Economics mock exam — Paper 1", kind: "Full paper", minutes: 120, level: "Hard" },
  { id: "economics-mock-2", subject: "Economics", title: "Economics mock exam — Paper 2", kind: "Full paper", minutes: 120, level: "Hard" },

  // ENGLISH
  { id: "english-quick", subject: "English Home Language", title: "English HL quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "english-mock-1", subject: "English Home Language", title: "English HL mock exam — Paper 1", kind: "Full paper", minutes: 120, level: "Hard" },
  { id: "english-mock-2", subject: "English Home Language", title: "English HL mock exam — Paper 2", kind: "Full paper", minutes: 150, level: "Hard" },
  { id: "english-mock-3", subject: "English Home Language", title: "English HL mock exam — Paper 3", kind: "Full paper", minutes: 180, level: "Hard" },

  // OTHER POPULAR SUBJECTS
  { id: "tourism-quick", subject: "Tourism", title: "Tourism quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "tourism-mock", subject: "Tourism", title: "Tourism mock exam", kind: "Full paper", minutes: 180, level: "Hard" },

  { id: "agri-quick", subject: "Agricultural Sciences", title: "Agricultural Sciences quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "agri-mock-1", subject: "Agricultural Sciences", title: "Agricultural Sciences mock exam — Paper 1", kind: "Full paper", minutes: 150, level: "Hard" },
  { id: "agri-mock-2", subject: "Agricultural Sciences", title: "Agricultural Sciences mock exam — Paper 2", kind: "Full paper", minutes: 150, level: "Hard" },
];

export const getSession = (id) => SESSIONS.find((s) => s.id === id) ?? null;
