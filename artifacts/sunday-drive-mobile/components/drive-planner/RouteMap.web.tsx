import { StyleSheet, Text, View } from 'react-native';
import { designTokens, interfaceFontFamily } from '@/constants/designTokens';
import type { GeocodedLocation } from './types';
import type { RouteResult } from './RouteResultContext';

export default function RouteMap({
  route: _route,
  start: _start,
  end: _end,
}: {
  route: RouteResult;
  start: GeocodedLocation;
  end: GeocodedLocation;
}) {
  return (
    <View style={styles.notice} testID="map-route-web-notice">
      <Text style={styles.text}>
        The interactive MapLibre map is available in the iOS and Android app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    minHeight: 120,
    padding: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: designTokens.color.border,
    borderRadius: designTokens.radius.medium,
    backgroundColor: designTokens.color.darkSurface,
  },
  text: {
    color: designTokens.color.mutedForeground,
    fontFamily: interfaceFontFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
