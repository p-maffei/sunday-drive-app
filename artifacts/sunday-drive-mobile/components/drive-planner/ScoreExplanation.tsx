import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import {
  designTokens,
  interfaceFontFamily,
} from '@/constants/designTokens';

export default function ScoreExplanation() {
  const styles = StyleSheet.create({
    container: {
      padding: designTokens.component.cardPadding,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      borderRadius: designTokens.radius.medium,
      backgroundColor: designTokens.color.surface,
    },
    icon: { marginTop: 2 },
    copy: { flex: 1, gap: 4 },
    title: {
      color: designTokens.color.surfaceForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
      fontWeight: '600',
    },
    description: {
      color: designTokens.color.surfaceForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 12,
      lineHeight: 18,
      opacity: 0.78,
    },
  });

  return (
    <View style={styles.container} accessibilityLabel="About the future drivability score">
      <Feather
        name="info"
        size={17}
        color={designTokens.color.accent}
        style={styles.icon}
      />
      <View style={styles.copy}>
        <Text style={styles.title}>A preference-match score, not a safety rating</Text>
        <Text style={styles.description}>
          Routes will eventually receive a 0–100% score showing how closely they
          match the road preferences you choose. It will not rate road quality
          or safety.
        </Text>
      </View>
    </View>
  );
}
