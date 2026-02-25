import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import type { Template } from '../types';
import { theme } from '../theme';
import { useI18n } from '../i18n/context';

interface Props {
  templates: Template[];
  selected: Template | null;
  loading: boolean;
  onSelect: (t: Template) => void;
  onBack: () => void;
  onContinue: () => void;
  /** When true, hide the back button (e.g. when used as Home tab). */
  hideBack?: boolean;
}

/** Pinterest-style: varying aspect ratios by slot count (taller = more slots) */
function getCardAspectRatio(slotCount: number): number {
  if (slotCount <= 1) return 1.0;
  if (slotCount === 2) return 0.95;
  if (slotCount === 3) return 0.78;
  return 0.65;
}

export function TemplateScreen({
  templates,
  selected,
  loading,
  onSelect,
  onBack,
  onContinue,
  hideBack = false,
}: Props) {
  const { width } = useWindowDimensions();
  const { t: tr } = useI18n();
  const gap = theme.spacing.sm;
  const padding = theme.spacing.lg;
  const numCols = 2;
  const cardWidth = (width - padding * 2 - gap) / numCols;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {hideBack ? <View style={styles.backPill} /> : (
            <TouchableOpacity style={styles.backPill} onPress={onBack} hitSlop={12}>
              <ChevronLeft size={22} color={theme.colors.textSecondary} strokeWidth={2.5} />
              <Text style={styles.backPillText}>Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.step}>{hideBack ? 'Templates' : '1. Template'}</Text>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const leftColumn: Template[] = [];
  const rightColumn: Template[] = [];
  templates.forEach((t, i) => {
    if (i % 2 === 0) leftColumn.push(t);
    else rightColumn.push(t);
  });

  const renderCard = (template: Template) => {
    const aspect = getCardAspectRatio(template.slotCount ?? 3);
    const isSelected = selected?.id === template.id;
    const isFree = template.isFree !== false;
    return (
      <TouchableOpacity
        key={template.id}
        style={[styles.pinCard, isSelected && styles.pinCardActive, { width: cardWidth, marginBottom: gap }]}
        onPress={() => onSelect(template)}
        activeOpacity={0.9}
      >
        <View style={styles.pinImageWrap}>
          {template.imageUrl ? (
            <Image
              source={{ uri: template.imageUrl }}
              style={[styles.pinImage, { height: cardWidth / aspect }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.pinPlaceholder, { height: cardWidth / aspect }]}>
              {Array.from({ length: Math.min(4, Math.max(1, template.slotCount ?? 3)) }).map((_, i) => (
                <View key={i} style={styles.placeholderSlot} />
              ))}
            </View>
          )}
          <View style={[styles.badge, isFree ? styles.badgeFree : styles.badgePaid]}>
            <Text style={styles.badgeText}>{isFree ? tr('templateBadge.free') : tr('templateBadge.paid')}</Text>
          </View>
        </View>
        <View style={styles.pinLabel}>
          <Text style={styles.pinName} numberOfLines={1}>{template.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {hideBack ? <View style={styles.backPill} /> : (
          <TouchableOpacity style={styles.backPill} onPress={onBack} hitSlop={12}>
            <ChevronLeft size={22} color={theme.colors.textSecondary} strokeWidth={2.5} />
            <Text style={styles.backPillText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.step}>{hideBack ? 'Templates' : '1. Template'}</Text>
      </View>

      <Text style={styles.title}>Pick a style</Text>
      <Text style={styles.sub}>Choose how your strip will look.</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.pinterestContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          {leftColumn.map(renderCard)}
        </View>
        <View style={[styles.column, { marginLeft: gap }]}>
          {rightColumn.map(renderCard)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !selected && styles.ctaDisabled]}
          onPress={onContinue}
          disabled={!selected}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>Continue</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  pinterestContent: {
    flexDirection: 'row',
    paddingBottom: theme.spacing.xl,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  pinCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pinCardActive: {
    borderColor: theme.colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  pinImageWrap: {
    position: 'relative',
    width: '100%',
  },
  pinImage: {
    width: '100%',
    backgroundColor: theme.colors.border,
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  badgeFree: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  badgePaid: {
    backgroundColor: 'rgba(234, 179, 8, 0.9)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  pinPlaceholder: {
    width: '100%',
    flexDirection: 'column',
    gap: 4,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.border,
  },
  placeholderSlot: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.sm,
  },
  pinLabel: {
    padding: theme.spacing.sm,
  },
  pinName: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.text,
  },
  footer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
});
