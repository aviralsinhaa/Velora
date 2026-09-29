/**
 * Conversational Repair Engine for Velora Concierge
 * Detects breakdowns and repairs dialogue using previous turn context,
 * resolving misunderstandings gracefully instead of repeating scripted resort intros.
 */

import { DialogueContext } from './dialogueState';
import { ComposedResponse } from './responseComposer';

export function isRepairTrigger(normalized: string, rawText: string): boolean {
  const clean = rawText.toLowerCase().trim().replace(/[?!.,]/g, '');
  
  const REPAIR_PHRASES = [
    'what',
    'huh',
    'hein',
    'sorry',
    'what do you mean',
    'i do not understand',
    'i dont understand',
    'that makes no sense',
    'what are you talking about',
    'come again',
    'excuse me',
    'what is that supposed to mean',
    'what does that mean',
    'wtf',
    'pardon',
    'beg your pardon',
  ];

  if (REPAIR_PHRASES.includes(clean)) {
    return true;
  }

  if (
    clean.startsWith('what do you mean') ||
    clean.startsWith('what are you talking about') ||
    clean.startsWith('that makes no sense') ||
    clean.startsWith('that makes zero sense') ||
    clean.startsWith('i do not understand') ||
    clean.startsWith('i dont understand')
  ) {
    return true;
  }

  return false;
}

export function generateRepairResponse(context: DialogueContext): ComposedResponse {
  const prevUserMsg = (context.previousUserMessage || '').toLowerCase();
  const prevAssistantMsg = (context.previousAssistantResponse || '').toLowerCase();
  const prevMeta = context.previousAssistantMeta;

  // Case 1: Previous user asked a social question like "how are you", but assistant gave an unrelated answer
  const isSocialQuestion =
    prevUserMsg.includes('how are you') ||
    prevUserMsg.includes('how are u') ||
    prevUserMsg.includes('how r u') ||
    prevUserMsg.includes('how is it going') ||
    prevUserMsg.includes('how you doing') ||
    prevUserMsg.includes('you good') ||
    prevUserMsg.includes('everything good');

  if (isSocialQuestion) {
    return {
      type: 'clarification',
      message: "Sorry — I misunderstood you. I'm doing well, thank you. How are you doing today?",
      suggestedActions: [],
      perceptualDelayMs: 400,
    };
  }

  // Case 2: Previous assistant response was a greeting or unsolicited intro
  if (prevMeta?.type === 'greeting' || prevAssistantMsg.includes('welcome to velora')) {
    return {
      type: 'clarification',
      message: "Forgive me if that seemed sudden. I am here to help whenever you have questions about the island, or feel free to simply explore at your own pace.",
      suggestedActions: [],
      perceptualDelayMs: 400,
    };
  }

  // Case 3: Previous assistant made a villa recommendation or claim
  if (prevMeta?.hasRecommendation || prevMeta?.type === 'villa_recommendation' || prevMeta?.subjectId) {
    const villaName = prevMeta.subjectId === 'sunset-pool-villa'
      ? 'Sunset Pool Villa'
      : prevMeta.subjectId === 'ocean-lagoon-villa'
      ? 'Ocean Lagoon Villa'
      : prevMeta.subjectId === 'beach-reserve-residence'
      ? 'Beach Reserve Residence'
      : 'Velora Private Estate';

    return {
      type: 'clarification',
      message: `Forgive me if that was unclear. I was suggesting the ${villaName} for your stay because of its setting and views. Did you have a different style of stay in mind?`,
      suggestedActions: [],
      perceptualDelayMs: 450,
    };
  }

  // Case 4: Previous assistant presented pricing or numbers
  if (prevMeta?.type === 'pricing' || prevAssistantMsg.includes('per night') || prevAssistantMsg.includes('total')) {
    return {
      type: 'clarification',
      message: "I was sharing the rates for that stay. Forgive me if that came out unexpectedly — what would you like to know instead?",
      suggestedActions: [],
      perceptualDelayMs: 400,
    };
  }

  // Case 5: Previous assistant presented an itinerary
  if (prevMeta?.type === 'itinerary' || prevAssistantMsg.includes('day-by-day') || prevAssistantMsg.includes('tailored')) {
    return {
      type: 'clarification',
      message: "I was putting together a sample day-by-day schedule for your visit. Forgive me if that moved too quickly. Tell me what you'd like to focus on.",
      suggestedActions: [],
      perceptualDelayMs: 450,
    };
  }

  // Case 6: Generic repair
  return {
    type: 'clarification',
    message: "Sorry about that — I think I misunderstood your previous note. Tell me what you are looking for, and I will keep it simple and direct.",
    suggestedActions: [],
    perceptualDelayMs: 400,
  };
}
