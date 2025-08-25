import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function TimePicker({ availableHours, selectedTime, onTimeSelect, type = 'start' }) {
  const { colors } = useTheme();

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Select {type === 'start' ? 'Start' : 'End'} Time
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeContainer}>
          {availableHours.map(({ hour, slot }) => (
            <TouchableOpacity
              key={hour}
              style={[
                styles.timeSlot,
                { 
                  backgroundColor: selectedTime === hour ? colors.primary : colors.background,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => onTimeSelect(hour, slot)}
            >
              <Text style={[
                styles.timeText,
                { color: selectedTime === hour ? '#fff' : colors.text }
              ]}>
                {formatHour(hour)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});