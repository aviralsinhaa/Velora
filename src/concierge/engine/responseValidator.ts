/**
 * Response Consistency Validator
 * Validates generated responses against dialogue context and negative evidence rules.
 */

import { DialogueContext } from './dialogueState';
import { ComposedResponse } from './responseComposer';
import {
  canExpressViewEnjoyment,
  canMentionHoneymoon,
  canMentionAnniversary,
  canAssumePrivacyPriority,
} from './responsePreconditions';

export function validateAndSanitizeResponse(
  response: ComposedResponse,
  context: DialogueContext
): ComposedResponse {
  let message = response.message;
  let suggestedActions = response.suggestedActions || [];

  // Rule 1: Action Button Relevance Threshold
  // For social conversation, confusion, repair, thanks, goodbye, frustration, meta:
  // DEFAULT: actions = []
  const noActionTypes = [
    'greeting',
  ];

  const lowerMsg = message.toLowerCase();

  const isSocialIntent =
    context.currentUserMessage.includes('how are you') ||
    context.currentUserMessage.includes('how are u') ||
    context.currentUserMessage.includes('hello') ||
    context.currentUserMessage.includes('hi') ||
    context.currentUserMessage.includes('thanks') ||
    context.currentUserMessage.includes('bye') ||
    context.currentUserMessage === 'cool' ||
    context.currentUserMessage === 'okay' ||
    context.currentUserMessage === 'ok' ||
    context.currentUserMessage === 'nice';

  if (noActionTypes.includes(response.type) || isSocialIntent) {
    suggestedActions = [];
  }

  // Rule 2: Negative Evidence on View / Lagoon sentiment
  if (
    (lowerMsg.includes('enjoying the view') || lowerMsg.includes('light across the lagoon is truly exceptional')) &&
    !canExpressViewEnjoyment(context)
  ) {
    // Replace hallucinated view sentiment with natural social acknowledgment
    message = "I'm doing well, thank you. Let me know if there is anything I can share about the island, or feel free to look around at your own pace.";
    suggestedActions = [];
  }

  // Rule 3: Negative Evidence on Honeymoon sentiment
  if (lowerMsg.includes('honeymoon') && !canMentionHoneymoon(context)) {
    message = message.replace(/for your honeymoon,?/gi, 'for your stay,');
    message = message.replace(/honeymoon/gi, 'stay');
  }

  // Rule 4: Negative Evidence on Anniversary sentiment
  if (lowerMsg.includes('anniversary') && !canMentionAnniversary(context)) {
    message = message.replace(/for your anniversary,?/gi, 'for your stay,');
    message = message.replace(/anniversary/gi, 'celebration');
  }

  // Rule 5: Negative Evidence on Privacy assumptions
  if (
    lowerMsg.includes('privacy is important to you') &&
    !canAssumePrivacyPriority(context)
  ) {
    message = "Each villa at Velora is designed with generous space and uninterrupted ocean horizons.";
  }

  // Rule 6: Avoid exact duplicate repetitions of previous assistant message
  if (
    context.previousAssistantResponse &&
    message.trim().toLowerCase() === context.previousAssistantResponse.trim().toLowerCase()
  ) {
    const topic = context.previousAssistantMeta?.topic;
    if (topic === 'pricing') {
      message = "The nightly rate is an indicative concept rate including daily breakfast at AURA and arrival coordination.";
    } else if (topic === 'villa') {
      message = "Would you like me to share additional architectural dimensions or compare this sanctuary with our other residences?";
    } else if (topic === 'dining') {
      message = "Private beach or sandbank dining can also form part of the stay concept.";
    } else if (topic === 'arrival') {
      message = "Seaplane timing would be planned around the international flight schedule.";
    } else {
      message = "Let me know if you would like further details on this, or if you wish to explore other sanctuaries.";
    }
  }

  // Rule 7: AI Identity Honesty Enforcement
  const isAiInquiry =
    context.currentUserMessage.includes('are you ai') ||
    context.currentUserMessage.includes('are you an ai') ||
    context.currentUserMessage.includes('are you a bot') ||
    context.currentUserMessage.includes('are you a robot') ||
    context.currentUserMessage.includes('are you human') ||
    context.currentUserMessage.includes('are you real') ||
    context.currentUserMessage.includes('is this ai') ||
    context.currentUserMessage.includes('is this an ai') ||
    context.currentUserMessage.includes('is this a bot') ||
    context.currentUserMessage.includes('am i talking to a human') ||
    context.currentUserMessage.includes('am i talking to a bot');

  if (isAiInquiry && !lowerMsg.includes('digital concierge')) {
    message = "I'm Velora's digital concierge, built specifically for exploring the island and planning a stay.";
  }

  return {
    ...response,
    message,
    suggestedActions,
  };
}
