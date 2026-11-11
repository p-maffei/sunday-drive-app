import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

function DriveRequestForm() {
  const colors = useColors();
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(2);
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  function submitDriveRequest() {
    if (!start.trim()) {
      setHasError(true);
      setMessage('Add a starting place before continuing.');
      return;
    }

    Keyboard.dismiss();
    setHasError(false);
    setMessage(
      'Route discovery is coming in a later milestone. This screen is a preview for now.',
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function adjustDuration(amount: number) {
    setDuration((current) => Math.max(1, Math.min(6, current + amount)));
    void Haptics.selectionAsync();
  }

  const styles = StyleSheet.create({
    container: {
      gap: 19,
    },
    field: {
      gap: 8,
    },
    label: {
      color: colors.foreground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      letterSpacing: 1,
    },
    optional: {
      color: colors.mutedForeground,
      marginLeft: 'auto',
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
    inputFocused: {
      borderBottomColor: colors.primary,
    },
    durationRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    durationLabel: {
      color: colors.foreground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      letterSpacing: 1,
    },
    durationControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
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
    stepButtonDisabled: {
      opacity: 0.4,
    },
    durationValue: {
      minWidth: 68,
      color: colors.primary,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 18,
      textAlign: 'center',
    },
    button: {
      minHeight: 54,
      marginTop: 2,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: colors.radius,
      backgroundColor: colors.primary,
    },
    buttonPressed: {
      opacity: 0.82,
    },
    buttonText: {
      color: colors.primaryForeground,
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
    },
    footnote: {
      marginTop: -10,
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      lineHeight: 15,
    },
    message: {
      padding: 12,
      borderLeftWidth: 2,
      borderLeftColor: hasError ? colors.destructive : colors.accent,
      backgroundColor: colors.secondary,
      color: colors.secondaryForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      lineHeight: 19,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>01 / STARTING NEAR</Text>
        <TextInput
          value={start}
          onChangeText={(value) => {
            setStart(value);
            setMessage('');
            setHasError(false);
          }}
          placeholder="City, neighborhood, or zip"
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.label}>02 / HEADED TOWARD</Text>
          <Text style={[styles.label, styles.optional]}>OPTIONAL</Text>
        </View>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Somewhere on the horizon"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          accessibilityLabel="Optional destination"
          style={styles.input}
          testID="input-destination"
        />
      </View>

      <View style={styles.durationRow}>
        <Text style={styles.durationLabel}>03 / TIME TO WANDER</Text>
        <View style={styles.durationControls}>
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.buttonPressed,
              duration === 1 && styles.stepButtonDisabled,
            ]}
            onPress={() => adjustDuration(-1)}
            disabled={duration === 1}
            accessibilityRole="button"
            accessibilityLabel="Decrease driving duration"
            testID="button-duration-decrease"
          >
            <Feather name="minus" size={16} color={colors.foreground} />
          </Pressable>
          <Text style={styles.durationValue} testID="text-drive-duration">
            {duration} {duration === 1 ? 'hour' : 'hours'}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.buttonPressed,
              duration === 6 && styles.stepButtonDisabled,
            ]}
            onPress={() => adjustDuration(1)}
            disabled={duration === 6}
            accessibilityRole="button"
            accessibilityLabel="Increase driving duration"
            testID="button-duration-increase"
          >
            <Feather name="plus" size={16} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={submitDriveRequest}
        accessibilityRole="button"
        testID="button-find-drive"
      >
        <Text style={styles.buttonText}>Find My Drive</Text>
        <Feather
          name="arrow-up-right"
          size={19}
          color={colors.primaryForeground}
        />
      </Pressable>
      <Text style={styles.footnote}>
        No itinerary yet. Just a direction and a little daylight.
      </Text>
      {message ? (
        <Text
          style={styles.message}
          accessibilityRole={hasError ? 'alert' : 'summary'}
          accessibilityLiveRegion="polite"
          testID={hasError ? 'error-drive-form' : 'status-route-discovery'}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export default DriveRequestForm;
