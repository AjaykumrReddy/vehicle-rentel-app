import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import useLocation from '../../hooks/useLocation';
import { getNearbyVehicles } from '../../api/vehicleService';
import MapHeader from '../../components/MapComponents/MapHeader';
import FloatingButtons from '../../components/MapComponents/FloatingButtons';
import FilterBar from '../../components/MapComponents/FilterBar';
import VehicleBottomSheet from '../../components/MapComponents/VehicleBottomSheet';
import { parsePoint, getVehicleIcon, getMarkerColor, filterVehicles } from '../../utils/mapUtils';
import { useTheme } from '../../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 120;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function MapScreen({ navigation }) {
  const { colors } = useTheme();
  const { location, loading, errorMsg } = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [fetchingVehicles, setFetchingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const mapRef = useRef(null);
  const bottomSheetAnim = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const lastGesture = useRef(BOTTOM_SHEET_MIN_HEIGHT);

  const fetchVehicles = async () => {
    if (!location) return;
    try {
      setFetchingVehicles(true);
      const vehicleData = await getNearbyVehicles(location.latitude, location.longitude);
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setFetchingVehicles(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [location]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVehicles();
    setRefreshing(false);
  };

  const filteredVehicles = filterVehicles(vehicles, filterType);

  // Add small offset to vehicles with duplicate coordinates
  const adjustedVehicles = filteredVehicles.map((vehicle, index) => {
    const coords = parsePoint(vehicle.location);
    if (!coords) return vehicle;

    // Check for duplicates
    const duplicateIndex = filteredVehicles.findIndex((v, i) => {
      if (i >= index) return false;
      const otherCoords = parsePoint(v.location);
      return otherCoords && 
        Math.abs(otherCoords.latitude - coords.latitude) < 0.0001 &&
        Math.abs(otherCoords.longitude - coords.longitude) < 0.0001;
    });

    if (duplicateIndex !== -1) {
      // Add small random offset (about 10-20 meters)
      const offsetLat = (Math.random() - 0.5) * 0.0002;
      const offsetLng = (Math.random() - 0.5) * 0.0002;
      const adjustedLocation = `POINT(${coords.longitude + offsetLng} ${coords.latitude + offsetLat})`;
      return { ...vehicle, location: adjustedLocation };
    }
    
    return vehicle;
  });

  const centerOnVehicle = (vehicle) => {
    const coords = parsePoint(vehicle.location);
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const handleLocationPress = () => {
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleVehiclePress = (vehicle) => {
    setSelectedVehicle(vehicle);
    centerOnVehicle(vehicle);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        bottomSheetAnim.setOffset(lastGesture.current);
        bottomSheetAnim.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newValue = -gestureState.dy;
        if (lastGesture.current + newValue >= BOTTOM_SHEET_MIN_HEIGHT && 
            lastGesture.current + newValue <= BOTTOM_SHEET_MAX_HEIGHT) {
          bottomSheetAnim.setValue(newValue);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        bottomSheetAnim.flattenOffset();
        const currentValue = lastGesture.current - gestureState.dy;
        const threshold = (BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT) / 2;
        
        if (gestureState.vy > 0.5) {
          lastGesture.current = BOTTOM_SHEET_MIN_HEIGHT;
          Animated.spring(bottomSheetAnim, {
            toValue: BOTTOM_SHEET_MIN_HEIGHT,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        } else if (gestureState.vy < -0.5) {
          lastGesture.current = BOTTOM_SHEET_MAX_HEIGHT;
          Animated.spring(bottomSheetAnim, {
            toValue: BOTTOM_SHEET_MAX_HEIGHT,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        } else if (currentValue > threshold) {
          lastGesture.current = BOTTOM_SHEET_MAX_HEIGHT;
          Animated.spring(bottomSheetAnim, {
            toValue: BOTTOM_SHEET_MAX_HEIGHT,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        } else {
          lastGesture.current = BOTTOM_SHEET_MIN_HEIGHT;
          Animated.spring(bottomSheetAnim, {
            toValue: BOTTOM_SHEET_MIN_HEIGHT,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  if (loading || !location) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Fetching location...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>{errorMsg || 'Location not available'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} navigation={navigation} />
      
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {adjustedVehicles.map((vehicle) => {
          const coords = parsePoint(vehicle.location);
          if (!coords) {
            console.warn(`Skipping vehicle ${vehicle.id} - invalid location: ${vehicle.location}`);
            return null;
          }
          return (
            <Marker
              key={vehicle.id}
              coordinate={coords}
              onPress={() => setSelectedVehicle(vehicle)}
            >
              <View style={[styles.customMarker, { backgroundColor: getMarkerColor(vehicle) }]}>
                <Text style={styles.markerText}>{getVehicleIcon(vehicle)}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <FloatingButtons 
        bottomSheetAnim={bottomSheetAnim}
        BOTTOM_SHEET_MIN_HEIGHT={BOTTOM_SHEET_MIN_HEIGHT}
        BOTTOM_SHEET_MAX_HEIGHT={BOTTOM_SHEET_MAX_HEIGHT}
        onLocationPress={handleLocationPress}
        onRefresh={onRefresh}
      />

      <FilterBar 
        bottomSheetAnim={bottomSheetAnim}
        BOTTOM_SHEET_MIN_HEIGHT={BOTTOM_SHEET_MIN_HEIGHT}
        BOTTOM_SHEET_MAX_HEIGHT={BOTTOM_SHEET_MAX_HEIGHT}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <VehicleBottomSheet 
        bottomSheetAnim={bottomSheetAnim}
        panResponder={panResponder}
        vehicles={filteredVehicles}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onVehiclePress={handleVehiclePress}
        lastGesture={lastGesture}
        BOTTOM_SHEET_MIN_HEIGHT={BOTTOM_SHEET_MIN_HEIGHT}
        BOTTOM_SHEET_MAX_HEIGHT={BOTTOM_SHEET_MAX_HEIGHT}
        userLocation={location}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    fontSize: 14,
  },
});