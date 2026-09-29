/**
 * Villa comparison and pricing calculation engine using real structured resort data
 */

import { veloraResort } from '../../data/resortConfig';
import { Villa } from '../../types';

export function compareVillas(villaId1: string, villaId2: string): string {
  const v1 = veloraResort.villas.find((v) => v.id === villaId1) || veloraResort.villas[0];
  const v2 = veloraResort.villas.find((v) => v.id === villaId2) || veloraResort.villas[1];

  const size1 = parseInt(v1.size.replace(/\D/g, ''), 10);
  const size2 = parseInt(v2.size.replace(/\D/g, ''), 10);

  const priceDiff = Math.abs(v1.pricePerNight - v2.pricePerNight);
  const cheaper = v1.pricePerNight < v2.pricePerNight ? v1 : v2;
  const pricier = v1.pricePerNight > v2.pricePerNight ? v1 : v2;

  let comparison = '';

  if (v1.pricePerNight === v2.pricePerNight) {
    comparison = `Both the ${v1.name} and ${v2.name} are offered at $${v1.pricePerNight.toLocaleString()} per night. `;
  } else {
    comparison = `Between the two, the ${cheaper.name} is the more accessible option at $${cheaper.pricePerNight.toLocaleString()} per night, compared to $${pricier.pricePerNight.toLocaleString()} for the ${pricier.name} ($${priceDiff.toLocaleString()}/night difference). `;
  }

  if (size1 !== size2) {
    const bigger = size1 > size2 ? v1 : v2;
    const smaller = size1 < size2 ? v1 : v2;
    comparison += `In terms of space, the ${bigger.name} offers ${bigger.size} compared to ${smaller.size} in the ${smaller.name}. `;
  }

  comparison += `For orientation, ${v1.name} features ${v1.orientation}, whereas ${v2.name} offers ${v2.orientation}.`;

  return comparison;
}

export function calculateCost(villaId: string, nights: number = 5): {
  villa: Villa;
  nights: number;
  perNight: number;
  total: number;
  summaryText: string;
} {
  const villa = veloraResort.villas.find((v) => v.id === villaId) || veloraResort.villas[0];
  const total = villa.pricePerNight * nights;

  return {
    villa,
    nights,
    perNight: villa.pricePerNight,
    total,
    summaryText: `For ${nights} nights in the ${villa.name}, the indicative concept rate is $${total.toLocaleString()} total ($${villa.pricePerNight.toLocaleString()} per night).`,
  };
}
