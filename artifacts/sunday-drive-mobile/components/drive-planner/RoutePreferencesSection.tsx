import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { ROUTE_PREFERENCES, type RoutePreference } from './types';

interface RoutePreferencesSectionProps {
  selected: RoutePreference[];
  onToggle: (preference: RoutePreference) => void;
}

export default function RoutePreferencesSection({
  selected,
  onToggle,
}: RoutePreferencesSectionProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    option: {
      minHeight: 40,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      backgroundColor: colors.card,
    },
    selected: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    label: {
      color: colors.foreground,
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      {ROUTE_PREFERENCES.map((preference) => {
        const isSelected = selected.includes(preference);
        return (
          <Pressable
            key={preference}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            onPress={() => onToggle(preference)}
            style={[styles.option, isSelected && styles.selected]}
            testID={`preference-${preference.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          >
            {isSelected ? (
              <Feather name="check" size={13} color={colors.primary} />
            ) : null}
            <Text style={styles.label}>{preference}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
