import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useColors } from '@/hooks/useColors';
import {
  INITIAL_MAP_ZOOM,
  MAP_STYLE_URL,
  SOUTHERN_CALIFORNIA_CENTER,
} from '@/constants/map';

export default function InteractiveMap() {
  const colors = useColors();
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState(false);

  const styles = StyleSheet.create({
    container: {
      height: 250,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      backgroundColor: colors.secondary,
    },
    errorMessage: {
      position: 'absolute',
      right: 12,
      bottom: 12,
      left: 12,
      padding: 10,
      backgroundColor: colors.background,
      color: colors.foreground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
    },
  });

  useEffect(() => {
    if (!mapElement.current) return;

    // Expo's browser bundler does not emit MapLibre's worker file next to the
    // app bundle, so this preview loads the matching pinned worker from CDN.
    setWorkerUrl(
      'https://unpkg.com/maplibre-gl@6.17.0/dist/maplibre-gl-worker.mjs',
    );

    const map = new MapLibreMap({
      container: mapElement.current,
      style: MAP_STYLE_URL,
      center: SOUTHERN_CALIFORNIA_CENTER,
      zoom: INITIAL_MAP_ZOOM,
    });

    map.addControl(new NavigationControl(), 'top-right');
    map.on('error', () => setMapError(true));
    map.on('load', () => setMapError(false));

    // MapLibre creates browser event listeners and WebGL resources. Removing
    // the map here cleans them up when this screen is closed or reloaded.
    return () => map.remove();
  }, []);

  return (
    <View
      style={styles.container}
      accessibilityLabel="Interactive map of Southern California"
      testID="interactive-map"
    >
      <div
        ref={mapElement}
        style={{ position: 'absolute', inset: 0 }}
        aria-label="Map of Southern California"
      />
      {mapError ? (
        <Text style={styles.errorMessage} accessibilityRole="alert">
          The map could not load. Check your connection and try again.
        </Text>
      ) : null}
    </View>
  );
}
