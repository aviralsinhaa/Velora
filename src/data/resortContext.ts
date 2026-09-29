import { veloraResort } from './resortConfig';

export interface TripState {
  dates?: string;
  month?: string;
  nights?: number;
  guests?: number;
  occasion?: string;
  villaPreference?: string;
  selectedVillaId?: string;
  villaPreferences?: string[];
  interests?: string[];
  diningPreferences?: string[];
  activityPreferences?: string[];
  wellnessPreferences?: string[];
  notes?: string;
}

export type ConciergeSourceContext =
  | { type: 'global' }
  | { type: 'villa'; id: string }
  | { type: 'dining'; id: string }
  | { type: 'experience'; id: string }
  | { type: 'wellness'; id: string }
  | { type: 'gettingHere' }
  | { type: 'practicalInfo' };

export type ConciergeResponseType =
  | 'conversation'
  | 'greeting'
  | 'answer'
  | 'clarification'
  | 'villa_recommendation'
  | 'experience_recommendation'
  | 'itinerary'
  | 'itinerary_update'
  | 'booking_handoff';

export type SuggestedActionType =
  | 'prompt'
  | 'view_villa'
  | 'open_360'
  | 'request_stay'
  | 'compare_villas'
  | 'navigate_section';

export interface BaseSuggestedAction {
  label: string;
}

export interface PromptAction extends BaseSuggestedAction {
  type?: 'prompt';
  prompt: string;
}

export interface ViewVillaAction extends BaseSuggestedAction {
  type: 'view_villa';
  villaId: string;
  prompt?: string;
}

export interface Open360Action extends BaseSuggestedAction {
  type: 'open_360';
  sceneId: string;
  villaId?: string;
  prompt?: string;
}

export interface RequestStayAction extends BaseSuggestedAction {
  type: 'request_stay';
  villaId?: string;
  nights?: number;
  guests?: number;
  notes?: string;
  prompt?: string;
}

export interface CompareVillasAction extends BaseSuggestedAction {
  type: 'compare_villas';
  prompt?: string;
}

export interface NavigateSectionAction extends BaseSuggestedAction {
  type: 'navigate_section';
  sectionId: string;
  prompt?: string;
}

export type SuggestedAction =
  | PromptAction
  | ViewVillaAction
  | Open360Action
  | RequestStayAction
  | CompareVillasAction
  | NavigateSectionAction;

export interface ConciergeAIResponse {
  type: ConciergeResponseType;
  message: string;
  tripState?: TripState;
  recommendedVillaId?: 'sunset-pool-villa' | 'ocean-lagoon-villa' | 'beach-reserve-residence' | 'velora-private-estate';
  reasons?: string[];
  itineraryDays?: { day: string; time: string; title: string; description: string }[];
  diningHighlight?: string;
  wellnessHighlight?: string;
  suggestedActions?: SuggestedAction[];
  bookingAction?: {
    villaId?: string;
    nights?: number;
    guests?: number;
    checkInNote?: string;
  };
}

export function buildResortSystemContext(): string {
  const villaSummaries = veloraResort.villas.map((v) => 
    `- ID: "${v.id}" | Name: ${v.name} (${v.subtitle}) | Rate: $${v.pricePerNight.toLocaleString()}/night | Size: ${v.size} | Capacity: ${v.guests} | Orientation: ${v.orientation} | Best For: ${v.highlights.join(', ')} | Description: ${v.description}`
  ).join('\n');

  const diningSummaries = veloraResort.dining.map((d) => 
    `- ${d.name} (${d.cuisine}): ${d.setting}, ${d.hours}. Signature: ${d.signatureDish}. Description: ${d.description}`
  ).join('\n');

  const expSummaries = veloraResort.experiences.map((e) => 
    `- ${e.title} (${e.category}): Duration ${e.duration}, ${e.privacy}. ${e.description}`
  ).join('\n');

  const wellnessSummaries = veloraResort.wellness.rituals.map((w) => 
    `- ${w.title} (${w.duration}, Focus: ${w.focus}): ${w.description}`
  ).join('\n');

  return `You are Velora's private island concierge at ${veloraResort.brandName} Private Island, ${veloraResort.location}, ${veloraResort.country}.

CONVERSATION PRINCIPLES:
1. Respond naturally, warmly, and calmly to whatever the guest says.
2. If they are casually chatting (e.g., "hi", "how are you", "just browsing", "looks beautiful"), chat naturally and briefly. Do not push for dates, guests, or bookings.
3. If they ask about Velora, answer directly from verified resort facts.
4. If they ask for recommendations (villas, dining, diving), recommend thoughtfully and explain why simply.
5. If they want to plan a stay or build an itinerary, help them plan and gather only the necessary details without being pushy.
6. If asked about your identity, answer honestly: "I am Velora's private digital concierge, a local purpose-built experience designed to help you explore the island and plan your stay." Never pretend to be human staff or a general-purpose assistant.
7. Preserve conversation context: if the guest refers to "it" or a previously mentioned villa or detail, understand what they mean.
8. Keep ordinary conversational responses concise (1-3 natural sentences).

VERIFIED RESORT FACTS:
- 24 private villas (16 overwater, 8 beachfront) across a broad turquoise coral lagoon in Noonu Atoll, Maldives.
- Arrival: Approximately 45-minute scenic seaplane journey from Velana International Airport (MLE), or boat-based transfer from Maafaru (NMF).

VILLAS:
${villaSummaries}

DINING:
${diningSummaries}

EXPERIENCES & EXPEDITIONS:
${expSummaries}

WELLNESS & SPA:
${wellnessSummaries}

RESPONSE SCHEMA RULES:
- Use type="conversation" for casual conversation, greetings, social remarks, or general questions.
- Use type="answer" for factual inquiries about the resort.
- Use type="villa_recommendation" when recommending a specific villa.
- Use type="experience_recommendation" when recommending an experience or dining.
- Use type="itinerary" when creating a stay plan.
- Use type="booking_handoff" when the user requests to book or check specific dates.
- CRITICAL for suggestedActions: Only include suggestedActions when they are genuinely useful in context (e.g. after recommending a villa: "View Villa", "360° Tour"). For casual conversation (e.g. "how are you", "just looking around", "hi"), suggestedActions MUST BE EMPTY []! Never append "CHOOSE A VILLA" or "PLAN A STAY" to casual chat.
`;
}
