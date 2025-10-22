export const SECTION_MARKERS = {
  CORE: 'CORE SUBJECTS',
  ALTERNATIVE: 'ALTERNATIVE REQUIREMENTS', 
  RECOMMENDATIONS: 'RECOMMENDATIONS'
} as const;

export const EMOJI_MAPPINGS = {
  CORE: '📚',
  ALTERNATIVE: '🔄',
  RECOMMENDATIONS: '💡'
} as const;


// Fallback markers for when emojis render as question marks
export const FALLBACK_MARKERS = {
  CORE: '?? CORE SUBJECTS ANALYSIS',
  ALTERNATIVE: '?? ALTERNATIVE REQUIREMENTS',
  RECOMMENDATIONS: '?? RECOMMENDATIONS'
} as const;