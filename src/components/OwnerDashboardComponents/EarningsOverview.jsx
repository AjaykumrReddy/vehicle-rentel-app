import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function EarningsOverview({ earnings }) {
  const { colors } = useTheme();

  if (!earnings) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No earnings data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.earningsContainer}>
      <View style={[styles.earningsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.earningsTitle, { color: colors.text }]}>Earnings Overview</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningsItem}>
            <Text style={[styles.earningsAmount, { color: colors.primary }]}>₹{earnings.today}</Text>
            <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Today</Text>
          </View>
          <View style={styles.earningsItem}>
            <Text style={[styles.earningsAmount, { color: colors.primary }]}>₹{earnings.thisMonth}</Text>
            <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>This Month</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  earningsContainer: { padding: 16 },
  earningsCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  earningsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  earningsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  earningsItem: { alignItems: 'center' },
  earningsAmount: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  earningsLabel: { fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});