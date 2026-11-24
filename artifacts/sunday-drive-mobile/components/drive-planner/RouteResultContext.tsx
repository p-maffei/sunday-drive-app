import { createContext, useContext, useState, type ReactNode } from 'react';
import type { FeatureCollection, Geometry } from 'geojson';
import type { GeocodedLocation } from './types';

export type RouteBreakdown = Partial<
  Record<'curvy' | 'backroads' | 'urban', number>
>;

export interface RouteResult {
  geojson: FeatureCollection<Geometry>;
  distance_km: number;
  duration_min?: number;
  match_pct: number | null;
  breakdown: RouteBreakdown;
}

export interface WanderWaypoint {
  lon: number;
  lat: number;
}

export interface WanderOption extends RouteResult {
  rank: number;
  waypoint: WanderWaypoint | null;
  edge_ids?: Array<string | number> | null;
  extra_min: number;
  fun_km: number;
  reused_km: number;
}

export interface FastestRoute extends Omit<RouteResult, 'geojson'> {
  duration_min: number;
  geojson?: RouteResult['geojson'];
}

export interface GeneratedDrive {
  fastest: FastestRoute;
  extra_min: number;
  budget_min: number;
  style: string[];
  style_defaulted: boolean;
  note: string | null;
  options: WanderOption[];
  selectedOptionRank: number;
  start: GeocodedLocation;
  end: GeocodedLocation;
}

interface RouteResultContextValue {
  generatedDrive: GeneratedDrive | null;
  setGeneratedDrive: (drive: GeneratedDrive | null) => void;
  selectWanderOption: (rank: number) => void;
}

const RouteResultContext = createContext<RouteResultContextValue | null>(null);

export function RouteResultProvider({ children }: { children: ReactNode }) {
  const [generatedDrive, setGeneratedDrive] = useState<GeneratedDrive | null>(null);
  const selectWanderOption = (rank: number) => {
    setGeneratedDrive((current) =>
      current?.options.some((option) => option.rank === rank)
        ? { ...current, selectedOptionRank: rank }
        : current,
    );
  };

  return (
    <RouteResultContext.Provider
      value={{ generatedDrive, setGeneratedDrive, selectWanderOption }}
    >
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
