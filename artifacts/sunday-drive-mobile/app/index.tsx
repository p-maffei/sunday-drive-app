import { Platform, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DriveRequestForm from '@/components/DriveRequestForm';
import InteractiveMap from '@/components/InteractiveMap';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const topInset =
    Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset =
    Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: 22,
      paddingTop: topInset + 10,
      paddingBottom: bottomInset + 28,
    },
    header: {
      minHeight: 42,
      marginBottom: 38,
      flexDirection: 'row',
      alignItems: 'center',
    },
    brandIcon: {
      width: 34,
      height: 34,
      marginRight: 10,
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
      marginBottom: 13,
      color: colors.primary,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      letterSpacing: 1.3,
    },
    title: {
      color: colors.foreground,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 50,
      lineHeight: 55,
      letterSpacing: -1.8,
    },
    titleAccent: {
      color: colors.primary,
      fontStyle: 'italic',
    },
    description: {
      maxWidth: 360,
      marginTop: 16,
      marginBottom: 24,
      color: colors.mutedForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      lineHeight: 22,
    },
    sectionHeading: {
      marginTop: 27,
      marginBottom: 13,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      color: colors.foreground,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 24,
    },
    sectionIndex: {
      color: colors.mutedForeground,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
      letterSpacing: 1,
    },
    about: {
      marginTop: 34,
      paddingTop: 22,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    aboutLabel: {
      marginBottom: 11,
      color: colors.accent,
      fontFamily: 'DMMono_400Regular',
      fontSize: 9,
      letterSpacing: 1.2,
    },
    aboutTitle: {
      marginBottom: 9,
      color: colors.foreground,
      fontFamily: 'PlayfairDisplay_500Medium',
      fontSize: 24,
      lineHeight: 31,
    },
    aboutText: {
      color: colors.mutedForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      lineHeight: 20,
    },
    signoff: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    signoffText: {
      color: colors.primary,
      fontFamily: 'DMMono_400Regular',
      fontSize: 8,
      letterSpacing: 1,
    },
  });

  return (
    <View style={styles.screen}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
        <Text style={styles.title}>
          Take the long{'\n'}way{' '}
          <Text style={styles.titleAccent}>home.</Text>
        </Text>
        <Text style={styles.description}>
          Good roads are out there. Find a little room to roam, from a quick
          escape to a whole day off course.
        </Text>

        <InteractiveMap />

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Plan a drive</Text>
          <Text style={styles.sectionIndex}>A PLACE TO BEGIN</Text>
        </View>
        <DriveRequestForm />

        <View style={styles.about}>
          <Text style={styles.aboutLabel}>THE REASON</Text>
          <Text style={styles.aboutTitle}>Made for the miles between.</Text>
          <Text style={styles.aboutText}>
            Sunday Drive is a little tool for getting out of your routine. Tell
            us where you’re starting and how long you have; the road can take it
            from there.
          </Text>
          <View style={styles.signoff}>
            <Feather name="compass" size={14} color={colors.primary} />
            <Text style={styles.signoffText}>THE ROAD IS THE PLAN</Text>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}
