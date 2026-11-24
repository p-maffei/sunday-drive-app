import { Feather } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteMap from '@/components/drive-planner/RouteMap';
import {
  useRouteResult,
  type RouteResult,
} from '@/components/drive-planner/RouteResultContext';
import { formatRouteSummary } from '@/components/drive-planner/routeSummary';
import {
  buildGpxExportRequest,
  buildMapsExportRequest,
  getExportErrorDetail,
  hasExportableEdges,
} from '@/components/drive-planner/routeExports';
import { theme } from '@/constants/theme';

export default function DiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mapsLoading, setMapsLoading] = useState(false);
  const [gpxLoading, setGpxLoading] = useState(false);
  const [mapsNote, setMapsNote] = useState<string | null>(null);
  const [googleMatch, setGoogleMatch] = useState<number | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [gpxError, setGpxError] = useState<string | null>(null);
  const { generatedDrive, selectWanderOption } = useRouteResult();
  const selectedOption = generatedDrive?.options.find(
    (option) => option.rank === generatedDrive.selectedOptionRank,
  ) ?? generatedDrive?.options[0];
  const comparisonRoutes: RouteResult[] = generatedDrive?.options.filter(
    (option) => option.rank !== selectedOption?.rank,
  ) ?? [];
  if (generatedDrive?.fastest.geojson) {
    comparisonRoutes.push({
      ...generatedDrive.fastest,
      geojson: generatedDrive.fastest.geojson,
    });
  }

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      paddingHorizontal: 24,
      paddingTop: insets.top + 16,
      paddingBottom: insets.bottom + 28,
      gap: 18,
    },
    backButton: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    eyebrow: {
      marginBottom: 6,
      ...theme.text.resultEyebrow,
    },
    title: {
      ...theme.text.title,
      fontSize: 23,
      lineHeight: 32,
    },
    description: {
      ...theme.text.intro,
      fontSize: 14,
      lineHeight: 20,
    },
    backText: {
      ...theme.text.backButton,
    },
    scoreRow: {
      flexDirection: 'row',
      gap: 12,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    optionCard: {
      flexGrow: 1,
      minWidth: 140,
      padding: 12,
      gap: 5,
      ...theme.cards.bordered,
    },
    selectedOptionCard: {
      borderColor: theme.colors.accent,
      backgroundColor: '#34302E',
    },
    optionTitle: {
      ...theme.text.scoreLabel,
      color: theme.colors.primaryText,
    },
    optionSummary: {
      ...theme.text.breakdownLabel,
      color: theme.colors.primaryText,
    },
    optionMatch: {
      ...theme.text.breakdownLabel,
      color: theme.colors.secondaryText,
    },
    noteBanner: {
      padding: 13,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent,
      backgroundColor: theme.colors.surface,
    },
    noteText: {
      ...theme.text.intro,
      color: theme.colors.primaryText,
    },
    styleDefault: {
      ...theme.text.breakdownLabel,
      color: theme.colors.primaryText,
    },
    scoreCard: {
      flex: 1,
      minHeight: 78,
      padding: 14,
      justifyContent: 'center',
      gap: 4,
      ...theme.cards.bordered,
    },
    scoreLabel: {
      ...theme.text.scoreLabel,
    },
    scoreValue: {
      ...theme.text.scoreValue,
    },
    breakdown: {
      padding: 16,
      gap: 11,
      ...theme.cards.bordered,
    },
    breakdownTitle: {
      ...theme.text.breakdownTitle,
      marginBottom: 2,
    },
    breakdownRow: {
      minHeight: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    breakdownLabel: {
      flex: 1,
      ...theme.text.breakdownLabel,
      textTransform: 'capitalize',
    },
    breakdownValue: {
      ...theme.text.breakdownValue,
    },
    exportActions: {
      gap: 10,
    },
    exportButton: {
      minHeight: 48,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    exportButtonPressed: {
      opacity: 0.78,
    },
    exportButtonText: {
      ...theme.text.button,
      color: theme.colors.primaryText,
    },
    exportMessage: {
      ...theme.text.intro,
      color: theme.colors.secondaryText,
      fontSize: 13,
      lineHeight: 19,
    },
    exportError: {
      ...theme.text.error,
      fontSize: 13,
      lineHeight: 19,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      gap: 10,
    },
    emptyTitle: {
      ...theme.text.emptyTitle,
    },
  });

  const breakdownEntries = selectedOption
    ? Object.entries(selectedOption.breakdown).map(([key, score]) => [
        key,
        generatedDrive?.fastest.breakdown[key as keyof typeof generatedDrive.fastest.breakdown],
        score,
      ] as const)
    : [];
  const edgeIds = selectedOption?.edge_ids;

  async function openGoogleMaps() {
    const routeApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');
    if (!selectedOption || !edgeIds || !hasExportableEdges(edgeIds)) return;
    if (!routeApiUrl) {
      setMapsError('Route export is temporarily unavailable. Please try again later.');
      return;
    }

    setMapsLoading(true);
    setMapsError(null);
    setMapsNote(null);
    setGoogleMatch(null);
    try {
      const response = await fetch(`${routeApiUrl}/export/maps`, {
        ...buildMapsExportRequest(edgeIds),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = getExportErrorDetail(payload);
        throw new Error(
          detail ??
            (response.status === 429 || response.status === 503
              ? 'Google Maps export is temporarily unavailable. Please try again.'
              : 'Could not create a Google Maps route. Please try again.'),
        );
      }
      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('url' in payload) ||
        typeof payload.url !== 'string'
      ) {
        throw new Error('The Google Maps export returned an invalid URL.');
      }
      await Linking.openURL(payload.url);
      setMapsNote(
        'note' in payload && typeof payload.note === 'string'
          ? payload.note
          : null,
      );
      setGoogleMatch(
        'fidelity_pct' in payload && typeof payload.fidelity_pct === 'number'
          ? payload.fidelity_pct
          : null,
      );
    } catch (error) {
      setMapsError(
        error instanceof Error ? error.message : 'Could not open Google Maps.',
      );
    } finally {
      setMapsLoading(false);
    }
  }

  async function downloadGpx() {
    const routeApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');
    if (!selectedOption || !edgeIds || !hasExportableEdges(edgeIds)) return;
    if (!routeApiUrl) {
      setGpxError('Route export is temporarily unavailable. Please try again later.');
      return;
    }

    setGpxLoading(true);
    setGpxError(null);
    try {
      const response = await fetch(`${routeApiUrl}/export/gpx`, {
        ...buildGpxExportRequest(edgeIds, selectedOption.duration_min ?? 0),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const detail = getExportErrorDetail(payload);
        throw new Error(
          detail ??
            (response.status === 429 || response.status === 503
              ? 'GPX export is temporarily unavailable. Please try again.'
              : 'Could not download the GPX route. Please try again.'),
        );
      }

      if (Platform.OS === 'web') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'sunday-drive.gpx';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const gpxText = await response.text();
        const file = new File(Paths.cache, 'sunday-drive.gpx');
        file.create({ overwrite: true });
        await file.write(gpxText);
        if (!(await Sharing.isAvailableAsync())) {
          throw new Error('The share sheet is not available on this device.');
        }
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/gpx+xml',
          UTI: 'public.xml',
        });
      }
    } catch (error) {
      setGpxError(
        error instanceof Error ? error.message : 'Could not download the GPX route.',
      );
    } finally {
      setGpxLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to drive planner"
        onPress={() => router.back()}
        style={styles.backButton}
        testID="button-back-to-planner"
      >
        <Feather name="arrow-left" size={17} color={theme.colors.primaryText} />
        <Text style={styles.backText}>Back to planner</Text>
      </Pressable>

      {generatedDrive && selectedOption ? (
        <>
          <View>
            <Text style={styles.eyebrow}>YOUR SUNDAY DRIVE</Text>
            <Text style={styles.title}>
              {generatedDrive.start.title} to {generatedDrive.end.title}
            </Text>
          </View>

          {generatedDrive.note ? (
            <View style={styles.noteBanner} testID="wander-note">
              <Text style={styles.noteText}>{generatedDrive.note}</Text>
            </View>
          ) : null}

          {generatedDrive.style_defaulted ? (
            <Text style={styles.styleDefault} testID="style-defaulted">
              Style: {generatedDrive.style.join(' + ')} (default)
            </Text>
          ) : null}

          <View style={styles.optionRow} accessibilityRole="tablist">
            {generatedDrive.options.map((option) => {
              const selected = option.rank === selectedOption.rank;
              return (
                <Pressable
                  key={option.rank}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  onPress={() => selectWanderOption(option.rank)}
                  style={[styles.optionCard, selected && styles.selectedOptionCard]}
                  testID={`button-wander-option-${option.rank}`}
                >
                  <Text style={styles.optionTitle}>Option {option.rank}</Text>
                  <Text style={styles.optionSummary}>
                    {option.duration_min} min · +{option.extra_min} min ·{' '}
                    {formatRouteSummary(option.distance_km)}
                  </Text>
                  <Text style={styles.optionMatch}>
                    Match {option.match_pct === null ? '—' : `${option.match_pct}%`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <RouteMap
            route={selectedOption}
            comparisonRoutes={comparisonRoutes}
            start={generatedDrive.start}
            end={generatedDrive.end}
            waypoint={selectedOption.waypoint}
          />

          <View style={styles.scoreRow}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>DURATION · EXTRA · DISTANCE</Text>
              <Text style={styles.scoreValue} testID="text-route-distance">
                {selectedOption.duration_min} min · +
                {selectedOption.extra_min} min ·{' '}
                {formatRouteSummary(selectedOption.distance_km)}
              </Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>PREFERENCE MATCH</Text>
              <Text style={styles.scoreValue} testID="text-route-match">
                {selectedOption.match_pct === null
                  ? '—'
                  : `${selectedOption.match_pct}%`}
              </Text>
            </View>
          </View>

          {hasExportableEdges(edgeIds) ? (
            <View style={styles.exportActions} testID="route-export-actions">
              <View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open in Google Maps"
                  disabled={mapsLoading || gpxLoading}
                  onPress={openGoogleMaps}
                  style={({ pressed }) => [
                    styles.exportButton,
                    pressed && styles.exportButtonPressed,
                  ]}
                  testID="button-open-google-maps"
                >
                  {mapsLoading ? (
                    <ActivityIndicator color={theme.colors.primaryText} />
                  ) : (
                    <Feather name="map" size={17} color={theme.colors.primaryText} />
                  )}
                  <Text style={styles.exportButtonText}>
                    {mapsLoading ? 'Opening Maps…' : 'Open in Google Maps'}
                  </Text>
                </Pressable>
                {googleMatch !== null ? (
                  <Text style={styles.exportMessage} testID="text-google-match">
                    Google match: {googleMatch}%
                  </Text>
                ) : null}
                {mapsNote ? (
                  <Text style={styles.exportMessage} testID="text-maps-note">
                    {mapsNote}
                  </Text>
                ) : null}
                {mapsError ? (
                  <Text style={styles.exportError} testID="text-maps-error">
                    {mapsError}
                  </Text>
                ) : null}
              </View>

              <View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Download GPX"
                  disabled={mapsLoading || gpxLoading}
                  onPress={downloadGpx}
                  style={({ pressed }) => [
                    styles.exportButton,
                    pressed && styles.exportButtonPressed,
                  ]}
                  testID="button-download-gpx"
                >
                  {gpxLoading ? (
                    <ActivityIndicator color={theme.colors.primaryText} />
                  ) : (
                    <Feather name="download" size={17} color={theme.colors.primaryText} />
                  )}
                  <Text style={styles.exportButtonText}>
                    {gpxLoading ? 'Preparing GPX…' : 'Download GPX'}
                  </Text>
                </Pressable>
                {gpxError ? (
                  <Text style={styles.exportError} testID="text-gpx-error">
                    {gpxError}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {breakdownEntries.length ? (
            <View style={styles.breakdown} testID="route-breakdown">
              <Text style={styles.breakdownTitle}>SCORE BREAKDOWN</Text>
              {breakdownEntries.map(([label, fastestScore, optionScore], index) => (
                <View key={`${label}-${index}`} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    {String(label).charAt(0).toUpperCase()}{String(label).slice(1)}
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {fastestScore === undefined ? '—' : `${fastestScore}%`} to{' '}
                    {optionScore === undefined ? '—' : `${optionScore}%`}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.eyebrow}>ROUTE NOT AVAILABLE</Text>
          <Text style={styles.emptyTitle}>No drive to show yet.</Text>
          <Text style={styles.description}>
            Go back to the planner and choose a start and destination to find a
            route.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
