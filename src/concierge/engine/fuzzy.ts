/**
 * Lightweight fuzzy word correction for luxury resort domain
 */

const KNOWN_TYPO_MAP: Record<string, string> = {
  // Villas & accommodations
  vila: 'villa',
  villas: 'villa',
  villasn: 'villa',
  bungalow: 'villa',
  bunglow: 'villa',
  rooom: 'room',
  rom: 'room',
  resort: 'resort',
  sanctuary: 'sanctuary',
  santuary: 'sanctuary',

  // Times & views
  sunet: 'sunset',
  sunst: 'sunset',
  sundown: 'sunset',
  sunries: 'sunrise',
  sunrie: 'sunrise',
  dusk: 'sunset',

  // Qualities & preferences
  privcy: 'privacy',
  privat: 'privacy',
  privte: 'privacy',
  romance: 'romance',
  romantic: 'romantic',
  romntic: 'romantic',
  honeymon: 'honeymoon',
  honeymoonn: 'honeymoon',
  aniversary: 'anniversary',

  // Activities & dining
  divng: 'diving',
  dive: 'diving',
  scuba: 'diving',
  snorkling: 'snorkeling',
  snorkle: 'snorkeling',
  dinig: 'dining',
  dinning: 'dining',
  resturant: 'restaurant',
  restarant: 'restaurant',
  diner: 'dinner',
  omakase: 'omakase',

  // Comparisons & questions
  cheapr: 'cheaper',
  chepr: 'cheaper',
  cheapest: 'cheapest',
  expensiv: 'expensive',
  biggr: 'bigger',
  largr: 'larger',
  whch: 'which',
  wat: 'what',
  recommed: 'recommend',
  recomnd: 'recommend',
};

export function correctTypos(text: string): string {
  const words = text.split(/\s+/);
  const corrected = words.map((w) => {
    if (KNOWN_TYPO_MAP[w]) {
      return KNOWN_TYPO_MAP[w];
    }
    return w;
  });
  return corrected.join(' ');
}
