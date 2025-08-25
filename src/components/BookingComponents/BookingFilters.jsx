import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function BookingFilters({ filters, activeFilter, onFilterChange }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: activeFilter === filter.key ? colors.primary : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={[
              styles.filterLabel,
              { color: activeFilter === filter.key ? '#fff' : colors.text }
            ]}>
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View style={[
                styles.countBadge,
                { 
                  backgroundColor: activeFilter === filter.key 
                    ? 'rgba(255,255,255,0.2)' 
                    : colors.primary + '20'
                }
              ]}>
                <Text style={[
                  styles.countText,
                  { 
                    color: activeFilter === filter.key ? '#fff' : colors.primary 
                  }
                ]}>
                  {filter.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
});