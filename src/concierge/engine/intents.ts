/**
 * Intent recognition with Match Quality, Preconditions, and Context-Aware Priority
 * Distinguishes Exact/Near Phrase, Strong Multi-Word, Contextual, and Token Matches.
 */

import { hasAnySynonym } from './synonyms';
import { DialogueContext } from './dialogueState';
import { isRepairTrigger } from './repairEngine';
import { extractEntities } from './entities';
import { classifyBookingUtterance, type BookingUtteranceKind } from './bookingClassifier';

export { classifyBookingUtterance };
export type { BookingUtteranceKind };

export function isExplicitVillaSelection(text: string): boolean {
  return classifyBookingUtterance(text) === 'commitment';
}

export type ConciergeIntent =
  | 'SOCIAL_GREETING'
  | 'SOCIAL_HOW_ARE_YOU'
  | 'SOCIAL_USER_IS_FINE'
  | 'SOCIAL_POSITIVE_REACTION'
  | 'SOCIAL_NEGATIVE_REACTION'
  | 'SOCIAL_SMALL_TALK'
  | 'SOCIAL_THANKS'
  | 'SOCIAL_GOODBYE'
  | 'SOCIAL_CONFUSION'
  | 'SOCIAL_FRUSTRATION'
  | 'SOCIAL_META'
  | 'CONVERSATIONAL_REPAIR'
  | 'PENDING_ANSWER'
  | 'FOLLOWUP_QUERY'
  | 'BROWSING'
  | 'VILLA_RECOMMENDATION'
  | 'VILLA_COMPARE'
  | 'VILLA_DETAIL'
  | 'VILLA_PRICE'
  | 'VILLA_360'
  | 'DINING'
  | 'DIVING'
  | 'SNORKELING'
  | 'SAILING'
  | 'WELLNESS'
  | 'ARRIVAL'
  | 'PLAN_TRIP'
  | 'MODIFY_ITINERARY'
  | 'AVAILABILITY'
  | 'UNKNOWN';

export type MatchQuality =
  | 'EXACT_PHRASE'
  | 'STRONG_PHRASE'
  | 'CONTEXTUAL'
  | 'SINGLE_STRONG'
  | 'WEAK';

export interface IntentMatch {
  intent: ConciergeIntent;
  confidence: number;
  quality: MatchQuality;
  subType?: string;
}

