import { processConciergeInput, ConciergeSessionContext } from './src/concierge/engine/conciergeEngine';
import { TripState } from './src/data/resortContext';
import { veloraResort } from './src/data/resortConfig';
import { classifyBookingUtterance } from './src/concierge/engine/bookingClassifier';

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

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  }
  console.log(`PASS: ${testName}`);
}

function assertOperationalHonesty(message: string, testName: string) {
  const lower = message.toLowerCase();
  const forbiddenPhrases = [
    'reservations team',
    'confirmed directly',
    'confirms your arrangements',
    'live availability is confirmed',
    'velora operates as',
  ];
  for (const phrase of forbiddenPhrases) {
    if (lower.includes(phrase)) {
      console.error(`FAIL: ${testName} - contains forbidden operational phrase: "${phrase}" in message: "${message}"`);
      process.exit(1);
    }
  }
}

console.log('--- VELORA ENGINE REGRESSION TEST SUITE (96 TESTS + SUPPLEMENTAL) ---');

// TEST 1
// "Which villa is best for sunset?"
// selectedVillaId must remain undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Which villa is best for sunset?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 1 - "Which villa is best for sunset?" keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 2
// "Tell me about Ocean Lagoon Villa."
// selectedVillaId must remain undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Tell me about Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 2 - "Tell me about Ocean Lagoon Villa." keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 3
// "I want to know about Ocean Lagoon Villa."
// selectedVillaId must remain undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I want to know about Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 3 - "I want to know about Ocean Lagoon Villa." keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 4
// "I'd like to see Ocean Lagoon Villa."
// selectedVillaId must remain undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput("I'd like to see Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 4 - "I\'d like to see Ocean Lagoon Villa." keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 5
// "Let's go with Ocean Lagoon Villa."
// selectedVillaId must equal: ocean-lagoon-villa
{
  const ctx = createFreshContext();
  const res = processConciergeInput("Let's go with Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa',
    'TEST 5 - "Let\'s go with Ocean Lagoon Villa." selects ocean-lagoon-villa',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 6
// "I want the Beach Reserve Residence for our stay."
// selectedVillaId must equal: beach-reserve-residence
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I want the Beach Reserve Residence for our stay.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence',
    'TEST 6 - "I want the Beach Reserve Residence for our stay." selects beach-reserve-residence',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 7
// Recommendation followed by:
// "Which villa have we selected?"
// must report that no villa is selected.
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Which villa is best for sunset?', ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('Which villa have we selected?', ctx);
  const msgLower = res2.response.message.toLowerCase();
  assert(
    res2.updatedContext.activeTripState.selectedVillaId === undefined &&
    msgLower.includes('not selected a specific villa'),
    'TEST 7 - Recommendation followed by "Which villa have we selected?" reports no villa selected',
    `Message: "${res2.response.message}"`
  );
}

// TEST 8
// Explicit villa selection followed by:
// "Which villa have we selected?"
// must report the correct selected villa.
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput("Let's go with Ocean Lagoon Villa.", ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('Which villa have we selected?', ctx);
  assert(
    res2.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res2.response.message.includes('Ocean Lagoon Villa'),
    'TEST 8 - Explicit villa selection followed by "Which villa have we selected?" reports correct selected villa',
    `Message: "${res2.response.message}"`
  );
}

// TEST 9
// "Tell me about AURA."
// then:
// "What is on the menu?"
// must remain about AURA.
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about AURA.', ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('What is on the menu?', ctx);
  const msg = res2.response.message;
  assert(
    (msg.includes('AURA') || msg.toLowerCase().includes('japanese') || msg.includes('Otoro')) &&
    !msg.includes('Which villa do you mean'),
    'TEST 9 - AURA followed by "What is on the menu?" remains about AURA and does not ask about villas',
    `Message: "${msg}"`
  );
}

// TEST 10
// "Tell me about EMBER."
// then:
// "What does it serve?"
// must remain about EMBER.
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about EMBER.', ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('What does it serve?', ctx);
  const msg = res2.response.message;
  assert(
    (msg.includes('EMBER') || msg.toLowerCase().includes('woodfire') || msg.toLowerCase().includes('hearth')) &&
    !msg.includes('Which villa do you mean'),
    'TEST 10 - EMBER followed by "What does it serve?" remains about EMBER and does not ask about villas',
    `Message: "${msg}"`
  );
}

// TEST 11
// "Tell me about Velora Ocean Caress Ritual."
// then:
// "When should we do it?"
// must remain about Ocean Caress.
{
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about Velora Ocean Caress Ritual.', ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('When should we do it?', ctx);
  const msg = res2.response.message;
  assert(
    (msg.includes('Ocean Caress') || msg.toLowerCase().includes('wellness rhythm')) &&
    !msg.includes('Which villa do you mean'),
    'TEST 11 - Ocean Caress followed by "When should we do it?" remains about Ocean Caress and does not ask about villas',
    `Message: "${msg}"`
  );
}

