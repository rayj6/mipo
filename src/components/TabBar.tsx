import { Home, Images, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

export type TabId = 'home' | 'gallery' | 'profile';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size: number; color: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'profile', label: 'Profile', icon: User },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <Icon
                size={24}
                color={isActive ? theme.colors.primary : theme.colors.textMuted}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  tabActive: {},
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  labelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
