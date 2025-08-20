import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeSlot {
  start_datetime: string;
  end_datetime: string;
  hourly_rate: number;
  daily_rate: number;
  min_rental_hours: number;
  max_rental_hours: number;
}

export default function SetVehicleAvailabilityScreen({ navigation, route }: any) {
  const { selectedVehicle } = route.params;
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [tempDate, setTempDate] = useState(new Date());

  const addNewSlot = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours later
    
    const newSlot: TimeSlot = {
      start_datetime: now.toISOString(),
      end_datetime: endTime.toISOString(),
      hourly_rate: 25,
      daily_rate: 200,
      min_rental_hours: 2,
      max_rental_hours: 24,
    };
    
    setSlots([...slots, newSlot]);
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updatedSlots = [...slots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setSlots(updatedSlots);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const openDateTimePicker = (slotIndex: number, mode: 'start' | 'end') => {
    setCurrentSlotIndex(slotIndex);
    setPickerMode(mode);
    const currentDateTime = mode === 'start' 
      ? new Date(slots[slotIndex].start_datetime)
      : new Date(slots[slotIndex].end_datetime);
    setTempDate(currentDateTime);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      setShowDatePicker(false);
      setShowTimePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(tempDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      
      const field = pickerMode === 'start' ? 'start_datetime' : 'end_datetime';
      updateSlot(currentSlotIndex, field, newDateTime.toISOString());
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const saveAvailability = () => {
    if (slots.length === 0) {
      Alert.alert('No Slots', 'Please add at least one availability slot.');
      return;
    }

    // Validate slots
    for (let slot of slots) {
      if (new Date(slot.start_datetime) >= new Date(slot.end_datetime)) {
        Alert.alert('Invalid Time', 'End time must be after start time.');
        return;
      }
    }

    const payload = { slots };
    console.log('Saving availability:', payload);
    // API call would go here
    Alert.alert('Success', 'Vehicle availability updated!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Availability</Text>
        <TouchableOpacity onPress={saveAvailability}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Configure when your vehicle is available for rent</Text>

        {slots.map((slot, index) => (
          <View key={index} style={styles.slotCard}>
            <View style={styles.slotHeader}>
              <Text style={styles.slotTitle}>Slot {index + 1}</Text>
              <TouchableOpacity onPress={() => removeSlot(index)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.label}>Time Period</Text>
              <View style={styles.timeRow}>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => openDateTimePicker(index, 'start')}
                >
                  <Text style={styles.timeLabel}>From</Text>
                  <Text style={styles.timeText}>{formatDateTime(slot.start_datetime)}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => openDateTimePicker(index, 'end')}
                >
                  <Text style={styles.timeLabel}>To</Text>
                  <Text style={styles.timeText}>{formatDateTime(slot.end_datetime)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.ratesSection}>
              <Text style={styles.label}>Pricing</Text>
              <View style={styles.rateRow}>
                <View style={styles.rateInput}>
                  <Text style={styles.rateLabel}>Hourly Rate (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={slot.hourly_rate.toString()}
                    onChangeText={(text) => updateSlot(index, 'hourly_rate', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder="25"
                  />
                </View>
                <View style={styles.rateInput}>
                  <Text style={styles.rateLabel}>Daily Rate (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={slot.daily_rate.toString()}
                    onChangeText={(text) => updateSlot(index, 'daily_rate', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder="200"
                  />
                </View>
              </View>
            </View>

            <View style={styles.limitsSection}>
              <Text style={styles.label}>Rental Limits</Text>
              <View style={styles.rateRow}>
                <View style={styles.rateInput}>
                  <Text style={styles.rateLabel}>Min Hours</Text>
                  <TextInput
                    style={styles.input}
                    value={slot.min_rental_hours.toString()}
                    onChangeText={(text) => updateSlot(index, 'min_rental_hours', parseInt(text) || 1)}
                    keyboardType="numeric"
                    placeholder="2"
                  />
                </View>
                <View style={styles.rateInput}>
                  <Text style={styles.rateLabel}>Max Hours</Text>
                  <TextInput
                    style={styles.input}
                    value={slot.max_rental_hours.toString()}
                    onChangeText={(text) => updateSlot(index, 'max_rental_hours', parseInt(text) || 24)}
                    keyboardType="numeric"
                    placeholder="24"
                  />
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addSlotButton} onPress={addNewSlot}>
          <Text style={styles.addSlotText}>+ Add Time Slot</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backIcon: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeText: {
    fontSize: 18,
    color: '#ff4444',
  },
  timeSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  ratesSection: {
    marginBottom: 16,
  },
  rateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rateInput: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  limitsSection: {
    marginBottom: 0,
  },
  addSlotButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addSlotText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});