// TEST 12
// "Tell me about Tibetan Sound & Water Meditation."
// then:
// "How long is it?"
// must remain about Tibetan Sound & Water Meditation and use its canonical duration.
{
  const canonicalTibetan = veloraResort.wellness.rituals.find((r) => r.id === 'tibetan-sound-water')!;
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about Tibetan Sound & Water Meditation.', ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('How long is it?', ctx);
  const msg = res2.response.message;
  assert(
    msg.includes(canonicalTibetan.duration) &&
    (msg.includes('Tibetan Sound') || msg.toLowerCase().includes('tibetan')) &&
    !msg.includes('Which villa do you mean'),
    'TEST 12 - Tibetan Sound & Water Meditation followed by "How long is it?" uses canonical duration and does not ask about villas',
    `Message: "${msg}", Expected duration: "${canonicalTibetan.duration}"`
  );
}

// TEST 13
// Fresh NEW ESCAPE-equivalent state followed by:
// "Which villa have we selected?"
// must report no selected villa.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Which villa have we selected?', ctx);
  const msgLower = res.response.message.toLowerCase();
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    msgLower.includes('not selected a specific villa'),
    'TEST 13 - Fresh NEW ESCAPE state followed by "Which villa have we selected?" reports no selected villa',
    `Message: "${res.response.message}"`
  );
}

// TEST 14
// "Do all villas have pools?"
// must answer generally and must NOT ask: "Which villa do you mean?"
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Do all villas have pools?', ctx);
  const msg = res.response.message;
  assert(
    !msg.includes('Which villa do you mean') &&
    (msg.toLowerCase().includes('every villa') || msg.toLowerCase().includes('all villas') || msg.toLowerCase().includes('features a private pool')),
    'TEST 14 - "Do all villas have pools?" answers generally without asking "Which villa do you mean?"',
    `Message: "${msg}"`
  );
}

// TEST 15
// Fresh global:
// "Does it have a pool?"
// must ask which villa the user means.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Does it have a pool?', ctx);
  const msg = res.response.message;
  assert(
    msg.includes('Which villa do you mean'),
    'TEST 15 - Fresh global "Does it have a pool?" asks "Which villa do you mean?"',
    `Message: "${msg}"`
  );
}

// TEST 16
// "Can I book Ocean Lagoon Villa?"
// Expected: selectedVillaId remains undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Can I book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 16 - "Can I book Ocean Lagoon Villa?" keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 16');
}

// TEST 17
// "Can we reserve Beach Reserve Residence?"
// Expected: selectedVillaId remains undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Can we reserve Beach Reserve Residence?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 17 - "Can we reserve Beach Reserve Residence?" keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 17');
}

// TEST 18
// "How do I book Ocean Lagoon Villa?"
// Expected: selectedVillaId remains undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('How do I book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 18 - "How do I book Ocean Lagoon Villa?" keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 18');
}

// TEST 19
// "Is Ocean Lagoon Villa available to book?"
// Expected: selectedVillaId remains undefined.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Is Ocean Lagoon Villa available to book?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 19 - "Is Ocean Lagoon Villa available to book?" keeps selectedVillaId undefined',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 19');
}

// TEST 20
// "I am thinking of booking Ocean Lagoon Villa."
// Expected:
// selectedVillaId remains undefined.
// Response must NOT say: "I have prepared your stay inquiry"
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I am thinking of booking Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    !res.response.message.toLowerCase().includes('prepared your stay inquiry'),
    'TEST 20 - "I am thinking of booking Ocean Lagoon Villa." keeps selectedVillaId undefined and does not prepare stay inquiry',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 20');
}

// TEST 21
// "Please book Ocean Lagoon Villa."
// Expected:
// selectedVillaId = ocean-lagoon-villa
// Genuine commitment.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Please book Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa',
    'TEST 21 - "Please book Ocean Lagoon Villa." selects ocean-lagoon-villa as genuine commitment',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 22
// "Reserve the Beach Reserve Residence."
// Expected:
// Beach Reserve Residence is explicitly chosen/requested.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Reserve the Beach Reserve Residence.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence',
    'TEST 22 - "Reserve the Beach Reserve Residence." selects beach-reserve-residence as genuine commitment',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 23
// "Before booking Ocean Lagoon Villa, can you tell me the price?"
// Expected:
// no villa selection.
// Answer should remain informational.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Before booking Ocean Lagoon Villa, can you tell me the price?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    (res.response.message.includes('$') || res.response.message.toLowerCase().includes('rate') || res.response.message.toLowerCase().includes('night')),
    'TEST 23 - "Before booking Ocean Lagoon Villa, can you tell me the price?" leaves villa unselected and answers with pricing info',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
}

