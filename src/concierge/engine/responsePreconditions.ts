/**
 * Precondition verification for response candidates.
 * Enforces negative evidence and strictly forbids hallucinating user sentiment or facts.
 */

import { DialogueContext } from './dialogueState';

export function canExpressViewEnjoyment(context: DialogueContext): boolean {
  return (
    context.userExpressedFacts.hasVisualCompliment ||
    context.userExpressedFacts.hasPropertyCompliment
  );
}

export function canMentionHoneymoon(context: DialogueContext): boolean {
  return context.userExpressedFacts.hasMentionedHoneymoon;
}

export function canMentionAnniversary(context: DialogueContext): boolean {
  return context.userExpressedFacts.hasMentionedAnniversary;
}

export function canAssumePrivacyPriority(context: DialogueContext): boolean {
  return context.userExpressedFacts.hasMentionedPrivacy;
}

export function canAssumeFamilyStay(context: DialogueContext): boolean {
  return context.userExpressedFacts.hasMentionedFamily;
}
