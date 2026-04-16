// // ─────────────────────────────────────────────────────────────
// // grades-entry.data.ts
// // Static reference data for UserGradesEntryComponent.
// // Keep all subject lists, grade scales, and category mappings here.
// // ─────────────────────────────────────────────────────────────

// export type ExamBoard   = 'WAEC' | 'CTVET';
// export type WASSCEType  = 'WASSCE_SCHOOL' | 'WASSCE_PRIVATE';
// export type GradeOptions = Record<WASSCEType | 'NAPTEX' | 'TEU', string[]>;

// export interface SubjectDatabase {
//   WAEC: Record<WASSCEType, string[]>;
//   CTVET: {
//     NAPTEX: string[];
//     TEU: string[];
//   };
// }

// // ── Programme categories (used for basic eligibility checks) ──────────────
// export const CATEGORIES: { [key: string]: string[] } = {
//   Science:  ['ENGLISH LANG', 'INTEGRATED SCIENCE', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'MATHEMATICS(CORE)', 'MATHEMATICS(ELECT)'],
//   Arts:     ['ENGLISH LANG', 'SOCIAL STUDIES', 'GOVERNMENT', 'MATHEMATICS(CORE)', 'LITERATURE'],
//   Business: ['ENGLISH LANG', 'MATHEMATICS(CORE)', 'ACCOUNTING', 'ECONOMICS', 'BUSINESS MANAGEMENT'],
// };

// // Flat union of all category subjects (duplicates included — matches original behaviour)
// export const COMBINED_SUBJECTS: string[] = [
//   ...CATEGORIES['Science'],
//   ...CATEGORIES['Arts'],
//   ...CATEGORIES['Business'],
// ];

// // ── Subject lists per exam board / exam type ──────────────────────────────
// const WAEC_SUBJECTS: string[] = [
//   'MATHEMATICS (CORE)', 'MATHEMATICS (ELECTIVE)', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS',
//   'ENGLISH LANG', 'INTEGRATED SCIENCE', 'SOCIAL STUDIES',
//   'CIVIC EDUCATION', 'GENERAL AGRICULTURE', 'ANIMAL HUSBANDRY',
//   'CROP HUSBANDRY AND HORTICULTURE', 'FISHERIES',
//   'COMPUTER SCIENCE', 'FURTHER MATHEMATICS', 'PHYSICAL EDUCATION',
//   'DATA PROCESSING', 'ECONOMICS', 'GEOGRAPHY', 'GOVERNMENT', 'HISTORY',
//   'LITERATURE-IN-ENGLISH', 'CHRISTIAN RELIGIOUS STUDIES', 'ISLAMIC STUDIES',
//   'FRENCH', 'ARABIC', 'HAUSA', 'IGBO', 'YORUBA', 'EDO', 'EFIK', 'IBIBIO',
//   'FINANCIAL ACCOUNTING', 'COMMERCE', 'COST ACCOUNTING', 'BUSINESS MANAGEMENT',
//   'TECHNICAL DRAWING', 'GENERAL KNOWLEDGE IN ART', 'APPLIED ELECTRICITY',
//   'ELECTRONICS', 'AUTO MECHANICS', 'BUILDING CONSTRUCTION', 'METALWORK', 'WOODWORK',
//   'MANAGEMENT IN LIVING', 'FOODS AND NUTRITION', 'CLOTHING AND TEXTILES', 'GRAPHIC DESIGN',
//   'PICTURE MAKING', 'SCULPTURE', 'CERAMICS', 'TEXTILES', 'MUSIC',
// ];

// export const SUBJECT_DATABASE: SubjectDatabase = {
//   WAEC: {
//     WASSCE_SCHOOL:   WAEC_SUBJECTS,
//     WASSCE_PRIVATE:  WAEC_SUBJECTS,
//   },
//   CTVET: {
//     NAPTEX: ['TECHNICAL DRAWING', 'BUILDING CONSTRUCTION', 'METALWORK', 'WOODWORK'],
//     TEU:    ['ELECTRICAL TECHNOLOGY', 'ELECTRONICS', 'AUTO MECHANICS'],
//   },
// };

// // ── Grade scales per exam type ────────────────────────────────────────────
// export const GRADE_OPTIONS: GradeOptions = {
//   WASSCE_SCHOOL:  ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'],
//   WASSCE_PRIVATE: ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'],
//   NAPTEX:         ['PASS', 'FAIL'],
//   TEU:            ['DISTINCTION', 'CREDIT', 'PASS', 'FAIL'],
// };


// ─────────────────────────────────────────────────────────────
// grades-entry.data.ts
// Static reference data for UserGradesEntryComponent.
// Keep all subject lists, grade scales, and category mappings here.
// Subject names validated against 14 Ghanaian university admission sources.
// ─────────────────────────────────────────────────────────────

