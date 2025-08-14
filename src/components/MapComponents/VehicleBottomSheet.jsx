import React from 'react';
import { Animated, View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import VehicleCard from './VehicleCard';

export default function VehicleBottomSheet({ 
  bottomSheetAnim, 
  panResponder, 
  vehicles, 
  refreshing, 
  onRefresh, 
  onVehiclePress,
  lastGesture,
  BOTTOM_SHEET_MIN_HEIGHT,
  BOTTOM_SHEET_MAX_HEIGHT,
  userLocation
}) {
  
  const expandBottomSheet = () => {
    lastGesture.current = BOTTOM_SHEET_MAX_HEIGHT;
    Animated.spring(bottomSheetAnim, {
      toValue: BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const collapseBottomSheet = () => {
    lastGesture.current = BOTTOM_SHEET_MIN_HEIGHT;
    Animated.spring(bottomSheetAnim, {
      toValue: BOTTOM_SHEET_MIN_HEIGHT,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View style={[styles.bottomSheet, { height: bottomSheetAnim }]}>
      <View style={styles.bottomSheetHeader} {...panResponder.panHandlers}>
        <View style={styles.dragHandle} />
        <Text style={styles.vehicleCount}>{vehicles.length} vehicles nearby</Text>
        <TouchableOpacity onPress={() => {
          if (lastGesture.current === BOTTOM_SHEET_MIN_HEIGHT) {
            expandBottomSheet();
          } else {
            collapseBottomSheet();
          }
        }}>
          <Animated.View style={{
            transform: [{
              rotate: bottomSheetAnim.interpolate({
                inputRange: [BOTTOM_SHEET_MIN_HEIGHT, BOTTOM_SHEET_MAX_HEIGHT],
                outputRange: ['0deg', '180deg'],
                extrapolate: 'clamp',
              })
            }]
          }}>
            <Text style={styles.collapseIcon}>▼</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.vehicleList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {vehicles.map((vehicle) => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onPress={() => onVehiclePress(vehicle)}
            userLocation={userLocation}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
  },
  vehicleCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  collapseIcon: {
    fontSize: 16,
    color: '#666',
  },
  vehicleList: {
    flex: 1,
  },
});