import { Feather } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  designTokens,
  displayFontFamily,
  interfaceFontFamily,
} from '@/constants/designTokens';
import LocationAutocompleteField from './LocationAutocompleteField';
import TripDurationSlider from './TripDurationSlider';
import type { GeocodedLocation } from './types';

interface TripBasicsSectionProps {
  start: string;
  destination: string;
  roundTrip: boolean;
  anywhere: boolean;
  durationMinutes: number;
  startLocation: GeocodedLocation | null;
  destinationLocation: GeocodedLocation | null;
  onStartChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onStartSelect: (location: GeocodedLocation) => void;
  onDestinationSelect: (location: GeocodedLocation) => void;
  onRoundTripChange: (value: boolean) => void;
  onAnywhereChange: (value: boolean) => void;
  onDurationChange: (value: number) => void;
}

export default function TripBasicsSection({
  start,
  destination,
  roundTrip,
  anywhere,
  durationMinutes,
  startLocation,
  destinationLocation,
  onStartChange,
  onDestinationChange,
  onStartSelect,
  onDestinationSelect,
  onRoundTripChange,
  onAnywhereChange,
  onDurationChange,
}: TripBasicsSectionProps) {
  const styles = StyleSheet.create({
    section: { gap: 18 },
    label: {
      color: designTokens.color.mutedForeground,
      fontFamily: displayFontFamily,
      fontSize: 10,
      letterSpacing: 1,
    },
    helper: {
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 12,
      lineHeight: 17,
      flexShrink: 1,
      textAlign: 'right',
    },
    toggles: { gap: 10, paddingTop: 2 },
    toggle: {
      minHeight: 46,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.darkSurface,
    },
    toggleSelected: {
      borderColor: designTokens.color.accent,
      backgroundColor: designTokens.color.accent,
    },
    toggleLabel: {
      flex: 1,
      flexShrink: 1,
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  function renderToggleRow({
    label,
    detail,
    checked,
    onPress,
    testID,
  }: {
    label: string;
    detail: string;
    checked: boolean;
    onPress: () => void;
    testID: string;
  }) {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onPress}
        style={[styles.toggle, checked && styles.toggleSelected]}
        testID={testID}
      >
        <Feather
          name={checked ? 'check-square' : 'square'}
          size={18}
          color={
            checked
              ? designTokens.color.accentForeground
              : designTokens.color.mutedForeground
          }
        />
        <Text
          style={[
            styles.toggleLabel,
            checked && { color: designTokens.color.accentForeground },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.helper,
            checked && { color: designTokens.color.accentForeground },
          ]}
        >
          {detail}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.section}>
      <LocationAutocompleteField
        label="01 / STARTING NEAR"
        value={start}
        placeholder="City, neighborhood, or ZIP"
        accessibilityLabel="Starting location"
        returnKeyType="next"
        selectedLocation={startLocation}
        testID="input-start-location"
        onChangeText={onStartChange}
        onSelect={onStartSelect}
      />

      <LocationAutocompleteField
        label="02 / HEADED TOWARD · OPTIONAL"
        value={destination}
        placeholder={anywhere ? 'We’ll choose a destination' : 'Somewhere on the horizon'}
        accessibilityLabel="Optional destination"
        testID="input-destination"
        disabled={anywhere}
        selectedLocation={destinationLocation}
        onChangeText={onDestinationChange}
        onSelect={onDestinationSelect}
      />

      <View style={styles.toggles}>
        {renderToggleRow({
          label: 'Round trip',
          detail: 'Return to your start',
          checked: roundTrip,
          onPress: () => onRoundTripChange(!roundTrip),
          testID: 'toggle-round-trip',
        })}
        {renderToggleRow({
          label: 'I’ll Go Anywhere',
          detail: 'Choose a destination for me',
          checked: anywhere,
          onPress: () => onAnywhereChange(!anywhere),
          testID: 'toggle-anywhere',
        })}
      </View>

      <TripDurationSlider
        durationMinutes={durationMinutes}
        onChange={onDurationChange}
      />
    </View>
  );
}
