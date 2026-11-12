import { useEffect, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useGetGeocodingSuggestions } from '@workspace/api-client-react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  designTokens,
  displayFontFamily,
  interfaceFontFamily,
} from '@/constants/designTokens';
import type { GeocodedLocation } from './types';

interface LocationAutocompleteFieldProps {
  label: string;
  value: string;
  placeholder: string;
  accessibilityLabel: string;
  testID: string;
  selectedLocation?: GeocodedLocation | null;
  disabled?: boolean;
  returnKeyType?: 'next' | 'done';
  onChangeText: (value: string) => void;
  onSelect: (location: GeocodedLocation) => void;
}

export default function LocationAutocompleteField({
  label,
  value,
  placeholder,
  accessibilityLabel,
  testID,
  selectedLocation = null,
  disabled = false,
  returnKeyType = 'done',
  onChangeText,
  onSelect,
}: LocationAutocompleteFieldProps) {
  const [focused, setFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedValue = value.trim();

  useEffect(() => {
    if (normalizedValue.length < 3) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(normalizedValue), 350);
    return () => clearTimeout(timer);
  }, [normalizedValue]);

  const query = useGetGeocodingSuggestions(
    { q: debouncedQuery, limit: 6 },
    {
      query: {
        enabled: !disabled && debouncedQuery.length >= 3,
        staleTime: 30_000,
        retry: 1,
      },
    },
  );

  const waitingForDebounce =
    normalizedValue.length >= 3 && normalizedValue !== debouncedQuery;
  const isLoading = waitingForDebounce || query.isFetching;
  const suggestions =
    normalizedValue === debouncedQuery ? query.data?.suggestions ?? [] : [];
  const showDropdown =
    focused && !disabled && normalizedValue.length >= 3;

  const styles = StyleSheet.create({
    field: { gap: 7, zIndex: showDropdown ? 2 : 0 },
    label: {
      color: designTokens.color.mutedForeground,
      fontFamily: displayFontFamily,
      fontSize: 10,
      letterSpacing: 1,
    },
    input: {
      minHeight: designTokens.component.inputHeight,
      borderWidth: 1,
      borderColor: focused ? designTokens.color.accent : designTokens.color.border,
      borderRadius: designTokens.radius.small,
      paddingHorizontal: designTokens.spacing.medium,
      backgroundColor: designTokens.color.darkSurface,
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 15,
    },
    inputDisabled: { opacity: 0.45 },
    dropdown: {
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.darkSurface,
      overflow: 'hidden',
    },
    status: {
      minHeight: 44,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },
    statusText: {
      flex: 1,
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 12,
      lineHeight: 17,
    },
    result: {
      minHeight: 54,
      paddingHorizontal: 12,
      paddingVertical: 9,
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: designTokens.color.border,
    },
    resultTitle: {
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
      fontWeight: '600',
    },
    resultContext: {
      marginTop: 3,
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 11,
      lineHeight: 15,
    },
    attribution: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 10,
    },
  });

  function selectLocation(location: GeocodedLocation) {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(false);
    onSelect(location);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setFocused(true);
        }}
        onBlur={() => {
          // Delay dismissal so a suggestion tap can select before the field blurs.
          blurTimer.current = setTimeout(() => setFocused(false), 120);
        }}
        placeholder={placeholder}
        placeholderTextColor={designTokens.color.mutedForeground}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType={returnKeyType}
        editable={!disabled}
        accessibilityLabel={
          selectedLocation
            ? `${accessibilityLabel}, selected location`
            : accessibilityLabel
        }
        style={[styles.input, disabled && styles.inputDisabled]}
        testID={testID}
      />
      {showDropdown ? (
        <View style={styles.dropdown} testID={`${testID}-suggestions`}>
          {isLoading ? (
            <View style={styles.status}>
              <ActivityIndicator
                size="small"
                color={designTokens.color.accent}
              />
              <Text style={styles.statusText}>Searching real locations…</Text>
            </View>
          ) : query.isError ? (
            <View style={styles.status}>
              <Text style={styles.statusText}>
                Location search is unavailable. Check your connection and try again.
              </Text>
            </View>
          ) : suggestions.length === 0 ? (
            <View style={styles.status}>
              <Text style={styles.statusText}>
                No California locations found. Try a city or address in California.
              </Text>
            </View>
          ) : (
            suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${suggestion.label}`}
                onPress={() => selectLocation(suggestion)}
                style={styles.result}
                testID={`${testID}-suggestion-${suggestion.id}`}
              >
                <Text style={styles.resultTitle}>{suggestion.title}</Text>
                {suggestion.context ? (
                  <Text style={styles.resultContext}>{suggestion.context}</Text>
                ) : null}
              </Pressable>
            ))
          )}
          <Text style={styles.attribution}>Location data © OpenStreetMap contributors</Text>
        </View>
      ) : null}
    </View>
  );
}
