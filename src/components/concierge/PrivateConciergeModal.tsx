import { useState, useEffect, useRef } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import {
  TripState,
  ConciergeAIResponse,
  SuggestedAction,
  ConciergeSourceContext,
} from '../../data/resortContext';
import { oceanAudio } from '../../utils/audio';
import {
  processConciergeInput,
  ConciergeSessionContext,
} from '../../concierge/engine/conciergeEngine';
import {
  X,
  ArrowRight,
  RotateCcw,
  Compass,
  Calendar,
  Users,
} from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ResponsiveImage } from '../ui/ResponsiveImage';

export interface ConciergeHandoffData {
  villaId?: string;
  nights: number;
  guests: number;
  notes?: string;
}

interface PrivateConciergeModalProps {
  isOpen: boolean;
  initialPrompt?: string;
  initialVillaId?: string;
  sourceContext?: ConciergeSourceContext;
  launchTriggerId?: number;
  isResume?: boolean;
  onClose: () => void;
  onReserveHandoff: (data: ConciergeHandoffData) => void;
  onOpen360Scene: (sceneId: string) => void;
  onSelectVillaInExplorer?: (villaId: string) => void;
  onTripStateChange?: (state: TripState) => void;
  onCompareVillas?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  type?: ConciergeAIResponse['type'];
  recommendedVillaId?: string;
  reasons?: string[];
  suggestedActions?: SuggestedAction[];
  bookingAction?: {
    villaId?: string;
    nights?: number;
    guests?: number;
    checkInNote?: string;
  };
  metaType?: string;
}

