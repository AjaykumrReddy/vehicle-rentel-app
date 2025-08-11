import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import useLocation from '../hooks/useLocation';
import { getNearbyVehicles } from '../api/vehicleService';

export default function MapScreen() {
  const { location, loading, errorMsg } = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [fetchingVehicles,setFetchingVehicles] = useState(false);

  useEffect(() => {
    if(!location) return;
    const fetchVehicles = async () => {
      try{
        setFetchingVehicles(true);
        const vehicleData = await getNearbyVehicles(location.latitude,location.longitude);
        setVehicles(vehicleData);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setFetchingVehicles(false);
      }
    };
    fetchVehicles();
  },[location]);

  const parsePoint = (point) => {
    // convert "POINT(lng lat)" to {latitude, longitude}
    const match = point.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    if(!match) return null;
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2]),
    };
  }

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Fetching location...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{errorMsg || 'Location not available'}</Text>
      </View>
    );
  }

  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation
    >
      {vehicles.map((vehicle) => {
        const coords = parsePoint(vehicle.location);
        if (!coords) return null;
        return(
          <Marker
            key={vehicle.id}
            coordinate={coords}
            title={`${vehicle.brand} ${vehicle.model}`}
            description={vehicle.available ? 'Available' : 'Not available'}
          />
        )
      })}
      {/* <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="You are here"
        pinColor="blue"
      /> */}
    </MapView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