// TEST 24
// "Could I book Ocean Lagoon Villa?"
// Expected:
// selectedVillaId undefined.
// Response type must NOT be booking_handoff.
// Must NOT say: "prepared your stay inquiry"
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Could I book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('prepared your stay inquiry'),
    'TEST 24 - "Could I book Ocean Lagoon Villa?" leaves villa unselected, not booking_handoff, no prepared inquiry',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 24');
}

// TEST 25
// "I might reserve Ocean Lagoon Villa."
// Expected:
// selectedVillaId undefined.
// Response must remain exploratory.
// No booking_handoff.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I might reserve Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('prepared your stay inquiry'),
    'TEST 25 - "I might reserve Ocean Lagoon Villa." leaves villa unselected, remains exploratory, no booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 25');
}

// TEST 26
// "What is the process to reserve Ocean Lagoon Villa?"
// Expected:
// selectedVillaId undefined.
// Response must explain booking/request process.
// Must NOT return generic villa-detail description.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('What is the process to reserve Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    (res.response.message.includes('Request Your Stay') || res.response.message.toLowerCase().includes('request')) &&
    !res.response.message.includes('floats directly above the azure waters'),
    'TEST 26 - "What is the process to reserve Ocean Lagoon Villa?" explains booking/request process without generic villa description',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 26');
}

// TEST 27
// "What's the process to book Beach Reserve Residence?"
// Expected:
// booking-process answer.
// No selection.
{
  const ctx = createFreshContext();
  const res = processConciergeInput("What's the process to book Beach Reserve Residence?", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    (res.response.message.includes('Request Your Stay') || res.response.message.toLowerCase().includes('request')) &&
    res.response.type !== 'booking_handoff',
    'TEST 27 - "What\'s the process to book Beach Reserve Residence?" returns booking-process answer without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 27');
}

// TEST 28
// "Would it be possible to reserve Sunset Pool Villa?"
// Expected:
// availability/question response.
// No selection.
// No automatic booking handoff.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Would it be possible to reserve Sunset Pool Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('prepared your stay inquiry'),
    'TEST 28 - "Would it be possible to reserve Sunset Pool Villa?" provides availability question response without selection or handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 28');
}

// TEST 29
// "Is there availability for Ocean Lagoon Villa?"
// Expected:
// no live availability claim.
// No selection.
// No reservations-team claim.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Is there availability for Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.message.toLowerCase().includes("don't have live availability") &&
    res.response.type !== 'booking_handoff',
    'TEST 29 - "Is there availability for Ocean Lagoon Villa?" states no live availability claim without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 29');
}

// TEST 30
// "I want to book Ocean Lagoon Villa."
// Expected:
// genuine commitment.
// Either: selectedVillaId = ocean-lagoon-villa OR explicit request action is produced.
// Do not treat this as exploratory.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I want to book Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa',
    'TEST 30 - "I want to book Ocean Lagoon Villa." selects ocean-lagoon-villa as genuine commitment',
    `Found selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
}

// TEST 31
// "What is the Ocean Lagoon Villa?"
// Expected:
// normal Villa Detail.
// This verifies booking-order changes did not break villa queries.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('What is the Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.message.toLowerCase().includes('ocean lagoon villa') &&
    (res.response.message.toLowerCase().includes('azure') || res.response.message.toLowerCase().includes('lagoon') || res.response.message.toLowerCase().includes('overwater')),
    'TEST 31 - "What is the Ocean Lagoon Villa?" returns normal Villa Detail description',
    `Message: "${res.response.message}"`
  );
}

// TEST 32
// "Would I be able to book Ocean Lagoon Villa?"
// Expected:
// no selected villa
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Would I be able to book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 32 - "Would I be able to book Ocean Lagoon Villa?" leaves villa unselected, not booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 32');
}

// TEST 33
// "Can Ocean Lagoon Villa be booked?"
// Expected:
// no selected villa
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Can Ocean Lagoon Villa be booked?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 33 - "Can Ocean Lagoon Villa be booked?" leaves villa unselected, not booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 33');
}

// TEST 34
// "Is booking possible for Ocean Lagoon Villa?"
// Expected:
// no selected villa
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Is booking possible for Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 34 - "Is booking possible for Ocean Lagoon Villa?" leaves villa unselected, not booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 34');
}

// TEST 35
// "What do I need to do to book Ocean Lagoon Villa?"
// Expected:
// process answer
// no selection
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput('What do I need to do to book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff' &&
    (res.response.message.includes('Request Your Stay') || res.response.message.toLowerCase().includes('request')),
    'TEST 35 - "What do I need to do to book Ocean Lagoon Villa?" returns process answer without selection or handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 35');
}

// TEST 36
// "I may book Ocean Lagoon Villa."
// Expected:
// exploratory
// no selection
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I may book Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('prepared your stay inquiry'),
    'TEST 36 - "I may book Ocean Lagoon Villa." remains exploratory without selection or booking handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 36');
}

// TEST 37
// "I am considering Ocean Lagoon Villa for our stay."
// Expected:
// exploratory response
// no selection
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I am considering Ocean Lagoon Villa for our stay.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 37 - "I am considering Ocean Lagoon Villa for our stay." remains exploratory without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 37');
}

// TEST 38
// "Do not book Ocean Lagoon Villa."
// Expected:
// no selection
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Do not book Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 38 - "Do not book Ocean Lagoon Villa." leaves villa unselected and not booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 38');
}

// TEST 39
// "Don't reserve Beach Reserve Residence."
// Expected:
// no selection
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput("Don't reserve Beach Reserve Residence.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 39 - "Don\'t reserve Beach Reserve Residence." leaves villa unselected and not booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 39');
}

// TEST 40
// "Cancel booking Ocean Lagoon Villa."
// Expected:
// no booking_handoff
// must not claim real reservation cancellation
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Cancel booking Ocean Lagoon Villa.', ctx);
  const msgLower = res.response.message.toLowerCase();
  assert(
    res.response.type !== 'booking_handoff' &&
    !msgLower.includes('reservation has been cancelled') &&
    !msgLower.includes('cancelled your reservation'),
    'TEST 40 - "Cancel booking Ocean Lagoon Villa." does not handoff or claim real reservation cancellation',
    `type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 40');
}