export function PrivateConciergeModal({
  isOpen,
  initialPrompt,
  initialVillaId,
  sourceContext,
  launchTriggerId,
  isResume,
  onClose,
  onReserveHandoff,
  onOpen360Scene,
  onSelectVillaInExplorer,
  onTripStateChange,
  onCompareVillas,
  onNavigateSection,
}: PrivateConciergeModalProps) {
  // Session messages & context memory
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingCopy, setThinkingCopy] = useState('Thinking');
  const [mobileTab, setMobileTab] = useState<'chat' | 'plan'>('chat');
  const lastHandledPromptRef = useRef<string | null>(null);
  const lastHandledTriggerIdRef = useRef<number | null>(null);
  const isSessionResetRef = useRef(false);
  const onTripStateChangeRef = useRef(onTripStateChange);
  useEffect(() => {
    onTripStateChangeRef.current = onTripStateChange;
  });

  // Living Trip Canvas State
  const [tripState, setTripState] = useState<TripState>({
    nights: 5,
    guests: 2,
    selectedVillaId: initialVillaId || (sourceContext?.type === 'villa' ? sourceContext.id : undefined),
  });

  const [itineraryDays, setItineraryDays] = useState<
    Array<{ day: string; time: string; title: string; description: string }>
  >([]);

  const [diningHighlight, setDiningHighlight] = useState<string | null>(null);
  const [wellnessHighlight, setWellnessHighlight] = useState<string | null>(null);

  const conversationScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalContainerRef, isOpen);
  const sessionContextRef = useRef<ConciergeSessionContext>({
    turnCount: 0,
    lastVillaContext: initialVillaId || (sourceContext?.type === 'villa' ? sourceContext.id : undefined),
    sourceContext: sourceContext || { type: 'global' },
    activeTripState: {
      nights: 5,
      guests: 2,
      selectedVillaId: initialVillaId || (sourceContext?.type === 'villa' ? sourceContext.id : undefined),
    },
    recentTurns: [],
    pendingQuestion: null,
    lastAssistantMeta: undefined,
    recentMessages: [],
  });

  // Natural starter prompts
  const suggestedQuestions = [
    'Which villa is best for sunset?',
    'Plan five nights for us.',
    'What can we do on the reef?',
    'Where should we have dinner?',
  ];

  // Dynamic thinking label based on query
  const determineThinkingCopy = (text: string) => {
    const q = text.toLowerCase();
    if (
      q.includes('villa') ||
      q.includes('sunset') ||
      q.includes('ocean') ||
      q.includes('lagoon') ||
      q.includes('compare') ||
      q.includes('cheaper') ||
      q.includes('bigger')
    ) {
      return 'Comparing villas';
    }
    if (
      q.includes('modify') ||
      q.includes('change') ||
      q.includes('remove') ||
      q.includes('instead') ||
      q.includes('six') ||
      q.includes('three')
    ) {
      return 'Updating your stay';
    }
    if (
      q.includes('plan') ||
      q.includes('stay') ||
      q.includes('itinerary') ||
      q.includes('nights')
    ) {
      return 'Planning your stay';
    }
    return 'Thinking';
  };

  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Sound ducking, body scroll lock & Escape key dismissal
  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;
      oceanAudio.setConciergeFocus(true);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Desktop auto-focus
      if (window.innerWidth >= 1024) {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }

      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        if (
          lastActiveElementRef.current &&
          document.body.contains(lastActiveElementRef.current) &&
          typeof lastActiveElementRef.current.focus === 'function'
        ) {
          lastActiveElementRef.current.focus();
        }
      };
    } else {
      oceanAudio.setConciergeFocus(false);
    }
  }, [isOpen, onClose]);

  // Launch vs Resume distinction:
  // On RESUME:
  // DO NOT rerun:
  // - selectedVilla initialization
  // - sourceContext initialization
  // - initial prompt
  // - NEW ESCAPE reset
  // - conversation initialization
  // - itinerary initialization
  // Simply reveal the existing session again.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const isResumeSession = Boolean(
      isResume ||
      (launchTriggerId !== undefined && lastHandledTriggerIdRef.current === launchTriggerId)
    );

    if (isResumeSession) {
      // RESUME EXISTING SESSION: reveal existing session without re-initialization
      return;
    }

    // A. FRESH LAUNCH
    if (launchTriggerId !== undefined) {
      lastHandledTriggerIdRef.current = launchTriggerId;
    }
    isSessionResetRef.current = false;

    // 1. Source Context & Initial Villa initialization
    sessionContextRef.current.sourceContext = sourceContext || { type: 'global' };

    const launchVillaId =
      sourceContext?.type === 'villa'
        ? sourceContext.id
        : initialVillaId;

    if (launchVillaId) {
      setTripState((prev) => {
        const next = {
          ...prev,
          selectedVillaId: launchVillaId,
        };
        onTripStateChangeRef.current?.(next);
        return next;
      });
      sessionContextRef.current.lastVillaContext = launchVillaId;
      sessionContextRef.current.activeTripState.selectedVillaId = launchVillaId;
    }

    // 2. Initial prompt trigger for fresh launch
    if (initialPrompt) {
      lastHandledPromptRef.current = initialPrompt;
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, isResume, launchTriggerId, sourceContext, initialVillaId, initialPrompt]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (conversationScrollRef.current) {
      conversationScrollRef.current.scrollTo({
        top: conversationScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  // Message Handler: Processed 100% locally through sophisticated conversational engine
  const handleSendMessage = (rawInput?: string) => {
    const textToSend = rawInput !== undefined ? rawInput : inputText;
    if (!textToSend || !textToSend.trim() || isThinking) return;

    // Ensure sessionContext has latest sourceContext unless explicitly reset
    if (!isSessionResetRef.current && sourceContext) {
      sessionContextRef.current.sourceContext = sourceContext;
    }

    const trimmed = textToSend.trim();
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setThinkingCopy(determineThinkingCopy(trimmed));
    setIsThinking(true);

    // Preserve cursor focus immediately on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }

    // Call Local Engine
    const { response: composed, updatedContext } = processConciergeInput(
      trimmed,
      sessionContextRef.current
    );
    sessionContextRef.current = updatedContext;

    // Apply perceptual delay for luxury elegance
    setTimeout(() => {
      // Update living trip state
      if (composed.tripState) {
        setTripState(composed.tripState);
        onTripStateChange?.(composed.tripState);
      }

      if (composed.itineraryDays && composed.itineraryDays.length > 0) {
        setItineraryDays(composed.itineraryDays);
      }

      if (composed.diningHighlight) {
        setDiningHighlight(composed.diningHighlight);
      }

      if (composed.wellnessHighlight) {
        setWellnessHighlight(composed.wellnessHighlight);
      }

      const modelMessage: ChatMessage = {
        id: `velora-${Date.now()}`,
        role: 'model',
        text: composed.message,
        type: composed.type,
        recommendedVillaId: composed.recommendedVillaId,
        reasons: composed.reasons,
        suggestedActions: composed.suggestedActions,
        bookingAction: composed.bookingAction,
        metaType: composed.responseMeta?.type,
      };

      setMessages((prev) => [...prev, modelMessage]);
      setIsThinking(false);

      // Explicitly restore focus to message box on desktop without stealing mobile focus
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }, composed.perceptualDelayMs || 450);
  };

  const handleResetSession = () => {
    isSessionResetRef.current = true;
    lastHandledPromptRef.current = null;
    lastHandledTriggerIdRef.current = launchTriggerId ?? null;
    setMessages([]);
    setItineraryDays([]);
    setDiningHighlight(null);
    setWellnessHighlight(null);
    setInputText('');
    const cleanTripState: TripState = {
      nights: 5,
      guests: 2,
      selectedVillaId: undefined,
      dates: undefined,
      notes: undefined,
    };
    setTripState(cleanTripState);
    onTripStateChangeRef.current?.(cleanTripState);
    sessionContextRef.current = {
      turnCount: 0,
      lastVillaContext: undefined,
      sourceContext: { type: 'global' },
      activeTripState: cleanTripState,
      recentTurns: [],
      pendingQuestion: null,
      lastAssistantMeta: undefined,
      recentMessages: [],
    };
  };

  const handleActionClick = (action: SuggestedAction) => {
    if (!action) return;

    switch (action.type) {
      case 'view_villa':
        onClose();
        if (action.villaId && onSelectVillaInExplorer) {
          onSelectVillaInExplorer(action.villaId);
        } else if (onSelectVillaInExplorer && tripState.selectedVillaId) {
          onSelectVillaInExplorer(tripState.selectedVillaId);
        } else if (onNavigateSection) {
          onNavigateSection('stay');
        }
        break;

      case 'open_360': {
        const targetVilla = action.villaId || tripState.selectedVillaId;
        if (action.villaId) {
          sessionContextRef.current.lastVillaContext = action.villaId;
        }
        const targetSceneId =
          action.sceneId ||
          (action.villaId ? veloraResort.villas.find((v) => v.id === action.villaId)?.panoramaSceneId : undefined) ||
          (targetVilla ? veloraResort.villas.find((v) => v.id === targetVilla)?.panoramaSceneId : undefined) ||
          currentVilla?.panoramaSceneId ||
          'sunset-exterior';
        onOpen360Scene(targetSceneId);
        break;
      }

      case 'request_stay': {
        const targetVilla = action.villaId || tripState.selectedVillaId;
        if (targetVilla && targetVilla !== tripState.selectedVillaId) {
          setTripState((prev) => {
            const next = { ...prev, selectedVillaId: targetVilla };
            onTripStateChangeRef.current?.(next);
            return next;
          });
          sessionContextRef.current.lastVillaContext = targetVilla;
          sessionContextRef.current.activeTripState.selectedVillaId = targetVilla;
        }
        onReserveHandoff({
          villaId: targetVilla,
          nights: action.nights || tripState.nights || 5,
          guests: action.guests || tripState.guests || 2,
          notes: action.notes || tripState.notes,
        });
        break;
      }

      case 'compare_villas':
        onClose();
        if (onCompareVillas) {
          onCompareVillas();
        }
        break;

      case 'navigate_section':
        onClose();
        if (action.sectionId && onNavigateSection) {
          onNavigateSection(action.sectionId);
        }
        break;

      case 'prompt':
      default:
        if (action.prompt) {
          handleSendMessage(action.prompt);
        }
        break;
    }
  };

  const handleReserveNow = () => {
    onReserveHandoff({
      villaId: tripState.selectedVillaId,
      nights: tripState.nights || 5,
      guests: tripState.guests || 2,
      notes: tripState.notes,
    });
  };

  const currentVilla = tripState.selectedVillaId
    ? veloraResort.villas.find((v) => v.id === tripState.selectedVillaId) || null
    : null;

  const hasItinerary = itineraryDays.length > 0;

  if (!isOpen) return null;

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Velora Private Concierge"
      className="fixed inset-0 z-[150] overflow-hidden"
    >
      <style>{`
        @keyframes veloraDotFade {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes messageFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .velora-drawer-in { animation: drawerSlideIn 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .velora-backdrop-in { animation: backdropFadeIn 280ms ease-out forwards; }
        .velora-msg-in { animation: messageFadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .velora-dot-1 { animation: veloraDotFade 1.2s ease-in-out infinite; }
        .velora-dot-2 { animation: veloraDotFade 1.2s ease-in-out infinite 0.2s; }
        .velora-dot-3 { animation: veloraDotFade 1.2s ease-in-out infinite 0.4s; }
      `}</style>

      {/* Dismissable Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="velora-backdrop-in fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
      />

      {/* RIGHT-SIDE ATELIER DRAWER (Desktop: slide-over panel; Mobile: full-screen 100dvh) */}
      <aside
        className={`velora-drawer-in fixed top-0 right-0 bottom-0 z-10 h-[100dvh] max-h-[100dvh] bg-[#04080f] border-l border-white/10 shadow-[-24px_0_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden transition-[width] duration-500 ease-out ${
          hasItinerary
            ? 'w-full sm:w-[620px] md:w-[740px] lg:w-[880px] xl:w-[960px]'
            : 'w-full sm:w-[540px] md:w-[600px] lg:w-[660px]'
        }`}
      >
        {/* Subtle Ambient Background Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${RESORT_MEDIA.textures.ambientLagoon})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#04080f] via-[#04080f]/90 to-[#04080f]" />
        </div>

        {/* Studio Header Bar */}
        <header className="relative z-20 flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/[0.08] bg-[#06101c]/80 backdrop-blur-md shrink-0 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.28em] font-sans font-medium text-white flex items-center gap-1.5">
              <span>VELORA</span>
              <span className="text-[#dfcaa3]">✦</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-sans hidden sm:inline-block">
              Private Concierge
            </span>
          </div>

          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <button
                onClick={handleResetSession}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-sans text-white/60 hover:text-[#dfcaa3] transition-colors"
                title="Start a fresh conversation"
                aria-label="Start a fresh conversation (New Escape)"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">NEW ESCAPE</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors"
              aria-label="Close concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile View Switcher (Only visible when structured itinerary exists on mobile) */}
        {hasItinerary && (
          <div role="tablist" aria-label="Concierge views" className="lg:hidden flex border-b border-white/10 bg-[#06101c]/90 text-xs shrink-0 z-20">
            <button
              role="tab"
              aria-selected={mobileTab === 'chat'}
              onClick={() => setMobileTab('chat')}
              className={`flex-1 py-3 text-center uppercase tracking-[0.2em] font-sans font-medium transition-colors ${
                mobileTab === 'chat'
                  ? 'text-[#dfcaa3] border-b-2 border-[#dfcaa3]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              CONVERSATION
            </button>
            <button
              role="tab"
              aria-selected={mobileTab === 'plan'}
              onClick={() => setMobileTab('plan')}
              className={`flex-1 py-3 text-center uppercase tracking-[0.2em] font-sans font-medium transition-colors ${
                mobileTab === 'plan'
                  ? 'text-[#dfcaa3] border-b-2 border-[#dfcaa3]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              YOUR STAY ({itineraryDays.length} DAYS)
            </button>
          </div>
        )}

        {/* Primary Content Region */}
        <div className="relative z-10 flex-1 flex overflow-hidden min-h-0">
          {/* ZONE 1: Conversation Region */}
          <div
            className={`flex flex-col h-full min-h-0 border-r border-white/10 bg-[#04080f]/95 transition-[width,opacity] duration-500 ease-out ${
              hasItinerary
                ? 'w-full lg:w-[44%]'
                : 'w-full lg:w-[62%]'
            } ${mobileTab === 'plan' ? 'hidden lg:flex' : 'flex'}`}
          >
            {/* Scrollable Message Feed Container */}
            <div
              ref={conversationScrollRef}
              className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6 scrollbar-none min-h-0"
              aria-live="polite"
            >
              {/* Initial State lives directly inside the message area */}
              {messages.length === 0 ? (
                <div className="py-6 sm:py-10 space-y-8 max-w-[540px]">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-[#dfcaa3] font-sans font-medium">
                         VELORA ✦
                      </span>
                    </div>
                    <h2 className="font-editorial text-3xl sm:text-4xl text-white font-light leading-snug">
                      How can I help you experience the island?
                    </h2>
                  </div>

                  {/* Initial Prompts */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block mb-2">
                      SUGGESTIONS
                    </span>
                    <div className="divide-y divide-white/10 border-y border-white/10">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          aria-label={`Ask: ${q}`}
                          className="w-full py-3.5 flex items-center justify-between group text-left transition-colors"
                        >
                          <span className="text-xs sm:text-sm font-sans text-white/80 group-hover:text-[#dfcaa3] transition-colors transform group-hover:translate-x-1 duration-200">
                            {q}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#dfcaa3] transform group-hover:translate-x-1 transition-colors duration-200 shrink-0 ml-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Message Stream */
                <div className="space-y-6">
                  {messages.map((m) => {
                    const isUser = m.role === 'user';
                    return (
                      <div key={m.id} className="velora-msg-in space-y-1.5 max-w-[560px]">
                        <span className="text-[9px] uppercase tracking-[0.24em] font-sans text-white/40 block">
                          {isUser ? 'YOU' : 'VELORA ✦'}
                        </span>

                        <div
                          className={`text-sm sm:text-[14.5px] leading-relaxed font-light ${
                            isUser
                              ? 'text-[#f0e2c8] font-sans pl-3 border-l border-[#dfcaa3]/50'
                              : 'text-white/90 font-sans'
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>

                          {/* Villa Recommendation presentation */}
                          {m.type === 'villa_recommendation' && (() => {
                            const recVilla = (m.bookingAction?.villaId && veloraResort.villas.find(v => v.id === m.bookingAction?.villaId)) || currentVilla;
                            if (!recVilla) return null;
                            return (
                              <div className="mt-4 space-y-3">
                                <div className="aspect-[16/9] overflow-hidden rounded-lg relative border border-white/10">
                                  <ResponsiveImage
                                    src={recVilla.featuredImage}
                                    alt={recVilla.name}
                                    loading="lazy"
                                    sizes="(max-width: 640px) 100vw, 420px"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans block">
                                    RECOMMENDED VILLA
                                  </span>
                                  <h4 className="font-editorial text-xl text-white mt-0.5">
                                    {recVilla.name}
                                  </h4>
                                  <p className="text-xs text-white/70 mt-1 font-light leading-relaxed">
                                    {recVilla.tagline}
                                  </p>
                                </div>

                                {m.reasons && m.reasons.length > 0 && (
                                  <ul className="space-y-1 text-xs text-white/75 pt-1">
                                    {m.reasons.map((r, rIdx) => (
                                      <li key={rIdx} className="flex items-start gap-2">
                                        <span className="text-[#dfcaa3] mt-0.5">✦</span>
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <div className="flex items-center gap-4 pt-2">
                                  {onSelectVillaInExplorer && (
                                    <button
                                      onClick={() => {
                                        onSelectVillaInExplorer(recVilla.id);
                                        onClose();
                                      }}
                                      className="text-[10px] uppercase tracking-[0.22em] font-sans text-[#dfcaa3] hover:text-[#f0e2c8] transition-colors"
                                    >
                                      VIEW VILLA →
                                    </button>
                                  )}
                                  {recVilla.panoramaSceneId && (
                                    <button
                                      onClick={() => {
                                        onOpen360Scene(recVilla.panoramaSceneId!);
                                      }}
                                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-sans text-white/70 hover:text-white transition-colors"
                                    >
                                      <Compass className="w-3 h-3 text-[#dfcaa3]" />
                                      <span>360° TOUR</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Direct Stay Request Action */}
                          {m.type === 'booking_handoff' && (
                            <div className="mt-4 pt-1">
                              <button
                                onClick={() => {
                                  onReserveHandoff({
                                    villaId: m.bookingAction?.villaId || tripState.selectedVillaId,
                                    nights: m.bookingAction?.nights || tripState.nights || 5,
                                    guests: m.bookingAction?.guests || tripState.guests || 2,
                                    notes: m.bookingAction?.checkInNote || tripState.notes,
                                  });
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-[background-color,color,transform,box-shadow] duration-200 shadow-[0_0_16px_rgba(223,202,163,0.25)] hover:scale-105 active:scale-95"
                              >
                                <span>{m.bookingAction?.villaId || tripState.selectedVillaId ? 'REQUEST THIS VILLA' : 'REQUEST YOUR STAY'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Direct 360 Tour Launcher */}
                          {m.metaType === 'spatial_360' && currentVilla?.panoramaSceneId && (
                            <div className="mt-4 pt-1">
                              <button
                                onClick={() => {
                                  onOpen360Scene(currentVilla.panoramaSceneId!);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#dfcaa3]/50 bg-[#dfcaa3]/10 hover:bg-[#dfcaa3]/20 text-[#dfcaa3] text-xs font-sans uppercase tracking-[0.18em] transition-colors"
                              >
                                <Compass className="w-3.5 h-3.5" />
                                <span>LAUNCH 360° TOUR</span>
                              </button>
                            </div>
                          )}

                          {/* Contextual Actions (Only present when semantic and helpful) */}
                          {m.suggestedActions && m.suggestedActions.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-3">
                              {m.suggestedActions.map((action, aIdx) => (
                                <button
                                  key={aIdx}
                                  onClick={() => handleActionClick(action)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 hover:border-[#dfcaa3] bg-white/[0.03] hover:bg-[#dfcaa3]/10 text-white/80 hover:text-[#dfcaa3] text-[9.5px] uppercase tracking-[0.2em] font-sans transition-colors duration-200"
                                >
                                  <span>{action.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Thinking Indicator */}
                  {isThinking && (
                    <div className="velora-msg-in space-y-1.5">
                      <span className="text-[9px] uppercase tracking-[0.24em] font-sans text-[#dfcaa3] block">
                        VELORA ✦
                      </span>
                      <div className="flex items-center gap-2.5 text-xs text-white/50 font-sans font-light py-1">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3] velora-dot-1" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3] velora-dot-2" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3] velora-dot-3" />
                        </div>
                        <span className="text-[11px] font-sans tracking-wide text-white/60">
                          {thinkingCopy}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Bar (Anchored above safe area bottom) */}
            <div className="p-4 md:p-6 border-t border-white/[0.08] bg-[#06101c]/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  ref={inputRef}
                  id="concierge-chat-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about villas, dining, the reef, or your stay…"
                  aria-label="Ask about villas, dining, the reef, or your stay"
                  className="w-full bg-[#04080f] border border-white/15 focus:border-[#dfcaa3] text-white text-xs sm:text-sm rounded-full pl-5 pr-12 py-3.5 focus:outline-none transition-colors placeholder:text-white/35 font-light"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="absolute right-1.5 p-2 rounded-full bg-[#dfcaa3] text-[#04080f] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f0e2c8] transition-colors"
                  aria-label="Send message"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* ZONE 2: Living Trip Canvas (Revealed when itinerary is built) */}
          {hasItinerary ? (
            <div
              className={`flex-1 flex flex-col h-full min-h-0 bg-[#06101c] p-6 md:p-8 space-y-6 overflow-y-auto scrollbar-none pb-[calc(2rem+env(safe-area-inset-bottom))] ${
                mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block">
                  YOUR ISLAND ITINERARY
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-white font-light">
                  {tripState.nights || 5} Nights in Noonu Atoll
                </h3>
              </div>

              {/* Villa & Summary Snapshot */}
              <div className="p-4 border border-white/10 bg-white/[0.02] rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#dfcaa3] font-sans block">
                    SANCTUARY
                  </span>
                  <p className="font-editorial text-lg text-white">
                    {currentVilla ? currentVilla.name : 'Sanctuary to be selected'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>{tripState.nights || 5} Nights</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>{tripState.guests || 2} Guests</span>
                  </span>
                </div>
              </div>

              {/* Day-by-Day Flow */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block">
                  CHOREOGRAPHY
                </span>
                <div className="space-y-2.5">
                  {itineraryDays.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.04] transition-colors flex items-start gap-4 group"
                    >
                      <div className="shrink-0 w-16 pt-0.5">
                        <span className="text-[10px] font-mono text-[#dfcaa3] uppercase tracking-wider block">
                          {item.day}
                        </span>
                        <span className="text-[11px] font-mono text-white/40 block mt-0.5">
                          {item.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-editorial text-base sm:text-lg text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                          {item.title}
                        </h5>
                        <p className="font-sans text-xs text-white/65 font-light mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 border border-white/10 bg-white/[0.02] rounded-xl">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#dfcaa3] font-sans block mb-1">
                    GASTRONOMY HIGHLIGHT
                  </span>
                  <p className="font-editorial text-sm text-white">
                    {diningHighlight || 'Lantern-Lit Sandbank Omakase'}
                  </p>
                </div>

                <div className="p-3.5 border border-white/10 bg-white/[0.02] rounded-xl">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#dfcaa3] font-sans block mb-1">
                    WELLNESS HIGHLIGHT
                  </span>
                  <p className="font-editorial text-sm text-white">
                    {wellnessHighlight || 'Tibetan Sound & Water Meditation'}
                  </p>
                </div>
              </div>

              {/* Reserve Handoff Action */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/60 font-light hidden sm:inline">
                  Ready to request your stay?
                </span>
                <button
                  onClick={handleReserveNow}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-[background-color,color,transform,box-shadow] duration-200 shadow-[0_0_20px_rgba(223,202,163,0.25)] hover:scale-105"
                >
                  <span>{tripState.selectedVillaId ? 'REQUEST THIS VILLA' : 'REQUEST YOUR STAY'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Atmospheric Visual Panel (Before Itinerary Exists) */
            <div className="hidden lg:flex lg:w-[38%] flex-col h-full min-h-0 relative overflow-hidden justify-between p-8 bg-[#03060d]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{
                  backgroundImage: `url(${currentVilla?.featuredImage || RESORT_MEDIA.textures.underwaterLight})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-[#04080f]/80 to-[#04080f]/40" />

              <div className="relative z-10 space-y-1">
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#dfcaa3] font-sans block">
                  NOONU ATOLL · MALDIVES
                </span>
                <span className="text-[10px] font-mono text-white/40 tracking-wider">
                  NORTHERN ATOLLS · MALDIVES
                </span>
              </div>

              {/* Active Sanctuary Live Summary */}
              <div className="relative z-10 space-y-4">
                {currentVilla ? (
                  <div className="p-4 rounded-xl border border-white/10 bg-black/50 backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans">
                        ACTIVE SANCTUARY
                      </span>
                      <span className="text-xs font-mono text-white/70">
                        ${currentVilla.pricePerNight.toLocaleString()}/night
                      </span>
                    </div>
                    <div>
                      <h4 className="font-editorial text-xl text-white">
                        {currentVilla.name}
                      </h4>
                      <p className="text-[11px] text-white/60 font-light mt-0.5">
                        {tripState.nights || 5} Nights · {tripState.guests || 2} Guests
                      </p>
                    </div>
                    <button
                      onClick={handleReserveNow}
                      className="w-full py-2.5 rounded-lg bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-[10px] uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(223,202,163,0.2)]"
                    >
                      <span>REQUEST THIS VILLA</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-white/10 bg-black/50 backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans">
                        SANCTUARIES
                      </span>
                      <span className="text-xs font-mono text-white/70">
                        4 Typologies
                      </span>
                    </div>
                    <div>
                      <h4 className="font-editorial text-xl text-white">
                        24 Solitary Residences
                      </h4>
                      <p className="text-[11px] text-white/60 font-light mt-0.5">
                        {tripState.nights || 5} Nights · {tripState.guests || 2} Guests
                      </p>
                    </div>
                    <button
                      onClick={handleReserveNow}
                      className="w-full py-2.5 rounded-lg bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-[10px] uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(223,202,163,0.2)]"
                    >
                      <span>REQUEST YOUR STAY</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="font-editorial text-lg text-white/90 font-light leading-snug">
                    24 solitary sanctuaries suspended over living coral.
                  </p>
                  <p className="font-sans text-[11px] text-white/50 font-light">
                    Your days unhurried, your rhythm undisturbed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
