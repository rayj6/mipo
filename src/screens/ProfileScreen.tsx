import { Globe, LogOut, Mail, Sparkles, Trash2, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../theme';
import type { User as UserType } from '../services/authService';
import * as authService from '../services/authService';
import { useI18n } from '../i18n';
import { LOCALE_NAMES, SUPPORTED_LOCALES, isValidLocale, type LocaleCode } from '../i18n';

interface Props {
  user: UserType | null;
  onLogout: () => void;
  onDeleteAccount: (password: string) => Promise<void>;
  onOpenPricing: () => void;
  onLanguageChange?: (user: UserType) => void;
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase() || '?';
}

export function ProfileScreen({ user, onLogout, onDeleteAccount, onOpenPricing, onLanguageChange }: Props) {
  const { t, locale, setLocale } = useI18n();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [languageLoading, setLanguageLoading] = useState(false);

  const currentLocale: LocaleCode = isValidLocale(locale) ? locale : 'en';

  const handleDeletePress = () => {
    Alert.alert(
      t('profile.deleteConfirmTitle'),
      t('profile.deleteConfirmMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        { text: t('profile.continue'), style: 'destructive', onPress: () => setDeleteModalVisible(true) },
      ]
    );
  };

  const handleDeleteSubmit = async () => {
    if (!deletePassword.trim()) {
      setDeleteError(t('profile.deletePasswordPlaceholder'));
      return;
    }
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await onDeleteAccount(deletePassword);
      setDeleteModalVisible(false);
      setDeletePassword('');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLanguageSelect = async (code: LocaleCode) => {
    setLanguageLoading(true);
    try {
      await setLocale(code);
      if (user) {
        const updated = await authService.updateProfile({ language: code });
        onLanguageChange?.(updated);
      }
      setLanguageModalVisible(false);
    } catch (e) {
      // ignore
    } finally {
      setLanguageLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletePassword('');
    setDeleteError('');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrap}>
            <Sparkles size={28} color={theme.colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>Mipo</Text>
        </View>

        {user ? (
          <>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText} numberOfLines={1}>
                  {getInitials(user.displayName)}
                </Text>
              </View>
            </View>
            <Text style={styles.displayName}>{user.displayName}</Text>

            <View style={styles.section}>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Mail size={18} color={theme.colors.textMuted} strokeWidth={2} />
                </View>
                <Text style={styles.rowLabel}>{t('profile.email')}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>{user.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setLanguageModalVisible(true)}
                disabled={languageLoading}
              >
                <View style={styles.rowIcon}>
                  <Globe size={18} color={theme.colors.textMuted} strokeWidth={2} />
                </View>
                <Text style={styles.rowLabel}>{t('profile.language')}</Text>
                <Text style={styles.rowValue}>{LOCALE_NAMES[currentLocale]}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={onLogout}
              activeOpacity={0.85}
            >
              <LogOut size={20} color={theme.colors.error} strokeWidth={2} />
              <Text style={styles.logoutBtnText}>{t('profile.logout')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAccountBtn}
              onPress={handleDeletePress}
              activeOpacity={0.85}
            >
              <Trash2 size={18} color={theme.colors.textMuted} strokeWidth={2} />
              <Text style={styles.deleteAccountBtnText}>{t('profile.deleteAccount')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.guestWrap}>
              <View style={styles.guestIconWrap}>
                <User size={40} color={theme.colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={styles.guestTitle}>{t('profile.notSignedIn')}</Text>
              <Text style={styles.guestSub}>{t('profile.notSignedInSub')}</Text>
            </View>
            <TouchableOpacity
              style={styles.languageRowGuest}
              onPress={() => setLanguageModalVisible(true)}
              disabled={languageLoading}
            >
              <Globe size={18} color={theme.colors.textMuted} strokeWidth={2} />
              <Text style={styles.rowLabel}>{t('profile.language')}</Text>
              <Text style={styles.rowValue}>{LOCALE_NAMES[currentLocale]}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={onOpenPricing} style={styles.footerPlanLink}>
            <Text style={styles.footerPlanLinkText}>{t('profile.plansPricing')}</Text>
          </TouchableOpacity>
          <Text style={styles.tagline}>{t('profile.tagline')}</Text>
          <Text style={styles.version}>{t('profile.version')}</Text>
        </View>
      </View>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('profile.language')}</Text>
            {SUPPORTED_LOCALES.map((code) => (
              <TouchableOpacity
                key={code}
                style={[styles.languageOption, code === currentLocale && styles.languageOptionActive]}
                onPress={() => handleLanguageSelect(code)}
                disabled={languageLoading}
              >
                <Text style={styles.languageOptionText}>{LOCALE_NAMES[code]}</Text>
                {code === currentLocale && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('profile.deleteConfirmTitle')}</Text>
            <Text style={styles.modalSub}>{t('profile.deletePasswordPlaceholder')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('auth.password')}
              placeholderTextColor={theme.colors.textMuted}
              value={deletePassword}
              onChangeText={(text) => { setDeletePassword(text); setDeleteError(''); }}
              secureTextEntry
              editable={!deleteLoading}
              autoCapitalize="none"
            />
            {deleteError ? <Text style={styles.modalError}>{deleteError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={closeDeleteModal}
                disabled={deleteLoading}
              >
                <Text style={styles.modalCancelText}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, deleteLoading && styles.modalBtnDisabled]}
                onPress={handleDeleteSubmit}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>{t('profile.deleteAccount')}</Text>
                )}
              </TouchableOpacity>
        </View>
      </View>
    </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl + 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  brandIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  displayName: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  rowIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    width: 48,
  },
  rowValue: {
    flex: 1,
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  logoutBtnText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.error,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  deleteAccountBtnText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  modalInput: {
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalError: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
  },
  modalBtnDisabled: {
    opacity: 0.7,
  },
  modalConfirmText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.xs,
  },
  languageOptionActive: {
    backgroundColor: theme.colors.primaryDim,
  },
  languageOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  languageOptionCheck: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  languageRowGuest: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
  },
  guestWrap: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  guestIconWrap: {
    marginBottom: theme.spacing.md,
  },
  guestTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  guestSub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  footer: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  footerPlanLink: {
    marginBottom: theme.spacing.sm,
  },
  footerPlanLinkText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  tagline: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  version: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
