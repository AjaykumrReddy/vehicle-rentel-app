import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function DashboardTabBar({ tabs, activeTab, onTabPress }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: colors.primary + '15', borderBottomColor: colors.primary }
            ]}
            onPress={() => onTabPress(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabTitle,
              { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
            ]}>
              {tab.title}
            </Text>
            {tab.count !== null && (
              <Text style={[
                styles.tabCount,
                { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
              ]}>
                {tab.count}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { borderBottomWidth: 1, paddingVertical: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabIcon: { fontSize: 16, marginRight: 6 },
  tabTitle: { fontSize: 14, fontWeight: '600', marginRight: 6 },
  tabCount: { fontSize: 12, fontWeight: '500' },
});