// TEST 41
// "Please don't book anything."
// Expected:
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput("Please don't book anything.", ctx);
  assert(
    res.response.type !== 'booking_handoff',
    'TEST 41 - "Please don\'t book anything." produces no booking_handoff',
    `type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 41');
}

// TEST 42
// "Can you book Ocean Lagoon Villa for me?"
// Expected:
// genuine commitment / explicit request behavior
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Can you book Ocean Lagoon Villa for me?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa',
    'TEST 42 - "Can you book Ocean Lagoon Villa for me?" produces genuine commitment / explicit request behavior',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
}

// TEST 43
// "Could you reserve Beach Reserve Residence for us?"
// Expected:
// genuine commitment / explicit request behavior
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Could you reserve Beach Reserve Residence for us?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence',
    'TEST 43 - "Could you reserve Beach Reserve Residence for us?" produces genuine commitment / explicit request behavior',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
}

// TEST 44
// "Can I book Ocean Lagoon Villa?"
// Expected:
// availability question
// no selection
// This verifies "Can I" remains different from "Can you ... for me".
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Can I book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 44 - "Can I book Ocean Lagoon Villa?" remains availability question without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 44');
}

// TEST 45
// "Please book Ocean Lagoon Villa."
// Expected:
// existing commitment behavior remains intact.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Please book Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa',
    'TEST 45 - "Please book Ocean Lagoon Villa." maintains commitment behavior intact',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
}

// TEST 46
// "I don't think I want to book Ocean Lagoon Villa."
// Expected:
// no selection
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput("I don't think I want to book Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 46 - "I don\'t think I want to book Ocean Lagoon Villa." leaves villa unselected, not booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 46');
}

// TEST 47
// "I'm not ready to book Ocean Lagoon Villa."
// Expected:
// no selection from fresh state
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput("I'm not ready to book Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 47 - "I\'m not ready to book Ocean Lagoon Villa." leaves villa unselected from fresh state, not booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 47');
}

// TEST 48
// Start with Ocean Lagoon selected.
// "I'm not ready to book Ocean Lagoon Villa yet."
// Expected:
// Ocean Lagoon remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput("I'm not ready to book Ocean Lagoon Villa yet.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff',
    'TEST 48 - "I\'m not ready to book Ocean Lagoon Villa yet." preserves Ocean Lagoon selection without handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 48');
}

// TEST 49
// Start with Beach Reserve Residence selected.
// "Don't book Ocean Lagoon Villa."
// Expected:
// Beach Reserve Residence remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput("Don't book Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'booking_handoff',
    'TEST 49 - "Don\'t book Ocean Lagoon Villa." keeps Beach Reserve Residence selected',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 49');
}

// TEST 50
// Start with Ocean Lagoon selected.
// "I no longer want Ocean Lagoon Villa."
// Expected:
// selectedVillaId becomes undefined.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('I no longer want Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 50 - "I no longer want Ocean Lagoon Villa." clears active Ocean Lagoon selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 50');
}

// TEST 51
// Start with Beach Reserve Residence selected.
// "I no longer want Ocean Lagoon Villa."
// Expected:
// Beach Reserve Residence remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput('I no longer want Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence',
    'TEST 51 - "I no longer want Ocean Lagoon Villa." preserves Beach Reserve Residence selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 51');
}

// TEST 52
// Start with Ocean Lagoon selected.
// "Cancel the stay request."
// Expected:
// Ocean Lagoon remains selected.
// Must not claim an external reservation was cancelled.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Cancel the stay request.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('reservation has been cancelled'),
    'TEST 52 - "Cancel the stay request." preserves Ocean Lagoon selection and makes no external cancellation claim',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 52');
}

// TEST 53
// "I no longer want to go diving."
// Expected:
// must NOT be classified as booking cancellation.
{
  const kind = classifyBookingUtterance('I no longer want to go diving.');
  assert(
    kind !== 'cancel_or_decline',
    'TEST 53 - "I no longer want to go diving." must NOT be classified as booking cancellation',
    `Classified kind: ${kind}`
  );
}

// TEST 54
// "I no longer want spa."
// Expected:
// must NOT be classified as booking cancellation.
{
  const kind = classifyBookingUtterance('I no longer want spa.');
  assert(
    kind !== 'cancel_or_decline',
    'TEST 54 - "I no longer want spa." must NOT be classified as booking cancellation',
    `Classified kind: ${kind}`
  );
}

// TEST 55
// "Could you tell me if I can book Ocean Lagoon Villa?"
// Expected:
// availability/informational
// no selection
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Could you tell me if I can book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 55 - "Could you tell me if I can book Ocean Lagoon Villa?" remains informational without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 55');
}

// TEST 56
// "Is Ocean Lagoon Villa bookable?"
// Expected:
// availability/informational
// no selection
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Is Ocean Lagoon Villa bookable?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 56 - "Is Ocean Lagoon Villa bookable?" remains availability/informational without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 56');
}

// TEST 57
// "Can you tell me how to book Ocean Lagoon Villa?"
// Expected:
// process answer
// no selection
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Can you tell me how to book Ocean Lagoon Villa?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff' &&
    (res.response.message.includes('Request Your Stay') || res.response.message.toLowerCase().includes('request')),
    'TEST 57 - "Can you tell me how to book Ocean Lagoon Villa?" returns process answer without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 57');
}

// TEST 58
// "Maybe I'll book Ocean Lagoon Villa."
// Expected:
// exploratory
// no selection
{
  const ctx = createFreshContext();
  const res = processConciergeInput("Maybe I'll book Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 58 - "Maybe I\'ll book Ocean Lagoon Villa." remains exploratory without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 58');
}

// TEST 59
// "Perhaps we'll reserve Beach Reserve Residence."
// Expected:
// exploratory
// no selection
{
  const ctx = createFreshContext();
  const res = processConciergeInput("Perhaps we'll reserve Beach Reserve Residence.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 59 - "Perhaps we\'ll reserve Beach Reserve Residence." remains exploratory without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 59');
}

// TEST 60
// "Would you mind booking Ocean Lagoon Villa for me?"
// Expected:
// genuine commitment
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Would you mind booking Ocean Lagoon Villa for me?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa',
    'TEST 60 - "Would you mind booking Ocean Lagoon Villa for me?" produces genuine commitment',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
}

// TEST 61
// "Could you please reserve Beach Reserve Residence?"
// Expected:
// genuine commitment
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Could you please reserve Beach Reserve Residence?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence',
    'TEST 61 - "Could you please reserve Beach Reserve Residence?" produces genuine commitment',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, Message: "${res.response.message}"`
  );
}

