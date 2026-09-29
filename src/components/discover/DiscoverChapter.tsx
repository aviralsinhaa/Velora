import { useState, useEffect } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

interface GalleryPiece {
  id: string;
  title: string;
  caption: string;
  image: string;
  aspect: string;
  desktopCols: string;
}

export function DiscoverChapter() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Curated, art-directed editorial pieces — large photography from one cohesive Maldivian resort world
  const pieces: GalleryPiece[] = [
    // ROW 1: 12 columns large 2:1 / 16:9 hero image
    {
      id: 'western-lagoon-hero',
      title: 'Western Lagoon at Golden Hour',
      caption: 'WESTERN LAGOON',
      image: RESORT_MEDIA.arrival.heroBackdrop,
      aspect: 'aspect-[21/9] sm:aspect-[21/9]',
      desktopCols: 'col-span-12',
    },
    // ROW 2: 7-column landscape + 5-column portrait
    {
      id: 'sunset-deck',
      title: 'Sunset Deck & Infinity Pool',
      caption: 'SUNSET DECK',
      image: RESORT_MEDIA.villas.sunsetPoolVilla.hero,
      aspect: 'aspect-[16/10]',
      desktopCols: 'lg:col-span-7',
    },
    {
      id: 'house-reef-drift',
      title: 'Outer Reef Drop-Off',
      caption: 'HOUSE REEF',
      image: RESORT_MEDIA.experiences.mantaReefDive,
      aspect: 'aspect-[4/5]',
      desktopCols: 'lg:col-span-5',
    },
    // ROW 4: 5-column portrait + 7-column landscape
    {
      id: 'water-pavilion',
      title: 'The Water Pavilion',
      caption: 'WATER PAVILION',
      image: RESORT_MEDIA.wellness.waterPavilion,
      aspect: 'aspect-[4/5]',
      desktopCols: 'lg:col-span-5',
    },
    {
      id: 'private-sandbank-dining',
      title: 'Lantern-Lit Sandbank Table',
      caption: 'SANDBANK DINNER',
      image: RESORT_MEDIA.dining.sandbankOmakase.hero,
      aspect: 'aspect-[16/10]',
      desktopCols: 'lg:col-span-7',
    },
    // ROW 5: Full-width cinematic image
    {
      id: 'sunset-catamaran',
      title: 'Dusk Catamaran Sail across Noonu Atoll',
      caption: 'SUNSET SAIL',
      image: RESORT_MEDIA.experiences.sunsetDhoniSail,
      aspect: 'aspect-[21/9]',
      desktopCols: 'col-span-12',
    },
  ];

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % pieces.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + pieces.length) % pieces.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, pieces.length]);

  return (
    <section id="discover" className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] border-t border-white/10">
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-5 mb-12 sm:mb-16">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              CHAPTER 06 · DISCOVER
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
              The Island, in Moments
            </h2>
          </div>
          <div className="text-left sm:text-right mt-2 sm:mt-0 font-mono text-xs text-white/45 tracking-[0.2em]">
            PHOTOGRAPHY
          </div>
        </div>

        {/* ========================================================
            MOBILE EDITORIAL RHYTHM (< md screens)
            Dominant, large photography with intentional captions
           ======================================================== */}
        <div className="block md:hidden space-y-10 mb-12">
          {pieces.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => setLightboxIndex(idx)}
              className="space-y-2 cursor-pointer group"
            >
              <div className={`relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] ${p.aspect} w-full shadow-lg`}>
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover velora-image-grade"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span className="font-editorial text-lg text-white font-normal">{p.title}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#dfcaa3] font-sans font-medium">{p.caption}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================
            DESKTOP ASYMMETRIC EDITORIAL SPREAD (md+ screens)
            12-col Hero -> 7/5 Asymmetric -> 5/7 Asymmetric -> 12-col Full Cinematic
           ======================================================== */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 mb-16 items-center">
          {/* Row 1: 12-Column Hero */}
          <div
            onClick={() => setLightboxIndex(0)}
            data-cursor="VIEW"
            className="col-span-12 group cursor-pointer space-y-2"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[21/9] w-full shadow-2xl">
              <img
                src={pieces[0].image}
                alt={pieces[0].title}
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 flex flex-col justify-end pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-sans block mb-1">
                  {pieces[0].caption}
                </span>
                <p className="font-editorial text-2xl text-white font-normal">{pieces[0].title}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs px-2 text-white/60">
              <span className="font-editorial text-lg text-white/90">{pieces[0].title}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">{pieces[0].caption}</span>
            </div>
          </div>

          {/* Row 2: 7-col Landscape + 5-col Portrait */}
          <div
            onClick={() => setLightboxIndex(1)}
            data-cursor="VIEW"
            className="col-span-7 group cursor-pointer space-y-2"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] w-full shadow-xl">
              <img
                src={pieces[1].image}
                alt={pieces[1].title}
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between text-xs px-1 text-white/60">
              <span className="font-editorial text-base text-white/90">{pieces[1].title}</span>
              <span className="text-[9px] uppercase tracking-widest text-[#dfcaa3] font-mono">{pieces[1].caption}</span>
            </div>
          </div>

          <div
            onClick={() => setLightboxIndex(2)}
            data-cursor="VIEW"
            className="col-span-5 group cursor-pointer space-y-2"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[4/5] w-full shadow-xl">
              <img
                src={pieces[2].image}
                alt={pieces[2].title}
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between text-xs px-1 text-white/60">
              <span className="font-editorial text-base text-white/90">{pieces[2].title}</span>
              <span className="text-[9px] uppercase tracking-widest text-[#dfcaa3] font-mono">{pieces[2].caption}</span>
            </div>
          </div>

          {/* Row 3: 5-col Portrait + 7-col Landscape */}
          <div
            onClick={() => setLightboxIndex(3)}
            data-cursor="VIEW"
            className="col-span-5 group cursor-pointer space-y-2"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[4/5] w-full shadow-xl">
              <img
                src={pieces[3].image}
                alt={pieces[3].title}
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between text-xs px-1 text-white/60">
              <span className="font-editorial text-base text-white/90">{pieces[3].title}</span>
              <span className="text-[9px] uppercase tracking-widest text-[#dfcaa3] font-mono">{pieces[3].caption}</span>
            </div>
          </div>

          <div
            onClick={() => setLightboxIndex(4)}
            data-cursor="VIEW"
            className="col-span-7 group cursor-pointer space-y-2"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] w-full shadow-xl">
              <img
                src={pieces[4].image}
                alt={pieces[4].title}
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between text-xs px-1 text-white/60">
              <span className="font-editorial text-base text-white/90">{pieces[4].title}</span>
              <span className="text-[9px] uppercase tracking-widest text-[#dfcaa3] font-mono">{pieces[4].caption}</span>
            </div>
          </div>

          {/* Row 4: 12-Column Full Cinematic Image */}
          <div
            onClick={() => setLightboxIndex(5)}
            data-cursor="VIEW"
            className="col-span-12 group cursor-pointer space-y-2 pt-4"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[21/9] w-full shadow-2xl">
              <img
                src={pieces[5].image}
                alt={pieces[5].title}
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between text-xs px-2 text-white/60">
              <span className="font-editorial text-lg text-white/90">{pieces[5].title}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">{pieces[5].caption}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX */}
      {lightboxIndex !== null && pieces[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-3 text-white/70 hover:text-white"
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + pieces.length) % pieces.length : 0))}
            className="absolute left-4 p-3 rounded-full border border-white/20 text-white/80 hover:text-white"
            aria-label="Previous image"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={pieces[lightboxIndex].image}
              alt={pieces[lightboxIndex].title}
              className="max-h-[72vh] w-auto object-contain rounded-xl border border-white/10"
            />
            <div className="text-center mt-3">
              <p className="font-editorial text-xl sm:text-2xl text-white">
                {pieces[lightboxIndex].title}
              </p>
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#dfcaa3] mt-1">
                {pieces[lightboxIndex].caption}
              </p>
            </div>
          </div>

          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % pieces.length : 0))}
            className="absolute right-4 p-3 rounded-full border border-white/20 text-white/80 hover:text-white"
            aria-label="Next image"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
