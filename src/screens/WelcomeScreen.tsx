import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PHOTO STRIPS</Text>
        </View>
        <Text style={styles.title}>Mipo</Text>
        <Text style={styles.subtitle}>
          Create your own photobooth strip in a few taps. Pick a style, add your photos, done.
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={onStart} activeOpacity={0.9}>
          <Text style={styles.ctaText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primaryDim,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.xl,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.primary,
  },
  title: {
    ...theme.typography.hero,
    color: theme.colors.text,
    letterSpacing: -1,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: {
    paddingTop: theme.spacing.lg,
  },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  ctaText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
});
