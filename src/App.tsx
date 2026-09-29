import { useState, lazy, Suspense, useCallback } from 'react';
import { CustomCursor } from './components/ui/CustomCursor';
import { Navbar } from './components/navigation/Navbar';
import { MegaMenu } from './components/navigation/MegaMenu';
import { ArrivalChapter } from './components/arrival/ArrivalChapter';
import { IslandChapter } from './components/island/IslandChapter';
import { StayChapter } from './components/villas/StayChapter';
import { IslandLifeChapter } from './components/island/IslandLifeChapter';
import { DayAtVeloraChapter } from './components/day/DayAtVeloraChapter';
import { DiscoverChapter } from './components/discover/DiscoverChapter';
import { GettingHereChapter } from './components/logistics/GettingHereChapter';
import { PlanEscapeSection } from './components/plan/PlanEscapeSection';
import { Footer } from './components/footer/Footer';
import { PrivateConciergeModal, ConciergeHandoffData } from './components/concierge/PrivateConciergeModal';
import { BookingModal } from './components/booking/BookingModal';
import { VillaDetailView } from './components/villas/VillaDetailView';
import { CompareVillasView } from './components/villas/CompareVillasView';
import { DiningDestinationView } from './components/dining/DiningDestinationView';
import { WellnessDestinationView } from './components/wellness/WellnessDestinationView';
import { ExperiencesDestinationView } from './components/experiences/ExperiencesDestinationView';
import { GettingHereDestinationView } from './components/logistics/GettingHereDestinationView';
import { PracticalInfoView } from './components/faq/PracticalInfoView';
import { veloraResort } from './data/resortConfig';
import { ConciergeSourceContext, TripState } from './data/resortContext';
import { Sparkles } from 'lucide-react';

// Lazy load heavy Three.js 360 Viewer so it doesn't inflate initial critical bundle
const Resort360Viewer = lazy(() =>
  import('./components/immersive/Resort360Viewer').then((m) => ({ default: m.Resort360Viewer }))
);

