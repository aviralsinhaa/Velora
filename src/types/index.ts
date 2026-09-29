export interface ResortMedia {
  url: string;
  alt: string;
  caption?: string;
  photographer?: string;
}

export interface Villa {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  category: 'overwater' | 'beach' | 'residence';
  size: string;
  guests: string;
  bedrooms: string;
  pricePerNight: number;
  featuredImage: string;
  gallery: string[];
  panoramaSceneId?: string;
  tagline: string;
  description: string;
  highlights: string[];
  amenities: string[];
  orientation: string;
  architecturalDetails: string[];
}

export interface DiningVenue {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  setting: string;
  hours: string;
  image: string;
  description: string;
  signatureDish: string;
  chefQuote: string;
  dressCode: string;
  menuHighlights?: string[];
}

export interface Experience {
  id: string;
  title: string;
  category: 'ocean' | 'private' | 'wellness' | 'culinary';
  duration: string;
  privacy: 'Private' | 'Intimate Shared' | 'Bespoke';
  image: string;
  description: string;
  timing: string;
  bestTimeOfDay: 'morning' | 'afternoon' | 'sunset' | 'evening';
}

export interface DayMoment {
  time: string;
  title: string;
  subtitle: string;
  quote: string;
  image: string;
  atmosphere: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'dusk' | 'night';
  details: string;
}

export interface IslandHotspot {
  id: string;
  title: string;
  category: string;
  x: number; // percentage on map (0 - 100)
  y: number; // percentage on map (0 - 100)
  description: string;
  image: string;
  actionText: string;
  targetSection?: string;
  panoramaSceneId?: string;
}

export interface PanoramaScene {
  id: string;
  title: string;
  locationName: string;
  image: string;
  description: string;
  hotspots: {
    id: string;
    label: string;
    phi: number; // polar angle
    theta: number; // azimuthal angle
    description: string;
  }[];
}

export interface Offer {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  duration: string;
  inclusions: string[];
  image: string;
  idealFor: string;
}

export interface ResortConfig {
  slug: string;
  brandName: string;
  shortName: string;
  tagline: string;
  editorialSubhead: string;
  location: string;
  atoll: string;
  country: string;
  coordinates: {
    lat: string;
    lng: string;
    display: string;
  };
  contact: {
    email: string;
    phone: string;
    conciergeEmail: string;
    address: string;
  };
  currency: {
    code: string;
    symbol: string;
  };
  hero: {
    backgroundImage: string;
    badge: string;
    title: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  islandIntro: {
    headline: string;
    editorialQuote: string;
    narrative: string[];
    stats: { label: string; value: string }[];
    aerialImage: string;
    detailImage: string;
  };
  villas: Villa[];
  dining: DiningVenue[];
  experiences: Experience[];
  dayTimeline: DayMoment[];
  islandHotspots: IslandHotspot[];
  panoramaScenes: PanoramaScene[];
  offers: Offer[];
  wellness: {
    headline: string;
    subheadline: string;
    description: string;
    rituals: { id: string; title: string; duration: string; focus: string; description: string }[];
    images: string[];
  };
  destination: {
    title: string;
    summary: string;
    transferDetails: {
      type: string;
      duration: string;
      description: string;
    }[];
    coordinatesNote: string;
  };
  gallery: {
    id: string;
    title: string;
    category: 'island' | 'villas' | 'ocean' | 'dining' | 'wellness';
    image: string;
    aspectRatio: 'portrait' | 'landscape' | 'square';
  }[];
  reviews: {
    quote: string;
    guest: string;
    origin: string;
    villaStayed: string;
  }[];
}
