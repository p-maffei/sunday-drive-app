// MapLibre renders the map; OpenFreeMap supplies the real vector tiles.
// The public style works without an API key and includes source attribution.
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// This is only the initial camera view, not a user location or a route point.
// Coordinates use [longitude, latitude], the order expected by MapLibre.
export const SOUTHERN_CALIFORNIA_CENTER: [number, number] = [
  -118.2437, 34.0522,
];

export const INITIAL_MAP_ZOOM = 7.5;
