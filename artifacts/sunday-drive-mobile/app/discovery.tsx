import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import RouteMap from '@/components/drive-planner/RouteMap';
import { useRouteResult } from '@/components/drive-planner/RouteResultContext';
import { formatRouteSummary } from '@/components/drive-planner/routeSummary';
import {
  designTokens,
  displayFontFamily,
  interfaceFontFamily,
} from '@/constants/designTokens';

export default function DiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { generatedDrive } = useRouteResult();

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: designTokens.color.accent,
      fontFamily: displayFontFamily,
      fontSize: 10,
      letterSpacing: 1.2,
    },
    title: {
      color: colors.foreground,
      fontFamily: displayFontFamily,
      fontSize: 23,
      lineHeight: 32,
    },
    description: {
      color: colors.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
      lineHeight: 20,
    },
    backText: {
      color: colors.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
    },
    scoreRow: {
      flexDirection: 'row',
      gap: 12,
    },
    scoreCard: {
      flex: 1,
      minHeight: 78,
      padding: 14,
      justifyContent: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.darkSurface,
    },
    scoreLabel: {
      color: colors.mutedForeground,
      fontFamily: displayFontFamily,
      fontSize: 9,
      letterSpacing: 0.6,
    },
    scoreValue: {
      color: colors.foreground,
      fontFamily: displayFontFamily,
      fontSize: 19,
    },
    breakdown: {
      padding: 16,
      gap: 11,
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.darkSurface,
    },
    breakdownTitle: {
      color: colors.foreground,
      fontFamily: displayFontFamily,
      fontSize: 12,
      letterSpacing: 0.5,
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
      color: colors.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 13,
      textTransform: 'capitalize',
    },
    breakdownValue: {
      color: colors.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 13,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      gap: 10,
    },
    emptyTitle: {
      color: colors.foreground,
      fontFamily: displayFontFamily,
      fontSize: 24,
    },
  });

  const breakdownEntries = generatedDrive
    ? Array.isArray(generatedDrive.route.breakdown)
      ? generatedDrive.route.breakdown.map((item, index) => [
          item.label ?? item.name ?? `Factor ${index + 1}`,
          item.score ?? item.value ?? '—',
        ] as const)
      : Object.entries(generatedDrive.route.breakdown)
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
        <Feather name="arrow-left" size={17} color={colors.foreground} />
        <Text style={styles.backText}>Back to planner</Text>
      </Pressable>

      {generatedDrive ? (
        <>
          <View>
            <Text style={styles.eyebrow}>YOUR SUNDAY DRIVE</Text>
            <Text style={styles.title}>
              {generatedDrive.start.title} to {generatedDrive.end.title}
            </Text>
          </View>

          <RouteMap
            route={generatedDrive.route}
            start={generatedDrive.start}
            end={generatedDrive.end}
          />

          <View style={styles.scoreRow}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>DISTANCE · TIME</Text>
              <Text style={styles.scoreValue} testID="text-route-distance">
                {formatRouteSummary(
                  generatedDrive.route.distance_km,
                  generatedDrive.route.duration_min,
                )}
              </Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>PREFERENCE MATCH</Text>
              <Text style={styles.scoreValue} testID="text-route-match">
                {generatedDrive.route.match_pct === null
                  ? '—'
                  : `${generatedDrive.route.match_pct}%`}
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
