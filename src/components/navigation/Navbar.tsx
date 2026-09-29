import { useState, useEffect } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { AmbienceControl } from '../ui/AmbienceControl';
import { Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenConcierge: (prompt?: string) => void;
  onOpenMegaMenu: () => void;
}

export function Navbar({ onOpenBooking, onOpenConcierge, onOpenMegaMenu }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'THE ISLAND', href: '#island' },
    { label: 'VILLAS', href: '#stay' },
    { label: 'ISLAND LIFE', href: '#island-life' },
    { label: 'A DAY AT VELORA', href: '#day' },
    { label: 'DISCOVER', href: '#discover' },
    { label: 'GETTING HERE', href: '#getting-here' },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-[env(safe-area-inset-top)] ${
        isScrolled
          ? 'bg-[#04080f]/90 backdrop-blur-xl border-b border-white/[0.08] py-3.5 sm:py-4'
          : 'bg-gradient-to-b from-[#04080f]/90 via-[#04080f]/40 to-transparent py-4 sm:py-6'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-8 md:px-12 flex items-center justify-between">
        {/* Brand Wordmark */}
        <a
          href="#"
          className="group flex items-center gap-2 sm:gap-2.5 focus:outline-none"
          aria-label="VELORA Private Island Home"
        >
          <span className="font-editorial text-lg sm:text-2xl text-white tracking-[0.2em] sm:tracking-[0.28em] font-normal transition-opacity duration-300 group-hover:opacity-80">
            {veloraResort.brandName}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#dfcaa3]/50" />
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.25em] text-[#dfcaa3]/75 font-sans font-medium">
            MALDIVES
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-7 2xl:gap-9" aria-label="Primary Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="text-[10px] uppercase tracking-[0.26em] font-sans text-white/70 hover:text-[#dfcaa3] transition-colors duration-300 relative py-1 group font-medium"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#dfcaa3] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambient Soundscape Control: Desktop only to prevent mobile clutter */}
          <div className="hidden md:flex">
            <AmbienceControl />
          </div>

          {/* Mega Menu Launcher Button (Both desktop & tablet) */}
          <button
            onClick={onOpenMegaMenu}
            data-cursor="MENU"
            data-focus-id="navbar-menu-btn"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/20 hover:border-[#dfcaa3] bg-white/[0.04] hover:bg-[#dfcaa3]/10 text-white/85 hover:text-white text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.22em] font-sans font-medium transition-all duration-300"
            aria-label="Open Resort Architecture Menu"
          >
            <Menu className="w-3.5 h-3.5 text-[#dfcaa3]" />
            <span>MENU</span>
          </button>

          {/* Desktop Concierge Access */}
          <button
            onClick={() => onOpenConcierge()}
            data-cursor="CONCIERGE"
            data-focus-id="navbar-concierge-btn"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#c4a97d]/35 hover:border-[#dfcaa3] bg-[#c4a97d]/10 hover:bg-[#c4a97d]/20 text-[#dfcaa3] text-[10px] uppercase tracking-[0.22em] font-sans font-medium transition-all duration-300"
          >
            <Sparkles className="w-3 h-3 text-[#dfcaa3]" />
            <span>CONCIERGE ✦</span>
          </button>

          {/* Direct Reservation Action */}
          <button
            onClick={onOpenBooking}
            data-cursor="REQUEST"
            data-focus-id="navbar-booking-btn"
            className="px-2.5 min-[390px]:px-3 sm:px-5 py-1.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-[8.5px] min-[390px]:text-[9px] sm:text-[10px] uppercase tracking-[0.12em] min-[390px]:tracking-[0.16em] sm:tracking-[0.22em] font-sans font-medium transition-all duration-300 whitespace-nowrap shadow-[0_0_20px_rgba(223,202,163,0.2)] hover:scale-[1.02] active:scale-[0.98]"
          >
            REQUEST YOUR STAY
          </button>
        </div>
      </div>
    </header>
  );
}
