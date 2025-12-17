import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PagerView from 'react-native-pager-view';
import { useTheme } from '../../contexts/ThemeContext';
import OwnerService from '../../services/ownerService';
import BookingRequestCard from '../../components/OwnerDashboardComponents/BookingRequestCard';
import ActiveBookingCard from '../../components/OwnerDashboardComponents/ActiveBookingCard';
import VehicleCard from '../../components/OwnerDashboardComponents/VehicleCard';
import EarningsOverview from '../../components/OwnerDashboardComponents/EarningsOverview';
import DashboardTabBar from '../../components/OwnerDashboardComponents/DashboardTabBar';

export default function OwnerDashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef(null);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editVehicleModal, setEditVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editRates, setEditRates] = useState({ hourly: '', daily: '' });

  const tabs = [
    { id: 0, title: 'Requests', icon: '📋', count: bookingRequests.length },
    { id: 1, title: 'Active', icon: '🚗', count: activeBookings.length },
    { id: 2, title: 'Vehicles', icon: '🏍️', count: vehicles.length },
    { id: 3, title: 'Earnings', icon: '💰', count: null }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const result = await OwnerService.getDashboardData();
      if (result.success) {
        setBookingRequests(result.data.pendingBookings);
        setActiveBookings(result.data.activeBookings);
        setVehicles(result.data.vehicles);
        setEarnings(result.data.earnings);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const result = await OwnerService.handleBookingAction(bookingId, action);
      if (result.success) {
        setBookingRequests(prev => prev.filter(req => req.booking_id !== bookingId));
        if (action === 'accept') {
          const booking = bookingRequests.find(req => req.booking_id === bookingId);
          if (booking) setActiveBookings(prev => [...prev, { ...booking, status: 'CONFIRMED' }]);
        }
        Alert.alert('Success', `Booking ${action === 'accept' ? 'accepted' : 'rejected'} successfully`);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const toggleVehicleAvailability = async (vehicleId) => {
    try {
      const vehicle = vehicles.find(v => v.vehicle_id === vehicleId);
      const result = await OwnerService.toggleVehicleAvailability(vehicleId, !vehicle.is_available);
      if (result.success) {
        setVehicles(prev => prev.map(v => 
          v.vehicle_id === vehicleId ? { ...v, is_available: !v.is_available } : v
        ));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update vehicle availability');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditRates({ hourly: vehicle.hourly_rate?.toString() || '', daily: vehicle.daily_rate?.toString() || '' });
    setEditVehicleModal(true);
  };

  const handleSaveVehicleRates = async () => {
    if (!selectedVehicle) return;
    const hourlyRate = parseFloat(editRates.hourly);
    const dailyRate = parseFloat(editRates.daily);
    if (isNaN(hourlyRate) || isNaN(dailyRate)) {
      Alert.alert('Error', 'Please enter valid rates');
      return;
    }
    try {
      const result = await OwnerService.updateVehicleRates(selectedVehicle.vehicle_id, hourlyRate, dailyRate);
      if (result.success) {
        setVehicles(prev => prev.map(v => 
          v.vehicle_id === selectedVehicle.vehicle_id ? { ...v, hourly_rate: hourlyRate, daily_rate: dailyRate } : v
        ));
        setEditVehicleModal(false);
        Alert.alert('Success', 'Vehicle rates updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update vehicle rates');
    }
  };

  const handleTabPress = (tabIndex) => {
    setActiveTab(tabIndex);
    pagerRef.current?.setPage(tabIndex);
  };

  const handlePageSelected = (e) => {
    setActiveTab(e.nativeEvent.position);
  };

  const handleChatPress = (booking) => {
    navigation.navigate('Chat', { booking });
  };

  const renderBookingRequest = ({ item }) => (
    <BookingRequestCard 
      item={item} 
      onAccept={(bookingId) => handleBookingAction(bookingId, 'accept')}
      onReject={(bookingId) => handleBookingAction(bookingId, 'reject')}
      onChat={handleChatPress}
    />
  );

  const renderActiveBooking = ({ item }) => (
    <ActiveBookingCard 
      item={item} 
      onChat={handleChatPress}
    />
  );

  const renderVehicle = ({ item }) => (
    <VehicleCard 
      item={item}
      onToggleAvailability={toggleVehicleAvailability}
      onEditRates={handleEditVehicle}
    />
  );

  const renderTabContent = (tabIndex) => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    
    const data = tabIndex === 0 ? bookingRequests : 
                 tabIndex === 1 ? activeBookings : 
                 tabIndex === 2 ? vehicles : null;
    
    const renderItem = tabIndex === 0 ? renderBookingRequest :
                      tabIndex === 1 ? renderActiveBooking :
                      tabIndex === 2 ? renderVehicle : null;
    
    if (tabIndex === 3) return <EarningsOverview earnings={earnings} />;
    
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.booking_id || item.vehicle_id || `item-${index}`)?.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadDashboardData(); }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Data</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Owner Dashboard</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Manage your rentals</Text>
      </View>
      
      <DashboardTabBar 
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
      
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {tabs.map((tab) => (
          <View key={tab.id} style={styles.tabContent}>
            {renderTabContent(tab.id)}
          </View>
        ))}
      </PagerView>
      
      <Modal visible={editVehicleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Vehicle Rates</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={editRates.hourly}
              onChangeText={(text) => setEditRates(prev => ({ ...prev, hourly: text }))}
              placeholder="Hourly Rate"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={editRates.daily}
              onChangeText={(text) => setEditRates(prev => ({ ...prev, daily: text }))}
              placeholder="Daily Rate"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setEditVehicleModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveVehicleRates}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1},
  pagerView: { flex: 1 },
  tabContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  modalButtonText: { fontSize: 14, fontWeight: '600' },
});