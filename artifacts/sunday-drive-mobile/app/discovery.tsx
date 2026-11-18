import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteMap from '@/components/drive-planner/RouteMap';
import { useRouteResult } from '@/components/drive-planner/RouteResultContext';
import { formatRouteSummary } from '@/components/drive-planner/routeSummary';
import { theme } from '@/constants/theme';

export default function DiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { generatedDrive, selectWanderOption } = useRouteResult();
  const selectedOption = generatedDrive?.options.find(
    (option) => option.rank === generatedDrive.selectedOptionRank,
  ) ?? generatedDrive?.options[0];
  const comparisonRoutes = generatedDrive?.options.filter(
    (option) => option.rank !== selectedOption?.rank,
  ) ?? [];

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
    ? Array.isArray(selectedOption.breakdown)
      ? selectedOption.breakdown.map((item, index) => [
          item.label ?? item.name ?? `Factor ${index + 1}`,
          item.score ?? item.value ?? '—',
        ] as const)
      : Object.entries(selectedOption.breakdown)
    : [];

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
                    {formatRouteSummary(option.distance_km, option.duration_min)}
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
              <Text style={styles.scoreLabel}>DISTANCE · TIME</Text>
              <Text style={styles.scoreValue} testID="text-route-distance">
                {formatRouteSummary(
                  selectedOption.distance_km,
                  selectedOption.duration_min,
                )}
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

          {breakdownEntries.length ? (
            <View style={styles.breakdown} testID="route-breakdown">
              <Text style={styles.breakdownTitle}>SCORE BREAKDOWN</Text>
              {breakdownEntries.map(([label, value], index) => (
                <View key={`${label}-${index}`} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{String(label)}</Text>
                  <Text style={styles.breakdownValue}>
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
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
