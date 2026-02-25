import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import type { User } from '../storage';

interface Props {
  user: User | null;
  onLogout: () => void;
}

export function ProfileScreen({ user, onLogout }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Mipo</Text>
        </View>
        <Text style={styles.title}>Profile</Text>
        {user ? (
          <>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
              <Text style={styles.logoutBtnText}>Log out</Text>
            </TouchableOpacity>
          </>
        ) : null}
        <Text style={styles.sub}>
          Your photobooth strips, your way. Create and save memories with custom templates.
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  logoWrap: {
    marginBottom: theme.spacing.lg,
  },
  logo: {
    ...theme.typography.hero,
    fontSize: 36,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  title: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  displayName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
  },
  logoutBtnText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  meta: {
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