// TEST 62
// "Cancel my Ocean Lagoon Villa request."
// Expected:
// no booking_handoff
// no false real-world cancellation claim
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Cancel my Ocean Lagoon Villa request.', ctx);
  assert(
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('reservation has been cancelled'),
    'TEST 62 - "Cancel my Ocean Lagoon Villa request." produces no booking_handoff and no false cancellation claim',
    `type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 62');
}

// TEST 63
// "I want to cancel the Ocean Lagoon Villa request."
// Expected:
// no booking_handoff
{
  const ctx = createFreshContext();
  const res = processConciergeInput('I want to cancel the Ocean Lagoon Villa request.', ctx);
  assert(
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('reservation has been cancelled'),
    'TEST 63 - "I want to cancel the Ocean Lagoon Villa request." produces no booking_handoff',
    `type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 63');
}

// TEST 64
// Start with Beach Residence selected.
// "Please don't book anything yet."
// Expected:
// Beach Residence remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput("Please don't book anything yet.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'booking_handoff',
    'TEST 64 - "Please don\'t book anything yet." preserves Beach Residence selection without booking handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 64');
}

// TEST 65
// Start with Ocean Lagoon selected.
// "Clear our villa selection."
// Expected:
// selectedVillaId becomes undefined.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Clear our villa selection.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined,
    'TEST 65 - "Clear our villa selection." clears selectedVillaId to undefined',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 65');
}

