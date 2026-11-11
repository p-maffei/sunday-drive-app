import { Feather } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

interface TripBasicsSectionProps {
  start: string;
  destination: string;
  roundTrip: boolean;
  anywhere: boolean;
  duration: number;
  onStartChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onRoundTripChange: (value: boolean) => void;
  onAnywhereChange: (value: boolean) => void;
  onDurationChange: (value: number) => void;
}

export default function TripBasicsSection({
  start,
  destination,
  roundTrip,
  anywhere,
  duration,
  onStartChange,
  onDestinationChange,
  onRoundTripChange,
  onAnywhereChange,
  onDurationChange,
}: TripBasicsSectionProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    section: { gap: 18 },
    field: { gap: 7 },
    label: {
      color: colors.foreground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      letterSpacing: 1,
    },
    input: {
      minHeight: 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 2,
      color: colors.foreground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 15,
    },
    inputDisabled: { opacity: 0.45 },
    helper: {
      color: colors.mutedForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      lineHeight: 17,
    },
    toggles: { gap: 10, paddingTop: 2 },
    toggle: {
      minHeight: 46,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
    },
    toggleSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    toggleLabel: {
      flex: 1,
      color: colors.foreground,
      fontFamily: 'DMSans_500Medium',
      fontSize: 14,
    },
    durationRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    durationControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    stepButton: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
    },
    disabledButton: { opacity: 0.4 },
    durationValue: {
      minWidth: 62,
      color: colors.primary,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 18,
      textAlign: 'center',
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
          color={checked ? colors.primary : colors.mutedForeground}
        />
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.helper}>{detail}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.field}>
        <Text style={styles.label}>01 / STARTING NEAR</Text>
        <TextInput
          value={start}
          onChangeText={onStartChange}
          placeholder="City, neighborhood, or ZIP"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          accessibilityLabel="Starting location"
          style={styles.input}
          testID="input-start-location"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>02 / HEADED TOWARD · OPTIONAL</Text>
        <TextInput
          value={destination}
          onChangeText={onDestinationChange}
          placeholder={anywhere ? 'We’ll choose a destination' : 'Somewhere on the horizon'}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          editable={!anywhere}
          accessibilityLabel="Optional destination"
          style={[styles.input, anywhere && styles.inputDisabled]}
          testID="input-destination"
        />
      </View>

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

      <View style={styles.durationRow}>
        <Text style={styles.label}>03 / TIME TO WANDER</Text>
        <View style={styles.durationControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease driving duration"
            disabled={duration <= 1}
            onPress={() => onDurationChange(duration - 1)}
            style={[styles.stepButton, duration <= 1 && styles.disabledButton]}
            testID="button-duration-decrease"
          >
            <Feather name="minus" size={16} color={colors.foreground} />
          </Pressable>
          <Text style={styles.durationValue} testID="text-drive-duration">
            {duration} {duration === 1 ? 'hour' : 'hours'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase driving duration"
            disabled={duration >= 6}
            onPress={() => onDurationChange(duration + 1)}
            style={[styles.stepButton, duration >= 6 && styles.disabledButton]}
            testID="button-duration-increase"
          >
            <Feather name="plus" size={16} color={colors.foreground} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
