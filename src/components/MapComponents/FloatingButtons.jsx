import React from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function FloatingButtons({ bottomSheetAnim, BOTTOM_SHEET_MIN_HEIGHT, BOTTOM_SHEET_MAX_HEIGHT, onLocationPress, onRefresh }) {
  const { colors } = useTheme();
  return (
    <Animated.View style={[
      styles.fabContainer,
      {
        bottom: bottomSheetAnim.interpolate({
          inputRange: [BOTTOM_SHEET_MIN_HEIGHT, BOTTOM_SHEET_MAX_HEIGHT],
          outputRange: [BOTTOM_SHEET_MIN_HEIGHT + 20, BOTTOM_SHEET_MAX_HEIGHT + 20],
          extrapolate: 'clamp',
        })
      }
    ]}>
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.surface }]} onPress={onLocationPress}>
        <Text style={styles.fabIcon}>📍</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.surface }]} onPress={onRefresh}>
        <Text style={styles.fabIcon}>🔄</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 20,
  },
});