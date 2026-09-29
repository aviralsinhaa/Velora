import { useState, useEffect } from 'react';
import { oceanAudio } from '../../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

export function AmbienceControl() {
  const [isPlaying, setIsPlaying] = useState<boolean>(oceanAudio.getActive());

  useEffect(() => {
    const unsubscribe = oceanAudio.subscribe((active) => {
      setIsPlaying(active);
    });
    return unsubscribe;
  }, []);

  const toggleAmbience = () => {
    oceanAudio.toggle();
  };

  return (
    <button
      onClick={toggleAmbience}
      data-cursor={isPlaying ? 'MUTE' : 'LISTEN'}
      className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/15 hover:border-[#c4a97d]/60 bg-black/35 hover:bg-black/55 backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#dfcaa3]/50"
      title={isPlaying ? 'Mute Atoll tides' : 'Immerse in procedural ocean wave ambience'}
      aria-label={isPlaying ? 'Mute ocean soundscape' : 'Enable procedural ocean soundscape'}
    >
      <div className="relative flex items-center justify-center w-3.5 h-3.5 text-[#dfcaa3]">
        {isPlaying ? (
          <div className="flex items-end gap-[2.5px] h-3">
            <span className="w-[1.5px] h-2 bg-[#dfcaa3] rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
            <span className="w-[1.5px] h-3 bg-[#78dedc] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.2s]" />
            <span className="w-[1.5px] h-1.5 bg-[#dfcaa3] rounded-full animate-[pulse_1.4s_ease-in-out_infinite_0.4s]" />
          </div>
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-white/50 group-hover:text-[#dfcaa3] transition-colors" />
        )}
      </div>

      <span className="text-[10px] tracking-[0.22em] uppercase font-sans text-white/70 group-hover:text-white transition-colors flex items-center gap-1.5">
        <span>TIDES</span>
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full transition-all duration-500 ${
            isPlaying ? 'bg-[#78dedc] shadow-[0_0_8px_#78dedc] scale-110' : 'bg-white/25 scale-90'
          }`}
        />
      </span>
    </button>
  );
}
