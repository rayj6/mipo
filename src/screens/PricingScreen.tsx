import { ChevronLeft, Check, CreditCard } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../theme';
import { PLANS, type Plan, type PlanId } from '../constants/plans';
import * as iapService from '../services/iapService';

interface Props {
  onBack: () => void;
  /** Called when user successfully completes a paid purchase (so app can mark them as paid). */
  onPurchaseSuccess?: () => void;
}

export function PricingScreen({ onBack, onPurchaseSuccess }: Props) {
  const [purchasingPlanId, setPurchasingPlanId] = useState<PlanId | null>(null);

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.id === 'FREE') {
      return;
    }
    setPurchasingPlanId(plan.id);
    try {
      const result = await iapService.purchasePlan(plan.id);
      if (result.success) {
        onPurchaseSuccess?.();
      }
    } finally {
      setPurchasingPlanId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <ChevronLeft size={22} color={theme.colors.primary} strokeWidth={2.5} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói dịch vụ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Plans & Pricing</Text>
        <Text style={styles.sectionSub}>
          Chọn gói phù hợp với bạn. Thanh toán qua Apple In-App Purchase.
        </Text>

        {PLANS.map((plan) => {
          const isFree = plan.id === 'FREE';
          const isPurchasing = purchasingPlanId === plan.id;

          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.highlight && styles.planCardHighlight,
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.nameVi}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
              <Text style={styles.planAudience}>{plan.audience}</Text>

              {plan.features.length > 0 && (
                <View style={styles.featuresWrap}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Check size={16} color={theme.colors.success} strokeWidth={2.5} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}

              {!isFree && (
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    plan.highlight && styles.selectBtnHighlight,
                    isPurchasing && styles.selectBtnDisabled,
                  ]}
                  onPress={() => handleSelectPlan(plan)}
                  disabled={isPurchasing}
                  activeOpacity={0.85}
                >
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color={plan.highlight ? '#fff' : theme.colors.primary} />
                  ) : (
                    <>
                      <CreditCard size={18} color={plan.highlight ? '#fff' : theme.colors.primary} strokeWidth={2} />
                      <Text style={[styles.selectBtnText, plan.highlight && styles.selectBtnTextHighlight]}>
                        Chọn gói
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {isFree && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Gói hiện tại</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 70,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 32,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  planCardHighlight: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryDim,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  planName: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    flex: 1,
  },
  planPrice: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  planAudience: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  featuresWrap: {
    marginBottom: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    flex: 1,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  selectBtnHighlight: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectBtnDisabled: {
    opacity: 0.7,
  },
  selectBtnText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  selectBtnTextHighlight: {
    color: theme.colors.surface,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.background,
  },
  currentBadgeText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
});
