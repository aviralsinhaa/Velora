/**
 * Dynamic luxury itinerary generator and modifier for Velora Private Island
 */

export interface ItineraryDay {
  day: string;
  time: string;
  title: string;
  description: string;
}

export interface ItineraryConfig {
  nights: number;
  guests: number;
  month?: string;
  interests: string[];
  removals: string[];
  villaId?: string;
}

export function generateItinerary(config: ItineraryConfig): {
  days: ItineraryDay[];
  diningHighlight: string;
  wellnessHighlight: string;
} {
  const nights = Math.max(3, Math.min(10, config.nights || 5));
  const hasDiving = config.interests.includes('diving') && !config.removals.includes('diving') && !config.removals.includes('dive');
  const hasSpa = config.interests.includes('wellness') || config.removals.includes('diving'); // If removed diving, often added spa

  const days: ItineraryDay[] = [];

  // Day 01: Arrival & Horizon
  days.push({
    day: 'Day 01',
    time: '14:30',
    title: 'Seaplane Arrival & Island Welcome',
    description: 'Touch down on the outer lagoon pontoon followed by barefoot welcome tea in your private villa.',
  });

  // Day 02: Lagoon Awakening & Reef Exploration or Wellness
  if (hasDiving) {
    days.push({
      day: 'Day 02',
      time: '10:30',
      title: 'House Reef & Outer Drop-Off',
      description: 'Explore the northern reef channel where calm currents bring opportunities to encounter green sea turtles and tropical marine life along the outer drop-off.',
    });
  } else if (hasSpa) {
    days.push({
      day: 'Day 02',
      time: '15:00',
      title: 'Tibetan Sound & Water Meditation',
      description: 'Immerse in warm buoyant saline water as harmonic quartz crystal bowls reverberate above and beneath the surface.',
    });
  } else {
    days.push({
      day: 'Day 02',
      time: '11:00',
      title: 'Inner Lagoon Snorkeling & Coral Garden Drift',
      description: 'Gentle exploration across the shallow reef with personal marine guide.',
    });
  }

  // Day 03: Sunset Cruise or Gastronomy
  days.push({
    day: 'Day 03',
    time: '17:30',
    title: 'Traditional Sunset Dhoni Sailing',
    description: 'Glide silently across mirror-smooth waters under custom black linen sails as the sail crosses open lagoon waters toward the setting amber sun.',
  });

  // Day 04: Rest / Spa
  if (nights >= 4) {
    if (hasSpa && !days.some((d) => d.title.includes('Sound & Water Meditation'))) {
      days.push({
        day: 'Day 04',
        time: '14:00',
        title: 'Velora Ocean Caress Ritual',
        description: 'Warm poultices of hand-harvested Maldivian sea salt, virgin coconut oil, and wild sea algae applied with rhythmic oceanic strokes.',
      });
    } else {
      days.push({
        day: 'Day 04',
        time: '12:30',
        title: 'Castaway Sandbank Luncheon',
        description: 'Depart by wooden dhoni to a solitary sandbank that emerges only at low tide. A canopy of hand-woven linen, sunken sand seating, and chilled seafood prepared on site.',
      });
    }
  }

  // Day 05: Signature Dinner
  if (nights >= 5) {
    days.push({
      day: 'Day 05',
      time: '20:00',
      title: 'Lantern-Lit Private Sandbank Dining',
      description: 'One hundred lanterns on solitary sand with curated coastal delicacies and fresh seafood prepared on site.',
    });
  }

  // Day 06: Floating Breakfast
  if (nights >= 6) {
    days.push({
      day: 'Day 06',
      time: '09:00',
      title: 'Floating In-Villa Champagne Breakfast',
      description: 'Artisanal tropical fruits and warm pastries floating in your private infinity pool.',
    });
  }

  // Day 07: Starlight Stillness
  if (nights >= 7) {
    days.push({
      day: 'Day 07',
      time: '21:30',
      title: 'Bioluminescent Night Lagoon Experience',
      description: 'Quiet nighttime exploration watching natural glowing marine luminescence under starlight.',
    });
  }

  return {
    days,
    diningHighlight: 'Lantern-Lit Private Sandbank Dining',
    wellnessHighlight: 'Tibetan Sound & Water Meditation',
  };
}
