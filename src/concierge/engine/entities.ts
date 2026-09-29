/**
 * Entity extraction for Velora Concierge
 */

export interface ExtractedEntities {
  guests?: number;
  nights?: number;
  month?: string;
  partyType?: 'solo' | 'couple' | 'family' | 'group';
  villaId?: string;
  interests: string[];
  removals: string[];
  isCorrection?: boolean;
}

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
};

export function extractEntities(text: string): ExtractedEntities {
  const result: ExtractedEntities = {
    interests: [],
    removals: [],
  };

  const lower = text.toLowerCase();

  // 1. Nights extraction
  const nightsMatch = lower.match(/\b(\d+)\s*(?:nights?|days?|nt)\b/);
  if (nightsMatch) {
    result.nights = parseInt(nightsMatch[1], 10);
  } else {
    for (const [word, num] of Object.entries(NUMBER_WORDS)) {
      if (new RegExp(`\\b${word}\\s*(?:nights?|days?)\\b`, 'i').test(lower)) {
        result.nights = num;
        break;
      }
    }
  }

  // Common phrases: "a week" -> 7
  if (lower.includes('a week') || lower.includes('one week') || lower.includes('for a week')) {
    result.nights = 7;
  }

  // 2. Guests / Party Type extraction
  if (
    lower.includes('girlfriend') ||
    lower.includes('boyfriend') ||
    lower.includes('partner') ||
    lower.includes('wife') ||
    lower.includes('husband') ||
    lower.includes('couple') ||
    lower.includes('two of us') ||
    lower.includes('honeymoon') ||
    lower.includes('me and my gf') ||
    lower.includes('me and my girlfriend') ||
    lower.includes('me and my wife')
  ) {
    result.partyType = 'couple';
    result.guests = 2;
  } else if (lower.includes('family') || lower.includes('kids') || lower.includes('children')) {
    result.partyType = 'family';
    result.guests = 4;
  } else if (lower.includes('solo') || lower.includes('myself') || lower.includes('just me')) {
    result.partyType = 'solo';
    result.guests = 1;
  }

  const guestsMatch = lower.match(/\b(\d+)\s*(?:guests?|people|persons?|adults?)\b/);
  if (guestsMatch) {
    result.guests = parseInt(guestsMatch[1], 10);
    if (result.guests > 2) result.partyType = 'group';
  } else {
    for (const [word, num] of Object.entries(NUMBER_WORDS)) {
      if (new RegExp(`\\b${word}\\s*(?:guests?|people|adults?)\\b`, 'i').test(lower)) {
        result.guests = num;
        if (num > 2) result.partyType = 'group';
        break;
      }
    }
  }

  // 3. Month extraction
  for (const m of MONTHS) {
    if (new RegExp(`\\b${m}\\b`, 'i').test(lower)) {
      result.month = m.charAt(0).toUpperCase() + m.slice(1);
      break;
    }
  }

  // 4. Villa references
  if (lower.includes('sunset pool') || lower.includes('sunset villa') || (lower.includes('sunset') && lower.includes('villa'))) {
    result.villaId = 'sunset-pool-villa';
  } else if (lower.includes('ocean lagoon') || lower.includes('lagoon villa') || (lower.includes('lagoon') && lower.includes('villa'))) {
    result.villaId = 'ocean-lagoon-villa';
  } else if (
    lower.includes('beach reserve') ||
    lower.includes('beach sanctuary') ||
    lower.includes('beach residence') ||
    lower.includes('beach villa')
  ) {
    result.villaId = 'beach-reserve-residence';
  } else if (
    lower.includes('estate') ||
    lower.includes('velora estate') ||
    lower.includes('private estate')
  ) {
    result.villaId = 'velora-private-estate';
  }

  // 5. Removals / Negations detection ("no diving", "remove diving", "actually no diving", "cancel spa", "nah remove that")
  const negationMatches = [
    /(?:no|without|remove|cancel|drop|nah|exclude)\s+(diving|dive|scuba)/i,
    /(?:no|without|remove|cancel|drop|nah|exclude)\s+(spa|wellness|massage)/i,
    /(?:no|without|remove|cancel|drop|nah|exclude)\s+(sailing|boat|catamaran)/i,
  ];

  for (const pattern of negationMatches) {
    const match = lower.match(pattern);
    if (match) {
      result.removals.push(match[1].toLowerCase());
      result.isCorrection = true;
    }
  }

  // Generic correction trigger
  if (
    lower.includes('actually') ||
    lower.includes('instead') ||
    lower.includes('make it') ||
    lower.includes('change to') ||
    lower.includes('nah')
  ) {
    result.isCorrection = true;
  }

  // 6. Positive interests (unless in removals)
  if ((lower.includes('diving') || lower.includes('scuba') || lower.includes('reef dive')) && !result.removals.includes('diving') && !result.removals.includes('dive')) {
    result.interests.push('diving');
  }
  if ((lower.includes('spa') || lower.includes('wellness') || lower.includes('massage') || lower.includes('sound bath')) && !result.removals.includes('spa')) {
    result.interests.push('wellness');
  }
  if (lower.includes('dining') || lower.includes('omakase') || lower.includes('food') || lower.includes('romantic dinner')) {
    result.interests.push('dining');
  }
  if (lower.includes('sunset') || lower.includes('evening')) {
    result.interests.push('sunset');
  }
  if (lower.includes('privacy') || lower.includes('secluded') || lower.includes('quiet')) {
    result.interests.push('privacy');
  }
  if (lower.includes('sailing') || lower.includes('catamaran') || lower.includes('dolphin')) {
    result.interests.push('sailing');
  }

  return result;
}
