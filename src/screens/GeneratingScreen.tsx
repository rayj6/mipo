import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  error?: string | null;
  onBack?: () => void;
}

export function GeneratingScreen({ error, onBack }: Props) {
  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          {onBack && (
            <TouchableOpacity style={styles.cta} onPress={onBack} activeOpacity={0.9}>
              <Text style={styles.ctaText}>Back to photos</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.label}>Creating your strip</Text>
          <Text style={styles.sublabel}>Just a moment…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  label: {
    marginTop: theme.spacing.lg,
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sublabel: {
    marginTop: theme.spacing.xs,
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  errorTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    maxWidth: 280,
  },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
  },
  ctaText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
});
