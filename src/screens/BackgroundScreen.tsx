import React from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Background, Template } from '../types';
import type { TemplateCount } from '../types';
import { theme } from '../theme';

const SLOT_OPTIONS: TemplateCount[] = [1, 2, 3, 4];

interface Props {
  template: Template | null;
  backgrounds: Background[];
  selected: Background | null;
  selectedSlotCount: 1 | 2 | 3 | 4;
  onSlotCountChange: (n: 1 | 2 | 3 | 4) => void;
  title: string;
  names: string;
  date: string;
  loading: boolean;
  onSelectBackground: (bg: Background) => void;
  onTitleChange: (v: string) => void;
  onNamesChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function BackgroundScreen({
  template,
  backgrounds,
  selected,
  selectedSlotCount,
  onSlotCountChange,
  title,
  names,
  date,
  loading,
  onSelectBackground,
  onTitleChange,
  onNamesChange,
  onDateChange,
  onBack,
  onContinue,
}: Props) {
  const behavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 20;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={onBack} hitSlop={12}>
          <Text style={styles.backPillText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.step}>2. Details</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Strip details</Text>
        <Text style={styles.sub}>Optional text that appears on your strip.</Text>

        {template != null && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Number of photos</Text>
            <View style={styles.slotRow}>
              {(template.slotOptions ?? SLOT_OPTIONS).map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.slotPill, selectedSlotCount === n && styles.slotPillActive]}
                  onPress={() => onSlotCountChange(n)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotPillText, selectedSlotCount === n && styles.slotPillTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {loading && backgrounds.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : null}

        {backgrounds.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Background</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bgScrollContent}
              style={styles.bgScroll}
            >
              {backgrounds.map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  style={[styles.bgCard, selected?.id === bg.id && styles.bgCardActive]}
                  onPress={() => onSelectBackground(bg)}
                  activeOpacity={0.85}
                >
                  {bg.imageUrl ? (
                    <Image source={{ uri: bg.imageUrl }} style={styles.bgImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.bgPlaceholder}>
                      <Text style={styles.bgPlaceholderText}>Original</Text>
                    </View>
                  )}
                  <Text style={styles.bgName} numberOfLines={1}>{bg.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={onTitleChange}
            placeholder="e.g. Forever Yours"
            placeholderTextColor={theme.colors.textMuted}
            maxLength={40}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Names</Text>
          <TextInput
            style={styles.input}
            value={names}
            onChangeText={onNamesChange}
            placeholder="e.g. Nelly & William"
            placeholderTextColor={theme.colors.textMuted}
            maxLength={60}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date (optional)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={onDateChange}
            placeholder="e.g. September 18, 2033"
            placeholderTextColor={theme.colors.textMuted}
            maxLength={30}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.9}>
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backPill: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  backPillText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  step: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  loading: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  slotPill: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  slotPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotPillText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  slotPillTextActive: {
    color: theme.colors.surface,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bgScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  bgScrollContent: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  bgCard: {
    width: 100,
    minWidth: 100,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bgCardActive: {
    borderColor: theme.colors.primary,
  },
  bgImage: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.surfaceElevated,
  },
  bgPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgPlaceholderText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  bgName: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    padding: theme.spacing.xs,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
