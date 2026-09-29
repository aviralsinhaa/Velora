/**
 * Natural conversational response composer with Dialogue-State Reasoning,
 * Precondition verification, and strict Action Relevance thresholding.
 */

import { ConciergeIntent, IntentMatch } from './intents';
import { ExtractedEntities } from './entities';
import { recommendVilla } from './recommendations';
import { generateItinerary, ItineraryDay } from './itinerary';
import { compareVillas, calculateCost } from './comparisons';
import { veloraResort } from '../../data/resortConfig';
import { TripState, SuggestedAction } from '../../data/resortContext';
import { DialogueContext, AssistantResponseMeta, PendingQuestion } from './dialogueState';
import { generateRepairResponse } from './repairEngine';
import { validateAndSanitizeResponse } from './responseValidator';

export interface ComposedResponse {
  type:
    | 'conversation'
    | 'greeting'
    | 'answer'
    | 'clarification'
    | 'villa_recommendation'
    | 'experience_recommendation'
    | 'itinerary'
    | 'itinerary_update'
    | 'booking_handoff';
  message: string;
  tripState?: TripState;
  recommendedVillaId?: string;
  reasons?: string[];
  itineraryDays?: ItineraryDay[];
  diningHighlight?: string;
  wellnessHighlight?: string;
  suggestedActions?: SuggestedAction[];
  bookingAction?: {
    villaId?: string;
    nights?: number;
    guests?: number;
    checkInNote?: string;
  };
  perceptualDelayMs: number;
  responseMeta?: AssistantResponseMeta;
  pendingQuestion?: PendingQuestion | null;
}

const GREETING_VARIANTS = [
  'Welcome to Velora. Take all the time you need to look around, or let me know if there is anything I can share.',
  'Hello. Welcome to the island. Feel free to explore at your own pace, or ask if anything catches your eye.',
  'Good to have you here. Take your time looking around, or let me know if you would like to discover our villas or island life.',
];

const BROWSING_VARIANTS = [
  'Of course. Take your time. If something catches your eye, I am right here.',
  'Take all the time you need. The island is best explored unhurried.',
  'Enjoy looking around. When you are ready to learn about our villas or experiences, simply ask.',
];

const HOW_ARE_YOU_VARIANTS = [
  "I'm doing well, thank you. How about you?",
  'Very well, thank you. Enjoying your look around?',
  "Doing well. I'm here whenever you need me.",
];

export function resolveActiveVillaReferent(context: DialogueContext, entities?: ExtractedEntities): string | undefined {
  // 1. Explicit entity in the message itself
  if (entities?.villaId) return entities.villaId;

  // 2. Selected villa in trip state
  if (context.activeTripState?.selectedVillaId) return context.activeTripState.selectedVillaId;

  // 3. Last villa context in dialogue state
  if (context.lastVillaContext) return context.lastVillaContext;

  // 4. Source context (if opened from a villa)
  if (context.sourceContext?.type === 'villa' && context.sourceContext.id) {
    return context.sourceContext.id;
  }

  // 5. Recent assistant subject/entity
  if (context.previousAssistantMeta?.subjectId && veloraResort.villas.some((v) => v.id === context.previousAssistantMeta?.subjectId)) {
    return context.previousAssistantMeta.subjectId;
  }

  // 6. Pending question / entity
  if (context.pendingQuestion?.expectedEntity && veloraResort.villas.some((v) => v.id === context.pendingQuestion?.expectedEntity)) {
    return context.pendingQuestion.expectedEntity;
  }

  // 7. Recent conversation turns (check recent assistant and user turns for a villa referent)
  for (const turn of [...(context.recentTurns || [])].reverse()) {
    if (turn.entities?.villaId) return turn.entities.villaId;
    if (turn.responseMeta?.subjectId && veloraResort.villas.some((v) => v.id === turn.responseMeta?.subjectId)) {
      return turn.responseMeta.subjectId;
    }
  }

  return undefined;
}

export function isSingularPronounReference(text: string): boolean {
  const lower = text.toLowerCase().trim();
  // Check if explicit villa name or general list query is present
  if (
    lower.includes('ritual') ||
    lower.includes('treatment') ||
    lower.includes('massage') ||
    lower.includes('wellness') ||
    lower.includes('spa') ||
    lower.includes('dining') ||
    lower.includes('restaurant') ||
    lower.includes('dish') ||
    lower.includes('menu') ||
    lower.includes('experience') ||
    lower.includes('excursion') ||
    lower.includes('sunset') ||
    lower.includes('lagoon') ||
    lower.includes('beach reserve') ||
    lower.includes('estate') ||
    lower.includes('all villas') ||
    lower.includes('all of them') ||
    lower.includes('every villa') ||
    lower.includes('each villa') ||
    lower.includes('which villas') ||
    lower.includes('what villas') ||
    lower.includes('any villas') ||
    lower.includes('both villas')
  ) {
    return false;
  }

  return (
    /\b(does|has|is|can|could|would|will)\s+(it|this|that)\b/i.test(lower) ||
    /\b(how|what)\s+(big|much|private|is)\s+(is\s+)?(it|this|that)\b/i.test(lower) ||
    /\b(book|reserve|see|view|show)\s+(it|this|that)\b/i.test(lower) ||
    /\b(show|give|tell)\s+(me\s+)?(it|this|that)\b/i.test(lower) ||
    /\bshow\s+(it|this|that)\s+to\s+me\b/i.test(lower) ||
    /\bwhat\s+does\s+(it|this|that)\s+cost\b/i.test(lower) ||
    /\bcan\s+(we|i)\s+(book|reserve)\s+(it|this|that)\b/i.test(lower) ||
    /\bhow\s+big\s+is\s+(it|this|that)\b/i.test(lower) ||
    /\bis\s+(it|this|that)\s+private\b/i.test(lower) ||
    /\bis\s+(it|this|that)\s+secluded\b/i.test(lower) ||
    /\bdoes\s+(it|this|that)\s+have\b/i.test(lower) ||
    /\bhow\s+much\s+is\s+(it|this|that)\b/i.test(lower) ||
    /\bis\s+(it|this|that)\s+available\b/i.test(lower) ||
    /\bwhat\s+is\s+(its|the)\s+price\b/i.test(lower) ||
    lower === 'does it have a pool' ||
    lower === 'does it have a pool?' ||
    lower === 'how big is it' ||
    lower === 'how big is it?' ||
    lower === 'is it private' ||
    lower === 'is it private?' ||
    lower === 'what does it cost' ||
    lower === 'what does it cost?' ||
    lower === 'can we book it' ||
    lower === 'can we book it?' ||
    lower === 'show it to me' ||
    lower === 'show it to me?'
  );
}

