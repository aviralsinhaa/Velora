/**
 * Dialogue-State Reasoning & Context Model for Velora Concierge
 * Tracks multi-turn dialogue history, pending questions, semantic claims, and grounded user facts.
 */

import { TripState, ConciergeSourceContext } from '../../data/resortContext';
import { ConciergeIntent } from './intents';
import { ExtractedEntities } from './entities';

export interface PendingQuestion {
  type:
    | 'NIGHTS'
    | 'GUEST_COUNT'
    | 'VILLA_PREFERENCE'
    | 'CONFIRM_VILLA'
    | 'DATES'
    | 'ACTIVITY_PREFERENCE'
    | 'OCCASION'
    | 'GENERAL_CHOICE';
  expectedEntity: string;
  askedAtTurn: number;
  questionText: string;
  options?: string[];
}

export interface AssistantResponseMeta {
  type: string;
  subjectId?: string; // e.g. 'sunset-pool-villa'
  claims?: string[];
  topic?: string;
  askedQuestion?: PendingQuestion | null;
  hasRecommendation?: boolean;
  requiresClarification?: boolean;
  wasMisunderstood?: boolean;
  text: string;
  intent?: ConciergeIntent;
}

export interface TurnRecord {
  role: 'user' | 'model';
  text: string;
  rawText?: string;
  intent?: ConciergeIntent;
  entities?: ExtractedEntities;
  topic?: string;
  responseMeta?: AssistantResponseMeta;
  timestamp: number;
}

export interface UserExpressedFacts {
  hasVisualCompliment: boolean;
  hasPropertyCompliment: boolean;
  hasMentionedHoneymoon: boolean;
  hasMentionedAnniversary: boolean;
  hasMentionedPrivacy: boolean;
  hasMentionedFamily: boolean;
  hasMentionedOverwater: boolean;
  hasMentionedBeach: boolean;
  hasExpressedGratitude: boolean;
  hasNegativeFeedback: boolean;
  preferredOrientation?: 'sunset' | 'sunrise';
}

export interface DialogueContext {
  currentUserMessage: string;
  rawUserMessage: string;
  previousUserMessage?: string;
  previousAssistantResponse?: string;
  previousAssistantMeta?: AssistantResponseMeta;
  previousIntent?: ConciergeIntent;
  currentTopic?: string;
  pendingQuestion?: PendingQuestion | null;
  lastVillaContext?: string;
  sourceContext?: ConciergeSourceContext;
  activeTripState: TripState;
  turnCount: number;
  recentTurns: TurnRecord[];
  userExpressedFacts: UserExpressedFacts;
  conversationMode: 'social' | 'browsing' | 'consultation' | 'planning' | 'repair';
}

export function extractUserFacts(turns: TurnRecord[], currentNormalized: string): UserExpressedFacts {
  const userTexts = turns
    .filter((t) => t.role === 'user')
    .map((t) => t.text.toLowerCase());
  
  userTexts.push(currentNormalized.toLowerCase());
  const combined = userTexts.join(' ');

  const hasVisualCompliment =
    /\b(view|lagoon|ocean|water|sunset|sunrise|light)\b/.test(combined) &&
    /\b(beautiful|amazing|gorgeous|stunning|breathtaking|incredible|nice|love|pretty|spectacular)\b/.test(combined);

  const hasPropertyCompliment =
    /\b(resort|place|island|villa|velora|hotel|property)\b/.test(combined) &&
    /\b(beautiful|amazing|gorgeous|stunning|incredible|lovely|paradise|unreal|magic)\b/.test(combined) ||
    /^(wow|so beautiful|looks amazing|looks stunning|looks gorgeous|this is paradise)\b/.test(currentNormalized.toLowerCase().trim());

  const hasMentionedHoneymoon = /\b(honeymoon|honeymooners)\b/.test(combined);
  const hasMentionedAnniversary = /\b(anniversary)\b/.test(combined);
  const hasMentionedPrivacy = /\b(privacy|private|secluded|seclusion|isolated|quiet|peaceful|nobody else)\b/.test(combined);
  const hasMentionedFamily = /\b(family|kids|children|toddler|parents|son|daughter)\b/.test(combined);
  const hasMentionedOverwater = /\b(overwater|over water|lagoon villa|stilt|above water)\b/.test(combined);
  const hasMentionedBeach = /\b(beach|sand|beachfront|shoreline)\b/.test(combined);
  const hasExpressedGratitude = /\b(thanks|thank you|appreciate|thx|cheers)\b/.test(currentNormalized.toLowerCase());
  const hasNegativeFeedback = /\b(ugly|bad|hate|dislike|terrible|horrible|gross|rubbish)\b/.test(combined);

  let preferredOrientation: 'sunset' | 'sunrise' | undefined = undefined;
  if (/\b(sunset|west|dusk|evening)\b/.test(combined)) {
    preferredOrientation = 'sunset';
  } else if (/\b(sunrise|east|dawn|morning)\b/.test(combined)) {
    preferredOrientation = 'sunrise';
  }

  return {
    hasVisualCompliment,
    hasPropertyCompliment,
    hasMentionedHoneymoon,
    hasMentionedAnniversary,
    hasMentionedPrivacy,
    hasMentionedFamily,
    hasMentionedOverwater,
    hasMentionedBeach,
    hasExpressedGratitude,
    hasNegativeFeedback,
    preferredOrientation,
  };
}

export function buildDialogueContext(params: {
  rawInput: string;
  normalizedInput: string;
  turnCount: number;
  recentTurns: TurnRecord[];
  activeTripState: TripState;
  lastVillaContext?: string;
  sourceContext?: ConciergeSourceContext;
  pendingQuestion?: PendingQuestion | null;
  lastAssistantMeta?: AssistantResponseMeta;
}): DialogueContext {
  const {
    rawInput,
    normalizedInput,
    turnCount,
    recentTurns,
    activeTripState,
    lastVillaContext,
    sourceContext,
    pendingQuestion,
    lastAssistantMeta,
  } = params;

  // Find previous user turn and previous assistant turn
  const previousUserTurn = [...recentTurns].reverse().find((t) => t.role === 'user');
  const previousAssistantTurn = [...recentTurns].reverse().find((t) => t.role === 'model');

  const previousUserMessage = previousUserTurn?.text;
  const previousAssistantResponse = previousAssistantTurn?.text;
  const previousIntent = previousUserTurn?.intent || previousAssistantTurn?.responseMeta?.intent;

  const userExpressedFacts = extractUserFacts(recentTurns, normalizedInput);

  // Determine current conversation mode
  let conversationMode: DialogueContext['conversationMode'] = 'consultation';
  if (turnCount === 0 || recentTurns.length === 0) {
    conversationMode = 'social';
  } else if (activeTripState.nights && activeTripState.selectedVillaId) {
    conversationMode = 'planning';
  }

  const currentTopic =
    lastAssistantMeta?.topic ||
    (lastVillaContext ? 'villa' : undefined);

  return {
    currentUserMessage: normalizedInput,
    rawUserMessage: rawInput,
    previousUserMessage,
    previousAssistantResponse,
    previousAssistantMeta: lastAssistantMeta || previousAssistantTurn?.responseMeta,
    previousIntent,
    currentTopic,
    pendingQuestion: pendingQuestion || null,
    lastVillaContext,
    sourceContext,
    activeTripState,
    turnCount,
    recentTurns,
    userExpressedFacts,
    conversationMode,
  };
}
