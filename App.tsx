import { StatusBar } from 'expo-status-bar';
import { readAsStringAsync } from 'expo-file-system/legacy';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { I18nProvider, useI18n, isValidLocale } from './src/i18n';
import { fetchTemplates, fetchBackgrounds, generateStrip } from './src/api';
import type { Background, Template } from './src/types';
import {
  getWelcomeSeen,
  setWelcomeSeen,
  getGalleryEntries,
  addGalleryEntry,
  getPermissionsDone,
  setPermissionsDone,
  getHasPaidPlan,
  setHasPaidPlan,
  type GalleryEntry,
} from './src/storage';
import * as authService from './src/services/authService';
import type { User } from './src/services/authService';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TemplateScreen } from './src/screens/TemplateScreen';
import { BackgroundScreen } from './src/screens/BackgroundScreen';
import { CaptureScreen } from './src/screens/CaptureScreen';
import { GeneratingScreen } from './src/screens/GeneratingScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PermissionsScreen } from './src/screens/PermissionsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { PricingScreen } from './src/screens/PricingScreen';
import { TabBar, type TabId } from './src/components/TabBar';

type Step = 'welcome' | 'permissions' | 'main' | 'auth' | 'pricing' | 'background' | 'capture' | 'generating' | 'result';

function AppContent() {
  const [initializing, setInitializing] = useState(true);
  const { setLocale } = useI18n();
  const [hasSeenWelcome, setHasSeenWelcomeState] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState<Step>('welcome');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [pendingAuthTab, setPendingAuthTab] = useState<'gallery' | 'profile' | null>(null);
  const [galleryEntries, setGalleryEntries] = useState<GalleryEntry[]>([]);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [backgroundsLoading, setBackgroundsLoading] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedSlotCount, setSelectedSlotCount] = useState<1 | 2 | 3 | 4>(3);
  const [background, setBackground] = useState<Background | null>(null);
  const [title, setTitle] = useState('');
  const [names, setNames] = useState('');
  const [date, setDate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [generatedImageMimeType, setGeneratedImageMimeType] = useState<string>('image/png');
  const [generatedStripUrl, setGeneratedStripUrl] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const generatingRef = useRef(false);
  const [hasPaidPlan, setHasPaidPlanState] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [seen, done, currentUser, entries, paid] = await Promise.all([
          getWelcomeSeen(),
          getPermissionsDone(),
          authService.getCurrentUser().catch(() => null),
          getGalleryEntries(),
          getHasPaidPlan(),
        ]);
        if (!cancelled) {
          setHasSeenWelcomeState(seen);
          setUser(currentUser ?? null);
          setGalleryEntries(entries);
          setHasPaidPlanState(currentUser?.hasPaidAccess ?? paid);
          if (!seen) setStep('welcome');
          else if (!done) setStep('permissions');
          else setStep('main');
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTemplatesLoading(true);
      try {
        const list = await fetchTemplates();
        if (!cancelled) setTemplates(list);
      } catch (e) {
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBackgroundsLoading(true);
      try {
        const list = await fetchBackgrounds();
        if (!cancelled) setBackgrounds(list);
      } catch (e) {
        if (!cancelled) setBackgrounds([]);
      } finally {
        if (!cancelled) setBackgroundsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (step !== 'generating' || !template || photos.length === 0) return;
    if (generatingRef.current) return;
    generatingRef.current = true;
    setGenerateError(null);

    (async () => {
      try {
        const photoBase64s: string[] = [];
        for (const uri of photos) {
          const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
          photoBase64s.push(base64);
        }
        const slotCount = Math.min(4, Math.max(1, selectedSlotCount)) || photos.length;
        const token = await authService.getToken();
        const result = await generateStrip({
          templateId: template.id,
          templateImageUrl: template.imageUrl,
          backgroundImageUrl: background?.imageUrl ?? null,
          slotCount,
          photoBase64s,
          title,
          names,
          date,
          token: token ?? undefined,
        });
        if (result.success && (result.stripUrl || result.imageBase64)) {
          if (result.stripUrl) setGeneratedStripUrl(result.stripUrl);
          else setGeneratedStripUrl(null);
          setGeneratedImageBase64(result.imageBase64 ?? null);
          setGeneratedImageMimeType(result.mimeType || 'image/png');
          setStep('result');
        } else {
          setGenerateError(result.error || 'Failed to generate strip');
        }
      } catch (e) {
        setGenerateError(e instanceof Error ? e.message : 'Network error');
      } finally {
        generatingRef.current = false;
      }
    })();
  }, [step, template, background, photos, title, names, date, selectedSlotCount]);

  const handleStart = useCallback(async () => {
    await setWelcomeSeen();
    setHasSeenWelcomeState(true);
    setStep('permissions');
  }, []);

  const handlePermissionsDone = useCallback(async () => {
    await setPermissionsDone();
    setStep('main');
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    if ((tab === 'gallery' || tab === 'profile') && !user) {
      setPendingAuthTab(tab);
      setStep('auth');
    } else {
      setActiveTab(tab);
    }
  }, [user]);

  const handleAuthSuccess = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    setHasPaidPlanState(currentUser?.hasPaidAccess ?? false);
    setStep('main');
    if (pendingAuthTab) {
      setActiveTab(pendingAuthTab);
      setPendingAuthTab(null);
    }
  }, [pendingAuthTab]);

  const handleAuthBack = useCallback(() => {
    setStep('main');
    setPendingAuthTab(null);
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setHasPaidPlanState(false);
  }, []);

  const handleDeleteAccount = useCallback(async (password: string) => {
    await authService.deleteAccount(password);
    setUser(null);
  }, []);

  const handleLanguageChange = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  useEffect(() => {
    if (user?.language && isValidLocale(user.language)) setLocale(user.language);
  }, [user?.language, setLocale]);

  const handleOpenPricing = useCallback(() => {
    setStep('pricing');
  }, []);

  const handlePricingBack = useCallback(() => {
    setStep('main');
  }, []);

  const handlePurchaseSuccess = useCallback(async (planId: 'WEEKLY' | 'PRO' | 'ANNUAL') => {
    const now = new Date();
    const addDays = (d: Date, days: number) => { const x = new Date(d); x.setDate(x.getDate() + days); return x; };
    const expiryByPlan = { WEEKLY: addDays(now, 7), PRO: addDays(now, 31), ANNUAL: addDays(now, 366) };
    const subscriptionExpiresAt = expiryByPlan[planId]?.toISOString() ?? addDays(now, 31).toISOString();
    try {
      const updatedUser = await authService.updateProfile({ planId, subscriptionExpiresAt });
      setHasPaidPlanState(updatedUser.hasPaidAccess ?? true);
      setUser(updatedUser);
      await setHasPaidPlan(true);
    } catch {
      setHasPaidPlanState(true);
      await setHasPaidPlan(true);
    }
  }, []);

  const refreshGallery = useCallback(async () => {
    const entries = await getGalleryEntries();
    setGalleryEntries(entries);
  }, []);

  const handleSavedToGallery = useCallback(async (entry: { uri: string; createdAt: string; templateName?: string }) => {
    const added = await addGalleryEntry(entry);
    setGalleryEntries((prev) => [added, ...prev]);
  }, []);

  const goBack = useCallback(() => {
    if (step === 'background') setStep('main');
    else if (step === 'capture') setStep('background');
    else if (step === 'result') {
      setStep('capture');
      setGeneratedImageBase64(null);
      setGeneratedStripUrl(null);
      setGenerateError(null);
    }
  }, [step]);

  const handleNewStrip = useCallback(() => {
    setStep('main');
    setActiveTab('home');
    setTemplate(null);
    setSelectedSlotCount(3);
    setBackground(null);
    setTitle('');
    setNames('');
    setDate('');
    setPhotos([]);
    setGeneratedImageBase64(null);
    setGeneratedStripUrl(null);
    setGenerateError(null);
  }, []);

  const handleDoneCapture = useCallback((uris: string[]) => {
    setPhotos(uris);
    setGenerateError(null);
    setStep('generating');
  }, []);

  if (initializing) {
    return <SafeAreaView style={styles.container} />;
  }

  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <WelcomeScreen onStart={handleStart} />
      </SafeAreaView>
    );
  }

  if (step === 'permissions') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <PermissionsScreen onContinue={handlePermissionsDone} />
      </SafeAreaView>
    );
  }

  if (step === 'main') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.mainContent}>
          {activeTab === 'home' && (
            <TemplateScreen
              templates={templates}
              selected={template}
              loading={templatesLoading}
              onSelect={(t) => {
                setTemplate(t);
                const valid = Math.min(4, Math.max(1, t.slotCount ?? 3)) as 1 | 2 | 3 | 4;
                setSelectedSlotCount(valid);
              }}
              onBack={() => {}}
              onContinue={() => setStep('background')}
              hideBack
            />
          )}
          {activeTab === 'gallery' && (
            <GalleryScreen entries={galleryEntries} onRefresh={refreshGallery} />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen
              user={user}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onOpenPricing={handleOpenPricing}
              onLanguageChange={handleLanguageChange}
            />
          )}
        </View>
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </SafeAreaView>
    );
  }

  if (step === 'background') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <BackgroundScreen
          template={template}
          backgrounds={backgrounds}
          selected={background}
          selectedSlotCount={selectedSlotCount}
          onSlotCountChange={setSelectedSlotCount}
          title={title}
          names={names}
          date={date}
          loading={backgroundsLoading}
          onSelectBackground={setBackground}
          onTitleChange={setTitle}
          onNamesChange={setNames}
          onDateChange={setDate}
          onBack={goBack}
          onContinue={() => setStep('capture')}
        />
      </SafeAreaView>
    );
  }

  if (step === 'capture' && template !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <CaptureScreen
          template={template}
          slotCount={selectedSlotCount}
          onBack={goBack}
          onDone={handleDoneCapture}
        />
      </SafeAreaView>
    );
  }

  if (step === 'generating') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <GeneratingScreen
          error={generateError}
          onBack={() => {
            setStep('capture');
            setGenerateError(null);
          }}
        />
      </SafeAreaView>
    );
  }

  if (step === 'result' && (generatedStripUrl || generatedImageBase64)) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ResultScreen
          generatedStripUrl={generatedStripUrl}
          generatedImageBase64={generatedImageBase64}
          generatedImageMimeType={generatedImageMimeType}
          generateError={generateError}
          slotCount={selectedSlotCount}
          templateName={template?.name}
          templateIsFree={template?.isFree !== false}
          userHasPaidPlan={hasPaidPlan}
          onBack={goBack}
          onNewStrip={handleNewStrip}
          onSavedToGallery={handleSavedToGallery}
          onOpenPricing={handleOpenPricing}
        />
      </SafeAreaView>
    );
  }

  if (step === 'auth') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <AuthScreen
          returnTo={pendingAuthTab ?? 'profile'}
          onSuccess={handleAuthSuccess}
          onBack={handleAuthBack}
        />
      </SafeAreaView>
    );
  }

  if (step === 'pricing') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <PricingScreen
          onBack={handlePricingBack}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.mainContent} />
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  mainContent: {
    flex: 1,
  },
});

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
