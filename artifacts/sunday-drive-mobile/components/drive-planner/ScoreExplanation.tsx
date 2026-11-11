import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function ScoreExplanation() {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      borderRadius: colors.radius,
      backgroundColor: colors.secondary,
    },
    icon: { marginTop: 2 },
    copy: { flex: 1, gap: 4 },
    title: {
      color: colors.foreground,
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
    },
    description: {
      color: colors.mutedForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      lineHeight: 18,
    },
  });

  return (
    <View style={styles.container} accessibilityLabel="About the future drivability score">
      <Feather name="info" size={17} color={colors.primary} style={styles.icon} />
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
