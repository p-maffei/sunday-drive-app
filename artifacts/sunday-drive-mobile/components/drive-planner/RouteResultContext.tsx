import { createContext, useContext, useState, type ReactNode } from 'react';
import type { FeatureCollection, Geometry } from 'geojson';
import type { GeocodedLocation } from './types';

export type RouteBreakdown = Partial<
  Record<'curvy' | 'backroads' | 'urban', number>
>;

export interface RouteResult {
  geojson: FeatureCollection<Geometry>;
  distance_km: number;
  match_pct: number | null;
  breakdown: RouteBreakdown;
}

export interface GeneratedDrive {
  route: RouteResult;
  start: GeocodedLocation;
  end: GeocodedLocation;
}

interface RouteResultContextValue {
  generatedDrive: GeneratedDrive | null;
  setGeneratedDrive: (drive: GeneratedDrive | null) => void;
}

const RouteResultContext = createContext<RouteResultContextValue | null>(null);

export function RouteResultProvider({ children }: { children: ReactNode }) {
  const [generatedDrive, setGeneratedDrive] = useState<GeneratedDrive | null>(null);

  return (
    <RouteResultContext.Provider value={{ generatedDrive, setGeneratedDrive }}>
      {children}
    </RouteResultContext.Provider>
  );
}

export function useRouteResult() {
  const context = useContext(RouteResultContext);
  if (!context) {
    throw new Error('useRouteResult must be used inside RouteResultProvider.');
  }
  return context;
}
