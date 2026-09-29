/**
 * Villa recommendation engine based on user requirements and real resort data
 */

import { veloraResort } from '../../data/resortConfig';
import { Villa } from '../../types';
import { ExtractedEntities } from './entities';

export interface RecommendationResult {
  villa: Villa;
  reasons: string[];
  explanation: string;
}

export function recommendVilla(entities: ExtractedEntities, text: string): RecommendationResult {
  const lower = text.toLowerCase();
  const villas = veloraResort.villas;

  // Rule 1: Large party (4-8 guests)
  if ((entities.guests && entities.guests >= 5) || entities.partyType === 'group' || lower.includes('compound') || lower.includes('estate')) {
    const estate = villas.find((v) => v.id === 'velora-private-estate') || villas[3];
    return {
      villa: estate,
      reasons: [
        'Solitary compound occupying the entire southern island tip',
        '890 m² interior with 4 master suites accommodating up to 8 guests',
        'Private yacht charter options and bespoke in-villa dining',
      ],
      explanation: `For a party of your size, the ${estate.name} is our definitive private compound. Located at the secluded southern tip, it features four master suites, dual pools, and private boat mooring for tailored atoll excursions.`,
    };
  }

  // Rule 2: Family of 3-4 or beach lovers
  if ((entities.guests && entities.guests === 4) || entities.partyType === 'family' || entities.interests.includes('beach') || lower.includes('beach') || lower.includes('sand')) {
    const beach = villas.find((v) => v.id === 'beach-reserve-residence') || villas[2];
    return {
      villa: beach,
      reasons: [
        '50 metres of pristine private shoreline nestled in coconut palms',
        'Twin master pavilions offering 410 m² of barefoot living',
        'Open-air courtyard spa and private beachfront plunge pool',
      ],
      explanation: `I would recommend our ${beach.name}. Set directly on the powder white shoreline and framed by mature coconut palms, it offers two private pavilions and an open-air stone bath just steps from the quiet surf.`,
    };
  }

  // Rule 3: Dawn / Lagoon reef / Marine life focus
  if (lower.includes('sunrise') || lower.includes('dawn') || entities.interests.includes('diving') && lower.includes('lagoon')) {
    const lagoon = villas.find((v) => v.id === 'ocean-lagoon-villa') || villas[1];
    return {
      villa: lagoon,
      reasons: [
        'Direct submerged stairs leading into the calm lagoon reef',
        'East-by-southeast orientation welcoming soft morning dawn light',
        'Glass-floor salon viewing panels and shaded overwater catamaran hammock',
      ],
      explanation: `The ${lagoon.name} would be exceptional for you. Oriented toward the sunrise, it features direct stairs down to the calm coral shallows where reef fish and occasional marine life may drift with the morning tide.`,
    };
  }

  // Rule 4: Default luxury recommendation for couples / sunset lovers / romance / honeymoons
  const sunset = villas.find((v) => v.id === 'sunset-pool-villa') || villas[0];
  const partyDesc = entities.partyType === 'couple' ? 'the two of you' : 'an unforgettable stay';

  return {
    villa: sunset,
    reasons: [
      'Unobstructed due-west open ocean alignment for daily golden sunsets',
      'Private 16-metre saltwater infinity pool suspended over the lagoon',
      'Overwater catamaran net hammock and submerged reef ladder',
    ],
    explanation: `For ${partyDesc}, I would start with the ${sunset.name}. Its west-facing orientation gives you the most spectacular evening horizon in the Maldives directly in front of your private 16-metre infinity pool.`,
  };
}
