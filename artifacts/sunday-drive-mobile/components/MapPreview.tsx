import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

function MapPreview() {
  const colors = useColors();
  const [zoomLevel, setZoomLevel] = useState(0);
  const zoomScale = 1 + zoomLevel * 0.08;

  function changeZoom(amount: number) {
    setZoomLevel((current) => Math.max(0, Math.min(4, current + amount)));
  }

  const styles = StyleSheet.create({
    card: {
      height: 250,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      backgroundColor: colors.secondary,
    },
    drawing: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      transform: [{ scale: zoomScale }],
    },
    gridLine: {
      position: 'absolute',
      backgroundColor: colors.foreground,
      opacity: 0.06,
    },
    label: {
      position: 'absolute',
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
      letterSpacing: 1.3,
    },
    mountainLabel: {
      top: 54,
      right: 18,
      textAlign: 'right',
    },
    oceanLabel: {
      top: 137,
      left: 16,
      color: colors.primary,
      transform: [{ rotate: '-68deg' }],
    },
    cityLabel: {
      top: 142,
      left: '49%',
      color: colors.foreground,
    },
    roadLabel: {
      top: 165,
      left: '46%',
      color: colors.accent,
      transform: [{ rotate: '-24deg' }],
    },
    pin: {
      position: 'absolute',
      top: 166,
      left: '58%',
      width: 10,
      height: 10,
      borderWidth: 2,
      borderColor: colors.background,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    controls: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      gap: 4,
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 5,
      backgroundColor: colors.background,
    },
    controlButton: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlDisabled: {
      opacity: 0.35,
    },
    north: {
      position: 'absolute',
      top: 14,
      right: 16,
      alignItems: 'center',
      gap: 2,
    },
    northText: {
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
    },
    caption: {
      position: 'absolute',
      bottom: 13,
      left: 14,
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
      letterSpacing: 1,
    },
    scale: {
      position: 'absolute',
      right: 14,
      bottom: 13,
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
      letterSpacing: 1,
    },
  });

  return (
    <View
      style={styles.card}
      accessibilityLabel="Illustrated map preview of Southern California"
      testID="map-preview"
    >
      <View style={styles.drawing} pointerEvents="none">
        <View style={[styles.gridLine, { top: '25%', left: 0, right: 0, height: 1 }]} />
        <View style={[styles.gridLine, { top: '50%', left: 0, right: 0, height: 1 }]} />
        <View style={[styles.gridLine, { top: '75%', left: 0, right: 0, height: 1 }]} />
        <View style={[styles.gridLine, { left: '25%', top: 0, bottom: 0, width: 1 }]} />
        <View style={[styles.gridLine, { left: '50%', top: 0, bottom: 0, width: 1 }]} />
        <View style={[styles.gridLine, { left: '75%', top: 0, bottom: 0, width: 1 }]} />
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
        >
          <Path
            d="M275 14 C340 22 379 62 360 100 C342 135 298 138 282 170 C265 204 297 225 322 254"
            fill="none"
            stroke={colors.mutedForeground}
            strokeOpacity={0.17}
            strokeWidth={1}
          />
          <Path
            d="M258 7 C326 10 391 53 374 102 C357 152 307 151 296 184 C287 213 311 236 342 260"
            fill="none"
            stroke={colors.mutedForeground}
            strokeOpacity={0.14}
            strokeWidth={1}
          />
          <Path
            d="M0 76 C48 104 52 139 80 163 C106 185 105 218 135 250"
            fill="none"
            stroke={colors.primary}
            strokeOpacity={0.28}
            strokeWidth={2}
          />
          <Path
            d="M12 238 C62 202 91 154 129 158 C167 163 185 205 222 184 C260 162 258 115 298 91 C332 70 356 50 390 20"
            fill="none"
            stroke={colors.background}
            strokeWidth={10}
          />
          <Path
            d="M12 238 C62 202 91 154 129 158 C167 163 185 205 222 184 C260 162 258 115 298 91 C332 70 356 50 390 20"
            fill="none"
            stroke={colors.accent}
            strokeWidth={2.5}
          />
          <Circle cx="230" cy="178" r="5" fill={colors.primary} />
          <Circle cx="230" cy="178" r="2" fill={colors.background} />
        </Svg>
        <Text style={[styles.label, styles.mountainLabel]}>
          SAN GABRIEL{'\n'}MOUNTAINS
        </Text>
        <Text style={[styles.label, styles.oceanLabel]}>PACIFIC OCEAN</Text>
        <Text style={[styles.label, styles.cityLabel]}>PASADENA</Text>
        <Text style={[styles.label, styles.roadLabel]}>ANGELES CREST HWY</Text>
        <View style={styles.pin} />
      </View>

      <View style={styles.controls} accessibilityLabel="Map preview zoom">
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            pressed && { opacity: 0.65 },
            zoomLevel === 4 && styles.controlDisabled,
          ]}
          onPress={() => changeZoom(1)}
          disabled={zoomLevel === 4}
          accessibilityRole="button"
          accessibilityLabel="Zoom in on map preview"
          testID="button-map-zoom-in"
        >
          <Feather name="plus" size={17} color={colors.foreground} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            pressed && { opacity: 0.65 },
            zoomLevel === 0 && styles.controlDisabled,
          ]}
          onPress={() => changeZoom(-1)}
          disabled={zoomLevel === 0}
          accessibilityRole="button"
          accessibilityLabel="Zoom out on map preview"
          testID="button-map-zoom-out"
        >
          <Feather name="minus" size={17} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.north} pointerEvents="none">
        <Text style={styles.northText}>N</Text>
        <Feather name="arrow-up-right" size={13} color={colors.mutedForeground} />
      </View>
      <Text style={styles.caption} pointerEvents="none">
        A PLACE TO BEGIN
      </Text>
      <Text style={styles.scale} pointerEvents="none">
        MAP PREVIEW
      </Text>
    </View>
  );
}

export default MapPreview;
