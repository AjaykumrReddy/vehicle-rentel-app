export const parsePoint = (point) => {
  const match = point.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return null;
  return {
    longitude: parseFloat(match[1]),
    latitude: parseFloat(match[2]),
  };
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c * 1000).toFixed(0);
};

export const getVehicleIcon = (vehicle) => {
  const type = vehicle.model.toLowerCase();
  if (type.includes('bike') || type.includes('pulsar') || type.includes('hunter')) return '🏍️';
  if (type.includes('activa') || type.includes('scooter')) return '🛵';
  return '🚗';
};

export const getMarkerColor = (vehicle) => {
  return vehicle.available ? '#00C851' : '#ff4444';
};

export const filterVehicles = (vehicles, filterType) => {
  if (filterType === 'All') return vehicles;
  const type = filterType.toLowerCase();
  return vehicles.filter(vehicle => {
    const vehicleType = vehicle.model.toLowerCase();
    if (type === 'bikes') return vehicleType.includes('bike') || vehicleType.includes('pulsar') || vehicleType.includes('hunter');
    if (type === 'scooters') return vehicleType.includes('activa') || vehicleType.includes('scooter');
    return false;
  });
};