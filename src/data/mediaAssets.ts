/**
 * Centralized Visual Media Library for VELORA Private Island
 * Art-directed Maldivian architectural and oceanic photography.
 * Every image is semantically and physically coherent to a contemporary low-profile
 * tropical modernist private island in Noonu Atoll.
 */

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  title: string;
  caption?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square' | 'ultrawide';
}

export const RESORT_MEDIA = {
  // 1. ARRIVAL & ATOLL OVERVIEW
  arrival: {
    heroBackdrop: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2600&q=85', // Hero turquoise lagoon with low-profile overwater villas
    aerialAtoll: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=2400&q=85', // True coral atoll aerial surrounded by sapphire sea
    arrivalJetty: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2000&q=85', // Teak boardwalk leading to clear lagoon
    seaplaneTransfer: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85', // Island approach over ring reefs
    seaplaneLagoon: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=2000&q=85', // Low-flying twin otter seaplane over crystal turquoise water
    lagoonShallows: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=2000&q=85', // Pristine crystal shallows at arrival pontoon
  },

  // 2. VILLAS (Believable, architecturally cohesive villa families)
  villas: {
    // 01 Sunset Pool Villa (Overwater due-west with 16m infinity pool)
    sunsetPoolVilla: {
      hero: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2200&q=85',
      deck: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2000&q=85',
      interior: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2000&q=85',
      bathroom: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=2000&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=2000&q=85',
      ],
    },

    // 02 Ocean Lagoon Villa (Sunrise facing with direct reef stairs)
    oceanLagoonVilla: {
      hero: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2200&q=85',
      lagoonStairs: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=2000&q=85',
      interior: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2000&q=85',
      bathroom: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2000&q=85',
      ],
    },

    // 03 Beach Reserve Residence (Palm grove beachfront compound on white sand)
    beachReserveResidence: {
      hero: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2200&q=85',
      palmGarden: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2000&q=85',
      interior: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
      plungePool: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85',
      ],
    },

    // 04 The Velora Estate (Solitary Island Tip Sanctuary)
    veloraPrivateEstate: {
      hero: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2200&q=85',
      compoundAerial: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
      masterSuite: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85',
      ],
    },
  },

  // 3. DINING VENUES (Authentic luxury island settings, open air over water or sand, zero dark city bar stock)
  dining: {
    aura: {
      hero: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=2000&q=85', // Overwater open-air teak dining over turquoise lagoon
    },
    ember: {
      hero: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1800&q=85', // Beachfront woodfire grill under palms
    },
    tide: {
      hero: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1800&q=85', // Shaded open-air waterfront deck
    },
    noir: {
      hero: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1800&q=85', // Starlit oceanfront evening lounge
    },
    sandbankOmakase: {
      hero: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2000&q=85', // Private lantern-lit dining on isolated sandbank
    },
  },

  // 4. CIRCADIAN TIMELINE (Reflecting natural equatorial light from dawn to starlight)
  circadian: {
    dawn: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85', // 06:24 Dawn over lagoon
    morning: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2200&q=85', // 08:10 Overwater pool breakfast
    noon: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2200&q=85', // 11:42 Crystal reef dive
    afternoon: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=2200&q=85', // 15:20 Overwater wellness sanctuary
    sunset: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=2200&q=85', // 18:17 Catamaran sail into sunset
    dusk: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2200&q=85', // 20:36 Lantern-lit sandbank dinner
    night: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?auto=format&fit=crop&w=2200&q=85', // 23:08 Deep ocean night sky
  },

  // 5. EXPERIENCES
  experiences: {
    mantaReefDive: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=85',
    privateYachtExpedition: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1800&q=85',
    sandbankLuncheon: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1800&q=85',
    sunsetDhoniSail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85',
    starlightCinema: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1800&q=85',
  },

  // 6. WELLNESS & SPA (Architectural open-air oceanfront spaces, zero rolled towels or pump bottles)
  wellness: {
    waterPavilion: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=2000&q=85', // Overwater teak wellness pavilion
    soundSanctuary: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=2000&q=85', // Open air movement deck over ocean
    soundBath: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=85', // Overwater glass-deck acoustic space
    botanicalPool: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85', // Private ocean plunge
  },

  // 7. AMBIENT TEXTURES
  textures: {
    ambientLagoon: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=80',
    underwaterLight: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80',
  },
};
