import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { Config } from '../../config';
import { EXTERNAL_APIS } from '../../config/externalApis';

export default function LocationPickerScreen({ navigation }) {
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.length > 2) {
        searchPlaces(searchText);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const searchPlaces = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${EXTERNAL_APIS.GOOGLE_MAPS.PLACES_AUTOCOMPLETE}?input=${encodeURIComponent(query)}&key=${Config.GOOGLE_PLACES_API_KEY}&components=country:in`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setSuggestions(data.predictions);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `${EXTERNAL_APIS.GOOGLE_MAPS.PLACE_DETAILS}?place_id=${placeId}&key=${Config.GOOGLE_PLACES_API_KEY}&fields=geometry,formatted_address`
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Details error:', error);
      return null;
    }
  };

  const selectLocation = async (place) => {
    const details = await getPlaceDetails(place.place_id);
    if (details) {
      const location = {
        name: place.description,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        placeId: place.place_id
      };
      console.log("location - ", location)
      navigation.navigate('Search', { selectedLocation: location });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Select Location</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for a location..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
      </View>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.suggestionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
            onPress={() => selectLocation(item)}
          >
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={[styles.locationName, { color: colors.text }]}>{item.structured_formatting?.main_text || item.description}</Text>
              <Text style={[styles.locationDetails, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.structured_formatting?.secondary_text || item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        style={styles.suggestionsList}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  backButton: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '600' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  suggestionsList: { flex: 1 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  locationIcon: { fontSize: 20, marginRight: 12 },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  locationDetails: { fontSize: 12 },
  loadingContainer: { padding: 16, alignItems: 'center' },
  loadingText: { fontSize: 14 },
});