// TEST 66
// Start with Ocean Lagoon selected.
// "Drop Ocean Lagoon Villa from our plan."
// Expected:
// selectedVillaId undefined.
// No itinerary generation.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Drop Ocean Lagoon Villa from our plan.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'itinerary_update' &&
    res.response.type !== 'booking_handoff',
    'TEST 66 - "Drop Ocean Lagoon Villa from our plan." clears Ocean Lagoon selection without itinerary generation',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 66');
}

// TEST 67
// Start with Beach Reserve Residence selected.
// "Drop Ocean Lagoon Villa from our plan."
// Expected:
// Beach Reserve Residence remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput('Drop Ocean Lagoon Villa from our plan.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'booking_handoff',
    'TEST 67 - "Drop Ocean Lagoon Villa from our plan." keeps Beach Reserve Residence selected',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 67');
}

// TEST 68
// Start with Ocean Lagoon selected.
// "Take Ocean Lagoon Villa out of our plan."
// Expected:
// selectedVillaId undefined.
// No PLAN_TRIP response.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Take Ocean Lagoon Villa out of our plan.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'itinerary_update',
    'TEST 68 - "Take Ocean Lagoon Villa out of our plan." clears Ocean Lagoon selection without PLAN_TRIP response',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 68');
}

// TEST 69
// "Can you cancel the Ocean Lagoon Villa request?"
// Expected:
// no booking_handoff.
// Must not claim an external reservation was cancelled.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Can you cancel the Ocean Lagoon Villa request?', ctx);
  assert(
    res.response.type !== 'booking_handoff' &&
    !res.response.message.toLowerCase().includes('reservation has been cancelled'),
    'TEST 69 - "Can you cancel the Ocean Lagoon Villa request?" produces no booking_handoff and no external cancellation claim',
    `type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 69');
}

// TEST 70
// Start with Ocean Lagoon selected.
// "Could you cancel my stay request?"
// Expected:
// Ocean Lagoon remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Could you cancel my stay request?', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff',
    'TEST 70 - "Could you cancel my stay request?" preserves Ocean Lagoon selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 70');
}

// TEST 71
// Start with Beach Reserve Residence selected.
// "Don't submit anything yet."
// Expected:
// Beach Reserve Residence remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput("Don't submit anything yet.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'booking_handoff',
    'TEST 71 - "Don\'t submit anything yet." keeps Beach Reserve Residence selected without booking handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 71');
}

// TEST 72
// "Hold off on the stay request."
// Expected:
// no booking_handoff.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Hold off on the stay request.', ctx);
  assert(
    res.response.type !== 'booking_handoff',
    'TEST 72 - "Hold off on the stay request." produces no booking_handoff',
    `type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 72');
}

// TEST 73
// "I'm not sure about booking Ocean Lagoon Villa."
// Expected:
// exploratory/decline-oriented response.
// No selection.
{
  const ctx = createFreshContext();
  const res = processConciergeInput("I'm not sure about booking Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 73 - "I\'m not sure about booking Ocean Lagoon Villa." remains exploratory without selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 73');
}

// TEST 74
// Start with Ocean Lagoon selected.
// "I'm not sure about booking Ocean Lagoon Villa yet."
// Expected:
// Ocean Lagoon remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput("I'm not sure about booking Ocean Lagoon Villa yet.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff',
    'TEST 74 - "I\'m not sure about booking Ocean Lagoon Villa yet." keeps Ocean Lagoon selected',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 74');
}

// TEST 75
// "We probably shouldn't reserve Ocean Lagoon Villa."
// Expected:
// no booking_handoff.
{
  const ctx = createFreshContext();
  const res = processConciergeInput("We probably shouldn't reserve Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 75 - "We probably shouldn\'t reserve Ocean Lagoon Villa." produces no booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 75');
}

// TEST 76
// "I don't think we should book Ocean Lagoon Villa."
// Expected:
// no selection.
// No booking_handoff.
{
  const ctx = createFreshContext();
  const res = processConciergeInput("I don't think we should book Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 76 - "I don\'t think we should book Ocean Lagoon Villa." produces no selection and no booking_handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 76');
}

// TEST 77
// Start with Beach Reserve selected.
// "I think we shouldn't book Ocean Lagoon Villa."
// Expected:
// Beach Reserve remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput("I think we shouldn't book Ocean Lagoon Villa.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'booking_handoff',
    'TEST 77 - "I think we shouldn\'t book Ocean Lagoon Villa." preserves Beach Reserve selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 77');
}

