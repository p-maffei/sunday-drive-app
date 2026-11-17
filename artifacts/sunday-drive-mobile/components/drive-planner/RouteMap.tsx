import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
} from '@maplibre/maplibre-react-native';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { designTokens } from '@/constants/designTokens';
import type { GeocodedLocation } from './types';
import type { RouteResult } from './RouteResultContext';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function getRouteBounds(geojson: RouteResult['geojson']): [number, number, number, number] {
  const coordinates: number[][] = [];
  const collect = (value: unknown) => {
    if (!Array.isArray(value)) return;
    if (
      value.length >= 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    ) {
      coordinates.push(value);
      return;
    }
    value.forEach(collect);
  };

  const collectGeometry = (geometry: Geometry) => {
    if (geometry.type === 'GeometryCollection') {
      geometry.geometries.forEach(collectGeometry);
    } else {
      collect(geometry.coordinates);
    }
  };
  geojson.features.forEach((feature) => {
    if (feature.geometry) collectGeometry(feature.geometry);
  });

  if (!coordinates.length) {
    throw new Error('The route did not include usable map coordinates.');
  }

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  let west = Math.min(...longitudes);
  let east = Math.max(...longitudes);
  let south = Math.min(...latitudes);
  let north = Math.max(...latitudes);

  // A tiny buffer keeps a point-like route visible when start and end overlap.
  if (west === east) [west, east] = [west - 0.01, east + 0.01];
  if (south === north) [south, north] = [south - 0.01, north + 0.01];
  return [west, south, east, north];
}

export default function RouteMap({
  route,
  start,
  end,
}: {
  route: RouteResult;
  start: GeocodedLocation;
  end: GeocodedLocation;
}) {
  const bounds = useMemo(() => getRouteBounds(route.geojson), [route.geojson]);
  const endpoints = useMemo<FeatureCollection<Geometry>>(
    () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { label: 'Start', kind: 'start' },
          geometry: {
            type: 'Point',
            coordinates: [start.longitude, start.latitude],
          },
        },
        {
          type: 'Feature',
          properties: { label: 'End', kind: 'end' },
          geometry: {
            type: 'Point',
            coordinates: [end.longitude, end.latitude],
          },
        },
      ],
    }),
    [end.latitude, end.longitude, start.latitude, start.longitude],
  );

  return (
    <View style={styles.frame} testID="map-route">
      <Map style={styles.map} mapStyle={OPENFREEMAP_STYLE}>
        <Camera
          initialViewState={{
            bounds,
            padding: { top: 48, right: 36, bottom: 48, left: 36 },
          }}
          testID="camera-route-bounds"
        />
        <GeoJSONSource id="generated-route" data={route.geojson}>
          <Layer
            id="generated-route-line"
            type="line"
            paint={{
              'line-color': designTokens.color.accent,
              'line-width': 6,
              'line-opacity': 0.95,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        </GeoJSONSource>
        <GeoJSONSource id="route-endpoints" data={endpoints}>
          <Layer
            id="route-endpoint-circles"
            type="circle"
            paint={{
              'circle-color': [
                'match',
                ['get', 'kind'],
                'start',
                '#202322',
                '#C64B3F',
              ],
              'circle-radius': 8,
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 2,
            }}
          />
        </GeoJSONSource>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 360,
    overflow: 'hidden',
    borderRadius: designTokens.radius.medium,
    borderWidth: 1,
    borderColor: designTokens.color.border,
  },
  map: { flex: 1 },
});
