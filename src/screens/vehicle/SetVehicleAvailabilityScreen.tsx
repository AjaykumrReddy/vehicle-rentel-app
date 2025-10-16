import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { setVehicleAvailabilitySlots, getVehicleAvailabilitySlots, deleteVehicleAvailabilitySlot } from '../../api/vehicleService';
import { useAlert } from '../../hooks/useAlert';
import CustomAlert from '../../components/CommonComponents/CustomAlert';
import { useTheme } from '../../contexts/ThemeContext';


interface TimeSlot {
  id?: string;
  start_datetime: string;
  end_datetime: string;
  hourly_rate: number;
  daily_rate: number;
  min_rental_hours: number;
  max_rental_hours: number;
  is_active?: boolean;
  weekly_rate?: number | null;
}

export default function SetVehicleAvailabilityScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const { selectedVehicle } = route.params;
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [tempDate, setTempDate] = useState(new Date());
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [originalSlots, setOriginalSlots] = useState<TimeSlot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const { alertConfig, visible, hideAlert, showError, showSuccess, showWarning } = useAlert();

  // Load existing availability slots
  useEffect(() => {
    loadExistingSlots();
  }, []);

  const loadExistingSlots = async () => {
    try {
      setLoading(true);
      const response = await getVehicleAvailabilitySlots(selectedVehicle.id);
      // Response is directly an array of slots
      if (Array.isArray(response)) {
        setSlots(response);
        setOriginalSlots(JSON.parse(JSON.stringify(response))); // Deep copy
      } else if (response.data && Array.isArray(response.data)) {
        setSlots(response.data);
        setOriginalSlots(JSON.parse(JSON.stringify(response.data))); // Deep copy
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  // UTC utility functions
  const createUTCDateTime = (date: Date, hour: number) => {
    const utcDate = new Date(date);
    utcDate.setUTCHours(hour, 0, 0, 0);
    return utcDate.toISOString();
  };

  const parseUTCDateTime = (isoString: string) => {
    return new Date(isoString);
  };

  const checkForChanges = (updatedSlots: TimeSlot[]) => {
    // Compare current slots with original slots
    const hasRealChanges = JSON.stringify(updatedSlots) !== JSON.stringify(originalSlots);
    setHasChanges(hasRealChanges);
  };

  const addNewSlot = () => {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const nextHour = currentHour + 1;
    const endHour = currentHour + 9; // 8 hours later
    
    const newSlot: TimeSlot = {
      start_datetime: createUTCDateTime(now, nextHour),
      end_datetime: createUTCDateTime(now, endHour),
      hourly_rate: 25,
      daily_rate: 200,
      min_rental_hours: 2,
      max_rental_hours: 24,
    };
    
    const newSlots = [...slots, newSlot];
    setSlots(newSlots);
    checkForChanges(newSlots);
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updatedSlots = [...slots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setSlots(updatedSlots);
    checkForChanges(updatedSlots);
  };

  const removeSlot = (index: number) => {
    const updatedSlots = slots.filter((_, i) => i !== index);
    setSlots(updatedSlots);
    checkForChanges(updatedSlots);
  };

  const deleteExistingSlot = async (slotId: string, index: number) => {
    try {
      setDeletingSlotId(slotId);
      await deleteVehicleAvailabilitySlot(selectedVehicle.id, slotId);
      removeSlot(index);
      showSuccess('Slot Deleted', 'Availability slot removed successfully.');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Cannot delete slot with active bookings.';
      showError('Delete Failed', message);
    } finally {
      setDeletingSlotId(null);
    }
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
      setShowHourPicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const handleHourSelect = (hour: number) => {
    // Create UTC datetime to ensure consistent timezone handling
    const utcDateTime = createUTCDateTime(tempDate, hour);
    
    const field = pickerMode === 'start' ? 'start_datetime' : 'end_datetime';
    updateSlot(currentSlotIndex, field, utcDateTime);
    setShowHourPicker(false);
  };

  const generateHourOptions = () => {
    const hours = [];
    const now = new Date();
    const isToday = tempDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    
    for (let i = 0; i < 24; i++) {
      // Skip past hours for today's date
      if (isToday && i <= currentHour) {
        continue;
      }
      
      const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
      const ampm = i < 12 ? 'AM' : 'PM';
      hours.push({ value: i, label: `${hour12} ${ampm}` });
    }
    return hours;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: undefined, hour12: true });
  };

  const saveAvailability = async () => {
    if (slots.length === 0) {
      showWarning(
        'No Slots',
        'Please add at least one availability slot.',
        [{ text: 'OK', onPress: () => {} }]
      )
      return;
    }

    // Validate slots
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      
      // Check if end time is after start time
      if (new Date(slot.start_datetime) >= new Date(slot.end_datetime)) {
        showWarning(
          'Invalid Time', 
          `Slot ${i + 1}: End time must be after start time.`,
          [{ text: 'OK', onPress: () => {} }])
        return;
      }
      
      // Check for overlapping slots
      for (let j = i + 1; j < slots.length; j++) {
        const otherSlot = slots[j];
        const slot1Start = new Date(slot.start_datetime);
        const slot1End = new Date(slot.end_datetime);
        const slot2Start = new Date(otherSlot.start_datetime);
        const slot2End = new Date(otherSlot.end_datetime);
        
        // Check if slots overlap
        if ((slot1Start < slot2End && slot1End > slot2Start)) {
          showWarning(
            'Overlapping Slots',
            `Slot ${i + 1} and Slot ${j + 1} have overlapping times. Please adjust the time periods.`,
            [{ text: 'OK', onPress: () => {} }]
          )
          return;
        }
      }
    }

    // Only save new slots (without ID)
    const newSlots = slots.filter(slot => !slot.id);
    const payload = { slots: newSlots };
    console.log('Saving availability:', payload);
    try{
      setSaving(true);
      await setVehicleAvailabilitySlots(selectedVehicle.id, payload);
      showSuccess(
        'Availability Saved', 
        'Your vehicle availability has been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }catch(error: any){
      const message = error.response?.data?.detail ||
        (error.code === 'NETWORK_ERROR' || !error.response
          ? 'Please check your internet connection and try again.'
          : 'Failed to save availability. Please try again.');
      showError('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Availability</Text>
        <TouchableOpacity 
          onPress={saveAvailability}
          disabled={!hasChanges || saving}
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={[styles.saveText, (!hasChanges || saving) && styles.saveTextDisabled]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.vehicleInfo}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>{selectedVehicle.brand} {selectedVehicle.model}</Text>
          <Text style={[styles.vehicleReg, { color: colors.textSecondary }]}>{selectedVehicle.license_plate}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Configure when your vehicle is available for rent</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading availability slots...</Text>
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Availability Set</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add time slots to make your vehicle available for rent</Text>
          </View>
        ) : null}

        {!loading && slots.map((slot, index) => {
          const isExisting = slot.id; // Has ID means it's from backend
          return (
          <View key={index} style={[
            styles.slotCard,
            isExisting ? styles.existingSlot : styles.newSlot
          ]}>
            <View style={styles.slotHeader}>
              <View style={styles.slotTitleContainer}>
                <Text style={styles.slotTitle}>
                  {isExisting ? '📅 Existing' : '➕ New'} Slot {index + 1}
                </Text>
                {isExisting && <Text style={styles.existingBadge}>SAVED</Text>}
              </View>
              {isExisting ? (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {/* Edit functionality can be added later */}}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.deleteButton, deletingSlotId === slot.id && styles.deleteButtonDisabled]}
                    onPress={() => deleteExistingSlot(slot.id!, index)}
                    disabled={deletingSlotId === slot.id}
                  >
                    {deletingSlotId === slot.id ? (
                      <ActivityIndicator size="small" color="#ff4444" />
                    ) : (
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => removeSlot(index)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.label}>Time Period</Text>
              <View style={styles.timeRow}>
                <TouchableOpacity 
                  style={[styles.timeButton, isExisting && styles.disabledButton]}
                  onPress={() => !isExisting && openDateTimePicker(index, 'start')}
                  disabled={!!isExisting}
                >
                  <Text style={styles.timeLabel}>From</Text>
                  <Text style={[styles.timeText, isExisting && styles.disabledText]}>{formatDateTime(slot.start_datetime)}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.timeButton, isExisting && styles.disabledButton]}
                  onPress={() => !isExisting && openDateTimePicker(index, 'end')}
                  disabled={!!isExisting}
                >
                  <Text style={styles.timeLabel}>To</Text>
                  <Text style={[styles.timeText, isExisting && styles.disabledText]}>{formatDateTime(slot.end_datetime)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.ratesSection}>
              <Text style={styles.label}>Pricing</Text>
              <View style={styles.rateRow}>
                <View style={styles.rateInput}>
                  <Text style={styles.rateLabel}>Hourly Rate (₹)</Text>
                  <TextInput
                    style={[styles.input, isExisting && styles.disabledInput]}
                    value={slot.hourly_rate.toString()}
                    onChangeText={(text) => !isExisting && updateSlot(index, 'hourly_rate', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder="25"
                    editable={!isExisting}
                  />
                </View>
                <View style={styles.rateInput}>
                  <Text style={styles.rateLabel}>Daily Rate (₹)</Text>
                  <TextInput
                    style={[styles.input, isExisting && styles.disabledInput]}
                    value={slot.daily_rate.toString()}
                    onChangeText={(text) => !isExisting && updateSlot(index, 'daily_rate', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder="200"
                    editable={!isExisting}
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
                    style={[styles.input, isExisting && styles.disabledInput]}
                    value={slot.min_rental_hours.toString()}
                    onChangeText={(text) => !isExisting && updateSlot(index, 'min_rental_hours', parseInt(text) || 1)}
                    keyboardType="numeric"
                    placeholder="2"
                    editable={!isExisting}
                  />
                </View>
                <View style={styles.rateInput}>
                  <Text style={styles.rateLabel}>Max Hours</Text>
                  <TextInput
                    style={[styles.input, isExisting && styles.disabledInput]}
                    value={slot.max_rental_hours.toString()}
                    onChangeText={(text) => !isExisting && updateSlot(index, 'max_rental_hours', parseInt(text) || 24)}
                    keyboardType="numeric"
                    placeholder="24"
                    editable={!isExisting}
                  />
                </View>
              </View>
            </View>
          </View>
        );
        })}

        <TouchableOpacity style={styles.addSlotButton} onPress={addNewSlot}>
          <Text style={styles.addSlotText}>+ Add Time Slot</Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showHourPicker && (
        <View style={styles.hourPickerModal}>
          <View style={styles.hourPickerContent}>
            <Text style={styles.hourPickerTitle}>Select Hour</Text>
            <ScrollView style={styles.hourList} showsVerticalScrollIndicator={false}>
              {generateHourOptions().map((hour) => (
                <TouchableOpacity 
                  key={hour.value}
                  style={[styles.hourOption, selectedHour === hour.value && styles.hourOptionSelected]}
                  onPress={() => setSelectedHour(hour.value)}
                >
                  <Text style={[styles.hourOptionText, selectedHour === hour.value && styles.hourOptionTextSelected]}>
                    {hour.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.hourPickerButtons}>
              <TouchableOpacity 
                style={styles.hourPickerButton}
                onPress={() => setShowHourPicker(false)}
              >
                <Text style={styles.hourPickerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.hourPickerButton, styles.hourPickerConfirm]}
                onPress={() => handleHourSelect(selectedHour)}
              >
                <Text style={[styles.hourPickerButtonText, styles.hourPickerConfirmText]}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
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
    paddingTop: 50,
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
  saveTextDisabled: {
    color: '#999',
  },
  saveButton: {
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  vehicleInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleReg: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
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
  existingSlot: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  newSlot: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    backgroundColor: '#f8fbff',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  slotTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  existingBadge: {
    fontSize: 10,
    color: '#28a745',
    backgroundColor: '#d4edda',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 16,
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
  },
  disabledText: {
    color: '#999',
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
    marginBottom: 50,
  },
  addSlotText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  hourPickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourPickerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  hourPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  hourList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  hourOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  hourOptionSelected: {
    backgroundColor: '#007AFF',
  },
  hourOptionText: {
    fontSize: 16,
    color: '#333',
  },
  hourOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  hourPickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  hourPickerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  hourPickerConfirm: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  hourPickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  hourPickerConfirmText: {
    color: '#fff',
  },
});