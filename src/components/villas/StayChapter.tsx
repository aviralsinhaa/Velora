import { useState, useEffect, useCallback, useRef } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { Villa } from '../../types';
import { oceanAudio } from '../../utils/audio';
import { ArrowLeft, ArrowRight, Compass, X } from 'lucide-react';

interface StayChapterProps {
  onReserveVilla: (villaId: string) => void;
  onOpen360Scene: (sceneId: string) => void;
  onOpenConcierge?: (prompt?: string, villaId?: string) => void;
  onOpenVillaDetail?: (villaId: string) => void;
  onOpenCompareVillas?: () => void;
}

export function StayChapter({
  onReserveVilla,
  onOpen360Scene,
  onOpenConcierge,
  onOpenVillaDetail,
  onOpenCompareVillas,
}: StayChapterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const touchStartX = useRef<number | null>(null);

  const villas = veloraResort.villas;
  const currentVilla = villas[currentIndex];

  useEffect(() => {
    oceanAudio.setSoundscapeZone('stay');
  }, []);

  const nextVilla = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % villas.length);
  }, [villas.length]);

  const prevVilla = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + villas.length) % villas.length);
  }, [villas.length]);

  // Touch Swipe Support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextVilla();
    else if (diff < -50) prevVilla();
    touchStartX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedVilla) {
        if (e.key === 'Escape') setSelectedVilla(null);
        return;
      }
      if (e.key === 'ArrowRight') nextVilla();
      if (e.key === 'ArrowLeft') prevVilla();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextVilla, prevVilla, selectedVilla]);

  return (
    <section id="stay" className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] overflow-hidden">
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-5 mb-10 sm:mb-16">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              CHAPTER 03 · STAY
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
              Architectural Sanctuaries
            </h2>
          </div>

          {/* Villa Selector Index & Navigation */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
            {onOpenCompareVillas && (
              <button
                onClick={onOpenCompareVillas}
                data-cursor="COMPARE"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-[#dfcaa3] text-[#dfcaa3] hover:text-white text-[11px] uppercase tracking-[0.18em] font-sans transition-all"
              >
                <span>Compare Villas →</span>
              </button>
            )}
            <span className="font-mono text-xs text-white/50 tracking-widest">
              0{currentIndex + 1} / 0{villas.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={prevVilla}
                data-cursor="PREV"
                className="w-9 h-9 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors"
                aria-label="Previous villa"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextVilla}
                data-cursor="NEXT"
                className="w-9 h-9 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors"
                aria-label="Next villa"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 12-Column Architectural Spread: 7 Cols Photography | 5 Cols Villa Information */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="editorial-grid-12 items-center"
        >
          {/* Columns 1-7: Dominant Villa Photography Canvas */}
          <div className="lg:col-span-7">
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] sm:aspect-[16/10] shadow-2xl group">
              <img
                src={currentVilla.featuredImage}
                alt={currentVilla.name}
                loading="lazy"
                className="w-full h-full object-cover velora-image-grade transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

              {/* Quick Image Pill Indicator */}
              <div className="absolute bottom-5 left-5 text-white/80 font-mono text-[11px] tracking-wider pointer-events-none">
                <span>{currentVilla.orientation.toUpperCase()}</span>
              </div>

              {currentVilla.panoramaSceneId && (
                <button
                  onClick={() => onOpen360Scene(currentVilla.panoramaSceneId!)}
                  data-cursor="360°"
                  className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-sans backdrop-blur-md transition-all"
                >
                  <Compass className="w-3.5 h-3.5 text-[#dfcaa3]" />
                  <span>360° VIEW</span>
                </button>
              )}
            </div>

            {/* Quick Villa Tab Strip */}
            <div className="grid grid-cols-4 gap-2.5 mt-3">
              {villas.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`py-2 px-1 text-left border-b-2 transition-all ${
                    idx === currentIndex
                      ? 'border-[#dfcaa3] text-white'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  <span className="font-mono text-[10px] block">0{idx + 1}</span>
                  <span className="text-[10px] font-sans uppercase tracking-wider truncate block">
                    {v.name.replace(' Villa', '').replace(' Residence', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Columns 8-12 (lg:col-span-5): Clean Architectural Hierarchy (No heavy SaaS card) */}
          <div className="lg:col-span-5 space-y-6 lg:pl-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans font-medium">
                  {currentVilla.subtitle}
                </span>
                <span className="text-white/20">·</span>
                <span className="font-mono text-[11px] text-white/50">{currentVilla.orientation}</span>
              </div>

              <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-tight leading-tight">
                {currentVilla.name}
              </h3>
            </div>

            <p className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed font-light">
              {currentVilla.description}
            </p>

            {/* Architectural Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-white/10 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block">SIZE</span>
                <span className="font-editorial text-lg text-white mt-0.5 block">{currentVilla.size}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block">GUESTS</span>
                <span className="font-editorial text-lg text-white mt-0.5 block">{currentVilla.guests}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block">BEDROOMS</span>
                <span className="font-editorial text-lg text-white mt-0.5 block">{currentVilla.bedrooms}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block">FROM</span>
                <span className="font-mono text-sm text-[#dfcaa3] mt-1 block">
                  ${currentVilla.pricePerNight.toLocaleString()}<span className="text-[10px] text-white/40">/nt</span>
                </span>
              </div>
            </div>

            {/* Highlights List */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block">
                SANCTUARY HIGHLIGHTS
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-white/70 font-light">
                {currentVilla.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#dfcaa3] mt-0.5">✦</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={() => onReserveVilla(currentVilla.id)}
                data-cursor="RESERVE"
                className="px-8 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-all shadow-[0_0_24px_rgba(223,202,163,0.2)] hover:scale-105 active:scale-95 text-center"
              >
                REQUEST THIS VILLA
              </button>

              {onOpenConcierge && (
                <button
                  onClick={() =>
                    onOpenConcierge(
                      `Tell me about the ${currentVilla.name} and its privacy.`,
                      currentVilla.id
                    )
                  }
                  data-cursor="CONCIERGE"
                  className="px-6 py-3.5 rounded-full border border-white/20 hover:border-[#dfcaa3] bg-white/[0.03] hover:bg-[#dfcaa3]/10 text-white hover:text-[#dfcaa3] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all text-center"
                >
                  CONCIERGE ✦
                </button>
              )}

              <button
                onClick={() => {
                  if (onOpenVillaDetail) {
                    onOpenVillaDetail(currentVilla.id);
                  } else {
                    setSelectedVilla(currentVilla);
                  }
                }}
                data-cursor="SPECS"
                className="editorial-link py-2 sm:py-0 self-center sm:self-auto text-center"
              >
                <span>ARCHITECTURAL DOSSIER →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VILLA DETAIL MODAL */}
      {selectedVilla && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#06101c] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedVilla(null)}
              className="absolute top-5 right-5 p-2 rounded-full border border-white/10 text-white/60 hover:text-white"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans block">
                ARCHITECTURAL SPECIFICATION
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-white font-light">
                {selectedVilla.name}
              </h3>
            </div>

            <div className="aspect-[16/9] rounded-xl overflow-hidden border border-white/10">
              <img
                src={selectedVilla.featuredImage}
                alt={selectedVilla.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-light">
              {selectedVilla.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-sans">
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">LIVING AREA</span>
                <span className="text-white font-medium">{selectedVilla.size}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">MAX GUESTS</span>
                <span className="text-white font-medium">{selectedVilla.guests}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">ORIENTATION</span>
                <span className="text-white font-medium">{selectedVilla.orientation}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">NIGHTLY RATE</span>
                <span className="text-[#dfcaa3] font-medium">${selectedVilla.pricePerNight.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans block">
                INCLUDED AMENITIES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-white/70">
                {selectedVilla.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[#dfcaa3]">✓</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-3">
              {onOpenVillaDetail && (
                <button
                  onClick={() => {
                    const id = selectedVilla.id;
                    setSelectedVilla(null);
                    onOpenVillaDetail(id);
                  }}
                  className="px-4 py-3 rounded-full border border-white/20 hover:border-[#dfcaa3] text-[#dfcaa3] hover:text-white font-sans text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                >
                  FULL DOSSIER →
                </button>
              )}

              {onOpenConcierge && (
                <button
                  onClick={() => {
                    const v = selectedVilla;
                    setSelectedVilla(null);
                    onOpenConcierge(`Tell me more about the ${v.name}.`, v.id);
                  }}
                  className="px-5 py-3 rounded-full border border-white/20 hover:border-[#dfcaa3] text-white hover:text-[#dfcaa3] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors"
                >
                  CONCIERGE ✦
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedVilla(null);
                  onReserveVilla(selectedVilla.id);
                }}
                className="px-6 py-3 rounded-full bg-[#dfcaa3] text-[#04080f] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-[0_0_20px_rgba(223,202,163,0.2)] hover:scale-105"
              >
                REQUEST THIS VILLA
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
