import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  designTokens,
  interfaceFontFamily,
} from '@/constants/designTokens';
import { ROUTE_PREFERENCES, type RoutePreference } from './types';

interface RoutePreferencesSectionProps {
  selected: RoutePreference[];
  onToggle: (preference: RoutePreference) => void;
}

export default function RoutePreferencesSection({
  selected,
  onToggle,
}: RoutePreferencesSectionProps) {
  const styles = StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    option: {
      minHeight: 40,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.pill,
      backgroundColor: designTokens.color.darkSurface,
    },
    selected: {
      borderColor: designTokens.color.accent,
      backgroundColor: designTokens.color.accent,
    },
    label: {
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 12,
      fontWeight: '500',
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
              <Feather
                name="check"
                size={13}
                color={designTokens.color.accentForeground}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                isSelected && { color: designTokens.color.accentForeground },
              ]}
            >
              {preference}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
