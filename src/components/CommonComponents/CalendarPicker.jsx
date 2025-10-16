import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function CalendarPicker({ availabilitySlots, onDateTimeSelect, selectedStart, selectedEnd }) {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getAvailableDates = () => {
    const dates = new Set();
    availabilitySlots.forEach(slot => {
      const start = new Date(slot.start_datetime);
      const end = new Date(slot.end_datetime);
      const current = new Date(start);
      
      while (current <= end) {
        dates.add(current.toDateString());
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
  };

  const getAvailableHours = (date) => {
    const hours = [];
    const targetDateStr = date.toDateString();
    
    availabilitySlots.forEach(slot => {
      const slotStart = new Date(slot.start_datetime);
      const slotEnd = new Date(slot.end_datetime);
      
      // Check if target date falls within this slot's date range
      if (date >= new Date(slotStart.toDateString()) && date <= new Date(slotEnd.toDateString())) {
        const startHour = targetDateStr === slotStart.toDateString() ? slotStart.getHours() : 0;
        const endHour = targetDateStr === slotEnd.toDateString() ? slotEnd.getHours() : 23;
        
        for (let h = startHour; h <= endHour; h++) {
          hours.push({ hour: h, slot });
        }
      }
    });
    return hours;
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const availableDates = getAvailableDates();

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isAvailable = availableDates.has(date.toDateString());
      days.push({ date, isAvailable });
    }

    return days;
  };

  const formatMonth = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (date) => {
    if (!date || !date.isAvailable) return;
    
    const hours = getAvailableHours(date.date);
    
    if (hours.length === 0) {
      console.log('No hours available for this date');
      return;
    }

    onDateTimeSelect(date.date, hours);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={[styles.navButton, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>{formatMonth()}</Text>
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={[styles.navButton, { color: colors.primary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {getDaysInMonth().map((day, index) => {
          const isSelected = selectedStart?.toDateString() === day?.date?.toDateString();
          const isAvailable = day?.isAvailable;
          const isToday = day?.date?.toDateString() === new Date().toDateString();
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day && styles.emptyCell,
                isAvailable && !isSelected && { 
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.primary + '40'
                },
                !isAvailable && day && { 
                  backgroundColor: colors.background + '20',
                  opacity: 0.3
                },
                isSelected && { 
                  backgroundColor: colors.primary,
                  borderWidth: 2,
                  borderColor: colors.primary
                },
                isToday && !isSelected && {
                  borderWidth: 2,
                  borderColor: colors.primary
                }
              ]}
              onPress={() => day && handleDateSelect(day)}
              disabled={!day?.isAvailable}
            >
              {day && (
                <>
                  <Text style={[
                    styles.dayText,
                    { color: isSelected ? '#fff' : isAvailable ? colors.text : colors.textSecondary },
                    !isAvailable && { opacity: 0.5 }
                  ]}>
                    {day.date.getDate()}
                  </Text>
                  {isAvailable && !isSelected && (
                    <View style={[styles.availableDot, { backgroundColor: colors.primary }]} />
                  )}
                  {!isAvailable && (
                    <Text style={[styles.disabledIcon, { color: colors.textSecondary }]}>✕</Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    margin: 1,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  availableDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  disabledIcon: {
    fontSize: 8,
    position: 'absolute',
    bottom: 2,
    opacity: 0.5,
  },
});