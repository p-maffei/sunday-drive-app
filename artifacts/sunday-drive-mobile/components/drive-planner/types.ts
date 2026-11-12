export const ROUTE_PREFERENCES = [
  'Scenic roads',
  'Curvy / winding roads',
  'Urban cruising',
  'Lower average traffic',
  'Backroads',
  'Coastal roads',
  'Mountain / canyon roads',
  'Historic roads',
  'Interesting roads in general',
] as const;

export type RoutePreference = (typeof ROUTE_PREFERENCES)[number];

export interface GeocodedLocation {
  id: string;
  label: string;
  title: string;
  context: string;
  latitude: number;
  longitude: number;
}

export interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  nickname: string;
}

export type VehicleDraft = Omit<Vehicle, 'id'>;
