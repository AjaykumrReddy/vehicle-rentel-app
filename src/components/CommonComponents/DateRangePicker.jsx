import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function DateRangePicker({ onDateRangeSelect, onCancel }) {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [step, setStep] = useState('start'); // 'start' or 'end'

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate || !date) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (step === 'start') {
      return date < today;
    } else {
      return date < startDate;
    }
  };

  const handleDatePress = (date) => {
    if (isDateDisabled(date)) return;

    if (step === 'start') {
      setStartDate(date);
      setEndDate(null);
      setStep('end');
    } else {
      setEndDate(date);
      onDateRangeSelect(startDate, date);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.card,
      shadowColor: colors.text,
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {step === 'start' ? '📅 Select Start Date' : '🏁 Select End Date'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {step === 'start' ? 'Choose your pickup date' : `Pickup: ${startDate?.toLocaleDateString()} - Choose return date`}
        </Text>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
          <Text style={[styles.navText, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>{formatMonthYear(currentMonth)}</Text>
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
          <Text style={[styles.navText, { color: colors.primary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {days.map((date, index) => {
          const isDisabled = isDateDisabled(date);
          const isSelected = date && (
            (startDate && date.getTime() === startDate.getTime()) ||
            (endDate && date.getTime() === endDate.getTime())
          );
          const isInRange = isDateInRange(date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.primary },
                isInRange && !isSelected && { backgroundColor: colors.primary + '30' },
                isDisabled && styles.disabledDay
              ]}
              onPress={() => handleDatePress(date)}
              disabled={isDisabled}
            >
              <Text style={[
                styles.dayText,
                { color: colors.text },
                isSelected && { color: '#fff', fontWeight: '600' },
                isDisabled && { color: colors.textSecondary, opacity: 0.3 }
              ]}>
                {date ? date.getDate() : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.border }]}
          onPress={() => {
            if (step === 'end' && startDate) {
              setStep('start');
              setEndDate(null);
            } else {
              onCancel();
            }
          }}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            {step === 'end' ? 'Back' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: '90%',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  navText: {
    fontSize: 24,
    fontWeight: '600',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
  },
  disabledDay: {
    opacity: 0.3,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});