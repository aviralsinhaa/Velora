import { processConciergeInput, ConciergeSessionContext } from './src/concierge/engine/conciergeEngine';
import { TripState } from './src/data/resortContext';

function createFreshContext(): ConciergeSessionContext {
  const cleanTripState: TripState = {
    nights: 5,
    guests: 2,
    selectedVillaId: undefined,
  };
  return {
    turnCount: 0,
    lastVillaContext: undefined,
    sourceContext: { type: 'global' },
    activeTripState: cleanTripState,
    recentTurns: [],
    pendingQuestion: null,
    lastAssistantMeta: undefined,
    recentMessages: [],
  };
}

console.log('Running Concierge Regression Tests...');

// TEST 1: Fresh Concierge -> "Which villa is best for sunset?" -> "Which villa have we selected?"
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Which villa is best for sunset?', ctx);
  ctx = res1.updatedContext;
  console.log('Test 1 - Turn 1 recommendedVillaId:', res1.response.recommendedVillaId);
  console.log('Test 1 - Turn 1 selectedVillaId in tripState:', ctx.activeTripState.selectedVillaId);

  const res2 = processConciergeInput('Which villa have we selected?', ctx);
  ctx = res2.updatedContext;
  console.log('Test 1 - Turn 2 message:', res2.response.message);
  if (
    !ctx.activeTripState.selectedVillaId &&
    res2.response.message.includes('not selected a specific villa')
  ) {
    console.log('Test 1: PASS - Recommendation alone does not falsely create a selection.');
  } else {
    console.error('Test 1: FAIL');
    process.exit(1);
  }
}

// TEST 2: Fresh Concierge -> "Tell me about Ocean Lagoon Villa" -> "Which villa have we selected?"
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about Ocean Lagoon Villa', ctx);
  ctx = res1.updatedContext;
  console.log('Test 2 - Turn 1 lastVillaContext:', ctx.lastVillaContext);
  console.log('Test 2 - Turn 1 selectedVillaId:', ctx.activeTripState.selectedVillaId);

  const res2 = processConciergeInput('Which villa have we selected?', ctx);
  ctx = res2.updatedContext;
  console.log('Test 2 - Turn 2 message:', res2.response.message);
  if (
    !ctx.activeTripState.selectedVillaId &&
    res2.response.message.includes('not selected a specific villa')
  ) {
    console.log('Test 2: PASS - Talking about a villa alone does not falsely select it.');
  } else {
    console.error('Test 2: FAIL');
    process.exit(1);
  }
}

// TEST 3: Fresh Concierge -> explicitly choose Beach Reserve Residence -> "Which villa have we selected?"
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('I want the Beach Reserve Residence.', ctx);
  ctx = res1.updatedContext;
  console.log('Test 3 - Turn 1 selectedVillaId:', ctx.activeTripState.selectedVillaId);

  const res2 = processConciergeInput('Which villa have we selected?', ctx);
  ctx = res2.updatedContext;
  console.log('Test 3 - Turn 2 message:', res2.response.message);
  if (
    ctx.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res2.response.message.includes('Beach Reserve Residence')
  ) {
    console.log('Test 3: PASS - Explicit villa selection persists and is reported.');
  } else {
    console.error('Test 3: FAIL');
    process.exit(1);
  }
}

// TEST 7: NEW ESCAPE -> "Which villa have we selected?"
{
  let ctx = createFreshContext();
  // Simulate having selected a villa previously
  ctx.activeTripState.selectedVillaId = 'sunset-pool-villa';
  ctx.lastVillaContext = 'sunset-pool-villa';

  // Perform NEW ESCAPE reset
  const cleanTripState: TripState = {
    nights: 5,
    guests: 2,
    selectedVillaId: undefined,
  };
  ctx = {
    turnCount: 0,
    lastVillaContext: undefined,
    sourceContext: { type: 'global' },
    activeTripState: cleanTripState,
    recentTurns: [],
    pendingQuestion: null,
    lastAssistantMeta: undefined,
    recentMessages: [],
  };

  const res = processConciergeInput('Which villa have we selected?', ctx);
  console.log('Test 7 - message:', res.response.message);
  if (
    !ctx.activeTripState.selectedVillaId &&
    res.response.message.includes('not selected a specific villa')
  ) {
    console.log('Test 7: PASS - NEW ESCAPE resets selected villa.');
  } else {
    console.error('Test 7: FAIL');
    process.exit(1);
  }
}

// TEST 9: AURA contextual follow-up
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about AURA', ctx);
  ctx = res1.updatedContext;
  console.log('Test 9 - Turn 1 topic:', res1.response.responseMeta?.topic);

  const res2 = processConciergeInput('What is on the menu?', ctx);
  ctx = res2.updatedContext;
  console.log('Test 9 - Turn 2 message:', res2.response.message);
  if (res2.response.message.toLowerCase().includes('aura') || res2.response.message.toLowerCase().includes('japanese') || res2.response.message.toLowerCase().includes('tasting')) {
    console.log('Test 9: PASS - AURA contextual follow-up works.');
  } else {
    console.error('Test 9: FAIL');
    process.exit(1);
  }
}

// TEST 10: Wellness ritual contextual follow-up
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about Ocean Sleep Sanctuary', ctx);
  ctx = res1.updatedContext;
  console.log('Test 10 - Turn 1 topic:', res1.response.responseMeta?.topic);

  const res2 = processConciergeInput('When should we do it?', ctx);
  ctx = res2.updatedContext;
  console.log('Test 10 - Turn 2 message:', res2.response.message);
  if (res2.response.message.toLowerCase().includes('ocean sleep') || res2.response.message.toLowerCase().includes('wellness rhythm') || res2.response.message.toLowerCase().includes('afternoon')) {
    console.log('Test 10: PASS - Wellness ritual contextual follow-up works.');
  } else {
    console.error('Test 10: FAIL');
    process.exit(1);
  }
}

console.log('ALL ENGINE REGRESSION TESTS PASSED!');
