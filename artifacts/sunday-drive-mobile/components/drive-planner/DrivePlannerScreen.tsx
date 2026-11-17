import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Michroma_400Regular, useFonts } from '@expo-google-fonts/michroma';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { designTokens } from '@/constants/designTokens';
import { theme } from '@/constants/theme';
import RoutePreferencesSection from './RoutePreferencesSection';
import { useRouteResult, type RouteResult } from './RouteResultContext';
import ScoreExplanation from './ScoreExplanation';
import TripBasicsSection from './TripBasicsSection';
import VehicleProfileSection from './VehicleProfileSection';
import type {
  GeocodedLocation,
  RoutePreference,
  Vehicle,
  VehicleDraft,
} from './types';

const EMPTY_VEHICLE_DRAFT: VehicleDraft = {
  year: '',
  make: '',
  model: '',
  trim: '',
  nickname: '',
};

export default function DrivePlannerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setGeneratedDrive } = useRouteResult();
  const [displayFontLoaded, displayFontError] = useFonts({
    Michroma_400Regular,
  });
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset =
    Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [startLocation, setStartLocation] = useState<GeocodedLocation | null>(
    null,
  );
  const [destinationLocation, setDestinationLocation] =
    useState<GeocodedLocation | null>(null);
  const [roundTrip, setRoundTrip] = useState(false);
  const [anywhere, setAnywhere] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [preferences, setPreferences] = useState<RoutePreference[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleDraft, setVehicleDraft] =
    useState<VehicleDraft>(EMPTY_VEHICLE_DRAFT);
  const [vehicleError, setVehicleError] = useState('');
  const [formError, setFormError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: designTokens.spacing.medium,
      paddingTop: topInset + designTokens.spacing.medium,
      paddingBottom: bottomInset + designTokens.spacing.xlarge,
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
      borderColor: theme.colors.border,
      borderRadius: designTokens.radius.pill,
      backgroundColor: theme.colors.surface,
    },
    brandName: {
      ...theme.text.brandName,
    },
    brandSubtitle: {
      marginTop: 3,
      ...theme.text.brandSubtitle,
    },
    eyebrow: {
      marginBottom: 10,
      ...theme.text.eyebrow,
    },
    title: {
      marginBottom: 9,
      ...theme.text.title,
    },
    intro: {
      marginBottom: 25,
      ...theme.text.intro,
    },
    section: {
      marginTop: 24,
      paddingTop: 21,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 15,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...theme.text.sectionTitle,
    },
    sectionIndex: {
      ...theme.text.sectionIndex,
    },
    error: {
      padding: 12,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.accent,
      backgroundColor: theme.colors.surface,
      ...theme.text.error,
    },
    submit: {
      minHeight: designTokens.component.buttonHeight,
      marginTop: 24,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: designTokens.radius.small,
      backgroundColor: theme.colors.accent,
    },
    submitPressed: { opacity: 0.82 },
    submitText: {
      ...theme.text.button,
    },
    footer: {
      marginTop: 12,
      ...theme.text.footer,
      textAlign: 'center',
    },
  });

  function togglePreference(preference: RoutePreference) {
    setPreferences((current) => {
      if (current.includes(preference)) {
        return current.filter((item) => item !== preference);
      }

      if (preference === 'urban' || preference === 'backroads') {
        const otherExclusiveOption =
          preference === 'urban' ? 'backroads' : 'urban';
        return [
          ...current.filter((item) => item !== otherExclusiveOption),
          preference,
        ];
      }

      return [...current, preference];
    });
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

  async function submitDrive() {
    if (!startLocation) {
      setFormError('Choose a starting location from the suggestions.');
      return;
    }
    if (!destinationLocation) {
      setFormError('Choose a destination from the suggestions to generate a route.');
      return;
    }
    const routeApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');
    if (!routeApiUrl) {
      setFormError('Route generation is temporarily unavailable. Please try again later.');
      return;
    }

    Keyboard.dismiss();
    setFormError('');
    setGeneratedDrive(null);
    setIsGenerating(true);
    try {
      const response = await fetch(`${routeApiUrl}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          start: [startLocation.longitude, startLocation.latitude],
          end: [destinationLocation.longitude, destinationLocation.latitude],
          preferences,
          strength: 7,
        }),
      });
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error('The route service returned an unreadable response. Please try again.');
      }
      if (!response.ok) {
        const serverMessage = payload && typeof payload === 'object'
          ? 'detail' in payload && typeof payload.detail === 'string'
            ? payload.detail
              : null
          : null;
        throw new Error(serverMessage ?? 'We couldn’t find a route right now.');
      }
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('geojson' in payload) ||
        !('distance_km' in payload) ||
        typeof payload.distance_km !== 'number' ||
        ('duration_min' in payload && typeof payload.duration_min !== 'number') ||
        !('match_pct' in payload) ||
        (payload.match_pct !== null && typeof payload.match_pct !== 'number') ||
        !('breakdown' in payload)
      ) {
        throw new Error('The route service returned an incomplete route. Please try again.');
      }
      setGeneratedDrive({
        route: payload as RouteResult,
        start: startLocation,
        end: destinationLocation,
      });
      router.push('/discovery');
    } catch (error) {
      setFormError(
        error instanceof TypeError
          ? 'We couldn’t connect to the route service. Check your connection and try again.'
          : error instanceof Error
          ? error.message
          : 'We couldn’t find a route right now. Please try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  }

  if (!displayFontLoaded && !displayFontError) return null;

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
            <Feather
              name="navigation"
              size={17}
              color={theme.colors.accent}
            />
          </View>
          <View>
            <Text style={styles.brandName}>SUNDAY DRIVE</Text>
            <Text style={styles.brandSubtitle}>SOUTHERN CALIFORNIA, BY ROAD</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>A BETTER KIND OF DETOUR</Text>
        <Text style={styles.title}>Plan a drive.</Text>
        <Text style={styles.intro}>
          Set the kind of day you want on the road. We’ll find a route shaped by
          your choices.
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
            durationMinutes={durationMinutes}
            startLocation={startLocation}
            destinationLocation={destinationLocation}
            onStartChange={(value) => {
              setStart(value);
              setStartLocation(null);
              setFormError('');
            }}
            onDestinationChange={(value) => {
              setDestination(value);
              setDestinationLocation(null);
            }}
            onStartSelect={(location) => {
              setStart(location.label);
              setStartLocation(location);
              setFormError('');
            }}
            onDestinationSelect={(location) => {
              setDestination(location.label);
              setDestinationLocation(location);
            }}
            onRoundTripChange={setRoundTrip}
            onAnywhereChange={(value) => {
              setAnywhere(value);
              if (value) {
                setDestination('');
                setDestinationLocation(null);
              }
            }}
            onDurationChange={setDurationMinutes}
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
          disabled={isGenerating}
          style={({ pressed }) => [
            styles.submit,
            pressed && styles.submitPressed,
            isGenerating && { opacity: 0.75 },
          ]}
          testID="button-find-drive"
        >
          {isGenerating ? (
            <>
              <Text style={styles.submitText}>Finding your drive…</Text>
              <ActivityIndicator size="small" color={theme.colors.accentText} testID="loading-route" />
            </>
          ) : (
            <>
              <Text style={styles.submitText}>Find My Drive</Text>
              <Feather
                name="arrow-up-right"
                size={19}
                color={theme.colors.accentText}
              />
            </>
          )}
        </Pressable>
        <Text style={styles.footer}>
          Only supported road preferences are used to shape your route.
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}
