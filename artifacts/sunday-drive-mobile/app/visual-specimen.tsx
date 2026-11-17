import { Feather } from '@expo/vector-icons';
import {
  Michroma_400Regular,
  useFonts,
} from '@expo-google-fonts/michroma';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { designTokens as tokens } from '@/constants/designTokens';

const interfaceFont =
  Platform.select({
    ios: tokens.typography.interface,
    android: tokens.typography.interfaceFallback,
    web: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    default: tokens.typography.interfaceFallback,
  }) ?? tokens.typography.interfaceFallback;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.color.background,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: tokens.spacing.medium,
    paddingBottom: tokens.spacing.section,
  },
  backButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.small,
  },
  backText: {
    color: tokens.color.foreground,
    fontFamily: interfaceFont,
    fontSize: tokens.typography.size.button,
  },
  eyebrow: {
    marginTop: tokens.spacing.large,
    color: tokens.color.accent,
    fontFamily: 'Michroma_400Regular',
    fontSize: tokens.typography.size.label,
    letterSpacing: 1.4,
  },
  title: {
    marginTop: tokens.spacing.small,
    color: tokens.color.foreground,
    fontFamily: 'Michroma_400Regular',
    fontSize: tokens.typography.size.section,
    lineHeight: 29,
  },
  intro: {
    marginTop: tokens.spacing.small,
    color: tokens.color.mutedForeground,
    fontFamily: interfaceFont,
    fontSize: tokens.typography.size.body,
    lineHeight: 21,
  },
  section: {
    marginTop: tokens.spacing.section,
  },
  sectionHeading: {
    marginBottom: tokens.spacing.medium,
    color: tokens.color.foreground,
    fontFamily: 'Michroma_400Regular',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionNote: {
    marginTop: 5,
    marginBottom: tokens.spacing.medium,
    color: tokens.color.mutedForeground,
    fontFamily: interfaceFont,
    fontSize: 12,
    lineHeight: 18,
  },
  wordmarkStage: {
    minHeight: 236,
    padding: tokens.spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.medium,
    backgroundColor: tokens.color.darkSurface,
  },
  wordmark: {
    color: tokens.color.foreground,
    fontFamily: 'Michroma_400Regular',
    fontSize: tokens.typography.size.wordmark,
    lineHeight: 43,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  redRule: {
    width: 34,
    height: 3,
    marginTop: tokens.spacing.medium,
    marginBottom: tokens.spacing.medium,
    backgroundColor: tokens.color.accent,
  },
  stageCaption: {
    color: tokens.color.mutedForeground,
    fontFamily: 'Michroma_400Regular',
    fontSize: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  palette: {
    gap: tokens.spacing.small,
  },
  swatchRow: {
    minHeight: 64,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.medium,
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.color.darkSurface,
  },
  swatch: {
    width: 52,
    height: 46,
    borderRadius: tokens.radius.small,
  },
  swatchText: {
    flex: 1,
  },
  swatchLabel: {
    color: tokens.color.foreground,
    fontFamily: interfaceFont,
    fontSize: 13,
  },
  hex: {
    marginTop: 3,
    color: tokens.color.mutedForeground,
    fontFamily: 'Michroma_400Regular',
    fontSize: 9,
    letterSpacing: 0.4,
  },
  typeCard: {
    padding: tokens.component.cardPadding,
    gap: tokens.spacing.medium,
    borderRadius: tokens.radius.medium,
    backgroundColor: tokens.color.surface,
  },
  typeLabel: {
    color: tokens.color.surfaceForeground,
    fontFamily: 'Michroma_400Regular',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  interfaceSample: {
    color: tokens.color.surfaceForeground,
    fontFamily: interfaceFont,
    fontSize: 17,
    lineHeight: 24,
  },
  displaySample: {
    color: tokens.color.surfaceForeground,
    fontFamily: 'Michroma_400Regular',
    fontSize: 15,
    lineHeight: 23,
  },
  interfaceNote: {
    color: tokens.color.surfaceForeground,
    fontFamily: interfaceFont,
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.72,
  },
  componentStack: {
    gap: tokens.spacing.medium,
  },
  fieldCard: {
    minHeight: tokens.component.inputHeight,
    paddingHorizontal: tokens.spacing.medium,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.color.darkSurface,
  },
  fieldLabel: {
    marginBottom: 5,
    color: tokens.color.mutedForeground,
    fontFamily: interfaceFont,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  fieldInput: {
    height: 22,
    padding: 0,
    color: tokens.color.foreground,
    fontFamily: interfaceFont,
    fontSize: 14,
  },
  sampleButton: {
    minHeight: tokens.component.buttonHeight,
    paddingHorizontal: tokens.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.color.accent,
  },
  sampleButtonText: {
    color: tokens.color.accentForeground,
    fontFamily: interfaceFont,
    fontSize: tokens.typography.size.button,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.small,
  },
  chip: {
    minHeight: tokens.component.chipHeight,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: tokens.color.accent,
    borderRadius: tokens.radius.pill,
  },
  chipText: {
    color: tokens.color.foreground,
    fontFamily: interfaceFont,
    fontSize: 12,
  },
  note: {
    marginTop: tokens.spacing.section,
    paddingTop: tokens.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
    color: tokens.color.mutedForeground,
    fontFamily: interfaceFont,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  return (
    <View style={styles.swatchRow}>
      <View style={[styles.swatch, { backgroundColor: hex }]} />
      <View style={styles.swatchText}>
        <Text style={styles.swatchLabel}>{name}</Text>
        <Text style={styles.hex}>{hex}</Text>
      </View>
    </View>
  );
}

export default function VisualSpecimenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [displayFontLoaded, displayFontError] = useFonts({
    Michroma_400Regular,
  });
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  if (!displayFontLoaded && !displayFontError) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + tokens.spacing.medium, paddingBottom: bottomInset + tokens.spacing.section },
        ]}
        testID="visual-specimen-scroll"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to the drive planner"
          onPress={() => router.replace('/')}
          style={styles.backButton}
          testID="button-back-to-planner"
        >
          <Feather name="arrow-left" size={17} color={tokens.color.foreground} />
          <Text style={styles.backText}>Planner</Text>
        </Pressable>

        <Text style={styles.eyebrow}>SUNDAY DRIVE / VISUAL STUDY 01</Text>
        <Text style={styles.title}>A new identity, in type and tone.</Text>
        <Text style={styles.intro}>
          A first look at the mobile app’s palette, typography, and controls.
          The planner itself is unchanged for this review.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>WORDMARK / OPENING CONCEPT</Text>
          <View style={styles.wordmarkStage} testID="specimen-wordmark">
            <Text style={styles.wordmark}>SUNDAY{'\n'}DRIVE</Text>
            <View style={styles.redRule} />
            <Text style={styles.stageCaption}>SOUTHERN CALIFORNIA, BY ROAD</Text>
          </View>
          <Text style={styles.sectionNote}>
            Static visual concept only. The real app splash remains tied to
            startup asset loading; no timer or loading animation is added.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>COLOR / FOUR FOUNDATIONS</Text>
          <View style={styles.palette}>
            <ColorSwatch name="Charcoal / primary background" hex={tokens.color.background} />
            <ColorSwatch name="Cool grey / secondary surface" hex={tokens.color.surface} />
            <ColorSwatch name="Motoring red / accent" hex={tokens.color.accent} />
            <ColorSwatch name="White / dark-surface text" hex={tokens.color.foreground} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>TYPE / INTERFACE + DISPLAY</Text>
          <View style={styles.typeCard}>
            <Text style={styles.typeLabel}>INTERFACE / HELVETICA NEUE</Text>
            <Text style={styles.interfaceSample}>
              Plan a drive that takes the long way home.
            </Text>
            <Text style={styles.interfaceNote}>
              Helvetica Neue on iOS; native sans-serif fallback on Android.
            </Text>
            <View style={styles.redRule} />
            <Text style={styles.typeLabel}>DISPLAY / MICHROMA</Text>
            <Text style={styles.displaySample}>SUNDAY DRIVE — ROUTE 01</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>COMPONENTS / MOBILE CONTROLS</Text>
          <View style={styles.componentStack}>
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>STARTING NEAR</Text>
              <TextInput
                accessibilityLabel="Sample starting location field"
                editable={false}
                value="City, neighborhood, or ZIP"
                style={styles.fieldInput}
                testID="sample-location-field"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              style={styles.sampleButton}
              testID="sample-primary-button"
            >
              <Text style={styles.sampleButtonText}>FIND MY DRIVE</Text>
              <Feather name="arrow-up-right" size={17} color={tokens.color.accentForeground} />
            </Pressable>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: tokens.color.accent }]}>
                <Feather name="check" size={13} color={tokens.color.accentForeground} />
                <Text style={[styles.chipText, { color: tokens.color.accentForeground }]}>Backroads</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Curvy roads</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.note}>
          SPECIMEN ONLY / No route data, map, or planner restyling is included.
        </Text>
      </ScrollView>
    </View>
  );
}