// TEST 78
// "I no longer want to go diving."
// Expected:
// still NOT booking cancellation.
{
  const kind = classifyBookingUtterance('I no longer want to go diving.');
  assert(
    kind !== 'cancel_or_decline',
    'TEST 78 - "I no longer want to go diving." is NOT booking cancellation',
    `Classified kind: ${kind}`
  );
}

// TEST 79
// "I no longer want spa."
// Expected:
// still NOT booking cancellation.
{
  const kind = classifyBookingUtterance('I no longer want spa.');
  assert(
    kind !== 'cancel_or_decline',
    'TEST 79 - "I no longer want spa." is NOT booking cancellation',
    `Classified kind: ${kind}`
  );
}

// TEST 80
// "Plan a 5-night stay for us."
// Expected:
// normal PLAN_TRIP behavior still works.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Plan a 5-night stay for us.', ctx);
  assert(
    res.response.type === 'itinerary' &&
    (res.response.message.toLowerCase().includes('itinerary') ||
      res.response.message.toLowerCase().includes('escape') ||
      res.response.message.toLowerCase().includes('stay')),
    'TEST 80 - "Plan a 5-night stay for us." triggers normal PLAN_TRIP behavior',
    `type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 80');
}

// TEST 81
// Start Ocean Lagoon selected.
// "Remove Ocean Lagoon Villa from the itinerary."
// Expected:
// selectedVillaId undefined
// no itinerary response
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Remove Ocean Lagoon Villa from the itinerary.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'itinerary_update' &&
    res.response.type !== 'booking_handoff',
    'TEST 81 - "Remove Ocean Lagoon Villa from the itinerary." clears selectedVillaId with no itinerary response',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 81');
}

// TEST 82
// Start Beach Reserve selected.
// "Remove Ocean Lagoon Villa from the itinerary."
// Expected:
// Beach Reserve remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput('Remove Ocean Lagoon Villa from the itinerary.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'booking_handoff',
    'TEST 82 - "Remove Ocean Lagoon Villa from the itinerary." keeps Beach Reserve selected',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 82');
}

// TEST 83
// Start Ocean Lagoon selected.
// "Take Ocean Lagoon Villa off the itinerary."
// Expected:
// selectedVillaId undefined
// no itinerary regeneration
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Take Ocean Lagoon Villa off the itinerary.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'itinerary_update',
    'TEST 83 - "Take Ocean Lagoon Villa off the itinerary." clears selectedVillaId without itinerary regeneration',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 83');
}

// TEST 84
// Start Ocean Lagoon selected.
// "Drop Ocean Lagoon Villa from this trip."
// Expected:
// selectedVillaId undefined.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Drop Ocean Lagoon Villa from this trip.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'booking_handoff',
    'TEST 84 - "Drop Ocean Lagoon Villa from this trip." clears selectedVillaId to undefined',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 84');
}

// TEST 85
// Start Ocean Lagoon selected.
// "Do not include Ocean Lagoon Villa in our plan."
// Expected:
// selectedVillaId undefined
// no unsolicited PLAN_TRIP response
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Do not include Ocean Lagoon Villa in our plan.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'booking_handoff',
    'TEST 85 - "Do not include Ocean Lagoon Villa in our plan." clears selectedVillaId with no unsolicited PLAN_TRIP',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 85');
}

// TEST 86
// Start Beach Reserve selected.
// "Do not include Ocean Lagoon Villa in our plan."
// Expected:
// Beach Reserve remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput('Do not include Ocean Lagoon Villa in our plan.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'itinerary' &&
    res.response.type !== 'booking_handoff',
    'TEST 86 - "Do not include Ocean Lagoon Villa in our plan." keeps Beach Reserve selected',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 86');
}

// TEST 87
// Start Ocean Lagoon selected.
// "Plan a 5-night stay without Ocean Lagoon Villa."
// Expected:
// Ocean Lagoon is no longer selected.
// If itinerary generation occurs, its resulting state must not contradict the villa exclusion.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Plan a 5-night stay without Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId !== 'ocean-lagoon-villa',
    'TEST 87 - "Plan a 5-night stay without Ocean Lagoon Villa." ensures Ocean Lagoon is no longer selected',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 87');
}

// TEST 88
// "Pause booking for now."
// Expected:
// no booking_handoff.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Pause booking for now.', ctx);
  assert(
    res.response.type !== 'booking_handoff',
    'TEST 88 - "Pause booking for now." produces no booking_handoff',
    `type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 88');
}

// TEST 89
// Start Ocean Lagoon selected.
// "Hold off on booking Ocean Lagoon Villa."
// Expected:
// Ocean Lagoon remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('Hold off on booking Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff',
    'TEST 89 - "Hold off on booking Ocean Lagoon Villa." keeps Ocean Lagoon selected without booking handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 89');
}

