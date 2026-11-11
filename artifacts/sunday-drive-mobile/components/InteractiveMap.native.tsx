import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useColors } from '@/hooks/useColors';
import {
  INITIAL_MAP_ZOOM,
  MAP_STYLE_URL,
  SOUTHERN_CALIFORNIA_CENTER,
} from '@/constants/map';

export default function InteractiveMap() {
  const colors = useColors();
  const [mapError, setMapError] = useState(false);

  const styles = StyleSheet.create({
    container: {
      height: 250,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      backgroundColor: colors.secondary,
    },
    map: {
      flex: 1,
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

  return (
    <View
      style={styles.container}
      accessibilityLabel="Interactive map of Southern California"
      testID="interactive-map"
    >
      <Map
        mapStyle={MAP_STYLE_URL}
        style={styles.map}
        attribution
        attributionPosition={{ bottom: 8, right: 8 }}
        compass
        compassPosition={{ top: 12, right: 12 }}
        scaleBar
        scaleBarPosition={{ bottom: 12, left: 12 }}
        tintColor={colors.primary}
        onDidFailLoadingMap={() => setMapError(true)}
        onDidFinishLoadingMap={() => setMapError(false)}
      >
        <Camera
          initialViewState={{
            center: SOUTHERN_CALIFORNIA_CENTER,
            zoom: INITIAL_MAP_ZOOM,
          }}
        />
      </Map>
      {mapError ? (
        <Text style={styles.errorMessage} accessibilityRole="alert">
          The map could not load. Check your connection and try again.
        </Text>
      ) : null}
    </View>
  );
}
