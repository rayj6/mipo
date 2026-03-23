import { ChevronLeft, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../theme';
import * as authService from '../services/authService';

type Mode = 'login' | 'register' | 'forgot';

interface Props {
  returnTo: 'gallery' | 'profile';
  onSuccess: () => void;
  onBack: () => void;
}

export function AuthScreen({ returnTo, onSuccess, onBack }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const title = useMemo(() => {
    if (mode === 'register') return 'Create your account';
    if (mode === 'forgot') return 'Recover your account';
    return 'Welcome back';
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === 'register') return 'Register to sync gallery, plans, and profile.';
    if (mode === 'forgot') return 'Request a reset token and set a new password.';
    return 'Sign in to unlock your saved strips and paid templates.';
  }, [mode]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setMessage('');
  };

  const handlePrimaryAction = async () => {
    setError('');
    setMessage('');
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = displayName.trim();

    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        if (!password) {
          setError('Please enter your password.');
          return;
        }
        await authService.login(trimmedEmail, password);
        onSuccess();
        return;
      }

      if (mode === 'register') {
        if (!password || password.length < 8) {
          setError('Password must be at least 8 characters.');
          return;
        }
        if (!trimmedName) {
          setError('Please enter a display name.');
          return;
        }
        await authService.register(trimmedEmail, password, trimmedName);
        onSuccess();
        return;
      }

      if (!resetToken && !newPassword) {
        const result = await authService.forgotPassword(trimmedEmail);
        setMessage(result.message || 'Reset instructions sent.');
        if (result.resetToken) {
          setResetToken(result.resetToken);
          setMessage('Reset token created. Enter your new password below.');
        }
      } else {
        if (!resetToken.trim()) {
          setError('Please enter reset token.');
          return;
        }
        if (!newPassword || newPassword.length < 8) {
          setError('New password must be at least 8 characters.');
          return;
        }
        await authService.resetPassword(resetToken.trim(), newPassword);
        setMessage('Password reset completed. You can now log in.');
        setResetToken('');
        setNewPassword('');
        setPassword('');
        switchMode('login');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemo = async () => {
    setError('');
    setMessage('');
    setDemoLoading(true);
    try {
      await authService.createDemoAccount();
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start demo account.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <ChevronLeft size={22} color={theme.colors.primary} strokeWidth={2.5} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{returnTo === 'gallery' ? 'Gallery' : 'Profile'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Sparkles size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSub}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.toggleBtn, mode === 'login' && styles.toggleBtnActive]} onPress={() => switchMode('login')}>
              <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, mode === 'register' && styles.toggleBtnActive]} onPress={() => switchMode('register')}>
              <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, mode === 'forgot' && styles.toggleBtnActive]} onPress={() => switchMode('forgot')}>
              <Text style={[styles.toggleText, mode === 'forgot' && styles.toggleTextActive]}>Forgot</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          <View style={styles.inputWrap}>
            <Mail size={16} color={theme.colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading && !demoLoading}
            />
          </View>

          {mode === 'register' ? (
            <View style={styles.inputWrap}>
              <UserIcon size={16} color={theme.colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Display name"
                placeholderTextColor={theme.colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                editable={!loading && !demoLoading}
              />
            </View>
          ) : null}

          {mode !== 'forgot' ? (
            <View style={styles.inputWrap}>
              <Lock size={16} color={theme.colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={mode === 'login' ? 'Password' : 'Choose password (min 8)'}
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading && !demoLoading}
              />
            </View>
          ) : (
            <>
              <View style={styles.inputWrap}>
                <Lock size={16} color={theme.colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Reset token (optional at first)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={resetToken}
                  onChangeText={setResetToken}
                  autoCapitalize="none"
                  editable={!loading && !demoLoading}
                />
              </View>
              <View style={styles.inputWrap}>
                <Lock size={16} color={theme.colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="New password (min 8)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  editable={!loading && !demoLoading}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handlePrimaryAction}
            disabled={loading || demoLoading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'login' ? 'Log in' : mode === 'register' ? 'Create account' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoBtn, demoLoading && styles.btnDisabled]}
            onPress={handleCreateDemo}
            disabled={loading || demoLoading}
            activeOpacity={0.9}
          >
            {demoLoading ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <Text style={styles.demoBtnText}>Create demo account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { ...theme.typography.bodySmall, color: theme.colors.primary, fontWeight: '600' },
  headerTitle: { ...theme.typography.bodySmall, fontWeight: '600', color: theme.colors.text },
  headerSpacer: { width: 48 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl * 2,
    gap: theme.spacing.lg,
  },
  hero: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDim,
    marginBottom: theme.spacing.sm,
  },
  heroTitle: { ...theme.typography.titleSmall, color: theme.colors.text, marginBottom: theme.spacing.xs },
  heroSub: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, lineHeight: 20 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: theme.spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    padding: 4,
    marginBottom: theme.spacing.xs,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.radii.sm },
  toggleBtnActive: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  toggleText: { ...theme.typography.caption, color: theme.colors.textMuted, fontWeight: '700' },
  toggleTextActive: { color: theme.colors.text },
  errorText: { ...theme.typography.bodySmall, color: theme.colors.error },
  messageText: { ...theme.typography.bodySmall, color: theme.colors.success },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: 13,
  },
  primaryBtn: {
    marginTop: theme.spacing.sm,
    minHeight: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { ...theme.typography.button, color: theme.colors.surface },
  demoBtn: {
    minHeight: 46,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  demoBtnText: { ...theme.typography.bodySmall, color: theme.colors.primary, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
