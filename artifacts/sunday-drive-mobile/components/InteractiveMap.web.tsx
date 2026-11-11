import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function InteractiveMap() {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      minHeight: 250,
      justifyContent: 'center',
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      backgroundColor: colors.secondary,
    },
    heading: {
      marginBottom: 8,
      color: colors.foreground,
      fontFamily: 'PlayfairDisplay_600SemiBold',
      fontSize: 20,
    },
    message: {
      color: colors.mutedForeground,
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      lineHeight: 21,
    },
  });

  return (
    <View
      style={styles.container}
      accessibilityLabel="Map available in the native mobile app"
      testID="interactive-map-web-notice"
    >
      <Text style={styles.heading}>The map runs in the mobile app</Text>
      <Text style={styles.message}>
        Open Sunday Drive in its iOS or Android development build to explore
        the live map. This browser preview does not display map data.
      </Text>
    </View>
  );
}
