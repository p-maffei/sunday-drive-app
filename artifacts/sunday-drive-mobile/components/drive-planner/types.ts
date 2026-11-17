export const ROUTE_PREFERENCES = [
  { id: 'curvy', label: 'Curvy' },
  { id: 'backroads', label: 'Backroads' },
  { id: 'urban', label: 'Urban' },
] as const;

export type RoutePreference = (typeof ROUTE_PREFERENCES)[number]['id'];

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
