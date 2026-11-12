import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
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
import type { Vehicle, VehicleDraft } from './types';

interface VehicleProfileSectionProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  draft: VehicleDraft;
  error: string;
  onSelect: (id: string) => void;
  onDraftChange: (field: keyof VehicleDraft, value: string) => void;
  onAdd: () => void;
}

export default function VehicleProfileSection({
  vehicles,
  selectedVehicleId,
  draft,
  error,
  onSelect,
  onDraftChange,
  onAdd,
}: VehicleProfileSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const styles = StyleSheet.create({
    section: { gap: 12 },
    empty: {
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 13,
      lineHeight: 19,
    },
    vehicle: {
      minHeight: 58,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.darkSurface,
    },
    vehicleSelected: {
      borderColor: designTokens.color.accent,
      backgroundColor: designTokens.color.darkSurface,
    },
    vehicleCopy: { flex: 1 },
    vehicleName: {
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
      fontWeight: '600',
    },
    vehicleDetails: {
      marginTop: 3,
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 12,
    },
    addButton: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addButtonText: {
      color: designTokens.color.accent,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
      fontWeight: '600',
    },
    form: {
      padding: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.darkSurface,
    },
    field: { gap: 5 },
    label: {
      color: designTokens.color.mutedForeground,
      fontFamily: displayFontFamily,
      fontSize: 9,
      letterSpacing: 0.8,
    },
    input: {
      minHeight: 42,
      borderBottomWidth: 1,
      borderBottomColor: designTokens.color.border,
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
    },
    requiredRow: { flexDirection: 'row', gap: 12 },
    requiredField: { flex: 1 },
    saveButton: {
      minHeight: 44,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.accent,
    },
    saveText: {
      color: designTokens.color.accentForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
      fontWeight: '600',
    },
    error: {
      color: designTokens.color.accent,
      fontFamily: interfaceFontFamily,
      fontSize: 12,
    },
  });

  function renderField({
    label,
    value,
    field,
    required = false,
    keyboardType = 'default',
  }: {
    label: string;
    value: string;
    field: keyof VehicleDraft;
    required?: boolean;
    keyboardType?: 'default' | 'number-pad';
  }) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>
          {label}{required ? ' · REQUIRED' : ' · OPTIONAL'}
        </Text>
        <TextInput
          value={value}
          onChangeText={(nextValue) => onDraftChange(field, nextValue)}
          placeholder={label}
          placeholderTextColor={designTokens.color.mutedForeground}
          autoCapitalize="words"
          keyboardType={keyboardType}
          style={styles.input}
          accessibilityLabel={label}
          testID={`vehicle-${field}`}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {vehicles.length === 0 ? (
        <Text style={styles.empty}>
          No vehicles added yet. Vehicle details are optional for this planner
          and stay on this screen.
        </Text>
      ) : (
        vehicles.map((vehicle) => {
          const selected = selectedVehicleId === vehicle.id;
          const title = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
          return (
            <Pressable
              key={vehicle.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onSelect(vehicle.id)}
              style={[styles.vehicle, selected && styles.vehicleSelected]}
              testID={`vehicle-option-${vehicle.id}`}
            >
              <Feather
                name={selected ? 'check-circle' : 'circle'}
                size={19}
                color={
                  selected
                    ? designTokens.color.accent
                    : designTokens.color.mutedForeground
                }
              />
              <View style={styles.vehicleCopy}>
                <Text style={styles.vehicleName}>{title}</Text>
                <Text style={styles.vehicleDetails}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.trim ? ` · ${vehicle.trim}` : ''}
                </Text>
              </View>
            </Pressable>
          );
        })
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showForm }}
        onPress={() => setShowForm((shown) => !shown)}
        style={styles.addButton}
        testID="button-toggle-add-vehicle"
      >
        <Feather
          name={showForm ? 'minus-circle' : 'plus-circle'}
          size={18}
          color={designTokens.color.accent}
        />
        <Text style={styles.addButtonText}>
          {showForm ? 'Close vehicle form' : 'Add a vehicle'}
        </Text>
      </Pressable>

      {showForm ? (
        <View style={styles.form}>
          <View style={styles.requiredRow}>
            <View style={styles.requiredField}>
              {renderField({
                label: 'Year',
                field: 'year',
                value: draft.year,
                keyboardType: 'number-pad',
                required: true,
              })}
            </View>
            <View style={styles.requiredField}>
              {renderField({ label: 'Make', field: 'make', value: draft.make, required: true })}
            </View>
          </View>
          {renderField({ label: 'Model', field: 'model', value: draft.model, required: true })}
          {renderField({ label: 'Trim', field: 'trim', value: draft.trim })}
          {renderField({ label: 'Nickname', field: 'nickname', value: draft.nickname })}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            onPress={onAdd}
            style={styles.saveButton}
            testID="button-save-vehicle"
          >
            <Text style={styles.saveText}>Save vehicle</Text>
            <Feather
              name="arrow-right"
              size={17}
              color={designTokens.color.accentForeground}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
