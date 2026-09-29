/**
 * Master Local Concierge Engine for Velora Private Island
 * Features complete Conversational Reasoning, Dialogue-State Context,
 * First-Class Repair Engine, and Non-Hallucinating Response Preconditions.
 */

import { normalizeInput } from './normalize';
import { correctTypos } from './fuzzy';
import { extractEntities } from './entities';
import { detectIntent } from './intents';
import { composeResponse, ComposedResponse } from './responseComposer';
import { TripState, ConciergeSourceContext } from '../../data/resortContext';
import {
  TurnRecord,
  PendingQuestion,
  AssistantResponseMeta,
  buildDialogueContext,
} from './dialogueState';

export interface ConciergeSessionContext {
  turnCount: number;
  lastVillaContext?: string;
  sourceContext?: ConciergeSourceContext;
  activeTripState: TripState;
  recentTurns: TurnRecord[];
  pendingQuestion?: PendingQuestion | null;
  lastAssistantMeta?: AssistantResponseMeta;
  recentMessages?: Array<{ role: 'user' | 'model'; text: string }>;
}

export function processConciergeInput(
  rawInput: string,
  sessionContext: ConciergeSessionContext
): {
  response: ComposedResponse;
  updatedContext: ConciergeSessionContext;
} {
  const normalized = normalizeInput(rawInput);
  const typoCorrected = correctTypos(normalized);

  // 1. Build Dialogue Context from multi-turn history
  const dialogueContext = buildDialogueContext({
    rawInput,
    normalizedInput: typoCorrected,
    turnCount: sessionContext.turnCount,
    recentTurns: sessionContext.recentTurns || [],
    activeTripState: sessionContext.activeTripState,
    lastVillaContext: sessionContext.lastVillaContext,
    sourceContext: sessionContext.sourceContext,
    pendingQuestion: sessionContext.pendingQuestion,
    lastAssistantMeta: sessionContext.lastAssistantMeta,
  });

  // 2. Extract Entities
  const entities = extractEntities(typoCorrected);

  // 3. Detect Intent with Match Quality & Dialogue-State reasoning
  const intentMatch = detectIntent(typoCorrected, rawInput, dialogueContext);

  // 4. Update villa context tracking
  let nextVillaContext = entities.villaId || sessionContext.lastVillaContext;

  // 5. Compose contextual, grounded response
  const composed = composeResponse(
    intentMatch,
    entities,
    rawInput,
    dialogueContext
  );

  if (composed.recommendedVillaId) {
    nextVillaContext = composed.recommendedVillaId;
  }

  // 6. Handle Pending Question lifecycle
  let nextPendingQuestion = sessionContext.pendingQuestion;
  if (composed.pendingQuestion !== undefined) {
    nextPendingQuestion = composed.pendingQuestion;
  } else if (intentMatch.intent === 'PENDING_ANSWER' || intentMatch.intent === 'PLAN_TRIP') {
    nextPendingQuestion = null;
  } else if (intentMatch.intent === 'SOCIAL_GREETING' || intentMatch.intent === 'SOCIAL_HOW_ARE_YOU') {
    // If user shifts to social pleasantries, clear or suspend pending questions
    nextPendingQuestion = null;
  }

  // 7. Update Trip State
  const nextTripState: TripState = {
    ...sessionContext.activeTripState,
    ...(composed.tripState || {}),
    selectedVillaId: nextVillaContext || sessionContext.activeTripState.selectedVillaId,
  };

  // 8. Record turns
  const userTurn: TurnRecord = {
    role: 'user',
    text: typoCorrected,
    rawText: rawInput,
    intent: intentMatch.intent,
    entities,
    topic: composed.responseMeta?.topic,
    timestamp: Date.now(),
  };

  const modelTurn: TurnRecord = {
    role: 'model',
    text: composed.message,
    responseMeta: composed.responseMeta,
    timestamp: Date.now(),
  };

  const updatedTurns = [
    ...(sessionContext.recentTurns || []).slice(-16),
    userTurn,
    modelTurn,
  ];

  const updatedContext: ConciergeSessionContext = {
    turnCount: sessionContext.turnCount + 1,
    lastVillaContext: nextVillaContext,
    sourceContext: sessionContext.sourceContext,
    activeTripState: nextTripState,
    recentTurns: updatedTurns,
    pendingQuestion: nextPendingQuestion,
    lastAssistantMeta: composed.responseMeta,
    recentMessages: updatedTurns.map((t) => ({ role: t.role, text: t.text })),
  };

  return {
    response: {
      ...composed,
      tripState: nextTripState,
    },
    updatedContext,
  };
}