export function composeResponse(
  intentMatch: IntentMatch,
  entities: ExtractedEntities,
  rawText: string,
  context: DialogueContext
): ComposedResponse {
  const { intent, subType } = intentMatch;
  const lower = rawText.toLowerCase().trim();
  const currentState = context.activeTripState;
  const lastVillaContext = context.lastVillaContext;

  let candidate: ComposedResponse;

  // 1. Conversational Repair (First-Class Dialogue Behavior)
  if (intent === 'CONVERSATIONAL_REPAIR') {
    candidate = generateRepairResponse(context);
    candidate.responseMeta = {
      type: 'repair',
      text: candidate.message,
      topic: 'repair',
      wasMisunderstood: true,
      intent,
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 1b. Singular Pronoun Reference Check without Referent (First-Class Antecedent Resolution)
  if (
    isSingularPronounReference(rawText) &&
    !resolveActiveVillaReferent(context, entities) &&
    context.sourceContext?.type !== 'wellness' &&
    context.sourceContext?.type !== 'dining' &&
    context.sourceContext?.type !== 'experience'
  ) {
    let clarifMsg = 'Which villa do you mean?';
    if (lower.includes('book') || lower.includes('reserve')) {
      clarifMsg = 'Which villa would you like to request?';
    } else if (lower.includes('big') || lower.includes('size')) {
      clarifMsg = 'Which villa would you like me to check?';
    } else if (
      lower.includes('cost') ||
      lower.includes('price') ||
      lower.includes('rate') ||
      lower.includes('how much')
    ) {
      clarifMsg = 'Which villa would you like me to check?';
    } else if (
      lower.includes('show') ||
      lower.includes('view') ||
      lower.includes('see')
    ) {
      clarifMsg = 'Which villa would you like to view?';
    } else {
      clarifMsg = 'Which villa do you mean?';
    }

    candidate = {
      type: 'clarification',
      message: clarifMsg,
      suggestedActions: [
        { type: 'view_villa', label: 'SUNSET POOL VILLA', villaId: 'sunset-pool-villa' },
        { type: 'view_villa', label: 'OCEAN LAGOON VILLA', villaId: 'ocean-lagoon-villa' },
        { type: 'view_villa', label: 'BEACH RESERVE RESIDENCE', villaId: 'beach-reserve-residence' },
        { type: 'compare_villas', label: 'COMPARE ALL VILLAS' },
      ],
      perceptualDelayMs: 400,
      responseMeta: {
        type: 'clarification',
        topic: 'villa',
        text: clarifMsg,
        intent: 'VILLA_DETAIL',
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 2. Pending Question Resolutions
  if (intent === 'PENDING_ANSWER') {
    if (subType === 'NO_VILLA_SELECTED') {
      const pendingQ: PendingQuestion = {
        type: 'VILLA_PREFERENCE',
        expectedEntity: 'villa_preference',
        askedAtTurn: context.turnCount,
        questionText: 'What setting appeals to you most — over the water or nestled on the beach?',
        options: ['Overwater', 'Beachfront'],
      };

      candidate = {
        type: 'conversation',
        message: 'No problem at all. We have four exquisite architectural sanctuaries: overwater pool villas, lagoon villas, beach residences, and our private estate. What setting appeals to you most — over the water or nestled on the beach?',
        suggestedActions: [
          { label: 'OVERWATER VILLAS', prompt: 'I prefer overwater.' },
          { label: 'BEACH RESIDENCES', prompt: 'I prefer beachfront.' },
        ],
        perceptualDelayMs: 400,
        pendingQuestion: pendingQ,
        responseMeta: {
          type: 'question',
          text: 'What setting appeals to you most — over the water or nestled on the beach?',
          topic: 'villa',
          askedQuestion: pendingQ,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'PREFER_OVERWATER') {
      candidate = {
        type: 'answer',
        message: 'Our overwater sanctuaries include the Sunset Pool Villa (due-west facing with a private 16m infinity pool) and the Ocean Lagoon Villa (sunrise facing with direct lagoon reef steps). Which orientation would you prefer?',
        recommendedVillaId: 'sunset-pool-villa',
        suggestedActions: [
          { type: 'view_villa', label: 'SUNSET POOL VILLA', villaId: 'sunset-pool-villa' },
          { type: 'view_villa', label: 'OCEAN LAGOON VILLA', villaId: 'ocean-lagoon-villa' },
        ],
        perceptualDelayMs: 450,
        responseMeta: {
          type: 'villa_recommendation',
          subjectId: 'sunset-pool-villa',
          topic: 'villa',
          claims: ['overwater', 'sunset-facing', 'private-pool'],
          hasRecommendation: true,
          text: 'Our overwater sanctuaries include the Sunset Pool Villa and Ocean Lagoon Villa.',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'PREFER_BEACH') {
      candidate = {
        type: 'answer',
        message: 'Our Beach Reserve Residence offers 50 metres of pristine private shoreline, nestled beneath mature palms with twin master pavilions and an open-air plunge pool. Would you like to see details or plan a stay?',
        recommendedVillaId: 'beach-reserve-residence',
        suggestedActions: [
          { type: 'view_villa', label: 'VIEW BEACH RESIDENCE', villaId: 'beach-reserve-residence' },
          { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: 'beach-reserve-residence' },
        ],
        perceptualDelayMs: 450,
        responseMeta: {
          type: 'villa_recommendation',
          subjectId: 'beach-reserve-residence',
          topic: 'villa',
          claims: ['beachfront', 'shoreline', 'twin-master-pavilions'],
          hasRecommendation: true,
          text: 'Our Beach Reserve Residence offers 50 metres of private shoreline.',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'ANSWER_NIGHTS') {
      const numNights = entities.nights || 5;
      const updatedState = { ...currentState, nights: numNights };
      const activeVillaId = lastVillaContext || currentState.selectedVillaId;

      if (!activeVillaId) {
        candidate = {
          type: 'answer',
          message: `Understood — ${numNights} nights. Depending on whether you prefer an overwater sanctuary or a beach residence, nightly rates range from $2,400 to $9,800 inclusive of daily artisanal breakfast and personalized stay assistance. Which setting appeals to you?`,
          tripState: updatedState,
          suggestedActions: [
            { label: 'OVERWATER VILLAS', prompt: 'Tell me about overwater villas.' },
            { label: 'BEACH RESIDENCES', prompt: 'Tell me about beachfront sanctuaries.' },
            { type: 'compare_villas', label: 'COMPARE ALL VILLAS' },
          ],
          perceptualDelayMs: 500,
          responseMeta: {
            type: 'pricing',
            topic: 'pricing',
            text: `Understood — ${numNights} nights. Nightly rates range from $2,400 to $9,800.`,
            intent,
          },
        };
        return validateAndSanitizeResponse(candidate, context);
      }

      const cost = calculateCost(activeVillaId, numNights);

      candidate = {
        type: 'answer',
        message: `Understood — ${numNights} nights. ${cost.summaryText}`,
        tripState: updatedState,
        recommendedVillaId: activeVillaId,
        suggestedActions: [
          { label: 'PLAN FULL ITINERARY', prompt: `Plan a ${numNights}-night itinerary for us.` },
          { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: activeVillaId, nights: numNights },
        ],
        perceptualDelayMs: 500,
        responseMeta: {
          type: 'pricing',
          subjectId: activeVillaId,
          topic: 'pricing',
          text: `Understood — ${numNights} nights. ${cost.summaryText}`,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }
  }

  // 3. Contextual Follow-up Queries ("why?", "how much?", "show me", "cheaper one?")
  if (intent === 'FOLLOWUP_QUERY') {
    if (subType === 'WHY') {
      const prevMeta = context.previousAssistantMeta;
      let explanation = 'Each recommendation at Velora is tailored to create an unhurried, private island retreat.';
      let subjectId = lastVillaContext;

      if (prevMeta?.subjectId === 'sunset-pool-villa' || lastVillaContext === 'sunset-pool-villa') {
        explanation = 'I recommended the Sunset Pool Villa because its due-west alignment captures unobstructed Maldivian sunsets directly from your private 16-metre infinity pool and overwater catamaran hammock.';
        subjectId = 'sunset-pool-villa';
      } else if (prevMeta?.subjectId === 'ocean-lagoon-villa' || lastVillaContext === 'ocean-lagoon-villa') {
        explanation = 'I recommended the Ocean Lagoon Villa because of its direct submerged staircase to the calm house reef, ideal for early morning snorkeling.';
        subjectId = 'ocean-lagoon-villa';
      } else if (prevMeta?.subjectId === 'beach-reserve-residence' || lastVillaContext === 'beach-reserve-residence') {
        explanation = 'I recommended the Beach Reserve Residence for its direct barefoot access to 50 metres of private powder-white beach sheltered by mature coconut palms.';
        subjectId = 'beach-reserve-residence';
      } else if (prevMeta?.type === 'pricing') {
        explanation = 'That rate includes daily artisanal breakfast at AURA, personalized stay assistance, and all non-motorized watersports across the lagoon.';
      }

      candidate = {
        type: 'answer',
        message: explanation,
        recommendedVillaId: subjectId,
        suggestedActions: [],
        perceptualDelayMs: 450,
        responseMeta: {
          type: 'explanation',
          subjectId,
          topic: 'villa',
          text: explanation,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'CHEAPER') {
      const lagoonVilla = veloraResort.villas.find((v) => v.id === 'ocean-lagoon-villa') || veloraResort.villas[1];
      candidate = {
        type: 'answer',
        message: `Our most accessible overwater sanctuary is the ${lagoonVilla.name} at $${lagoonVilla.pricePerNight.toLocaleString()} per night, offering ${lagoonVilla.size} of overwater living and direct stairs into the calm lagoon reef waters.`,
        recommendedVillaId: lagoonVilla.id,
        suggestedActions: [
          { type: 'view_villa', label: 'EXPLORE LAGOON VILLA', villaId: lagoonVilla.id },
          { type: 'compare_villas', label: 'COMPARE OVERWATER VILLAS' },
        ],
        perceptualDelayMs: 500,
        responseMeta: {
          type: 'villa_recommendation',
          subjectId: lagoonVilla.id,
          topic: 'villa',
          hasRecommendation: true,
          text: `Our most accessible sanctuary is the ${lagoonVilla.name}.`,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'BIGGER') {
      const beachVilla = veloraResort.villas.find((v) => v.id === 'beach-reserve-residence') || veloraResort.villas[2];
      candidate = {
        type: 'answer',
        message: `For more space, our ${beachVilla.name} offers ${beachVilla.size} of barefoot beachfront living ($${beachVilla.pricePerNight.toLocaleString()}/night), while the Velora Private Estate spans 890 m² across 4 master suites ($8,900/night).`,
        recommendedVillaId: beachVilla.id,
        suggestedActions: [
          { type: 'view_villa', label: 'VIEW BEACH RESIDENCE', villaId: beachVilla.id },
          { type: 'compare_villas', label: 'COMPARE ALL VILLAS' },
        ],
        perceptualDelayMs: 500,
        responseMeta: {
          type: 'villa_recommendation',
          subjectId: beachVilla.id,
          topic: 'villa',
          hasRecommendation: true,
          text: `For more space, our ${beachVilla.name} offers ${beachVilla.size}.`,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'AND_THEN') {
      candidate = {
        type: 'conversation',
        message: 'From here we can examine specific villa features, design a daily itinerary, or prepare a stay inquiry whenever you are ready.',
        suggestedActions: [],
        perceptualDelayMs: 400,
      };
      return validateAndSanitizeResponse(candidate, context);
    }
  }

  // 4. Social: How Are You (Natural, grounded social response — NO hallucinated lagoon/view comments!)
  if (intent === 'SOCIAL_HOW_ARE_YOU') {
    const msg = HOW_ARE_YOU_VARIANTS[Math.floor(Math.random() * HOW_ARE_YOU_VARIANTS.length)];
    candidate = {
      type: 'conversation',
      message: msg,
      suggestedActions: [], // Zero actions on social chat!
      perceptualDelayMs: 400,
      responseMeta: {
        type: 'how_are_you',
        text: msg,
        topic: 'social',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 5. Social: Greeting
  if (intent === 'SOCIAL_GREETING') {
    const msg = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
    candidate = {
      type: 'greeting',
      message: msg,
      suggestedActions: [], // No aggressive actions on greeting
      perceptualDelayMs: 400,
      responseMeta: {
        type: 'greeting',
        text: msg,
        topic: 'social',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 6. Social: User is fine ("I'm good", "doing well")
  if (intent === 'SOCIAL_USER_IS_FINE') {
    candidate = {
      type: 'conversation',
      message: 'Glad to hear that. Take all the time you need to look around, or let me know if you would like to explore our villas or experiences.',
      suggestedActions: [],
      perceptualDelayMs: 350,
      responseMeta: {
        type: 'social_reply',
        text: 'Glad to hear that.',
        topic: 'social',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 7. Social: Positive Reaction (Only when user explicitly complimented view/place!)
  if (intent === 'SOCIAL_POSITIVE_REACTION') {
    candidate = {
      type: 'conversation',
      message: 'Thank you. The natural coral reef and serene lagoon light here in Noonu Atoll are truly special. Would you like to see our overwater villas or beachfront residences?',
      suggestedActions: [
        { label: 'OVERWATER VILLAS', prompt: 'Tell me about the overwater villas.' },
        { label: 'BEACH RESIDENCES', prompt: 'Tell me about the beachfront residences.' },
      ],
      perceptualDelayMs: 450,
      responseMeta: {
        type: 'positive_ack',
        text: 'Thank you. The natural coral reef and serene lagoon light here in Noonu Atoll are truly special.',
        topic: 'property',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 8. Social: Small Talk ("cool", "okay", "nice")
  if (intent === 'SOCIAL_SMALL_TALK') {
    candidate = {
      type: 'conversation',
      message: 'Always a pleasure. Let me know if you would like to explore our villas, dining, or island rhythms.',
      suggestedActions: [],
      perceptualDelayMs: 350,
      responseMeta: {
        type: 'small_talk',
        text: 'Always a pleasure.',
        topic: 'social',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 9. Social: Thanks
  if (intent === 'SOCIAL_THANKS') {
    candidate = {
      type: 'conversation',
      message: 'You are very welcome. Reach out anytime if you need more details about Velora.',
      suggestedActions: [],
      perceptualDelayMs: 350,
      responseMeta: {
        type: 'thanks_ack',
        text: 'You are very welcome.',
        topic: 'social',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 10. Social: Goodbye
  if (intent === 'SOCIAL_GOODBYE') {
    candidate = {
      type: 'conversation',
      message: 'Farewell for now. We hope to welcome you to Velora’s quiet waters soon.',
      suggestedActions: [],
      perceptualDelayMs: 350,
      responseMeta: {
        type: 'farewell',
        text: 'Farewell for now.',
        topic: 'social',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 11. Social: Frustration
  if (intent === 'SOCIAL_FRUSTRATION') {
    candidate = {
      type: 'conversation',
      message: 'Fair reaction. Something clearly did not land. Tell me what you are looking for, and I will keep it simple and direct.',
      suggestedActions: [],
      perceptualDelayMs: 400,
      responseMeta: {
        type: 'frustration_ack',
        text: 'Fair reaction. What were you trying to find?',
        topic: 'social',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 12. Social: Meta / Capabilities
  // 12. Social: Meta / Capabilities / AI Identity Honesty
  if (intent === 'SOCIAL_META') {
    if (subType === 'CHATGPT') {
      candidate = {
        type: 'answer',
        message: "No — I'm Velora's private digital concierge.",
        suggestedActions: [],
        perceptualDelayMs: 300,
        responseMeta: {
          type: 'ai_honesty',
          text: "No — I'm Velora's private digital concierge.",
          topic: 'meta',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'GEMINI') {
      candidate = {
        type: 'answer',
        message: "No. I'm Velora's own concierge experience.",
        suggestedActions: [],
        perceptualDelayMs: 300,
        responseMeta: {
          type: 'ai_honesty',
          text: "No. I'm Velora's own concierge experience.",
          topic: 'meta',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'MODEL_QUESTION') {
      candidate = {
        type: 'answer',
        message: "I'm a purpose-built conversational concierge for Velora rather than a general-purpose assistant.",
        suggestedActions: [],
        perceptualDelayMs: 350,
        responseMeta: {
          type: 'ai_honesty',
          text: "I'm a purpose-built conversational concierge for Velora rather than a general-purpose assistant.",
          topic: 'meta',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'AI_IDENTITY') {
      candidate = {
        type: 'answer',
        message: "I'm Velora's digital concierge, built specifically for exploring the island and planning a stay.",
        suggestedActions: [],
        perceptualDelayMs: 350,
        responseMeta: {
          type: 'ai_honesty',
          text: "I'm Velora's digital concierge, built specifically for exploring the island and planning a stay.",
          topic: 'meta',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'TALK_TO_HUMAN') {
      candidate = {
        type: 'answer',
        message: "In a live resort deployment, your request would be passed to the guest experience team. Here, I can help you prepare the details.",
        suggestedActions: [
          { type: 'request_stay', label: 'REQUEST YOUR STAY' },
        ],
        perceptualDelayMs: 400,
        responseMeta: {
          type: 'human_contact',
          text: "In a live resort deployment, your request would be passed to the guest experience team.",
          topic: 'meta',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    candidate = {
      type: 'answer',
      message: 'I am Velora’s private island concierge. I can answer questions about the island, compare sanctuaries, calculate stay rates, and design a customized itinerary for your visit.',
      suggestedActions: [],
      perceptualDelayMs: 400,
      responseMeta: {
        type: 'meta_overview',
        text: 'I am Velora’s private island concierge.',
        topic: 'meta',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 13. Browsing
  if (intent === 'BROWSING') {
    const msg = BROWSING_VARIANTS[Math.floor(Math.random() * BROWSING_VARIANTS.length)];
    candidate = {
      type: 'conversation',
      message: msg,
      suggestedActions: [],
      perceptualDelayMs: 400,
      responseMeta: {
        type: 'browsing',
        text: msg,
        topic: 'browsing',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 14. 360 / Visual Tour
  if (intent === 'VILLA_360') {
    const activeVillaId = resolveActiveVillaReferent(context, entities);
    if (!activeVillaId) {
      candidate = {
        type: 'clarification',
        message: 'Which villa would you like to view? You can explore our sanctuaries in high-fidelity 360° spatial panoramas.',
        suggestedActions: [
          { type: 'open_360', label: 'SUNSET VILLA 360°', sceneId: 'sunset-exterior' },
          { type: 'open_360', label: 'LAGOON VILLA 360°', sceneId: 'lagoon-exterior' },
          { type: 'open_360', label: 'BEACH RESERVE 360°', sceneId: 'beach-reserve' },
        ],
        perceptualDelayMs: 400,
        responseMeta: {
          type: 'spatial_360',
          topic: 'villa',
          text: 'Which villa would you like to view?',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }
    const villa = veloraResort.villas.find((v) => v.id === activeVillaId) || veloraResort.villas[0];
    candidate = {
      type: 'answer',
      message: `You can step directly into a 360° spatial panorama of the ${villa.name} to view the ocean horizon and infinity deck.`,
      recommendedVillaId: villa.id,
      suggestedActions: [
        { type: 'open_360', label: '360° TOUR', sceneId: villa.panoramaSceneId || 'sunset-exterior' },
        { type: 'view_villa', label: 'VIEW VILLA', villaId: villa.id },
        { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: villa.id },
      ],
      perceptualDelayMs: 500,
      responseMeta: {
        type: 'spatial_360',
        subjectId: villa.id,
        topic: 'villa',
        text: `You can step directly into a 360° spatial panorama of the ${villa.name}.`,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 15. Villa Comparison
  if (intent === 'VILLA_COMPARE') {
    const compText = compareVillas('sunset-pool-villa', 'ocean-lagoon-villa');
    candidate = {
      type: 'answer',
      message: compText,
      suggestedActions: [
        { type: 'compare_villas', label: 'COMPARE ALL VILLAS' },
        { type: 'view_villa', label: 'VIEW SUNSET VILLA', villaId: 'sunset-pool-villa' },
        { type: 'view_villa', label: 'VIEW LAGOON VILLA', villaId: 'ocean-lagoon-villa' },
      ],
      perceptualDelayMs: 650,
      responseMeta: {
        type: 'comparison',
        subjectId: 'sunset-pool-villa',
        topic: 'villa',
        text: compText,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 16. Villa Price & Arithmetic
  if (intent === 'VILLA_PRICE') {
    const targetVillaId = resolveActiveVillaReferent(context, entities);
    if (!targetVillaId) {
      candidate = {
        type: 'clarification',
        message: 'Which villa would you like the rate for? We feature the Sunset Pool Villa, Ocean Lagoon Villa, Beach Reserve Residence, and The Velora Estate.',
        suggestedActions: [
          { type: 'view_villa', label: 'SUNSET POOL VILLA', villaId: 'sunset-pool-villa' },
          { type: 'view_villa', label: 'OCEAN LAGOON VILLA', villaId: 'ocean-lagoon-villa' },
          { type: 'compare_villas', label: 'COMPARE ALL VILLAS' },
        ],
        perceptualDelayMs: 400,
        responseMeta: {
          type: 'pricing_clarification',
          topic: 'pricing',
          text: 'Which villa would you like the rate for?',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    const nights = entities.nights || currentState.nights || 5;
    const cost = calculateCost(targetVillaId, nights);
    candidate = {
      type: 'answer',
      message: cost.summaryText,
      recommendedVillaId: targetVillaId,
      suggestedActions: [
        { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: targetVillaId, nights },
        { type: 'view_villa', label: 'VIEW VILLA', villaId: targetVillaId },
      ],
      perceptualDelayMs: 550,
      responseMeta: {
        type: 'pricing',
        subjectId: targetVillaId,
        topic: 'pricing',
        claims: [cost.summaryText],
        text: cost.summaryText,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 17. Villa Detail Queries
  if (intent === 'VILLA_DETAIL') {
    if (
      subType === 'ALL_POOLS' ||
      lower.includes('all villas have pools') ||
      lower.includes('all villas have a pool') ||
      lower.includes('do all villas have') ||
      lower.includes('every villa have a pool')
    ) {
      const allPoolsMsg =
        'Yes, every villa and residence at Velora features a private pool — from 16-metre overwater infinity pools at our Sunset Pool Villas to secluded courtyard plunge pools at our beachfront residences.';
      candidate = {
        type: 'answer',
        message: allPoolsMsg,
        suggestedActions: [
          { type: 'view_villa', label: 'SUNSET POOL VILLA', villaId: 'sunset-pool-villa' },
          { type: 'view_villa', label: 'OCEAN LAGOON VILLA', villaId: 'ocean-lagoon-villa' },
          { type: 'view_villa', label: 'BEACH RESERVE RESIDENCE', villaId: 'beach-reserve-residence' },
          { type: 'compare_villas', label: 'COMPARE ALL VILLAS' },
        ],
        perceptualDelayMs: 400,
        responseMeta: {
          type: 'villa_detail',
          topic: 'villa',
          text: allPoolsMsg,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (
      subType === 'OVERWATER_LIST' ||
      lower.includes('villas are overwater') ||
      lower.includes('which villas are overwater')
    ) {
      const overwaterMsg =
        'Our overwater sanctuaries include the Sunset Pool Villa (due-west facing with a private 16-metre infinity pool) and the Ocean Lagoon Villa (sunrise facing with direct lagoon reef steps).';
      candidate = {
        type: 'answer',
        message: overwaterMsg,
        suggestedActions: [
          { type: 'view_villa', label: 'SUNSET POOL VILLA', villaId: 'sunset-pool-villa' },
          { type: 'view_villa', label: 'OCEAN LAGOON VILLA', villaId: 'ocean-lagoon-villa' },
          { type: 'compare_villas', label: 'COMPARE OVERWATER VILLAS' },
        ],
        perceptualDelayMs: 400,
        responseMeta: {
          type: 'villa_detail',
          topic: 'villa',
          text: overwaterMsg,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    const activeVillaId = resolveActiveVillaReferent(context, entities);
    const isPrivacy =
      subType === 'PRIVACY' ||
      lower.includes('private') ||
      lower.includes('privacy') ||
      lower.includes('secluded') ||
      lower.includes('seclusion') ||
      lower.includes('neighbors') ||
      lower.includes('isolated');

    if (!activeVillaId) {
      let clarifMsg = '';
      if (lower.includes('pool') || lower.includes('does it have')) {
        clarifMsg =
          'Which villa do you mean? Every sanctuary at Velora features a private pool, from 16-metre overwater infinity pools to secluded garden courtyard plunge pools.';
      } else if (lower.includes('big') || lower.includes('size') || lower.includes('area')) {
        clarifMsg =
          'Which villa would you like me to check? Velora’s sanctuaries range from 340 sqm for our Sunset Pool Villas up to 1,280 sqm for the four-bedroom Velora Private Estate.';
      } else if (isPrivacy) {
        clarifMsg =
          'Which villa do you mean? Every sanctuary at Velora is designed with architectural seclusion — from acoustic teak privacy fins on overwater decks to dense palm groves surrounding our beach residences.';
      } else {
        clarifMsg =
          'Which villa would you like me to check? We feature four distinct architectural sanctuaries: the Sunset Pool Villa, the Ocean Lagoon Villa, the Beach Reserve Residence, and the Velora Private Estate.';
      }
      candidate = {
        type: 'clarification',
        message: clarifMsg,
        suggestedActions: [
          { type: 'view_villa', label: 'SUNSET POOL VILLA', villaId: 'sunset-pool-villa' },
          { type: 'view_villa', label: 'OCEAN LAGOON VILLA', villaId: 'ocean-lagoon-villa' },
          { type: 'view_villa', label: 'BEACH RESERVE RESIDENCE', villaId: 'beach-reserve-residence' },
          { type: 'compare_villas', label: 'COMPARE ALL VILLAS' },
        ],
        perceptualDelayMs: 400,
        responseMeta: {
          type: 'villa_detail',
          topic: 'villa',
          text: clarifMsg,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    const villa = veloraResort.villas.find((v) => v.id === activeVillaId) || veloraResort.villas[0];

    let detailMsg = '';

    if (isPrivacy) {
      if (villa.id === 'sunset-pool-villa') {
        detailMsg = `The Sunset Pool Villa provides consummate privacy. Each villa is angled along a curved overwater jetty with custom acoustic teak privacy fins, ensuring your 16-metre infinity pool, sundeck, and catamaran net remain completely unobserved by neighbors while gazing west over the uninterrupted Indian Ocean.`;
      } else if (villa.id === 'ocean-lagoon-villa') {
        detailMsg = `The Ocean Lagoon Villa is suspended over calm shallow water with generous 25-metre spacing between sanctuaries. Privacy screening and angled oceanfront decks ensure your private sundeck and submerged lagoon stairs are completely secluded.`;
      } else if (villa.id === 'beach-reserve-residence') {
        detailMsg = `The Beach Reserve Residence delivers unparalleled natural seclusion. Sheltered by mature coconut palms and lush coastal vegetation, it commands 50 metres of exclusive private powder-white beach, an enclosed courtyard plunge pool, and open-air garden bathrooms.`;
      } else if (villa.id === 'velora-private-estate') {
        detailMsg = `The Velora Private Estate is our most secluded sanctuary, sequestered on its own private peninsula at the southern tip of the island. It features total perimeter seclusion, a private arrival dock, and walled tropical gardens with dual private pools.`;
      } else {
        detailMsg = `The ${villa.name} is designed with architectural seclusion, private plunge pools, and uninterrupted ocean panoramas.`;
      }
    } else if (lower.includes('pool')) {
      if (villa.id === 'beach-reserve-residence') {
        detailMsg = `Yes, the ${villa.name} features a private secluded courtyard plunge pool surrounded by lush tropical gardens, just steps from the private beach.`;
      } else if (villa.id === 'velora-private-estate') {
        detailMsg = `Yes, the ${villa.name} features dual private pools: a grand beachfront infinity pool and a secluded courtyard plunge pool.`;
      } else if (villa.id === 'ocean-lagoon-villa') {
        detailMsg = `Yes, the ${villa.name} features a private overwater plunge pool perched above the lagoon, with direct staircase access into the living coral reef.`;
      } else {
        detailMsg = `Yes, the ${villa.name} features a 16-metre private overwater infinity pool with uninterrupted sunset views across the Indian Ocean.`;
      }
    } else if (lower.includes('big') || lower.includes('size') || lower.includes('area')) {
      detailMsg = `The ${villa.name} spans ${villa.size} of seamless indoor and outdoor living space, accommodating ${villa.guests}.`;
    } else {
      detailMsg = `The ${villa.name} is a ${villa.subtitle} spanning ${villa.size}. It includes ${villa.highlights.join(', ')}.`;
    }

    candidate = {
      type: 'answer',
      message: detailMsg,
      recommendedVillaId: villa.id,
      suggestedActions: [
        { type: 'open_360', label: '360° TOUR', sceneId: villa.panoramaSceneId || 'sunset-exterior' },
        { type: 'view_villa', label: 'VIEW VILLA', villaId: villa.id },
        { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: villa.id },
      ],
      perceptualDelayMs: 550,
      responseMeta: {
        type: 'villa_detail',
        subjectId: villa.id,
        topic: 'villa',
        text: detailMsg,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 18. Itinerary Modifications
  if (intent === 'MODIFY_ITINERARY') {
    const nextVillaId = entities.villaId || currentState.selectedVillaId;
    const nextNights = entities.nights || currentState.nights || 5;
    const nextGuests = entities.guests || currentState.guests || 2;
    const nextMonth = entities.month || currentState.month || 'December';

    const updatedInterests = (currentState.interests || []).filter((i) => !entities.removals.includes(i));
    for (const item of entities.interests) {
      if (!updatedInterests.includes(item)) updatedInterests.push(item);
    }

    const { days, diningHighlight, wellnessHighlight } = generateItinerary({
      nights: nextNights,
      guests: nextGuests,
      month: nextMonth,
      interests: updatedInterests,
      removals: entities.removals,
      villaId: nextVillaId,
    });

    let modNotice = 'I have adjusted your stay.';
    if (entities.villaId) {
      const vObj = veloraResort.villas.find((v) => v.id === entities.villaId);
      modNotice = `I have updated your sanctuary to the ${vObj ? vObj.name : 'requested villa'}.`;
    } else if (entities.removals.includes('diving') || entities.removals.includes('dive')) {
      modNotice = 'I have removed the diving excursion and replaced it with dedicated overwater wellness rituals.';
    } else if (entities.nights) {
      modNotice = `I have updated your itinerary duration to ${entities.nights} nights.`;
    }

    const nextTripState: TripState = {
      ...currentState,
      selectedVillaId: nextVillaId,
      nights: nextNights,
      guests: nextGuests,
      month: nextMonth,
      interests: updatedInterests,
    };

    candidate = {
      type: 'itinerary_update',
      message: `${modNotice} Your updated day-by-day sequence is ready below.`,
      tripState: nextTripState,
      recommendedVillaId: nextTripState.selectedVillaId,
      itineraryDays: days,
      diningHighlight,
      wellnessHighlight,
      suggestedActions: nextTripState.selectedVillaId
        ? [
            { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: nextTripState.selectedVillaId, nights: nextTripState.nights, guests: nextTripState.guests },
            { type: 'open_360', label: '360° TOUR', sceneId: veloraResort.villas.find((v) => v.id === nextTripState.selectedVillaId)?.panoramaSceneId || 'sunset-exterior', villaId: nextTripState.selectedVillaId },
            { type: 'view_villa', label: 'VIEW VILLA', villaId: nextTripState.selectedVillaId },
          ]
        : [
            { type: 'compare_villas', label: 'COMPARE VILLAS' },
            { type: 'request_stay', label: 'REQUEST YOUR STAY', nights: nextTripState.nights, guests: nextTripState.guests },
          ],
      perceptualDelayMs: 700,
      responseMeta: {
        type: 'itinerary',
        subjectId: nextTripState.selectedVillaId,
        topic: 'itinerary',
        text: `${modNotice} Your updated day-by-day sequence is ready below.`,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 19. Planning a stay
  if (intent === 'PLAN_TRIP') {
    const nights = entities.nights || currentState.nights || 5;
    const guests = entities.guests || currentState.guests || 2;
    const month = entities.month || currentState.month || 'December';

    const recommendation = recommendVilla(entities, rawText);

    const { days, diningHighlight, wellnessHighlight } = generateItinerary({
      nights,
      guests,
      month,
      interests: entities.interests,
      removals: entities.removals,
      villaId: recommendation.villa.id,
    });

    const nextTripState: TripState = {
      ...currentState,
      nights,
      guests,
      month,
      selectedVillaId: recommendation.villa.id,
      interests: entities.interests,
    };

    candidate = {
      type: 'itinerary',
      message: `I have tailored a ${nights}-night escape for ${guests === 2 ? 'the two of you' : `${guests} guests`} in ${month}, centered around the ${recommendation.villa.name}.`,
      tripState: nextTripState,
      recommendedVillaId: recommendation.villa.id,
      reasons: recommendation.reasons,
      itineraryDays: days,
      diningHighlight,
      wellnessHighlight,
      suggestedActions: [
        { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: recommendation.villa.id, nights, guests },
        { type: 'open_360', label: '360° TOUR', sceneId: recommendation.villa.panoramaSceneId || 'sunset-exterior', villaId: recommendation.villa.id },
        { type: 'view_villa', label: 'VIEW VILLA', villaId: recommendation.villa.id },
      ],
      bookingAction: {
        villaId: recommendation.villa.id,
        nights,
        guests,
      },
      perceptualDelayMs: 850,
      responseMeta: {
        type: 'itinerary',
        subjectId: recommendation.villa.id,
        topic: 'itinerary',
        hasRecommendation: true,
        text: `I have tailored a ${nights}-night escape centered around the ${recommendation.villa.name}.`,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 20. Villa Recommendation
  if (intent === 'VILLA_RECOMMENDATION') {
    if (
      lower.includes('find a villa') ||
      lower.includes('choose a villa') ||
      lower.includes('help me choose') ||
      lower === 'which villa' ||
      lower === 'which villa?' ||
      lower === 'recommend a villa'
    ) {
      const pendingQ: PendingQuestion = {
        type: 'VILLA_PREFERENCE',
        expectedEntity: 'villa_preference',
        askedAtTurn: context.turnCount,
        questionText: 'Would you prefer an overwater pavilion suspended above the lagoon, or a secluded beachfront residence?',
        options: ['Overwater', 'Beachfront'],
      };

      candidate = {
        type: 'conversation',
        message: 'We have four architectural sanctuaries across the island. Would you prefer an overwater pavilion suspended above the quiet lagoon, or a secluded beachfront residence in the palms?',
        suggestedActions: [
          { label: 'OVERWATER', prompt: 'I prefer overwater.' },
          { label: 'BEACHFRONT', prompt: 'I prefer beachfront.' },
        ],
        perceptualDelayMs: 450,
        pendingQuestion: pendingQ,
        responseMeta: {
          type: 'question',
          text: 'Would you prefer an overwater pavilion suspended above the quiet lagoon, or a secluded beachfront residence in the palms?',
          topic: 'villa',
          askedQuestion: pendingQ,
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    if (subType === 'COUPLE') {
      const sunset = veloraResort.villas[0];
      const nextTripState: TripState = {
        ...currentState,
        selectedVillaId: sunset.id,
        guests: 2,
      };

      candidate = {
        type: 'villa_recommendation',
        message: 'Velora is an intimate haven for couples. Our overwater sanctuaries — particularly the Sunset Pool Villa — offer complete sunset seclusion, a private 16m infinity pool, and direct lagoon access. Would you like to view details or plan a stay?',
        recommendedVillaId: sunset.id,
        tripState: nextTripState,
        suggestedActions: [
          { type: 'view_villa', label: 'EXPLORE SUNSET VILLA', villaId: sunset.id },
          { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: sunset.id, guests: 2 },
        ],
        perceptualDelayMs: 450,
        responseMeta: {
          type: 'villa_recommendation',
          subjectId: sunset.id,
          topic: 'villa',
          hasRecommendation: true,
          text: 'Velora is an intimate haven for couples.',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    const rec = recommendVilla(entities, rawText);
    const nextTripState: TripState = {
      ...currentState,
      selectedVillaId: rec.villa.id,
      guests: entities.guests || currentState.guests || 2,
    };

    candidate = {
      type: 'villa_recommendation',
      message: rec.explanation,
      recommendedVillaId: rec.villa.id,
      reasons: rec.reasons,
      tripState: nextTripState,
      suggestedActions: [
        { type: 'open_360', label: '360° TOUR', sceneId: rec.villa.panoramaSceneId || 'sunset-exterior', villaId: rec.villa.id },
        { type: 'view_villa', label: 'VIEW VILLA', villaId: rec.villa.id },
        { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: rec.villa.id },
      ],
      perceptualDelayMs: 600,
      responseMeta: {
        type: 'villa_recommendation',
        subjectId: rec.villa.id,
        topic: 'villa',
        hasRecommendation: true,
        claims: rec.reasons,
        text: rec.explanation,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 21. Dining
  if (intent === 'DINING') {
    const diningSource = context.sourceContext?.type === 'dining' ? context.sourceContext.id : undefined;
    const isAura = subType === 'AURA' || diningSource?.includes('aura');
    const isEmber = subType === 'FIRE_SMOKE' || subType === 'EMBER' || diningSource?.includes('ember');
    const isTide = subType === 'TIDE' || diningSource?.includes('tide');
    const isSandbank = subType === 'SAND_PAVILION' || subType === 'SANDBANK' || diningSource?.includes('sandbank');

    const auraVenue = veloraResort.dining.find((d) => d.id === 'aura-ocean') || veloraResort.dining[0];
    const emberVenue = veloraResort.dining.find((d) => d.id === 'ember-grill') || veloraResort.dining[1];
    const tideVenue = veloraResort.dining.find((d) => d.id === 'tide-pavilion') || veloraResort.dining[2];
    const sandbankVenue = veloraResort.dining.find((d) => d.id === 'sandbank-dining') || veloraResort.dining[3];

    let msg = `Velora features distinct culinary sanctuaries: ${veloraResort.dining.map((d) => `${d.name} (${d.cuisine})`).join(', ')}.`;
    let actions: SuggestedAction[] = [
      { type: 'prompt', label: 'AURA DINING', prompt: 'Tell me about AURA dining.' },
      { type: 'prompt', label: 'EMBER WOODFIRE', prompt: 'Tell me about EMBER woodfire dining.' },
      { type: 'prompt', label: 'SANDBANK DINING', prompt: 'Tell me about private sandbank dining.' },
    ];

    if (isAura) {
      msg = `${auraVenue.name} is exceptional for dinner (${auraVenue.hours}). Cantilevered over the outer reef edge where lantern-lit tables overlook deep waters, it serves ${auraVenue.cuisine} in an ${auraVenue.setting}.`;
      actions = [
        { type: 'prompt', label: 'EMBER WOODFIRE', prompt: 'Tell me about EMBER.' },
        { type: 'prompt', label: 'SANDBANK DINING', prompt: 'Tell me about private sandbank dining.' },
      ];
    } else if (isEmber) {
      msg = `${emberVenue.name} is our beachfront woodfire hearth (${emberVenue.hours}). ${emberVenue.description}`;
      actions = [
        { type: 'prompt', label: 'AURA OVERWATER', prompt: 'Tell me about AURA.' },
        { type: 'prompt', label: 'TIDE LUNCH', prompt: 'Tell me about TIDE.' },
      ];
    } else if (isTide) {
      msg = `${tideVenue.name} is our relaxed waterfront pavilion (${tideVenue.hours}). ${tideVenue.description}`;
      actions = [
        { type: 'prompt', label: 'AURA DINNER', prompt: 'Tell me about dinner at AURA.' },
        { type: 'prompt', label: 'EMBER GRILL', prompt: 'Tell me about EMBER.' },
      ];
    } else if (isSandbank) {
      msg = `${sandbankVenue.name}: ${sandbankVenue.description}`;
      actions = [
        { type: 'prompt', label: 'AURA DINNER', prompt: 'Tell me about dinner at AURA.' },
      ];
    }

    candidate = {
      type: 'experience_recommendation',
      message: msg,
      suggestedActions: actions,
      perceptualDelayMs: 500,
      responseMeta: {
        type: 'experience',
        topic: 'dining',
        text: msg,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 22. Diving & Snorkeling
  if (intent === 'DIVING' || intent === 'SNORKELING') {
    let msg = 'Velora is encircled by a broad 8 km² lagoon with our house reef just 40 metres from the overwater villas. Depending on season and conditions, guided drift excursions along the outer reef channels may offer opportunities to observe manta rays, sea turtles, and pelagic marine life.';
    const expSource = context.sourceContext?.type === 'experience' ? context.sourceContext.id : undefined;
    const isHouseReef = expSource === 'house-reef-dive' || (expSource && expSource.includes('reef')) || subType === 'REEF_DIVE';
    if (isHouseReef) {
      msg = 'The House Reef & Outer Drop-Off is well suited for beginners and certified divers alike. Our experienced dive team conducts calm lagoon briefings and gentle orientation dives on the inner reef before venturing out.';
    } else if (subType === 'MANTA') {
      msg = 'Along the northern channel outer drop-off, seasonal currents may bring opportunities to observe reef manta rays and sea turtles. Guided drift excursions explore these channels during favorable morning tides, though wildlife sightings naturally vary with ocean conditions.';
    }

    candidate = {
      type: 'answer',
      message: msg,
      suggestedActions: [
        { type: 'prompt', label: 'WHICH VILLA HAS REEF ACCESS', prompt: 'Which villa has the best reef access?' },
        { type: 'prompt', label: 'ADD DIVING TO STAY', prompt: 'Plan five nights with reef diving.' },
      ],
      perceptualDelayMs: 500,
      responseMeta: {
        type: 'experience',
        topic: 'marine',
        text: msg,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 23. Sailing
  if (intent === 'SAILING') {
    candidate = {
      type: 'answer',
      message: 'Sunset sailing aboard catamaran and traditional wooden dhoni charters explores the open waters of Noonu Atoll, with marine-life sightings possible depending on tidal and weather conditions.',
      suggestedActions: [
        { type: 'prompt', label: 'ADD CATAMARAN SAIL', prompt: 'Add sunset sailing to our stay.' },
      ],
      perceptualDelayMs: 500,
      responseMeta: {
        type: 'experience',
        topic: 'sailing',
        text: 'Sunset catamaran sailing explores Noonu Atoll, with wildlife sightings possible depending on conditions.',
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 24. Wellness
  if (intent === 'WELLNESS') {
    let msg = 'The Water Pavilion offers six overwater treatment sanctuaries, Tibetan singing bowl acoustic sound sessions, Ayurvedic-inspired botanical oil rituals, and sunrise ocean yoga overlooking the reef.';
    const wellnessId = context.sourceContext?.type === 'wellness' ? context.sourceContext.id : undefined;
    const effectiveRitual = subType && ['velora-ocean-caress', 'tibetan-sound-water', 'sunset-solar-reset', 'ayurvedic-shirodhara-marma'].includes(subType)
      ? subType
      : wellnessId && ['velora-ocean-caress', 'tibetan-sound-water', 'sunset-solar-reset', 'ayurvedic-shirodhara-marma'].includes(wellnessId)
      ? wellnessId
      : undefined;

    const canonicalRitual = veloraResort.wellness.rituals.find((r) => r.id === effectiveRitual);

    if (canonicalRitual && effectiveRitual === 'velora-ocean-caress') {
      if (lower.includes('schedule') || lower.includes('when') || lower.includes('time') || lower.includes('timing') || lower.includes('afternoon') || lower.includes('morning')) {
        msg = `We recommend scheduling the ${canonicalRitual.title} (${canonicalRitual.duration}) on your arrival day or early in your stay to release travel fatigue. An unhurried afternoon session (available 09:00 – 20:00) allows the warm botanical oils and mineral-rich sea salts to deeply restore your skin and senses for deep relaxation.`;
      } else {
        msg = `The ${canonicalRitual.title} is a ${canonicalRitual.duration} restorative full-body ceremony. It combines warm botanical oil massage, mineral-rich sea salt exfoliation, and gentle acoustic resonance suspended above the calm lagoon waters to promote deep relaxation and restorative calm.`;
      }
    } else if (canonicalRitual && effectiveRitual === 'tibetan-sound-water') {
      if (lower.includes('schedule') || lower.includes('when') || lower.includes('time') || lower.includes('timing') || lower.includes('afternoon') || lower.includes('morning') || lower.includes('evening')) {
        msg = `We recommend scheduling the ${canonicalRitual.title} (${canonicalRitual.duration}) in the late afternoon as the island light softens, or during early evening dusk. At this hour, the quiet tidal movement beneath the glass-floor pavilion creates an ideal acoustic environment for meditative calm and deep relaxation.`;
      } else {
        msg = `The ${canonicalRitual.title} is a ${canonicalRitual.duration} acoustic immersion held over water. Hand-hammered Tibetan singing bowls resonate through the open-air pavilion alongside warm marine water immersion, deepening relaxation and meditative stillness.`;
      }
    } else if (canonicalRitual && effectiveRitual === 'sunset-solar-reset') {
      if (lower.includes('schedule') || lower.includes('when') || lower.includes('time') || lower.includes('timing') || lower.includes('afternoon') || lower.includes('morning') || lower.includes('evening')) {
        msg = `The ${canonicalRitual.title} (${canonicalRitual.duration}) is designed specifically for late afternoon between 17:00 and 18:30 as the sun drops toward the western horizon. Scheduling it at dusk allows cooling aloe and chilled stone therapy to soothe sun-warmed skin right before evening dining.`;
      } else {
        msg = `The ${canonicalRitual.title} is a ${canonicalRitual.duration} evening wind-down ritual. Held at dusk, it features a cooling aloe-infused body mask, chilled stone pressure point therapy, and dusk breathwork to soothe sun-warmed skin and ground the body for evening rest.`;
      }
    } else if (canonicalRitual && effectiveRitual === 'ayurvedic-shirodhara-marma') {
      if (lower.includes('schedule') || lower.includes('when') || lower.includes('time') || lower.includes('timing') || lower.includes('afternoon') || lower.includes('morning')) {
        msg = `We recommend scheduling ${canonicalRitual.title} (${canonicalRitual.duration}) in the quiet morning or peaceful mid-afternoon. Allowing quiet rest after your session lets the warm herbal oils and marma therapy integrate for profound restorative calm.`;
      } else {
        msg = `The ${canonicalRitual.title} is a ${canonicalRitual.duration} journey for deep relaxation and mental clarity. It pairs a rhythmic warm herbal oil stream over the forehead and temples with traditional marma point therapy, releasing tension and cultivating profound sensory stillness.`;
      }
    } else if (subType === 'WATER_PAVILION_AFTERNOON' || lower.includes('afternoon')) {
      msg = 'Yes, treatments at The Water Pavilion can certainly be arranged in the afternoon (available 09:00 – 20:00). An afternoon session is ideal as the equatorial sun softens and sea breezes flow through the open-air pavilion.';
    } else if (subType === 'AYURVEDA' || lower.includes('ayurved')) {
      msg = 'Our Ayurvedic-inspired rituals combine warm herb-infused botanical oils and gentle rhythmic massage, tailored to promote deep calm and unhurried rest.';
    }

    candidate = {
      type: 'answer',
      message: msg,
      suggestedActions: [
        { type: 'prompt', label: 'ADD WELLNESS TO STAY', prompt: 'Include wellness rituals in our stay.' },
      ],
      perceptualDelayMs: 500,
      responseMeta: {
        type: 'experience',
        topic: 'wellness',
        text: msg,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 25. Arrival / Seaplane & Logistics
  if (intent === 'ARRIVAL') {
    let msg = 'Guests arrive via an approximate 45-minute scenic seaplane journey from Velana International Airport (MLE) directly to Velora’s outer lagoon pontoon.';
    if (subType === 'BAGGAGE') {
      msg = 'Baggage limits depend on the operating transfer carrier and would be confirmed with the stay arrangements.';
    } else if (subType === 'FLIGHT_TIME') {
      msg = 'The flight from Velana International Airport (MLE) in Malé takes approximately 45 scenic minutes, cruising directly over the turquoise coral rings of the northern atolls.';
    }

    candidate = {
      type: 'answer',
      message: msg,
      suggestedActions: [
        { type: 'request_stay', label: 'REQUEST YOUR STAY' },
        { label: 'EXPLORE VILLAS', prompt: 'Which villa is best for sunset?' },
      ],
      perceptualDelayMs: 450,
      responseMeta: {
        type: 'logistics',
        topic: 'arrival',
        text: msg,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 26. Availability / Request Stay
  if (intent === 'AVAILABILITY') {
    const targetVillaId = entities.villaId || lastVillaContext || currentState.selectedVillaId;
    const nights = entities.nights || currentState.nights || 5;
    const guests = entities.guests || currentState.guests || 2;

    if (!targetVillaId) {
      candidate = {
        type: 'booking_handoff',
        message: 'I would be delighted to prepare your stay request. Which villa sanctuary would you prefer, or would you like me to recommend one?',
        bookingAction: {
          nights,
          guests,
        },
        suggestedActions: [
          { type: 'request_stay', label: 'REQUEST YOUR STAY', nights, guests },
          { type: 'view_villa', label: 'SUNSET POOL VILLA', villaId: 'sunset-pool-villa' },
          { type: 'compare_villas', label: 'COMPARE VILLAS' },
        ],
        perceptualDelayMs: 400,
        responseMeta: {
          type: 'booking_handoff',
          topic: 'booking',
          text: 'I would be delighted to prepare your stay request.',
          intent,
        },
      };
      return validateAndSanitizeResponse(candidate, context);
    }

    const villa = veloraResort.villas.find((v) => v.id === targetVillaId) || veloraResort.villas[0];

    candidate = {
      type: 'booking_handoff',
      message: `I have prepared your stay inquiry for ${nights} nights at the ${villa.name} for ${guests} guests. You can open your stay request below to tailor your dates and preferences.`,
      recommendedVillaId: targetVillaId,
      bookingAction: {
        villaId: targetVillaId,
        nights,
        guests,
      },
      suggestedActions: [
        { type: 'request_stay', label: 'REQUEST THIS VILLA', villaId: targetVillaId, nights, guests },
        { type: 'compare_villas', label: 'COMPARE VILLAS' },
      ],
      perceptualDelayMs: 450,
      responseMeta: {
        type: 'booking_handoff',
        topic: 'booking',
        subjectId: targetVillaId,
        text: `I have prepared your stay inquiry for the ${villa.name}.`,
        intent,
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // 27. Default / Unknown Intent (Contextual, grounded, no universal sales copy)
  const isGibberish =
    /^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(lower.trim()) ||
    lower.trim() === 'wode' ||
    lower.trim() === 'asdfgh' ||
    /^[a-z]{1,2}$/i.test(lower.trim());

  if (isGibberish) {
    candidate = {
      type: 'clarification',
      message: "I didn't quite catch that. Could you clarify what you'd like to explore about Velora?",
      suggestedActions: [],
      perceptualDelayMs: 300,
      responseMeta: {
        type: 'clarification',
        text: "I didn't quite catch that. Could you clarify what you'd like to explore about Velora?",
        topic: 'clarification',
        intent: 'UNKNOWN',
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  if (/^(what|huh|why|how)\??$/i.test(lower.trim())) {
    const topic = context.previousAssistantMeta?.topic;
    const topicDesc =
      topic === 'villa'
        ? 'our sanctuaries'
        : topic === 'pricing'
        ? 'our stay rates'
        : topic === 'dining'
        ? 'our dining venues'
        : topic === 'marine'
        ? 'our ocean experiences'
        : 'the island';
    candidate = {
      type: 'clarification',
      message: `Could you clarify what you would like to know more about regarding ${topicDesc}?`,
      suggestedActions: [],
      perceptualDelayMs: 350,
      responseMeta: {
        type: 'clarification',
        text: 'Could you clarify what you would like to know more about?',
        topic: 'clarification',
        intent: 'UNKNOWN',
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  if (/\b(frustrated|annoying|useless|stupid|bad|terrible|broken)\b/i.test(lower)) {
    candidate = {
      type: 'clarification',
      message: 'I apologize for any misunderstanding. Please let me know how I can better assist with your questions about Velora.',
      suggestedActions: [],
      perceptualDelayMs: 350,
      responseMeta: {
        type: 'clarification',
        text: 'I apologize for any misunderstanding.',
        topic: 'clarification',
        intent: 'UNKNOWN',
      },
    };
    return validateAndSanitizeResponse(candidate, context);
  }

  // Natural brief redirect without sales pitch
  candidate = {
    type: 'clarification',
    message: "I can assist with villa details, island dining, ocean activities, and stay requests. Let me know what you'd like to explore.",
    suggestedActions: [],
    perceptualDelayMs: 350,
    responseMeta: {
      type: 'clarification',
      text: "I can assist with villa details, island dining, ocean activities, and stay requests.",
      topic: 'general',
      intent: 'UNKNOWN',
    },
  };
  return validateAndSanitizeResponse(candidate, context);
}
