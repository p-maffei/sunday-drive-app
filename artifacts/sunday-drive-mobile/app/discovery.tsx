import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function DiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: insets.top + 24,
      paddingBottom: insets.bottom + 24,
    },
    backButton: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backText: {
      color: colors.foreground,
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    eyebrow: {
      marginBottom: 12,
      color: colors.primary,
      fontFamily: 'DMMono_400Regular',
      fontSize: 10,
      letterSpacing: 1.2,
    },
    title: {
      marginBottom: 12,
      color: colors.foreground,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 36,
      lineHeight: 43,
    },
    description: {
      color: colors.mutedForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 15,
      lineHeight: 23,
    },
  });

  return (
    <View style={styles.screen}>
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

      <View style={styles.content}>
        <Text style={styles.eyebrow}>NEXT UP / ROUTE DISCOVERY</Text>
        <Text style={styles.title}>Your drive starts here.</Text>
        <Text style={styles.description}>
          Route discovery is a future step. Your preferences are not sent to a
          routing service yet, and this page does not display a map or generated
          route.
        </Text>
      </View>
    </View>
  );
}
