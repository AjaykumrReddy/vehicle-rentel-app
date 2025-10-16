import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function HourPicker({ selectedHour, onHourSelect, onCancel, title }) {
  const { colors } = useTheme();
  
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      <ScrollView style={styles.hoursList} showsVerticalScrollIndicator={false}>
        {hours.map((hour) => (
          <TouchableOpacity
            key={hour}
            style={[
              styles.hourItem,
              selectedHour === hour && { backgroundColor: colors.primary }
            ]}
            onPress={() => onHourSelect(hour)}
          >
            <Text style={[
              styles.hourText,
              { color: selectedHour === hour ? '#fff' : colors.text }
            ]}>
              {formatHour(hour)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.cancelButton, { borderColor: colors.border }]}
        onPress={onCancel}
      >
        <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '70%',
    minWidth: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  hoursList: {
    maxHeight: 300,
  },
  hourItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  hourText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});