// TEST 90
// Start Ocean Lagoon selected.
// "Don't book it yet."
// Expected:
// Ocean Lagoon remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput("Don't book it yet.", ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff',
    'TEST 90 - "Don\'t book it yet." keeps Ocean Lagoon selected without booking handoff',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 90');
}

// TEST 91
// Start Ocean Lagoon selected.
// "I changed my mind about Ocean Lagoon Villa."
// Expected:
// selectedVillaId undefined.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('I changed my mind about Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === undefined &&
    res.response.type !== 'booking_handoff',
    'TEST 91 - "I changed my mind about Ocean Lagoon Villa." clears selectedVillaId to undefined',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 91');
}

// TEST 92
// Start Ocean Lagoon selected.
// "I changed my mind about booking Ocean Lagoon Villa."
// Expected:
// Ocean Lagoon remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('I changed my mind about booking Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff',
    'TEST 92 - "I changed my mind about booking Ocean Lagoon Villa." preserves Ocean Lagoon selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 92');
}

// TEST 93
// Start Beach Reserve selected.
// "I changed my mind about booking Ocean Lagoon Villa."
// Expected:
// Beach Reserve remains selected.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput('I changed my mind about booking Ocean Lagoon Villa.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'booking_handoff',
    'TEST 93 - "I changed my mind about booking Ocean Lagoon Villa." preserves Beach Reserve selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 93');
}

// TEST 94
// Start Beach Reserve selected.
// "We changed our mind about reserving Beach Reserve Residence."
// Expected:
// Beach Reserve remains selected unless wording explicitly rejects the villa
// itself rather than the reservation action.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'beach-reserve-residence';
  const res = processConciergeInput('We changed our mind about reserving Beach Reserve Residence.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'beach-reserve-residence' &&
    res.response.type !== 'booking_handoff',
    'TEST 94 - "We changed our mind about reserving Beach Reserve Residence." preserves Beach Reserve selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 94');
}

// TEST 95
// Start Ocean Lagoon selected.
// "I changed my mind about submitting the request."
// Expected:
// Ocean Lagoon remains selected.
// No booking_handoff.
{
  const ctx = createFreshContext();
  ctx.activeTripState.selectedVillaId = 'ocean-lagoon-villa';
  const res = processConciergeInput('I changed my mind about submitting the request.', ctx);
  assert(
    res.updatedContext.activeTripState.selectedVillaId === 'ocean-lagoon-villa' &&
    res.response.type !== 'booking_handoff',
    'TEST 95 - "I changed my mind about submitting the request." preserves Ocean Lagoon selection',
    `selectedVillaId: ${res.updatedContext.activeTripState.selectedVillaId}, type: ${res.response.type}`
  );
  assertOperationalHonesty(res.response.message, 'TEST 95');
}

// TEST 96
// "Plan a 5-night stay for us."
// Expected:
// normal PLAN_TRIP still works.
{
  const ctx = createFreshContext();
  const res = processConciergeInput('Plan a 5-night stay for us.', ctx);
  assert(
    res.response.type === 'itinerary' &&
    (res.response.message.toLowerCase().includes('itinerary') ||
      res.response.message.toLowerCase().includes('escape') ||
      res.response.message.toLowerCase().includes('stay')),
    'TEST 96 - "Plan a 5-night stay for us." triggers normal PLAN_TRIP behavior',
    `type: ${res.response.type}, Message: "${res.response.message}"`
  );
  assertOperationalHonesty(res.response.message, 'TEST 96');
}

// Additional Subject Memory Checks from Prior Tasks
{
  // TIDE subject memory: "Tell me about TIDE." -> "Is it good for lunch?"
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about TIDE.', ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('Is it good for lunch?', ctx);
  assert(
    res2.response.message.includes('TIDE') &&
    res2.response.message.toLowerCase().includes('lunch') &&
    !res2.response.message.includes('Which villa do you mean'),
    'SUPPLEMENTAL - TIDE followed by "Is it good for lunch?" answers about TIDE',
    `Message: "${res2.response.message}"`
  );
}

{
  // Sunset Solar Reset subject memory: "Tell me about Sunset Solar Reset." -> "When should we do this?"
  let ctx = createFreshContext();
  const res1 = processConciergeInput('Tell me about Sunset Solar Reset.', ctx);
  ctx = res1.updatedContext;
  const res2 = processConciergeInput('When should we do this?', ctx);
  assert(
    res2.response.message.includes('Sunset Solar Reset') &&
    !res2.response.message.includes('Which villa do you mean'),
    'SUPPLEMENTAL - Sunset Solar Reset followed by "When should we do this?" answers about Sunset Solar Reset',
    `Message: "${res2.response.message}"`
  );
}

console.log('--- ALL 96 REGRESSION TESTS & SUPPLEMENTAL TESTS PASSED SUCCESSFULLY! ---');

