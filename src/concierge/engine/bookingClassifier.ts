/**
 * Centralized Booking Language Classification
 * 
 * Unifies booking semantics across:
 * - isExplicitVillaSelection()
 * - isExplicitVillaRemoval()
 * - detectIntent()
 * - responseComposer()
 * 
 * Distinguishes genuine commitment from availability questions, process questions,
 * exploratory inquiries, and cancellation/negation.
 */

export type BookingUtteranceKind =
  | 'commitment'
  | 'availability_question'
  | 'process_question'
  | 'exploratory'
  | 'cancel_or_decline'
  | 'none';

/**
 * Checks if the utterance represents an explicit command to remove/drop/exclude a villa
 * from the stay plan, itinerary, or trip, or clear the villa selection.
 */
export function isExplicitVillaRemoval(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Full itinerary planning with duration (e.g. "Plan a 5-night stay without...")
  // is handled by PLAN_TRIP with exclusion logic, not pure removal.
  if (/\b(?:plan|create)\s+(?:a\s+)?(?:\d+|five|seven|three)\s*-?\s*nights?\b/i.test(lower)) {
    return false;
  }

  // Explicit clearing of selection
  if (
    /\b(?:clear|remove)\s+(?:our\s+|the\s+)?villa\s+selection\b/i.test(lower) ||
    /\bclear\s+selection\b/i.test(lower) ||
    /\bclear\s+our\s+selection\b/i.test(lower)
  ) {
    return true;
  }

  const mentionsVillaName =
    /\b(?:ocean\s+lagoon|beach\s+reserve|sunset\s+pool|velora\s+private\s+estate|villa|residence|sanctuary)\b/i.test(lower);

  // Dropping / taking off / removing a villa from plan / itinerary / trip / stay
  if (
    mentionsVillaName &&
    (/\b(?:drop|take|remove)\s+.*\b(?:from|out\s+of|off)\s+(?:our|my|the|this)\s+(?:stay\s+)?(?:plan|itinerary|trip|stay)\b/i.test(lower) ||
      /\b(?:don\'?t|do\s+not)\s+want\s+.*\bin\s+(?:the|our|my|this)\s+(?:plan|itinerary|trip)\s+anymore\b/i.test(lower) ||
      /\bforget\s+.*\bfor\s+(?:our|my|the)\s+stay\b/i.test(lower))
  ) {
    return true;
  }

  // Explicit exclusion / "without this villa"
  if (
    mentionsVillaName &&
    (/\b(?:do\s+not|don\'?t)\s+include\b/i.test(lower) ||
      /\bexclude\s+.*\b(?:from\s+(?:our|my|the|this)\s+(?:stay|plan|trip|itinerary))?\b/i.test(lower) ||
      /\b(?:plan|create)\s+(?:the|our)\s+(?:stay|itinerary|trip)\s+without\b/i.test(lower) ||
      /\b(?:we\s+want\s+the\s+trip\s+without)\b/i.test(lower))
  ) {
    return true;
  }

  // Change of mind about the villa itself
  // Distinguish "changed my mind about Ocean Lagoon Villa" (villa rejection)
  // from "changed my mind about booking/reserving Ocean Lagoon Villa" (booking hesitation/decline)
  const isBookingActionChangeOfMind =
    /\b(?:changed|change)\s+(?:my|our)\s+mind\s+about\s+(?:booking|reserving|submitting)\b/i.test(lower);

  if (
    mentionsVillaName &&
    !isBookingActionChangeOfMind &&
    (/\b(?:i|we)\s+no\s+longer\s+want\b/i.test(lower) ||
      /\bno\s+longer\s+want\b/i.test(lower) ||
      /\b(?:changed|change)\s+(?:my|our)\s+mind\s+about\b/i.test(lower))
  ) {
    return true;
  }

  return false;
}

function isCancelOrDecline(lower: string): boolean {
  // Explicit villa-selection clearing / plan removal language
  if (isExplicitVillaRemoval(lower)) {
    return true;
  }

  // Change of mind about booking / reserving / submitting
  if (
    /\b(?:changed|change)\s+(?:my|our)\s+mind\s+about\s+(?:booking|reserving|submitting|the\s+stay\s+request)\b/i.test(lower)
  ) {
    return true;
  }

  // Booking / stay request cancellation (including "Can you cancel...", "Could you cancel...", "Please cancel...")
  if (
    /\b(?:can\s+you|could\s+you|please\s+|i\s+want\s+to\s+)?cancel\s+(?:the|my|our)?\s*.*\b(?:stay\s+request|villa\s+request|booking|reservation|request)\b/i.test(lower) ||
    /\bcancel\s+(?:my\s+|the\s+|our\s+)?(?:stay\s+request|booking|reservation|request)\b/i.test(lower) ||
    /\bcancel\s+my\s+.*\brequest\b/i.test(lower) ||
    /\bwant\s+to\s+cancel\s+(?:the\s+|my\s+|our\s+)?.*\brequest\b/i.test(lower) ||
    /\bwant\s+to\s+cancel\s+(?:the\s+|my\s+|our\s+)?(?:stay\s+request|booking|reservation)\b/i.test(lower) ||
    /\bcancel\s+(?:booking|reserving)\b/i.test(lower)
  ) {
    return true;
  }

  // Hold off / pause / don't submit / don't send / don't book yet phrases
  if (
    /\b(?:let\'?s\s+)?(?:pause|hold\s+off)\b.*\b(?:booking|request|reservation)\b/i.test(lower) ||
    /\bpause\s+(?:the\s+)?booking\b/i.test(lower) ||
    /\bpause\s+booking\s+for\s+now\b/i.test(lower) ||
    /\bhold\s+off\s+on\s+booking\b/i.test(lower) ||
    /\b(?:hold\s+off|pause)\s+(?:on\s+)?(?:the|my|our)?\s*stay\s+request\b/i.test(lower) ||
    /\b(?:don\'?t|do\s+not|let\'?s\s+not)\s+(?:submit|send)\s+(?:anything|the\s+request|a\s+request)\s*(?:yet)?\b/i.test(lower) ||
    /\b(?:don\'?t|do\s+not)\s+submit\b/i.test(lower) ||
    /\b(?:don\'?t|do\s+not)\s+send\s+the\s+request\b/i.test(lower) ||
    /\b(?:don\'?t|do\s+not)\s+book\s+(?:it\s+)?yet\b/i.test(lower) ||
    /\b(?:don\'?t|do\s+not)\s+book\s+(?:anything\s+)?yet\b/i.test(lower)
  ) {
    return true;
  }

  // Negation of booking / reservation
  return (
    /\b(?:do\s+not|don\'?t)\s+(?:book|reserve|select|choose|pick)\b/i.test(lower) ||
    /\b(?:please\s+)?don\'?t\s+book\b/i.test(lower) ||
    /\b(?:please\s+)?do\s+not\s+book\b/i.test(lower) ||
    /\b(?:don\'?t|do\s+not)\s+want\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:don\'?t|do\s+not)\s+think\s+(?:i|we)\s+want\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:not\s+ready|aren\'?t\s+ready|we\'?re\s+not\s+ready)\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:probably\s+won\'?t|won\'?t)\s+(?:book|reserve)\b/i.test(lower)
  );
}

function isProcessQuestion(lower: string): boolean {
  return (
    /\b(?:can|could)\s+you\s+(?:tell\s+me|explain)\s+how\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\bwhat\s+(?:would|do)\s+(?:i|we)\s+need\s+to\s+do\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:what\s+is\s+the\s+process|what\'?s\s+the\s+process)\b/i.test(lower) ||
    /\b(?:booking\s+process|reservation\s+process)\b/i.test(lower) ||
    /\bhow\s+does\s+(?:booking|reserving|the\s+booking\s+process)\s+work\b/i.test(lower) ||
    /\bhow\s+(?:do|can)\s+(?:i|we)\s+(?:book|reserve)\b/i.test(lower) ||
    /\bhow\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\bwhat\s+(?:steps|step)\s+(?:do\s+i\s+follow|are\s+there|to\s+take)\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\bwhat\s+are\s+the\s+steps\s+to\s+(?:book|reserve)\b/i.test(lower)
  );
}

function isAvailabilityQuestion(lower: string): boolean {
  return (
    /\b(?:can\s+i|can\s+we|could\s+i|could\s+we)\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:would\s+i|would\s+we)\s+be\s+able\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:can|could|would)\s+.*\bbe\s+(?:booked|reserved)\b/i.test(lower) ||
    /\b(?:can|could)\s+you\s+tell\s+me\s+(?:if|whether)\s+(?:i|we|.*)\s+(?:can\s+book|can\s+reserve|can\s+be\s+booked|can\s+be\s+reserved)\b/i.test(lower) ||
    /\b(?:is|are)\s+.*\b(?:bookable|reservable)\b/i.test(lower) ||
    /\b(?:is|are)\s+booking\s+possible\b/i.test(lower) ||
    /\b(?:is|are)\s+reservation\s+possible\b/i.test(lower) ||
    /\b(?:is\s+it\s+possible|would\s+it\s+be\s+possible)\s+to\s+(?:get|book|reserve)\b/i.test(lower) ||
    /\bis\s+there\s+availability\b/i.test(lower) ||
    /\bcheck\s+availability\b/i.test(lower) ||
    /\bdo\s+you\s+have\s+.*\bavailable\b/i.test(lower) ||
    /\bavailable\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\bavailable\s+for\s+(?:booking|reservation|stay)\b/i.test(lower) ||
    (/\bavailable\b/i.test(lower) && /\b(?:is|are)\b/i.test(lower) && /\b(?:book|reserve|stay|villa|residence|sanctuary)\b/i.test(lower))
  );
}

function isExploratory(lower: string): boolean {
  return (
    // Booking hesitation / uncertainty
    /\b(?:not\s+sure|unsure)\s+about\s+(?:booking|reserving)\b/i.test(lower) ||
    /\b(?:not\s+sure|unsure)\s+(?:i|we|if\s+(?:i|we))\s+want\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:probably\s+shouldn\'?t|shouldn\'?t)\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:don\'?t\s+think|do\s+not\s+think)\s+(?:we|i)\s+should\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:i|we)\s+think\s+(?:we|i)\s+shouldn\'?t\s+(?:book|reserve)\b/i.test(lower) ||
    // Standard exploratory
    /\b(?:maybe|perhaps)\s+(?:i\'ll|we\'ll|i\s+will|we\s+will|i|we)\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:leaning\s+toward|leaning\s+towards)\s+(?:booking|reserving)\b/i.test(lower) ||
    /\b(?:may|might)\s+end\s+up\s+(?:booking|reserving)\b/i.test(lower) ||
    /\b(?:thinking\s+of|thinking\s+about)\s+(?:booking|reserving)\b/i.test(lower) ||
    /\b(?:i\s+may|we\s+may)\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:might|possibly)\s+(?:go\s+with|book|reserve)\b/i.test(lower) ||
    /\b(?:considering)\s+(?:booking|reserving)\b/i.test(lower) ||
    /\b(?:interested\s+in)\s+(?:booking|reserving)\b/i.test(lower) ||
    /\b(?:considering|interested\s+in)\b.*\bfor\s+(?:our|my|the)\s+stay\b/i.test(lower) ||
    /\bbefore\s+(?:i|we)\s+(?:book|reserve)\b/i.test(lower) ||
    /\bbefore\s+(?:booking|reserving)\b/i.test(lower)
  );
}

function isCommitment(lower: string): boolean {
  // If it's a negative, cancellation, question, or exploratory phrase, it can never be commitment
  if (isCancelOrDecline(lower) || isProcessQuestion(lower) || isAvailabilityQuestion(lower) || isExploratory(lower)) {
    return false;
  }

  // Guard against negated / uncertain desire / hesitation phrasing
  if (
    /\b(?:don\'?t|do\s+not|not\s+sure|unsure|not\s+ready|won\'?t|shouldn\'?t|never)\b/i.test(lower) ||
    /\b(?:yet|for\s+now)\b/i.test(lower)
  ) {
    return false;
  }

  // Generic information / inquiry verbs / query prefixes must not count as commitment
  if (
    /\b(?:know|see|view|views|show|showing|information|info|details|learn|explore|compare|price|pricing|cost|costs|rate|rates)\b/i.test(lower) ||
    lower.startsWith('which villa') ||
    lower.startsWith('what villa') ||
    lower.includes('best villa') ||
    lower.includes('tell me about') ||
    lower.includes('how much') ||
    lower.includes('does it have') ||
    lower.includes('do all villas have') ||
    lower.includes('prefer the design')
  ) {
    return false;
  }

  const hasImperative =
    /^(?:please\s+)?(?:book|reserve|select|choose|pick)\b/i.test(lower);

  const hasDirectServiceRequest =
    /\b(?:would\s+you\s+mind)\s+(?:booking|reserving)\b/i.test(lower) ||
    /\b(?:can|could|would)\s+you\s+(?:please\s+)?(?:book|reserve)\b/i.test(lower) ||
    /\b(?:book|reserve)\b.*\bfor\s+(?:me|us)\b/i.test(lower);

  const hasColloquialSelection =
    /\b(?:let's go with|lets go with|go with|let's do|lets do)\b/i.test(lower) ||
    /\b(?:let's book|lets book|let's reserve|lets reserve)\b/i.test(lower) ||
    /\b(?:i'll take|ill take|we'll take|well take|take the)\b/i.test(lower) ||
    /\b(?:switch us to|switch to|change to|change villa to|update villa to|make it the)\b/i.test(lower) ||
    /\b(?:we'll stay in|well stay in|i'll stay in|ill stay in|we will stay in|i will stay in)\b/i.test(lower);

  const hasWantStayCommitment =
    /\b(?:i want|we want|i would like|we would like|i'd like|we'd like)\s+to\s+(?:book|reserve)\b/i.test(lower) ||
    /\b(?:i want|we want|i would like|we would like|i'd like|we'd like)\b.*\bfor\s+(?:our|my|the)\s+stay\b/i.test(lower) ||
    /\b(?:i want|we want|i would like|we would like|i'd like|we'd like)\s+to\s+stay\s+in\b/i.test(lower);

  return hasImperative || hasDirectServiceRequest || hasColloquialSelection || hasWantStayCommitment;
}

export function classifyBookingUtterance(text: string): BookingUtteranceKind {
  const lower = text.toLowerCase().trim();

  // 1. Negation / Cancellation (e.g. "Do not book...", "Don't reserve...", "Cancel the stay request", "Drop ... from plan")
  if (isCancelOrDecline(lower)) {
    return 'cancel_or_decline';
  }

  // 2. Process questions (e.g. "what is the process to reserve...", "how do I book...", "what do I need to do to book...")
  if (isProcessQuestion(lower)) {
    return 'process_question';
  }

  // 3. Availability / possibility questions (e.g. "can I book...", "could I book...", "would I be able to book...", "can it be booked...")
  if (isAvailabilityQuestion(lower)) {
    return 'availability_question';
  }

  // 4. Exploratory inquiries & hesitation (e.g. "thinking of booking...", "might reserve...", "i may book...", "not sure about booking...")
  if (isExploratory(lower)) {
    return 'exploratory';
  }

  // 5. Genuine commitment (e.g. "Book Ocean Lagoon Villa", "Please book...", "I want to book...", "Can you book ... for me?")
  if (isCommitment(lower)) {
    return 'commitment';
  }

  return 'none';
}
