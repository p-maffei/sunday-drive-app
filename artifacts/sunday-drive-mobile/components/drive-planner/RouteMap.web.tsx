import { useEffect, useRef } from 'react';
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  Popup,
  getVersion,
  setWorkerUrl,
  type GeoJSONSource,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Geometry } from 'geojson';
import type { GeocodedLocation } from './types';
import type { RouteResult } from './RouteResultContext';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const ROUTE_SOURCE_ID = 'generated-route';
const ROUTE_LAYER_ID = 'generated-route-line';

setWorkerUrl(
  `https://unpkg.com/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
);

type RouteMapProps = {
  route: RouteResult;
  start: GeocodedLocation;
  end: GeocodedLocation;
};

function extendBounds(bounds: LngLatBounds, value: unknown) {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    bounds.extend([value[0], value[1]]);
    return;
  }
  value.forEach((item) => extendBounds(bounds, item));
}

function collectGeometryBounds(
  bounds: LngLatBounds,
  geometry: Geometry,
) {
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach((child) => collectGeometryBounds(bounds, child));
  } else {
    extendBounds(bounds, geometry.coordinates);
  }
}

function updateMap(
  map: MapLibreMap,
  route: RouteResult,
  start: GeocodedLocation,
  end: GeocodedLocation,
  markers: Marker[],
) {
  const source = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource | undefined;
  if (source) {
    source.setData(route.geojson);
  } else {
    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: route.geojson,
    });
  }

  if (!map.getLayer(ROUTE_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#C64B3F',
        'line-width': 6,
        'line-opacity': 0.95,
      },
    });
  }

  markers.forEach((marker) => marker.remove());
  markers.splice(0, markers.length);
  markers.push(
    new Marker({ color: '#202322' })
      .setLngLat([start.longitude, start.latitude])
      .setPopup(new Popup({ offset: 18 }).setText('Start'))
      .addTo(map),
    new Marker({ color: '#C64B3F' })
      .setLngLat([end.longitude, end.latitude])
      .setPopup(new Popup({ offset: 18 }).setText('End'))
      .addTo(map),
  );

  const bounds = new LngLatBounds();
  route.geojson.features.forEach((feature) => {
    if (feature.geometry) collectGeometryBounds(bounds, feature.geometry);
  });
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 48, right: 40, bottom: 48, left: 40 },
      maxZoom: 15,
      duration: 0,
    });
  }
}

export default function RouteMap({ route, start, end }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const latestPropsRef = useRef({ route, start, end });
  latestPropsRef.current = { route, start, end };

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [start.longitude, start.latitude],
      zoom: 9,
    });
    mapRef.current = map;

    map.once('load', () => {
      const latest = latestPropsRef.current;
      updateMap(map, latest.route, latest.start, latest.end, markersRef.current);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) {
      updateMap(map, route, start, end, markersRef.current);
    }
  }, [route, start, end]);

  return (
    <div
      ref={containerRef}
      data-testid="map-route-web"
      aria-label="Interactive route map"
      style={{
        width: '100%',
        height: 360,
        border: '1px solid #3D4240',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    />
  );
}