export default function App() {
  // Modal & interactive states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingVillaId, setBookingVillaId] = useState<string | undefined>(undefined);
  const [bookingNights, setBookingNights] = useState<number>(5);
  const [bookingGuests, setBookingGuests] = useState<number>(2);
  const [bookingNotes, setBookingNotes] = useState<string | undefined>(undefined);

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [conciergePrompt, setConciergePrompt] = useState<string | undefined>(undefined);
  const [conciergeVillaId, setConciergeVillaId] = useState<string | undefined>(undefined);
  const [conciergeSourceContext, setConciergeSourceContext] = useState<ConciergeSourceContext>({ type: 'global' });

  const [is360Open, setIs360Open] = useState(false);
  const [panoramaSceneId, setPanoramaSceneId] = useState<string | undefined>(undefined);

  // Architectural & Destination Deep Overlays
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [detailVillaId, setDetailVillaId] = useState<string | null>(null);
  const [isCompareVillasOpen, setIsCompareVillasOpen] = useState(false);
  const [isDiningOpen, setIsDiningOpen] = useState(false);
  const [isWellnessOpen, setIsWellnessOpen] = useState(false);
  const [isExperiencesOpen, setIsExperiencesOpen] = useState(false);
  const [isGettingHereOpen, setIsGettingHereOpen] = useState(false);
  const [isPracticalInfoOpen, setIsPracticalInfoOpen] = useState(false);

  type OverlayType =
    | { type: 'dining' }
    | { type: 'wellness' }
    | { type: 'experiences' }
    | { type: 'gettingHere' }
    | { type: 'practicalInfo' }
    | { type: 'villaDetail'; villaId: string }
    | { type: 'compareVillas' }
    | { type: 'concierge' }
    | { type: 'booking' }
    | null;

  const [conciergeReturnOverlay, setConciergeReturnOverlay] = useState<OverlayType>(null);
  const [bookingReturnOverlay, setBookingReturnOverlay] = useState<OverlayType>(null);
  const [three60ReturnOverlay, setThree60ReturnOverlay] = useState<OverlayType>(null);
  const [villaDetailReturnCompare, setVillaDetailReturnCompare] = useState<boolean>(false);
  const [conciergeTriggerId, setConciergeTriggerId] = useState<number>(0);

  // Helper to ensure clean overlay hierarchy (zero stacking collisions)
  const closeAllOverlays = () => {
    setIsMegaMenuOpen(false);
    setDetailVillaId(null);
    setIsCompareVillasOpen(false);
    setIsDiningOpen(false);
    setIsWellnessOpen(false);
    setIsExperiencesOpen(false);
    setIsGettingHereOpen(false);
    setIsPracticalInfoOpen(false);
    setIsConciergeOpen(false);
    setIsBookingOpen(false);
    setIs360Open(false);
  };

  // Direct Booking Handler with Origin Preservation
  const handleOpenBooking = (villaId?: string, notes?: string, explicitReturn?: OverlayType) => {
    let toReturn: OverlayType = explicitReturn ?? null;
    if (!toReturn) {
      if (isConciergeOpen) toReturn = { type: 'concierge' };
      else if (isDiningOpen) toReturn = { type: 'dining' };
      else if (isWellnessOpen) toReturn = { type: 'wellness' };
      else if (isExperiencesOpen) toReturn = { type: 'experiences' };
      else if (isGettingHereOpen) toReturn = { type: 'gettingHere' };
      else if (isPracticalInfoOpen) toReturn = { type: 'practicalInfo' };
      else if (detailVillaId) toReturn = { type: 'villaDetail', villaId: detailVillaId };
      else if (isCompareVillasOpen) toReturn = { type: 'compareVillas' };
    }

    closeAllOverlays();
    setBookingReturnOverlay(toReturn);
    setBookingVillaId(villaId);
    setBookingNotes(notes);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setBookingNotes(undefined);
    if (bookingReturnOverlay) {
      const ret = bookingReturnOverlay;
      setBookingReturnOverlay(null);
      if (ret.type === 'dining') setIsDiningOpen(true);
      else if (ret.type === 'wellness') setIsWellnessOpen(true);
      else if (ret.type === 'experiences') setIsExperiencesOpen(true);
      else if (ret.type === 'gettingHere') setIsGettingHereOpen(true);
      else if (ret.type === 'practicalInfo') setIsPracticalInfoOpen(true);
      else if (ret.type === 'villaDetail') setDetailVillaId(ret.villaId);
      else if (ret.type === 'compareVillas') setIsCompareVillasOpen(true);
      else if (ret.type === 'concierge') setIsConciergeOpen(true);
    }
  };

  // Concierge Handlers
  interface OpenConciergeOptions {
    prompt?: string;
    villaId?: string;
    sourceContext?: ConciergeSourceContext;
    explicitReturn?: OverlayType;
  }

  const handleOpenConcierge = (
    optionsOrPrompt?: OpenConciergeOptions | string,
    legacyVillaId?: string,
    legacyExplicitReturn?: OverlayType,
    legacySourceContext?: ConciergeSourceContext
  ) => {
    setConciergeTriggerId((prev) => prev + 1);
    let prompt: string | undefined;
    let villaId: string | undefined = legacyVillaId;
    let explicitReturn: OverlayType = legacyExplicitReturn ?? null;
    let sourceContext: ConciergeSourceContext = legacySourceContext || { type: 'global' };

    if (typeof optionsOrPrompt === 'object' && optionsOrPrompt !== null) {
      prompt = optionsOrPrompt.prompt;
      villaId = optionsOrPrompt.villaId;
      explicitReturn = optionsOrPrompt.explicitReturn ?? null;
      if (optionsOrPrompt.sourceContext) {
        sourceContext = optionsOrPrompt.sourceContext;
      } else if (optionsOrPrompt.villaId) {
        sourceContext = { type: 'villa', id: optionsOrPrompt.villaId };
      } else {
        sourceContext = { type: 'global' };
      }
    } else {
      prompt = optionsOrPrompt;
      if (villaId && !legacySourceContext) {
        sourceContext = { type: 'villa', id: villaId };
      }
    }

    let toReturn: OverlayType = explicitReturn;
    if (!toReturn) {
      if (isDiningOpen) toReturn = { type: 'dining' };
      else if (isWellnessOpen) toReturn = { type: 'wellness' };
      else if (isExperiencesOpen) toReturn = { type: 'experiences' };
      else if (isGettingHereOpen) toReturn = { type: 'gettingHere' };
      else if (isPracticalInfoOpen) toReturn = { type: 'practicalInfo' };
      else if (detailVillaId) toReturn = { type: 'villaDetail', villaId: detailVillaId };
      else if (isCompareVillasOpen) toReturn = { type: 'compareVillas' };
    }

    closeAllOverlays();
    setConciergeReturnOverlay(toReturn);
    setConciergePrompt(prompt);
    setConciergeVillaId(villaId);
    setConciergeSourceContext(sourceContext);
    setIsConciergeOpen(true);
  };

  const handleCloseConcierge = () => {
    setIsConciergeOpen(false);
    setConciergePrompt(undefined);
    setConciergeVillaId(undefined);
    setConciergeSourceContext({ type: 'global' });

    if (conciergeReturnOverlay) {
      const ret = conciergeReturnOverlay;
      setConciergeReturnOverlay(null);
      if (ret.type === 'dining') setIsDiningOpen(true);
      else if (ret.type === 'wellness') setIsWellnessOpen(true);
      else if (ret.type === 'experiences') setIsExperiencesOpen(true);
      else if (ret.type === 'gettingHere') setIsGettingHereOpen(true);
      else if (ret.type === 'practicalInfo') setIsPracticalInfoOpen(true);
      else if (ret.type === 'villaDetail') setDetailVillaId(ret.villaId);
      else if (ret.type === 'compareVillas') setIsCompareVillasOpen(true);
      else if (ret.type === 'booking') setIsBookingOpen(true);
    }
  };

  // Seamless Handoff from Concierge to Booking
  const handleConciergeBookingHandoff = (data: ConciergeHandoffData) => {
    handleOpenBooking(data.villaId, data.notes, { type: 'concierge' });
    setBookingNights(data.nights);
    setBookingGuests(data.guests);
  };

  // 360 Viewer Handler
  const handleOpen360 = (sceneId?: string, explicitReturn?: OverlayType) => {
    let toReturn: OverlayType = explicitReturn ?? null;
    if (!toReturn) {
      if (detailVillaId) toReturn = { type: 'villaDetail', villaId: detailVillaId };
      else if (isCompareVillasOpen) toReturn = { type: 'compareVillas' };
    }
    closeAllOverlays();
    setThree60ReturnOverlay(toReturn);
    setPanoramaSceneId(sceneId);
    setIs360Open(true);
  };

  const handleClose360 = () => {
    setIs360Open(false);
    setPanoramaSceneId(undefined);
    if (three60ReturnOverlay) {
      const ret = three60ReturnOverlay;
      setThree60ReturnOverlay(null);
      if (ret.type === 'villaDetail') setDetailVillaId(ret.villaId);
      else if (ret.type === 'compareVillas') setIsCompareVillasOpen(true);
      else if (ret.type === 'dining') setIsDiningOpen(true);
      else if (ret.type === 'wellness') setIsWellnessOpen(true);
      else if (ret.type === 'experiences') setIsExperiencesOpen(true);
      else if (ret.type === 'gettingHere') setIsGettingHereOpen(true);
      else if (ret.type === 'practicalInfo') setIsPracticalInfoOpen(true);
    }
  };

  // Navigation Handlers
  const handleNavigateSection = (sectionId: string) => {
    closeAllOverlays();
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Deep View Handlers
  const handleOpenMegaMenu = () => {
    closeAllOverlays();
    setIsMegaMenuOpen(true);
  };

  const handleOpenVillaDetail = (villaId: string, fromCompare: boolean = false) => {
    const isFromCompare = fromCompare || isCompareVillasOpen;
    closeAllOverlays();
    setVillaDetailReturnCompare(isFromCompare);
    setDetailVillaId(villaId);
  };

  const handleCloseVillaDetail = () => {
    setDetailVillaId(null);
    if (villaDetailReturnCompare) {
      setVillaDetailReturnCompare(false);
      setIsCompareVillasOpen(true);
    }
  };

  const handleOpenCompareVillas = () => {
    closeAllOverlays();
    setIsCompareVillasOpen(true);
  };

  const handleOpenDining = () => {
    closeAllOverlays();
    setIsDiningOpen(true);
  };

  const handleOpenWellness = () => {
    closeAllOverlays();
    setIsWellnessOpen(true);
  };

  const handleOpenExperiences = () => {
    closeAllOverlays();
    setIsExperiencesOpen(true);
  };

  const handleOpenGettingHere = () => {
    closeAllOverlays();
    setIsGettingHereOpen(true);
  };

  const handleOpenPracticalInfo = () => {
    closeAllOverlays();
    setIsPracticalInfoOpen(true);
  };

  const activeDetailVilla = detailVillaId
    ? veloraResort.villas.find((v) => v.id === detailVillaId)
    : null;

  // Memoized callback to prevent unstable callback identity across parent renders
  const handleTripStateChange = useCallback((st: TripState) => {
    setBookingVillaId(st.selectedVillaId);
    setConciergeVillaId(st.selectedVillaId);
    if (!st.selectedVillaId) {
      setConciergeSourceContext({ type: 'global' });
    }
    if (st.nights) setBookingNights(st.nights);
    if (st.guests) setBookingGuests(st.guests);
    if (st.notes) setBookingNotes(st.notes);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#04080f] text-[#ece6dc] font-sans selection:bg-[#c4a97d]/30 selection:text-[#f8f5ee] overflow-x-hidden">
      {/* Contextual Cursor */}
      <CustomCursor />

      {/* Simplified Architectural Navigation with MegaMenu trigger */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenConcierge={(prompt) =>
          handleOpenConcierge({ prompt, sourceContext: { type: 'global' } })
        }
        onOpenMegaMenu={handleOpenMegaMenu}
      />

      {/* Fullscreen Architectural MegaMenu Drawer */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        onNavigateSection={handleNavigateSection}
        onOpenVillaDetail={handleOpenVillaDetail}
        onOpenCompareVillas={handleOpenCompareVillas}
        onOpenDining={handleOpenDining}
        onOpenWellness={handleOpenWellness}
        onOpenExperiences={handleOpenExperiences}
        onOpenGettingHere={handleOpenGettingHere}
        onOpenPracticalInfo={handleOpenPracticalInfo}
        onOpenConcierge={() =>
          handleOpenConcierge({ sourceContext: { type: 'global' } })
        }
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* CHAPTER 01: ARRIVE (Film Opening Sequence & Hero Stage) */}
      <ArrivalChapter
        onOpenBooking={() => handleOpenBooking()}
        onOpenConcierge={(prompt) =>
          handleOpenConcierge({ prompt, sourceContext: { type: 'global' } })
        }
      />

      {/* CHAPTER 02: THE ISLAND (Aerial Composition & Contextual Destinations) */}
      <IslandChapter
        onOpen360Scene={(sceneId) => handleOpen360(sceneId)}
        onNavigateToStay={() => handleNavigateSection('stay')}
      />

      {/* CHAPTER 03: STAY (Villas & Architecture) */}
      <StayChapter
        onReserveVilla={(villaId) => handleOpenBooking(villaId)}
        onOpen360Scene={(sceneId) => handleOpen360(sceneId)}
        onOpenConcierge={(prompt, villaId) =>
          handleOpenConcierge({
            prompt,
            villaId,
            sourceContext: villaId ? { type: 'villa', id: villaId } : { type: 'global' },
          })
        }
        onOpenVillaDetail={handleOpenVillaDetail}
        onOpenCompareVillas={handleOpenCompareVillas}
      />

      {/* CHAPTER 04: ISLAND LIFE (Dining, Reef & Ocean, Water Pavilion) */}
      <IslandLifeChapter
        onOpenDining={handleOpenDining}
        onOpenExperiences={handleOpenExperiences}
        onOpenWellness={handleOpenWellness}
      />

      {/* CHAPTER 05: A DAY AT VELORA (Circadian Timeline) */}
      <DayAtVeloraChapter
        onOpenConcierge={(prompt) =>
          handleOpenConcierge({ prompt, sourceContext: { type: 'global' } })
        }
      />

      {/* CHAPTER 06: DISCOVER (Visual Archive & Photography) */}
      <DiscoverChapter />

      {/* CHAPTER 07: GETTING HERE (Arrival Trajectory & Seaplane) */}
      <GettingHereChapter
        onOpenGettingHereDetails={handleOpenGettingHere}
      />

      {/* CHAPTER 08: PRIVATE CONCIERGE (Intelligent Stay Atelier) */}
      <PlanEscapeSection
        onOpenConcierge={(prompt) =>
          handleOpenConcierge({ prompt, sourceContext: { type: 'global' } })
        }
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* FOOTER */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenConcierge={() =>
          handleOpenConcierge({ sourceContext: { type: 'global' } })
        }
        onOpenCompareVillas={handleOpenCompareVillas}
        onOpenDining={handleOpenDining}
        onOpenWellness={handleOpenWellness}
        onOpenExperiences={handleOpenExperiences}
        onOpenGettingHere={handleOpenGettingHere}
        onOpenPracticalInfo={handleOpenPracticalInfo}
      />

      {/* REFINED FLOATING CONCIERGE TRIGGER (Quiet ✦ trigger, safe-area aware, zero collisions) */}
      <aside
        aria-label="Persistent Concierge Access"
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-40 pointer-events-auto"
      >
        <button
          onClick={() =>
            handleOpenConcierge({ sourceContext: { type: 'global' } })
          }
          data-cursor="CONCIERGE"
          className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#06101c]/95 hover:bg-[#dfcaa3] text-[#dfcaa3] hover:text-[#04080f] border border-[#c4a97d]/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open Private Concierge"
          title="Private Concierge"
        >
          <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span className="sr-only">Private Concierge</span>
        </button>
      </aside>

      {/* IMMERSIVE & TRANSACTIONAL OVERLAYS (No stacking) */}

      {/* 1. Private Concierge */}
      <PrivateConciergeModal
        isOpen={isConciergeOpen}
        initialPrompt={conciergePrompt}
        initialVillaId={conciergeVillaId}
        sourceContext={conciergeSourceContext}
        launchTriggerId={conciergeTriggerId}
        onClose={handleCloseConcierge}
        onReserveHandoff={(data) => {
          handleConciergeBookingHandoff(data);
        }}
        onOpen360Scene={(sceneId) => {
          setConciergeReturnOverlay(null);
          setIsConciergeOpen(false);
          handleOpen360(sceneId);
        }}
        onSelectVillaInExplorer={(villaId) => {
          setConciergeReturnOverlay(null);
          setIsConciergeOpen(false);
          if (villaId) {
            handleOpenVillaDetail(villaId);
          } else {
            handleNavigateSection('stay');
          }
        }}
        onCompareVillas={() => {
          setConciergeReturnOverlay(null);
          setIsConciergeOpen(false);
          handleOpenCompareVillas();
        }}
        onNavigateSection={(sectionId) => {
          setConciergeReturnOverlay(null);
          setIsConciergeOpen(false);
          handleNavigateSection(sectionId);
        }}
        onTripStateChange={handleTripStateChange}
      />

      {/* 2. Direct Stay Request Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        initialVillaId={bookingVillaId}
        initialNights={bookingNights}
        initialGuests={bookingGuests}
        initialNotes={bookingNotes}
        onClose={handleCloseBooking}
        onOpenConcierge={(prompt, villaId) => {
          setIsBookingOpen(false);
          const targetVillaId = villaId || bookingVillaId;
          handleOpenConcierge({
            prompt,
            villaId: targetVillaId,
            sourceContext: targetVillaId ? { type: 'villa', id: targetVillaId } : { type: 'global' },
            explicitReturn: { type: 'booking' },
          });
        }}
      />

      {/* 3. Three.js Interactive 360 Panorama Modal (Code-split) */}
      {is360Open && (
        <Suspense fallback={null}>
          <Resort360Viewer
            initialSceneId={panoramaSceneId}
            onClose={handleClose360}
          />
        </Suspense>
      )}

      {/* 4. Full Architectural Villa Dossier View */}
      {activeDetailVilla && (
        <VillaDetailView
          villa={activeDetailVilla}
          allVillas={veloraResort.villas}
          onClose={handleCloseVillaDetail}
          onRequestStay={(villaId) =>
            handleOpenBooking(villaId, undefined, {
              type: 'villaDetail',
              villaId: activeDetailVilla.id,
            })
          }
          onOpen360={(sceneId) =>
            handleOpen360(sceneId, {
              type: 'villaDetail',
              villaId: activeDetailVilla.id,
            })
          }
          onAskConcierge={(prompt, villaId) => {
            const targetId = villaId || activeDetailVilla.id;
            handleOpenConcierge({
              prompt,
              villaId: targetId,
              sourceContext: { type: 'villa', id: targetId },
              explicitReturn: { type: 'villaDetail', villaId: activeDetailVilla.id },
            });
          }}
          onCompareVillas={handleOpenCompareVillas}
          onSelectOtherVilla={(villaId) => setDetailVillaId(villaId)}
        />
      )}

      {/* 5. Architectural Comparison Matrix View */}
      {isCompareVillasOpen && (
        <CompareVillasView
          villas={veloraResort.villas}
          onClose={() => setIsCompareVillasOpen(false)}
          onSelectVilla={(villaId) => handleOpenVillaDetail(villaId, true)}
          onRequestStay={(villaId) =>
            handleOpenBooking(villaId, undefined, { type: 'compareVillas' })
          }
          onAskConcierge={(prompt) =>
            handleOpenConcierge({
              prompt,
              sourceContext: { type: 'global' },
              explicitReturn: { type: 'compareVillas' },
            })
          }
        />
      )}

      {/* 6. Culinary Destinations View */}
      {isDiningOpen && (
        <DiningDestinationView
          onClose={() => setIsDiningOpen(false)}
          onAskConcierge={(prompt, context) =>
            handleOpenConcierge({
              prompt,
              sourceContext: context || { type: 'dining', id: 'dining-general' },
              explicitReturn: { type: 'dining' },
            })
          }
          onRequestStay={(notes) =>
            handleOpenBooking(undefined, notes, { type: 'dining' })
          }
        />
      )}

      {/* 7. Wellness & The Water Pavilion View */}
      {isWellnessOpen && (
        <WellnessDestinationView
          onClose={() => setIsWellnessOpen(false)}
          onAskConcierge={(prompt, context) =>
            handleOpenConcierge({
              prompt,
              sourceContext: context || { type: 'wellness', id: 'water-pavilion' },
              explicitReturn: { type: 'wellness' },
            })
          }
          onRequestStay={(notes) =>
            handleOpenBooking(undefined, notes, { type: 'wellness' })
          }
        />
      )}

      {/* 8. Reef & Ocean Expeditions View */}
      {isExperiencesOpen && (
        <ExperiencesDestinationView
          onClose={() => setIsExperiencesOpen(false)}
          onAskConcierge={(prompt, context) =>
            handleOpenConcierge({
              prompt,
              sourceContext: context || { type: 'experience', id: 'experience-general' },
              explicitReturn: { type: 'experiences' },
            })
          }
          onRequestStay={(notes) =>
            handleOpenBooking(undefined, notes, { type: 'experiences' })
          }
        />
      )}

      {/* 9. Travel Logistics & Lounge View */}
      {isGettingHereOpen && (
        <GettingHereDestinationView
          onClose={() => setIsGettingHereOpen(false)}
          onAskConcierge={(prompt) =>
            handleOpenConcierge({
              prompt,
              sourceContext: { type: 'gettingHere' },
              explicitReturn: { type: 'gettingHere' },
            })
          }
          onRequestStay={() =>
            handleOpenBooking(undefined, undefined, { type: 'gettingHere' })
          }
        />
      )}

      {/* 10. Practical Information & FAQ View */}
      {isPracticalInfoOpen && (
        <PracticalInfoView
          onClose={() => setIsPracticalInfoOpen(false)}
          onAskConcierge={(prompt) =>
            handleOpenConcierge({
              prompt,
              sourceContext: { type: 'practicalInfo' },
              explicitReturn: { type: 'practicalInfo' },
            })
          }
          onRequestStay={() =>
            handleOpenBooking(undefined, undefined, { type: 'practicalInfo' })
          }
        />
      )}
    </main>
  );
}
