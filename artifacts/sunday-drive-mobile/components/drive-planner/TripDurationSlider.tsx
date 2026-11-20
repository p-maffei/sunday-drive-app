import { useMemo, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  designTokens,
  displayFontFamily,
} from '@/constants/designTokens';

const MAX_EXTRA_MINUTES = 300;
const THUMB_SIZE = 22;

export function formatExtraTime(minutes: number): string {
  if (minutes === 0) return 'No detour';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `+${hours} h${remainingMinutes ? ` ${remainingMinutes} min` : ''}`;
  }
  return `+${remainingMinutes} min`;
}

interface TripDurationSliderProps {
  durationMinutes: number;
  onChange: (minutes: number) => void;
}

export default function TripDurationSlider({
  durationMinutes,
  onChange,
}: TripDurationSliderProps) {
  const [width, setWidth] = useState(0);
  const ratio = Math.max(
    0,
    Math.min(1, durationMinutes / MAX_EXTRA_MINUTES),
  );
  const usableWidth = Math.max(0, width - THUMB_SIZE);

  function setFromPosition(x: number) {
    if (usableWidth === 0) return;
    const clamped = Math.max(0, Math.min(usableWidth, x - THUMB_SIZE / 2));
    const minuteValue = (clamped / usableWidth) * MAX_EXTRA_MINUTES;
    onChange(Math.round(minuteValue / 15) * 15);
  }

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) =>
          setFromPosition(event.nativeEvent.locationX),
        onPanResponderMove: (event) =>
          setFromPosition(event.nativeEvent.locationX),
      }),
    [usableWidth, onChange],
  );

  const styles = StyleSheet.create({
    section: { gap: 10 },
    heading: {
      minHeight: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      color: designTokens.color.mutedForeground,
      fontFamily: displayFontFamily,
      fontSize: 10,
      letterSpacing: 1,
    },
    value: {
      color: designTokens.color.accent,
      fontFamily: displayFontFamily,
      fontSize: 13,
      textAlign: 'right',
    },
    touchArea: { height: 44, justifyContent: 'center' },
    track: {
      position: 'absolute',
      left: THUMB_SIZE / 2,
      right: THUMB_SIZE / 2,
      height: 4,
      borderRadius: 2,
      backgroundColor: designTokens.color.border,
    },
    activeTrack: {
      position: 'absolute',
      left: THUMB_SIZE / 2,
      height: 4,
      borderRadius: 2,
      backgroundColor: designTokens.color.accent,
    },
    thumb: {
      position: 'absolute',
      top: 11,
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderWidth: 3,
      borderColor: designTokens.color.accent,
      borderRadius: designTokens.radius.pill,
      backgroundColor: designTokens.color.background,
    },
    rangeLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rangeLabel: {
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 11,
    },
  });

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  function handleAccessibilityAction(event: {
    nativeEvent: { actionName: string };
  }) {
    if (event.nativeEvent.actionName === 'increment') {
      onChange(Math.min(MAX_EXTRA_MINUTES, durationMinutes + 15));
    } else if (event.nativeEvent.actionName === 'decrement') {
      onChange(Math.max(0, durationMinutes - 15));
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.label}>03 / EXTRA TIME TO WANDER</Text>
        <Text style={styles.value} testID="text-drive-duration">
          {formatExtraTime(durationMinutes)}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Extra time to wander"
        accessibilityValue={{
          min: 0,
          max: MAX_EXTRA_MINUTES,
          now: durationMinutes,
          text: formatExtraTime(durationMinutes),
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={handleAccessibilityAction}
        onLayout={handleLayout}
        style={styles.touchArea}
        testID="slider-drive-duration"
        {...responder.panHandlers}
      >
        <View style={styles.track} />
        <View
          style={[
            styles.activeTrack,
            { width: usableWidth * ratio },
          ]}
        />
        <View
          style={[
            styles.thumb,
            { left: usableWidth * ratio },
          ]}
        />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>0 min</Text>
        <Text style={styles.rangeLabel}>5 hours</Text>
      </View>
    </View>
  );
}

const interfaceFontFamily = designTokens.typography.interface;
