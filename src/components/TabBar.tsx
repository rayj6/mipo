import { Home, Images, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import { useI18n } from '../i18n';

export type TabId = 'home' | 'gallery' | 'profile';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; labelKey: string; icon: React.ComponentType<{ size: number; color: string }> }[] = [
  { id: 'home', labelKey: 'tabs.home', icon: Home },
  { id: 'gallery', labelKey: 'tabs.gallery', icon: Images },
  { id: 'profile', labelKey: 'tabs.profile', icon: User },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { t } = useI18n();
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
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
                size={22}
                color={isActive ? theme.colors.primary : theme.colors.textMuted}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>{t(tab.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 280,
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 4,
    borderRadius: theme.radii.md,
  },
  tabActive: {
    backgroundColor: theme.colors.primaryDim,
  },
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
