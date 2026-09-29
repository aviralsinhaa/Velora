/**
 * Text normalization utilities for Velora Concierge
 */

export function normalizeInput(raw: string): string {
  if (!raw) return '';
  
  let text = raw.trim().toLowerCase();

  // Normalize contractions
  text = text
    .replace(/i'm/g, 'i am')
    .replace(/we're/g, 'we are')
    .replace(/we'd/g, 'we would')
    .replace(/we'll/g, 'we will')
    .replace(/it's/g, 'it is')
    .replace(/that's/g, 'that is')
    .replace(/can't/g, 'cannot')
    .replace(/won't/g, 'will not')
    .replace(/don't/g, 'do not')
    .replace(/didn't/g, 'did not')
    .replace(/isn't/g, 'is not')
    .replace(/aren't/g, 'are not')
    .replace(/you're/g, 'you are')
    .replace(/what's/g, 'what is')
    .replace(/how's/g, 'how is')
    .replace(/let's/g, 'let us');

  // Normalize casual slang / greetings
  text = text
    .replace(/\bheyy+\b/g, 'hey')
    .replace(/\bhelloo+\b/g, 'hello')
    .replace(/\bhii+\b/g, 'hi')
    .replace(/\bpls\b/g, 'please')
    .replace(/\bthx\b/g, 'thanks')
    .replace(/\bty\b/g, 'thank you')
    .replace(/\bu\b/g, 'you')
    .replace(/\bur\b/g, 'your')
    .replace(/\br\b/g, 'are');

  // Strip excessive punctuation, keep alphanumeric and basic spacing
  text = text.replace(/[^\w\s-]/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
