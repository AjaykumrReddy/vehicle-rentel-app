import React from 'react';
import { Animated, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function FilterBar({ bottomSheetAnim, BOTTOM_SHEET_MIN_HEIGHT, BOTTOM_SHEET_MAX_HEIGHT, filterType, setFilterType }) {
  const { colors } = useTheme();
  return (
    <Animated.View style={[
      styles.filterBar,
      {
        bottom: bottomSheetAnim.interpolate({
          inputRange: [BOTTOM_SHEET_MIN_HEIGHT, BOTTOM_SHEET_MAX_HEIGHT],
          outputRange: [BOTTOM_SHEET_MIN_HEIGHT + 10, BOTTOM_SHEET_MAX_HEIGHT + 10],
          extrapolate: 'clamp',
        })
      }
    ]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['All', 'Bikes', 'Scooters','Cars'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip, 
              { backgroundColor: colors.surface },
              filterType === type && { backgroundColor: colors.primary }
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[
              styles.filterText, 
              { color: colors.text },
              filterType === type && { color: '#fff' }
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
});