export function detectIntent(
  text: string,
  rawInput: string,
  dialogueContext?: DialogueContext
): IntentMatch {
  const lower = text.toLowerCase().trim();
  const rawLower = rawInput.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;

  // -------------------------------------------------------------
  // STEP 1: Conversational Repair Check (First-Class Dialogue Behavior)
  // -------------------------------------------------------------
  if (isRepairTrigger(lower, rawInput)) {
    return {
      intent: 'CONVERSATIONAL_REPAIR',
      confidence: 0.98,
      quality: 'EXACT_PHRASE',
    };
  }

  // -------------------------------------------------------------
  // STEP 2: Pending Question Check (Resolves short user answers)
  // -------------------------------------------------------------
  if (dialogueContext?.pendingQuestion && wordCount <= 6) {
    const pq = dialogueContext.pendingQuestion;
    if (pq.type === 'CONFIRM_VILLA') {
      if (/^(no|nope|not yet|neither|none|i do not|i dont)\b/i.test(lower)) {
        return {
          intent: 'PENDING_ANSWER',
          confidence: 0.95,
          quality: 'CONTEXTUAL',
          subType: 'NO_VILLA_SELECTED',
        };
      }
      if (/^(yes|yeah|yep|i do|sure)\b/i.test(lower)) {
        return {
          intent: 'PENDING_ANSWER',
          confidence: 0.95,
          quality: 'CONTEXTUAL',
          subType: 'YES_VILLA_SELECTED',
        };
      }
    }

    if (pq.type === 'VILLA_PREFERENCE') {
      if (lower.includes('overwater') || lower.includes('water') || lower.includes('lagoon')) {
        return {
          intent: 'PENDING_ANSWER',
          confidence: 0.95,
          quality: 'CONTEXTUAL',
          subType: 'PREFER_OVERWATER',
        };
      }
      if (lower.includes('beach') || lower.includes('sand') || lower.includes('shore')) {
        return {
          intent: 'PENDING_ANSWER',
          confidence: 0.95,
          quality: 'CONTEXTUAL',
          subType: 'PREFER_BEACH',
        };
      }
    }

    if (pq.type === 'NIGHTS') {
      if (/^(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a week)\b/i.test(lower)) {
        return {
          intent: 'PENDING_ANSWER',
          confidence: 0.95,
          quality: 'CONTEXTUAL',
          subType: 'ANSWER_NIGHTS',
        };
      }
    }

    if (pq.type === 'GUEST_COUNT') {
      if (/^(\d+|one|two|three|four|five|six|couple|just me|solo|family)\b/i.test(lower)) {
        return {
          intent: 'PENDING_ANSWER',
          confidence: 0.95,
          quality: 'CONTEXTUAL',
          subType: 'ANSWER_GUESTS',
        };
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 3: Context-Dependent Short Utterance Inspection (< 4 words)
  // -------------------------------------------------------------
  if (wordCount <= 4) {
    // "why", "why?", "how come?"
    if (/^(why|why\?|how come|how so)\b/i.test(rawLower)) {
      return {
        intent: 'FOLLOWUP_QUERY',
        confidence: 0.95,
        quality: 'CONTEXTUAL',
        subType: 'WHY',
      };
    }

    // "how much?", "price?", "cost?"
    if (/^(how much|how much\?|price\?|what price|what is the price|cost\?)\b/i.test(rawLower)) {
      return {
        intent: 'VILLA_PRICE',
        confidence: 0.95,
        quality: 'CONTEXTUAL',
      };
    }

    // "show me", "can i see", "show it"
    if (/^(show me|show it|can i see|let me see|view it)\b/i.test(rawLower)) {
      return {
        intent: 'VILLA_360',
        confidence: 0.95,
        quality: 'CONTEXTUAL',
      };
    }

    // "which one?", "which?"
    if (/^(which one|which\?|which one\?)\b/i.test(rawLower)) {
      return {
        intent: 'VILLA_COMPARE',
        confidence: 0.92,
        quality: 'CONTEXTUAL',
      };
    }

    // "is this private?", "is it private?", "how private?", "is it secluded?"
    if (
      /^(is this private\??|is it private\??|how private\??|how private is it\??|is there privacy\??|private\??|is it secluded\??|is this secluded\??)\b/i.test(rawLower) ||
      lower === 'is this private' ||
      lower === 'is it private' ||
      lower === 'is this private?' ||
      lower === 'is it private?' ||
      lower === 'how private' ||
      lower === 'how private?' ||
      lower === 'is it secluded' ||
      lower === 'is this secluded'
    ) {
      return {
        intent: 'VILLA_DETAIL',
        confidence: 0.98,
        quality: 'CONTEXTUAL',
        subType: 'PRIVACY',
      };
    }

    // "too expensive", "cheaper one?", "cheaper?"
    if (lower.includes('too expensive') || lower.includes('cheaper') || lower.includes('less expensive')) {
      return {
        intent: 'FOLLOWUP_QUERY',
        confidence: 0.95,
        quality: 'CONTEXTUAL',
        subType: 'CHEAPER',
      };
    }

    // "bigger one?", "larger one?"
    if (lower.includes('bigger') || lower.includes('larger')) {
      return {
        intent: 'FOLLOWUP_QUERY',
        confidence: 0.95,
        quality: 'CONTEXTUAL',
        subType: 'BIGGER',
      };
    }

    // "we are a couple", "just the two of us", "for two"
    if (
      lower.includes('couple') ||
      lower.includes('two of us') ||
      lower.includes('just me') ||
      lower.includes('solo') ||
      lower.includes('family')
    ) {
      return {
        intent: 'VILLA_RECOMMENDATION',
        confidence: 0.95,
        quality: 'CONTEXTUAL',
        subType: lower.includes('family') ? 'FAMILY' : 'COUPLE',
      };
    }

    // "and?", "then?", "so?", "what else?"
    if (/^(and\?|then\?|so\?|what else\?|what next\?)\b/i.test(rawLower)) {
      return {
        intent: 'FOLLOWUP_QUERY',
        confidence: 0.9,
        quality: 'CONTEXTUAL',
        subType: 'AND_THEN',
      };
    }
  }

  // -------------------------------------------------------------
  // STEP 4: High-Priority Social Intents (Exact / Strong Phrase Match)
  // -------------------------------------------------------------

  // 4a. SOCIAL_HOW_ARE_YOU (High Confidence, Must Outweigh Weak Tokens!)
  const howAreYouPatterns = [
    'how are you',
    'how are u',
    'how r u',
    'how is it going',
    'how you doing',
    'how you doin',
    'you good',
    'everything good',
    'how are things',
    'how do you do',
    'what is up',
    'whats up',
    'sup',
  ];
  if (howAreYouPatterns.some((pattern) => lower.includes(pattern))) {
    return {
      intent: 'SOCIAL_HOW_ARE_YOU',
      confidence: 0.99,
      quality: 'EXACT_PHRASE',
    };
  }

  // 4b. SOCIAL_GREETING
  if (
    /^(hi|hello|hey|heyy|good morning|good afternoon|good evening|greetings)\b/i.test(lower) &&
    wordCount <= 4
  ) {
    return {
      intent: 'SOCIAL_GREETING',
      confidence: 0.98,
      quality: 'EXACT_PHRASE',
    };
  }

  // 4c. SOCIAL_USER_IS_FINE
  if (
    /^(i am good|i am fine|doing well|all good|i am doing well|doing great|great thanks|fine thanks)\b/i.test(lower)
  ) {
    return {
      intent: 'SOCIAL_USER_IS_FINE',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
    };
  }

  // 4d. SOCIAL_FRUSTRATION
  if (
    hasAnySynonym(lower, 'FRUSTRATION') ||
    lower === 'wtf' ||
    lower.includes('stupid') ||
    lower.includes('annoying') ||
    lower.includes('nonsense')
  ) {
    return {
      intent: 'SOCIAL_FRUSTRATION',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
    };
  }

  // 4e. SOCIAL_THANKS
  if (/^(thanks|thank you|thx|cheers|appreciate it|many thanks)\b/i.test(lower)) {
    return {
      intent: 'SOCIAL_THANKS',
      confidence: 0.98,
      quality: 'EXACT_PHRASE',
    };
  }

  // 4f. SOCIAL_GOODBYE
  if (/^(bye|goodbye|cya|see you|farewell|have a good day)\b/i.test(lower)) {
    return {
      intent: 'SOCIAL_GOODBYE',
      confidence: 0.98,
      quality: 'EXACT_PHRASE',
    };
  }

  // 4g. SOCIAL_POSITIVE_REACTION (Explicit Visual / Resort Compliments)
  if (
    lower.includes('looks amazing') ||
    lower.includes('looks beautiful') ||
    lower.includes('looks stunning') ||
    lower.includes('so beautiful') ||
    lower.includes('nice view') ||
    lower.includes('love this') ||
    lower.includes('gorgeous place') ||
    lower.includes('incredible place') ||
    lower.includes('breathtaking') ||
    (lower === 'wow' && wordCount === 1)
  ) {
    return {
      intent: 'SOCIAL_POSITIVE_REACTION',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
    };
  }

  // 4h. SOCIAL_SMALL_TALK
  if (
    lower === 'cool' ||
    lower === 'okay' ||
    lower === 'ok' ||
    lower === 'nice' ||
    lower === 'neat' ||
    lower === 'great' ||
    lower.includes('nice weather') ||
    lower.includes('sunny today')
  ) {
    return {
      intent: 'SOCIAL_SMALL_TALK',
      confidence: 0.9,
      quality: 'EXACT_PHRASE',
    };
  }

  // 4i. SOCIAL_META / AI Identity & Honesty
  const isChatGPT =
    lower.includes('chatgpt') ||
    lower.includes('chat gpt') ||
    lower.includes('openai') ||
    lower.includes('open ai') ||
    /\bgpt(-?[345o]|o\d)?\b/.test(lower);

  const isGemini =
    lower.includes('gemini') ||
    lower.includes('google ai') ||
    lower.includes('bard');

  const isModelQuestion =
    lower.includes('which model') ||
    lower.includes('what model') ||
    lower.includes('what ai model') ||
    lower.includes('what powers you') ||
    lower.includes('what are you built on') ||
    lower.includes('what engine') ||
    lower.includes('which llm') ||
    lower.includes('what llm') ||
    lower.includes('what technology');

  const isAiQuery =
    lower.includes('are you ai') ||
    lower.includes('are you an ai') ||
    lower.includes('are you a bot') ||
    lower.includes('are you a robot') ||
    lower.includes('are you human') ||
    lower.includes('are you real') ||
    lower.includes('is this ai') ||
    lower.includes('is this an ai') ||
    lower.includes('is this a bot') ||
    lower.includes('is this automated') ||
    lower.includes('am i talking to a human') ||
    lower.includes('am i talking to a bot') ||
    lower.includes('am i talking to ai') ||
    lower.includes('who created you') ||
    lower.includes('who made you') ||
    lower.includes('are you a real person');

  const isTalkToHuman =
    lower.includes('talk to a human') ||
    lower.includes('speak to a human') ||
    lower.includes('real person please') ||
    lower.includes('speak with someone') ||
    lower.includes('human agent') ||
    lower.includes('call someone') ||
    lower.includes('phone number') ||
    lower.includes('contact person') ||
    lower.includes('real person');

  if (isChatGPT) {
    return {
      intent: 'SOCIAL_META',
      confidence: 0.99,
      quality: 'STRONG_PHRASE',
      subType: 'CHATGPT',
    };
  }

  if (isGemini) {
    return {
      intent: 'SOCIAL_META',
      confidence: 0.99,
      quality: 'STRONG_PHRASE',
      subType: 'GEMINI',
    };
  }

  if (isModelQuestion) {
    return {
      intent: 'SOCIAL_META',
      confidence: 0.99,
      quality: 'STRONG_PHRASE',
      subType: 'MODEL_QUESTION',
    };
  }

  if (isAiQuery) {
    return {
      intent: 'SOCIAL_META',
      confidence: 0.98,
      quality: 'STRONG_PHRASE',
      subType: 'AI_IDENTITY',
    };
  }

  if (isTalkToHuman) {
    return {
      intent: 'SOCIAL_META',
      confidence: 0.98,
      quality: 'STRONG_PHRASE',
      subType: 'TALK_TO_HUMAN',
    };
  }

  if (
    lower.includes('who are you') ||
    lower.includes('what are you') ||
    lower.includes('what can you do') ||
    lower.includes('how can you help') ||
    lower.includes('tell me about yourself') ||
    lower.includes('what is your role')
  ) {
    return {
      intent: 'SOCIAL_META',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
      subType: 'CAPABILITIES',
    };
  }

  // -------------------------------------------------------------
  // STEP 5: Resort & Stay Query Intents
  // -------------------------------------------------------------

  // 5a. Browsing
  if (
    lower.includes('just browsing') ||
    lower.includes('just looking') ||
    lower.includes('just searching') ||
    lower.includes('look around') ||
    lower.includes('having a look') ||
    lower.includes('just exploring')
  ) {
    return {
      intent: 'BROWSING',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
    };
  }

  // 5b. 360 / Virtual tour
  if (
    lower.includes('360') ||
    lower.includes('virtual tour') ||
    lower.includes('look inside') ||
    lower.includes('show it') ||
    (lower.includes('tour') && lower.includes('villa'))
  ) {
    return {
      intent: 'VILLA_360',
      confidence: 0.92,
      quality: 'STRONG_PHRASE',
    };
  }

  // 5c. Villa Comparisons
  if (
    (lower.includes('which') && (lower.includes('bigger') || lower.includes('larger') || lower.includes('cheaper') || lower.includes('better') || lower.includes('difference'))) ||
    lower.includes('sunset or lagoon') ||
    lower.includes('lagoon or sunset') ||
    lower.includes('overwater or beach') ||
    lower.includes('beach or overwater') ||
    lower.includes('compare')
  ) {
    return {
      intent: 'VILLA_COMPARE',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
    };
  }

  // 5d. Villa Price Queries
  if (hasAnySynonym(lower, 'PRICE')) {
    return {
      intent: 'VILLA_PRICE',
      confidence: 0.92,
      quality: 'STRONG_PHRASE',
    };
  }

  // Centralized booking classification
  const bookingKind = classifyBookingUtterance(rawInput || text);

  // 5d-2. Explicit Villa Selection (Commitment with villa entity)
  if (bookingKind === 'commitment' && extractEntities(rawInput).villaId) {
    return {
      intent: 'VILLA_DETAIL',
      confidence: 0.99,
      quality: 'EXACT_PHRASE',
      subType: 'EXPLICIT_SELECTION',
    };
  }

  // 5d-3. Booking Process / Availability / Exploratory Queries / Negation / Cancellation
  // Must resolve BEFORE generic Villa Detail matching (e.g. "What is the process to reserve Ocean Lagoon Villa?")
  if (
    bookingKind === 'process_question' ||
    bookingKind === 'availability_question' ||
    bookingKind === 'exploratory' ||
    bookingKind === 'cancel_or_decline'
  ) {
    return {
      intent: 'AVAILABILITY',
      confidence: 0.96,
      quality: 'STRONG_PHRASE',
      subType: bookingKind,
    };
  }

  // 5e. Villa Detail Queries
  if (
    (lower.includes('tell me about') ||
      lower.includes('what is the') ||
      lower.includes('show me') ||
      lower.includes('details') ||
      lower.includes('about the') ||
      lower.includes('explore')) &&
    extractEntities(rawInput).villaId
  ) {
    return {
      intent: 'VILLA_DETAIL',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
    };
  }

  const isSelectedVillaQuery =
    (lower.includes('which villa') ||
      lower.includes('what villa') ||
      lower.includes('which sanctuary') ||
      lower.includes('what sanctuary') ||
      lower.includes('which residence') ||
      lower.includes('what residence') ||
      lower.includes('what is our villa') ||
      lower.includes('which is our villa') ||
      lower.includes('our villa')) &&
    (lower.includes('selected') ||
      lower.includes('chosen') ||
      lower.includes('picked') ||
      lower.includes('have we') ||
      lower.includes('did we') ||
      lower.includes('current'));

  if (
    isSelectedVillaQuery ||
    lower.includes('which villa have we selected') ||
    lower.includes('which villa is selected') ||
    lower.includes('what villa have we selected') ||
    lower.includes('what villa is selected') ||
    lower.includes('which villa did we select') ||
    lower.includes('villa have we selected') ||
    lower.includes('villa did we select')
  ) {
    return {
      intent: 'VILLA_DETAIL',
      confidence: 0.99,
      quality: 'EXACT_PHRASE',
      subType: 'SELECTED_VILLA',
    };
  }

  if (
    lower.includes('do all villas have pools') ||
    lower.includes('do all villas have a pool') ||
    lower.includes('do villas have pools') ||
    lower.includes('does every villa have a pool') ||
    lower.includes('all villas have pools') ||
    lower.includes('all villas have pool')
  ) {
    return {
      intent: 'VILLA_DETAIL',
      confidence: 0.98,
      quality: 'EXACT_PHRASE',
      subType: 'ALL_POOLS',
    };
  }

  if (
    lower.includes('which villas are overwater') ||
    lower.includes('which villa is overwater') ||
    lower.includes('which villa are overwater') ||
    lower.includes('which are overwater') ||
    lower.includes('villas are overwater') ||
    lower.includes('villa are overwater') ||
    lower.includes('villas over water') ||
    lower.includes('overwater villas') ||
    lower.includes('overwater sanctuaries') ||
    (lower.includes('which') && (lower.includes('overwater') || lower.includes('water villa')))
  ) {
    return {
      intent: 'VILLA_DETAIL',
      confidence: 0.98,
      quality: 'STRONG_PHRASE',
      subType: 'OVERWATER_LIST',
    };
  }

  const isPrivacyQuery =
    lower.includes('private') ||
    lower.includes('privacy') ||
    lower.includes('secluded') ||
    lower.includes('seclusion') ||
    lower.includes('neighbors see') ||
    lower.includes('neighbor see') ||
    lower.includes('isolated');

  if (
    isPrivacyQuery &&
    (dialogueContext?.lastVillaContext || lower.includes('villa') || lower.includes('this') || lower.includes('it') || lower.includes('residence') || lower.includes('pool') || lower.includes('estate'))
  ) {
    return {
      intent: 'VILLA_DETAIL',
      confidence: 0.95,
      quality: 'STRONG_PHRASE',
      subType: 'PRIVACY',
    };
  }

  if (
    (lower.includes('does it have') || lower.includes('how big') || lower.includes('pool') || lower.includes('bedrooms') || lower.includes('size') || lower.includes('reef access') || lower.includes('reef')) &&
    (dialogueContext?.lastVillaContext || lower.includes('it') || lower.includes('villa') || lower.includes('this'))
  ) {
    return {
      intent: 'VILLA_DETAIL',
      confidence: 0.9,
      quality: 'STRONG_PHRASE',
    };
  }

  // 5f. Itinerary Modifications
  if (
    lower.includes('actually') ||
    lower.includes('instead') ||
    lower.includes('make it') ||
    lower.includes('change to') ||
    lower.includes('remove') ||
    lower.includes('no diving') ||
    lower.includes('not diving')
  ) {
    return {
      intent: 'MODIFY_ITINERARY',
      confidence: 0.92,
      quality: 'STRONG_PHRASE',
    };
  }

  // 5g. Plan Trip / Itinerary
  if (
    lower.includes('plan') ||
    lower.includes('itinerary') ||
    lower.includes('escape') ||
    (lower.includes('nights') && (lower.includes('want') || lower.includes('would like') || lower.includes('for us') || lower.includes('stay')))
  ) {
    return {
      intent: 'PLAN_TRIP',
      confidence: 0.92,
      quality: 'STRONG_PHRASE',
    };
  }

  // 5h. Villa Recommendations
  if (
    lower.includes('which villa') ||
    lower.includes('best villa') ||
    lower.includes('best room') ||
    lower.includes('recommend') ||
    lower.includes('where should we stay') ||
    lower.includes('what villa') ||
    lower.includes('find a villa') ||
    lower.includes('choose a villa') ||
    lower.includes('help me choose')
  ) {
    return {
      intent: 'VILLA_RECOMMENDATION',
      confidence: 0.92,
      quality: 'STRONG_PHRASE',
    };
  }

  // 5i. Dining
  const isDiningContext =
    dialogueContext?.sourceContext?.type === 'dining' ||
    dialogueContext?.previousAssistantMeta?.topic === 'dining' ||
    dialogueContext?.currentTopic === 'dining';
  const diningSubjectId =
    dialogueContext?.previousAssistantMeta?.topic === 'dining'
      ? dialogueContext.previousAssistantMeta.subjectId
      : (dialogueContext?.sourceContext as any)?.id;
  if (
    lower.includes('dining') ||
    lower.includes('restaurant') ||
    lower.includes('restaurants') ||
    lower.includes('food') ||
    lower.includes('eat') ||
    lower.includes('dinner') ||
    lower.includes('breakfast') ||
    lower.includes('lunch') ||
    lower.includes('menu') ||
    lower.includes('dishes') ||
    lower.includes('cuisine') ||
    lower.includes('aura') ||
    lower.includes('ember') ||
    lower.includes('tide') ||
    lower.includes('fire') ||
    lower.includes('smoke') ||
    lower.includes('josper') ||
    lower.includes('subsolar') ||
    lower.includes('cellar') ||
    lower.includes('sand pavilion') ||
    lower.includes('sandbank dinner') ||
    lower.includes('omakase') ||
    (isDiningContext && (
      lower.includes('this') ||
      lower.includes('good') ||
      lower.includes('menu') ||
      lower.includes('tonight') ||
      lower.includes('serve') ||
      lower.includes('what is on') ||
      lower.includes("what's on") ||
      lower.includes('it')
    ))
  ) {
    let subType: string | undefined = undefined;
    if (lower.includes('subsolar') || lower.includes('underwater') || lower.includes('cellar')) {
      subType = 'SUBSOLAR';
    } else if (
      lower.includes('fire') ||
      lower.includes('smoke') ||
      lower.includes('josper') ||
      lower.includes('grill') ||
      lower.includes('ember') ||
      (isDiningContext && (diningSubjectId === 'ember-grill' || diningSubjectId?.includes('ember')))
    ) {
      subType = 'FIRE_SMOKE';
    } else if (
      lower.includes('aura') ||
      lower.includes('breakfast') ||
      (isDiningContext && (diningSubjectId === 'aura-ocean' || diningSubjectId?.includes('aura')))
    ) {
      subType = 'AURA';
    } else if (
      lower.includes('tide') ||
      (isDiningContext && (diningSubjectId === 'tide-pavilion' || diningSubjectId?.includes('tide')))
    ) {
      subType = 'TIDE';
    } else if (
      lower.includes('sand pavilion') ||
      lower.includes('sandbank') ||
      (isDiningContext && (diningSubjectId === 'sandbank-dining' || diningSubjectId?.includes('sandbank')))
    ) {
      subType = 'SAND_PAVILION';
    } else if (isDiningContext) {
      subType = (diningSubjectId || 'AURA').toUpperCase();
    }
    return {
      intent: 'DINING',
      confidence: 0.94,
      quality: 'SINGLE_STRONG',
      subType,
    };
  }

  // 5j. Diving & Snorkeling
  if (lower.includes('snorkeling') || lower.includes('snorkel') || lower.includes('lagoon reef') || lower.includes('house reef')) {
    return {
      intent: 'SNORKELING',
      confidence: 0.92,
      quality: 'SINGLE_STRONG',
    };
  }
  const isExperienceContext = dialogueContext?.sourceContext?.type === 'experience';
  if (
    lower.includes('diving') ||
    lower.includes('dive') ||
    lower.includes('scuba') ||
    lower.includes('manta') ||
    lower.includes('turtle') ||
    lower.includes('shark') ||
    (isExperienceContext && (lower.includes('beginner') || lower.includes('beginners') || lower.includes('this') || lower.includes('first time')))
  ) {
    return {
      intent: 'DIVING',
      confidence: 0.94,
      quality: 'SINGLE_STRONG',
      subType: isExperienceContext ? ((dialogueContext?.sourceContext as any)?.id || 'REEF_DIVE') : lower.includes('manta') ? 'MANTA' : undefined,
    };
  }

  // 5k. Sailing
  if (lower.includes('sailing') || lower.includes('sail') || lower.includes('catamaran') || lower.includes('boat') || lower.includes('dhoni') || lower.includes('yacht')) {
    return {
      intent: 'SAILING',
      confidence: 0.92,
      quality: 'SINGLE_STRONG',
    };
  }

  // 5l. Wellness
  const isWellnessContext =
    dialogueContext?.sourceContext?.type === 'wellness' ||
    dialogueContext?.currentTopic === 'wellness' ||
    dialogueContext?.previousAssistantMeta?.topic === 'wellness';
  const wellnessSourceId =
    dialogueContext?.previousAssistantMeta?.topic === 'wellness'
      ? dialogueContext.previousAssistantMeta.subjectId
      : (dialogueContext?.sourceContext?.type === 'wellness'
      ? dialogueContext.sourceContext.id
      : undefined);
  if (
    lower.includes('wellness') ||
    lower.includes('spa') ||
    lower.includes('massage') ||
    lower.includes('sound bath') ||
    lower.includes('sound healing') ||
    lower.includes('sound meditation') ||
    lower.includes('yoga') ||
    lower.includes('ayurved') ||
    lower.includes('vitality pool') ||
    lower.includes('water pavilion') ||
    lower.includes('ocean caress') ||
    lower.includes('tibetan') ||
    lower.includes('solar reset') ||
    lower.includes('shirodhara') ||
    lower.includes('marma') ||
    (isWellnessContext && (
      lower.includes('afternoon') ||
      lower.includes('morning') ||
      lower.includes('this') ||
      lower.includes('timing') ||
      lower.includes('schedule') ||
      lower.includes('ritual') ||
      lower.includes('treatment') ||
      lower.includes('like') ||
      lower.includes('about') ||
      lower.includes('when') ||
      lower.includes('what') ||
      lower.includes('how') ||
      lower.includes('how long') ||
      lower.includes('duration') ||
      lower.includes('length') ||
      lower.includes('do it') ||
      lower.includes('do this') ||
      lower.includes('it')
    ))
  ) {
    let subType: string | undefined = undefined;
    if (wellnessSourceId && ['velora-ocean-caress', 'tibetan-sound-water', 'sunset-solar-reset', 'ayurvedic-shirodhara-marma'].includes(wellnessSourceId)) {
      subType = wellnessSourceId;
    } else if (lower.includes('ocean caress')) {
      subType = 'velora-ocean-caress';
    } else if (lower.includes('tibetan') || lower.includes('sound bath') || lower.includes('sound healing') || lower.includes('sound meditation')) {
      subType = 'tibetan-sound-water';
    } else if (lower.includes('solar reset') || lower.includes('sunset solar')) {
      subType = 'sunset-solar-reset';
    } else if (lower.includes('shirodhara') || lower.includes('marma') || lower.includes('ayurved')) {
      subType = 'ayurvedic-shirodhara-marma';
    } else if (lower.includes('water pavilion') || (isWellnessContext && lower.includes('afternoon'))) {
      subType = 'WATER_PAVILION_AFTERNOON';
    } else if (lower.includes('water pavilion') || isWellnessContext) {
      subType = wellnessSourceId || 'WATER_PAVILION';
    }
    return {
      intent: 'WELLNESS',
      confidence: 0.94,
      quality: 'SINGLE_STRONG',
      subType,
    };
  }

  // 5m. Arrival & Logistics
  if (
    lower.includes('arrival') ||
    lower.includes('seaplane') ||
    lower.includes('airport') ||
    lower.includes('transfer') ||
    lower.includes('transfers') ||
    lower.includes('how to get there') ||
    lower.includes('getting here') ||
    lower.includes('luggage') ||
    lower.includes('baggage') ||
    lower.includes('flight duration') ||
    lower.includes('male') ||
    lower.includes('maafaru')
  ) {
    let subType: string | undefined = undefined;
    if (lower.includes('luggage') || lower.includes('baggage') || lower.includes('weight')) {
      subType = 'BAGGAGE';
    } else if (lower.includes('duration') || lower.includes('how long') || lower.includes('flight time')) {
      subType = 'FLIGHT_TIME';
    }
    return {
      intent: 'ARRIVAL',
      confidence: 0.92,
      quality: 'SINGLE_STRONG',
      subType,
    };
  }

  // 5n. Availability / Request Stay
  if (
    bookingKind !== 'none' ||
    lower.includes('availability') ||
    lower.includes('available') ||
    lower.includes('dates') ||
    lower.includes('request stay') ||
    lower.includes('stay request') ||
    lower.includes('request a stay') ||
    lower.includes('inquire stay') ||
    lower.includes('inquire about staying')
  ) {
    return {
      intent: 'AVAILABILITY',
      confidence: 0.95,
      quality: 'SINGLE_STRONG',
      subType: bookingKind !== 'none' ? bookingKind : undefined,
    };
  }

  // 5o. About Velora
  if (lower.includes('velora') || lower.includes('island') || lower.includes('resort')) {
    return {
      intent: 'ABOUT_VELORA' as any,
      confidence: 0.75,
      quality: 'WEAK',
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.3,
    quality: 'WEAK',
  };
}