export type ExamBoard   = 'WAEC' | 'CTVET';
export type WASSCEType  = 'WASSCE_SCHOOL' | 'WASSCE_PRIVATE';
export type GradeOptions = Record<WASSCEType | 'NAPTEX' | 'TEU', string[]>;

export interface SubjectDatabase {
  WAEC: Record<WASSCEType, string[]>;
  CTVET: {
    NAPTEX: string[];
    TEU: string[];
  };
}

// ── Programme categories (used for basic eligibility checks) ──────────────
export const CATEGORIES: { [key: string]: string[] } = {
  Science: [
    'ENGLISH LANGUAGE',
    'INTEGRATED SCIENCE',
    'BIOLOGY',
    'CHEMISTRY',
    'PHYSICS',
    'CORE MATHEMATICS',
    'ELECTIVE MATHEMATICS',
  ],
  Arts: [
    'ENGLISH LANGUAGE',
    'SOCIAL STUDIES',
    'GOVERNMENT',
    'CORE MATHEMATICS',
    'LITERATURE IN ENGLISH',
  ],
  Business: [
    'ENGLISH LANGUAGE',
    'CORE MATHEMATICS',
    'FINANCIAL ACCOUNTING',
    'ECONOMICS',
    'BUSINESS MANAGEMENT',
  ],
};

// Flat union of all category subjects (duplicates included — matches original behaviour)
export const COMBINED_SUBJECTS: string[] = [
  ...CATEGORIES['Science'],
  ...CATEGORIES['Arts'],
  ...CATEGORIES['Business'],
];

// ── Subject lists per exam board / exam type ──────────────────────────────
const WAEC_SUBJECTS: string[] = [
  // ── Core subjects ──────────────────────────────────────────
  'ENGLISH LANGUAGE',
  'CORE MATHEMATICS',
  'INTEGRATED SCIENCE',
  'SOCIAL STUDIES',

  // ── Science electives ──────────────────────────────────────
  'ELECTIVE MATHEMATICS',
  'BIOLOGY',
  'CHEMISTRY',
  'PHYSICS',
  'AGRICULTURAL SCIENCE',
  'GENERAL AGRICULTURE',
  'ANIMAL HUSBANDRY',
  'CROP HUSBANDRY AND HORTICULTURE',
  'FISHERIES',
  'FORESTRY',

  // ── Business electives ─────────────────────────────────────
  'FINANCIAL ACCOUNTING',
  'COST ACCOUNTING',
  'BUSINESS MANAGEMENT',
  'ECONOMICS',
  'BUSINESS MATHEMATICS',
  'COSTING',

  // ── Arts / Humanities electives ────────────────────────────
  'LITERATURE IN ENGLISH',
  'HISTORY',
  'GEOGRAPHY',
  'GOVERNMENT',
  'CHRISTIAN RELIGIOUS STUDIES',
  'ISLAMIC RELIGIOUS STUDIES',
  'FRENCH',
  'GHANAIAN LANGUAGE',

  // ── Technical / Vocational electives ──────────────────────
  'TECHNICAL DRAWING',
  'APPLIED ELECTRICITY',
  'ELECTRONICS',
  'AUTO MECHANICS',
  'BUILDING CONSTRUCTION',
  'METALWORK',
  'WOODWORK',
  'ENGINEERING SCIENCE',

  // ── Home Economics electives ───────────────────────────────
  'FOOD AND NUTRITION',
  'MANAGEMENT IN LIVING',
  'CLOTHING AND TEXTILES',

  // ── Visual Arts electives ──────────────────────────────────
  'GENERAL KNOWLEDGE IN ART',
  'GRAPHIC DESIGN',
  'PICTURE MAKING',
  'SCULPTURE',
  'CERAMICS',
  'TEXTILES',
  'LEATHERWORK',
  'JEWELLERY',
  'BASKETRY',

  // ── Other electives ────────────────────────────────────────
  'MUSIC',
  'PHYSICAL EDUCATION',
  'INFORMATION AND COMMUNICATION TECHNOLOGY',
  'FURTHER MATHEMATICS',
];

export const SUBJECT_DATABASE: SubjectDatabase = {
  WAEC: {
    WASSCE_SCHOOL:  WAEC_SUBJECTS,
    WASSCE_PRIVATE: WAEC_SUBJECTS,
  },
  CTVET: {
    NAPTEX: [
      'TECHNICAL DRAWING',
      'BUILDING CONSTRUCTION',
      'METALWORK',
      'WOODWORK',
    ],
    TEU: [
      'ELECTRICAL TECHNOLOGY',
      'ELECTRONICS',
      'AUTO MECHANICS',
    ],
  },
};

// ── Grade scales per exam type ────────────────────────────────────────────
export const GRADE_OPTIONS: GradeOptions = {
  WASSCE_SCHOOL:  ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'],
  WASSCE_PRIVATE: ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'],
  NAPTEX:         ['PASS', 'FAIL'],
  TEU:            ['DISTINCTION', 'CREDIT', 'PASS', 'FAIL'],
};