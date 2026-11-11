import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import RoutePreferencesSection from './RoutePreferencesSection';
import ScoreExplanation from './ScoreExplanation';
import TripBasicsSection from './TripBasicsSection';
import VehicleProfileSection from './VehicleProfileSection';
import type { RoutePreference, Vehicle, VehicleDraft } from './types';

const EMPTY_VEHICLE_DRAFT: VehicleDraft = {
  year: '',
  make: '',
  model: '',
  trim: '',
  nickname: '',
};

export default function DrivePlannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [roundTrip, setRoundTrip] = useState(false);
  const [anywhere, setAnywhere] = useState(false);
  const [duration, setDuration] = useState(2);
  const [preferences, setPreferences] = useState<RoutePreference[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleDraft, setVehicleDraft] =
    useState<VehicleDraft>(EMPTY_VEHICLE_DRAFT);
  const [vehicleError, setVehicleError] = useState('');
  const [formError, setFormError] = useState('');

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: 22,
      paddingTop: insets.top + 12,
      paddingBottom: insets.bottom + 32,
    },
    header: {
      minHeight: 42,
      marginBottom: 28,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandIcon: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
    },
    brandName: {
      color: colors.foreground,
      fontFamily: 'DMSans_700Bold',
      fontSize: 12,
      letterSpacing: 1.7,
    },
    brandSubtitle: {
      marginTop: 3,
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
      letterSpacing: 1,
    },
    eyebrow: {
      marginBottom: 10,
      color: colors.primary,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      letterSpacing: 1.2,
    },
    title: {
      marginBottom: 9,
      color: colors.foreground,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 36,
      lineHeight: 43,
    },
    intro: {
      marginBottom: 25,
      color: colors.mutedForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      lineHeight: 21,
    },
    section: {
      marginTop: 24,
      paddingTop: 21,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 15,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      color: colors.foreground,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 22,
    },
    sectionIndex: {
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
      letterSpacing: 0.8,
    },
    error: {
      padding: 12,
      borderLeftWidth: 2,
      borderLeftColor: colors.destructive,
      backgroundColor: colors.secondary,
      color: colors.secondaryForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      lineHeight: 19,
    },
    submit: {
      minHeight: 54,
      marginTop: 24,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: colors.radius,
      backgroundColor: colors.primary,
    },
    submitPressed: { opacity: 0.82 },
    submitText: {
      color: colors.primaryForeground,
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
    },
    footer: {
      marginTop: 12,
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      lineHeight: 15,
      textAlign: 'center',
    },
  });

  function togglePreference(preference: RoutePreference) {
    setPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference],
    );
  }

  function updateVehicleDraft(field: keyof VehicleDraft, value: string) {
    setVehicleDraft((current) => ({ ...current, [field]: value }));
    setVehicleError('');
  }

  function addVehicle() {
    const year = Number(vehicleDraft.year);
    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(year) ||
      year < 1886 ||
      year > currentYear ||
      !vehicleDraft.make.trim() ||
      !vehicleDraft.model.trim()
    ) {
      setVehicleError('Enter a valid year, make, and model.');
      return;
    }

    const vehicle: Vehicle = {
      id: `${Date.now()}`,
      ...vehicleDraft,
      year: String(year),
      make: vehicleDraft.make.trim(),
      model: vehicleDraft.model.trim(),
      trim: vehicleDraft.trim.trim(),
      nickname: vehicleDraft.nickname.trim(),
    };

    setVehicles((current) => [...current, vehicle]);
    setSelectedVehicleId(vehicle.id);
    setVehicleDraft(EMPTY_VEHICLE_DRAFT);
    setVehicleError('');
  }

  function submitDrive() {
    if (!start.trim()) {
      setFormError('Add a starting location to continue.');
      return;
    }

    Keyboard.dismiss();
    setFormError('');
    router.push('/discovery');
  }

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollViewCompat
        style={styles.screen}
        contentContainerStyle={styles.content}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.brandIcon}>
            <Feather name="navigation" size={17} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.brandName}>SUNDAY DRIVE</Text>
            <Text style={styles.brandSubtitle}>SOUTHERN CALIFORNIA, BY ROAD</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>A BETTER KIND OF DETOUR</Text>
        <Text style={styles.title}>Plan a drive.</Text>
        <Text style={styles.intro}>
          Set the kind of day you want on the road. We’ll use your choices to
          shape route discovery in a future step.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trip basics</Text>
            <Text style={styles.sectionIndex}>01 / WHERE & WHEN</Text>
          </View>
          <TripBasicsSection
            start={start}
            destination={destination}
            roundTrip={roundTrip}
            anywhere={anywhere}
            duration={duration}
            onStartChange={(value) => {
              setStart(value);
              setFormError('');
            }}
            onDestinationChange={setDestination}
            onRoundTripChange={setRoundTrip}
            onAnywhereChange={(value) => {
              setAnywhere(value);
              if (value) setDestination('');
            }}
            onDurationChange={setDuration}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Road preferences</Text>
            <Text style={styles.sectionIndex}>02 / PICK ANY</Text>
          </View>
          <RoutePreferencesSection
            selected={preferences}
            onToggle={togglePreference}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Drivability score</Text>
            <Text style={styles.sectionIndex}>03 / WHAT IT MEANS</Text>
          </View>
          <ScoreExplanation />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your vehicle</Text>
            <Text style={styles.sectionIndex}>04 / OPTIONAL</Text>
          </View>
          <VehicleProfileSection
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            draft={vehicleDraft}
            error={vehicleError}
            onSelect={setSelectedVehicleId}
            onDraftChange={updateVehicleDraft}
            onAdd={addVehicle}
          />
        </View>

        {formError ? (
          <Text style={styles.error} accessibilityRole="alert" testID="error-drive-form">
            {formError}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={submitDrive}
          style={({ pressed }) => [
            styles.submit,
            pressed && styles.submitPressed,
          ]}
          testID="button-find-drive"
        >
          <Text style={styles.submitText}>Find My Drive</Text>
          <Feather
            name="arrow-up-right"
            size={19}
            color={colors.primaryForeground}
          />
        </Pressable>
        <Text style={styles.footer}>
          Your choices stay on this screen for now. No route is generated yet.
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}
