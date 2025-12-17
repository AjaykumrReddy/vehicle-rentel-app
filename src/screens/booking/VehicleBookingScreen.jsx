import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getVehicleAvailabilitySlots } from '../../api/vehicleService';
import CalendarPicker from '../../components/CommonComponents/CalendarPicker';
import TimePicker from '../../components/CommonComponents/TimePicker';
import { createVehicleBooking } from '../../api/bookingService';
import { useAlert } from '../../hooks/useAlert';
import CustomAlert from '../../components/CommonComponents/CustomAlert';

export default function VehicleBookingScreen({ route, navigation }) {
  const { vehicle } = route.params;
  const { colors } = useTheme();
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentStep, setCurrentStep] = useState('startDate'); // startDate, startTime, endDate, endTime
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(true);
  const { alertConfig, visible, hideAlert, showError, showSuccess, showWarning } = useAlert();
  

  const fetchAvailabilitySlots = async () => {
    try {
      setFetchingSlots(true);
      const slots = await getVehicleAvailabilitySlots(vehicle.id);
      setAvailabilitySlots(slots.filter(slot => slot.is_active));
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      Alert.alert('Error', 'Failed to load availability slots');
    } finally {
      setFetchingSlots(false);
    }
  };

  useEffect(() => {
    fetchAvailabilitySlots();
  }, []);

  const handleDateSelect = (date, hours) => {
    if (currentStep === 'startDate') {
      setStartDate(date);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setSelectedSlot(null);
      setCurrentStep('startTime');
    } else if (currentStep === 'endDate') {
      setEndDate(date);
      setEndTime(null);
      setCurrentStep('endTime');
    }
  };

  const handleStartTimeSelect = (hour, slot) => {
    setStartTime(hour);
    setSelectedSlot(slot);
    setEndTime(null);
    setEndDate(null);
    setCurrentStep('endDate');
  };

  const handleEndTimeSelect = (hour) => {
    setEndTime(hour);
    setCurrentStep('complete');
  };

  const handleSameDayBooking = () => {
    setEndDate(null);
    setCurrentStep('endTime');
  };

  const getAvailableHoursForDate = (date) => {
    if (!date) return [];
    const hours = [];
    const targetDateStr = date.toDateString();
    
    availabilitySlots.forEach(slot => {
      const slotStart = new Date(slot.start_datetime);
      const slotEnd = new Date(slot.end_datetime);
      
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

  const getEndTimeOptions = () => {
    if (startTime === null || !selectedSlot || !startDate) return [];
    
    if (!endDate) {
      // Same day booking - show remaining hours on start date
      const options = [];
      const availableHours = getAvailableHoursForDate(startDate);
      
      
      availableHours.forEach(({ hour }) => {
        if (hour > startTime) {
          const duration = hour - startTime;
          if (duration >= selectedSlot.min_rental_hours && duration <= selectedSlot.max_rental_hours) {
            options.push({ hour, slot: selectedSlot });
          }
        }
      });
      return options;
    } else {
      // Cross-date booking - show all available hours on end date
      return getAvailableHoursForDate(endDate);
    }
  };

  const isValidBooking = () => {
    return getBookingValidationError() === null;
  };

  const isBookingWithinAvailability = (startDateTime, endDateTime) => {
    // Find all slots that overlap with the booking period
    const overlappingSlots = availabilitySlots.filter(slot => {
      const slotStart = new Date(slot.start_datetime);
      const slotEnd = new Date(slot.end_datetime);
      return startDateTime < slotEnd && endDateTime > slotStart;
    });
    
    if (overlappingSlots.length === 0) return false;
    
    // Sort slots by start time
    overlappingSlots.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
    
    // Check if there are gaps in coverage
    let currentTime = startDateTime;
    
    for (const slot of overlappingSlots) {
      const slotStart = new Date(slot.start_datetime);
      const slotEnd = new Date(slot.end_datetime);
      
      // If there's a gap before this slot starts
      if (currentTime < slotStart) {
        console.log('Gap found:', currentTime, 'to', slotStart);
        return false;
      }
      
      // Move current time to the end of this slot
      currentTime = new Date(Math.max(currentTime, slotEnd));
    }
    
    // Check if the last slot covers until the end of booking
    if (currentTime < endDateTime) {
      console.log('Booking extends beyond availability:', currentTime, 'to', endDateTime);
      return false;
    }
    
    return true;
  };

  const formatTime = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculatePrice = () => {
    if (!selectedSlot || !startDate || startTime === null || endTime === null) {
      return { baseAmount: 0, securityDeposit: 0, platformFee: 0, total: 0, hours: 0, breakdown: '', useDaily: false };
    }
    
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime);
    
    const endDateTime = new Date(endDate || startDate);
    endDateTime.setHours(endTime);
    
    const hours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    
    let baseAmount = 0;
    let breakdown = '';
    let useDaily = false;
    
    if (!selectedSlot.daily_rate) {
      // No daily rate available - use hourly only
      baseAmount = selectedSlot.hourly_rate * hours;
      breakdown = `${hours}h × ₹${selectedSlot.hourly_rate}`;
    } else if (hours < 24) {
      // Less than 24 hours with daily rate - check if hourly exceeds daily
      const hourlyCost = selectedSlot.hourly_rate * hours;
      if (hourlyCost > selectedSlot.daily_rate) {
        baseAmount = selectedSlot.daily_rate;
        breakdown = `Daily rate (better than ${hours}h × ₹${selectedSlot.hourly_rate})`;
        useDaily = true;
      } else {
        baseAmount = hourlyCost;
        breakdown = `${hours}h × ₹${selectedSlot.hourly_rate}`;
      }
    } else {
      // 24+ hours with daily rate available - optimize pricing
      const fullDays = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      
      // Calculate remaining hours cost
      const remainingHoursCost = remainingHours * selectedSlot.hourly_rate;
      
      // Check if remaining hours cost exceeds daily rate
      const shouldUseExtraDailyRate = remainingHoursCost > selectedSlot.daily_rate;
      
      if (shouldUseExtraDailyRate) {
        // Use additional daily rate instead of hourly for remaining hours
        const totalDays = fullDays + 1;
        baseAmount = selectedSlot.daily_rate * totalDays;
        breakdown = `${totalDays} days × ₹${selectedSlot.daily_rate}`;
      } else {
        // Use daily rate for full days + hourly for remaining
        baseAmount = (fullDays * selectedSlot.daily_rate) + remainingHoursCost;
        if (remainingHours > 0) {
          breakdown = `${fullDays} days × ₹${selectedSlot.daily_rate} + ${remainingHours}h × ₹${selectedSlot.hourly_rate}`;
        } else {
          breakdown = `${fullDays} days × ₹${selectedSlot.daily_rate}`;
        }
      }
      
      useDaily = true;
    }
    
    // Fixed fees (make dynamic later)
    const securityDeposit = 50;
    const platformFee = Math.round(baseAmount * 0.1);
    const total = baseAmount + securityDeposit + platformFee;
    
    return { baseAmount, securityDeposit, platformFee, total, hours, breakdown, useDaily };
  };

  const { baseAmount, securityDeposit, platformFee, total, hours, breakdown, useDaily } = calculatePrice();

  const getVehicleIcon = (vehicle) => {
    const type = vehicle.vehicle_type.toLowerCase();
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
  };

  const getBookingValidationError = () => {
    if (!startDate || startTime === null) {
      return 'Please select start date and time';
    }
    
    if (endTime === null) {
      return 'Please select end time';
    }
    
    if (!selectedSlot) {
      return 'Please select a valid time slot';
    }
    
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime);
    
    const endDateTime = new Date(endDate || startDate);
    endDateTime.setHours(endTime);
    
    // Check if booking spans across availability gaps
    if (!isBookingWithinAvailability(startDateTime, endDateTime)) {
      return 'Selected time period has gaps in availability. Please choose a continuous available period.';
    }
    
    const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    
    if (hours < selectedSlot.min_rental_hours) {
      return `Minimum rental duration is ${selectedSlot.min_rental_hours} hours`;
    }
    
    if (!endDate && hours > selectedSlot.max_rental_hours) {
      return `Maximum same-day rental duration is ${selectedSlot.max_rental_hours} hours`;
    }
    
    return null;
  };

  const handleBooking = async () => {
    const validationError = getBookingValidationError();
    if (validationError) {
      Alert.alert('Booking Error', validationError);
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startTime, 0, 0, 0);
      
      const endDateTime = new Date(endDate || startDate);
      endDateTime.setHours(endTime, 0, 0, 0);
      
      const bookingData = {
        vehicle_id: vehicle.id,
        availability_slot_id: selectedSlot.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        base_amount: baseAmount,
        security_deposit: securityDeposit,
        platform_fee: platformFee,
        total_amount: total
      };
      
      console.log('Booking data:', bookingData);

      await createVehicleBooking(bookingData)
      const startStr = `${formatDate(startDate)} ${formatTime(startTime)}`;
      const endStr = `${formatDate(endDate || startDate)} ${formatTime(endTime)}`;

      showSuccess(
        'Booking Confirmed!', 
        `Your ${vehicle.brand} ${vehicle.model} has been booked from ${startStr} to ${endStr}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const message = error.response?.data?.detail ||
        (error.code === 'NETWORK_ERROR' || !error.response
          ? 'Please check your internet connection and try again.'
          : 'Failed to save availability. Please try again.');
      showError('Booking Failed', message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSlots) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading availability...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
          type={alertConfig.type}
        />
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vehicle Info */}
        <View style={[styles.vehicleSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.vehicleIcon}>{getVehicleIcon(vehicle)}</Text>
            <View style={styles.vehicleDetails}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>
                {vehicle.brand} {vehicle.model}
              </Text>
              <Text style={[styles.vehicleType, { color: colors.textSecondary }]}>
                {vehicle.vehicle_type}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Progress */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking Steps</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, startDate && startTime !== null ? styles.progressStepComplete : styles.progressStepActive]}>
              <Text style={[styles.progressStepText, { color: startDate && startTime !== null ? '#fff' : colors.text }]}>1</Text>
            </View>
            <View style={[styles.progressLine, startDate && startTime !== null ? styles.progressLineComplete : null]} />
            <View style={[styles.progressStep, endTime !== null ? styles.progressStepComplete : (startDate && startTime !== null ? styles.progressStepActive : styles.progressStepInactive)]}>
              <Text style={[styles.progressStepText, { color: endTime !== null ? '#fff' : colors.text }]}>2</Text>
            </View>
            <View style={[styles.progressLine, endTime !== null ? styles.progressLineComplete : null]} />
            <View style={[styles.progressStep, isValidBooking() ? styles.progressStepComplete : styles.progressStepInactive]}>
              <Text style={[styles.progressStepText, { color: isValidBooking() ? '#fff' : colors.text }]}>3</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Start</Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>End</Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Book</Text>
          </View>
        </View>

        {/* Current Step Guidance */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.guidanceText, { color: colors.text }]}>
            {currentStep === 'startDate' ? '📅 Select start date' :
             currentStep === 'startTime' ? '⏰ Select start time' :
             currentStep === 'endDate' ? '📅 Select end date (or choose same-day)' :
             currentStep === 'endTime' ? '⏰ Select end time' :
             !isValidBooking() ? '⚠️ Please check your selection - there may be gaps in availability' :
             '✅ Ready to book!'}
          </Text>
        </View>

        {/* Availability Slots */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Periods</Text>
          {availabilitySlots.length === 0 ? (
            <Text style={[styles.noSlotsText, { color: colors.textSecondary }]}>No availability slots found</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.slotsContainer}>
                {availabilitySlots.map((slot) => {
                  const startDate = new Date(slot.start_datetime);
                  const endDate = new Date(slot.end_datetime);
                  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <View
                      key={slot.id}
                      style={[styles.slotCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                    >
                      <Text style={[styles.slotDuration, { color: colors.primary }]}>
                        {duration} {duration === 1 ? 'Day' : 'Days'}
                      </Text>
                      <Text style={[styles.slotDate, { color: colors.text }]}>
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={[styles.slotTime, { color: colors.textSecondary }]}>
                        {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={[styles.slotTo, { color: colors.textSecondary }]}>to</Text>
                      <Text style={[styles.slotDate, { color: colors.text }]}>
                        {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={[styles.slotTime, { color: colors.textSecondary }]}>
                        {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <View style={styles.slotRates}>
                        <Text style={[styles.slotRate, { color: colors.primary }]}>₹{slot.hourly_rate}/hr</Text>
                        {slot.daily_rate && (
                          <Text style={[styles.slotRate, { color: colors.primary }]}>₹{slot.daily_rate}/day</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Step 1: Start Date Selection */}
        {currentStep === 'startDate' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Start Date</Text>
            <CalendarPicker 
              availabilitySlots={availabilitySlots}
              onDateTimeSelect={handleDateSelect}
              selectedStart={startDate}
            />
          </View>
        )}

        {/* Step 3: End Date Selection */}
        {currentStep === 'endDate' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select End Date</Text>
            <TouchableOpacity 
              style={[styles.sameDayButton, { backgroundColor: colors.primary }]}
              onPress={handleSameDayBooking}
            >
              <Text style={styles.sameDayButtonText}>Same Day Booking</Text>
            </TouchableOpacity>
            <Text style={[styles.orText, { color: colors.textSecondary }]}>or select different date:</Text>
            <CalendarPicker 
              availabilitySlots={availabilitySlots}
              onDateTimeSelect={handleDateSelect}
              selectedStart={endDate}
              minDate={startDate}
            />
          </View>
        )}

        {/* Step 2: Start Time Selection */}
        {currentStep === 'startTime' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Start Time</Text>
            <Text style={[styles.selectedInfo, { color: colors.textSecondary }]}>Date: {formatDate(startDate)}</Text>
            <TimePicker 
              availableHours={getAvailableHoursForDate(startDate)}
              selectedTime={startTime}
              onTimeSelect={handleStartTimeSelect}
              type="start"
            />
          </View>
        )}

        {/* Step 4: End Time Selection */}
        {currentStep === 'endTime' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select End Time</Text>
            <Text style={[styles.selectedInfo, { color: colors.textSecondary }]}>
              Date: {formatDate(endDate || startDate)}
            </Text>
            <TimePicker 
              availableHours={getEndTimeOptions()}
              selectedTime={endTime}
              onTimeSelect={handleEndTimeSelect}
              type="end"
            />
          </View>
        )}

        {/* Booking Summary & Price */}
        {currentStep === 'complete' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Start</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatDate(startDate)} at {formatTime(startTime)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>End</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatDate(endDate || startDate)} at {formatTime(endTime)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Duration</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{hours} hours</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                {breakdown || `${hours}h × ₹${selectedSlot?.hourly_rate || 0}`}
              </Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>₹{baseAmount}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Security Deposit</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>₹{securityDeposit}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Platform Fee</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>₹{platformFee}</Text>
            </View>
            
            <View style={[styles.priceRow, styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₹{total}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={handleBooking}
          disabled={loading || !isValidBooking()}
        >
          <Text style={styles.bookButtonText}>
            {loading ? 'Booking...' : isValidBooking() ? `Book Now - ₹${total}` : 'Complete Selection'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vehicleSection: {
    margin: 16,
    marginTop: 50,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 14,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  noSlotsText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  slotCard: {
    minWidth: 120,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  slotDuration: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  slotDate: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  slotTime: {
    fontSize: 10,
    marginBottom: 4,
  },
  slotTo: {
    fontSize: 10,
    marginBottom: 4,
  },
  slotRates: {
    marginTop: 6,
    alignItems: 'center',
  },
  slotRate: {
    fontSize: 10,
    fontWeight: '600',
  },
  dateToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  selectedDates: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedDateText: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  bookButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  progressStepActive: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  progressStepComplete: {
    borderColor: '#28a745',
    backgroundColor: '#28a745',
  },
  progressStepInactive: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  progressLineComplete: {
    backgroundColor: '#28a745',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
  guidanceText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '500',
  },
  sameDayButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  sameDayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 12,
  },
  selectedInfo: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});