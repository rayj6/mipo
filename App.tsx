import { StatusBar } from 'expo-status-bar';
import { readAsStringAsync } from 'expo-file-system/legacy';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { fetchTemplates, fetchBackgrounds, generateStrip } from './src/api';
import type { Background, Template } from './src/types';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TemplateScreen } from './src/screens/TemplateScreen';
import { BackgroundScreen } from './src/screens/BackgroundScreen';
import { CaptureScreen } from './src/screens/CaptureScreen';
import { GeneratingScreen } from './src/screens/GeneratingScreen';
import { ResultScreen } from './src/screens/ResultScreen';

type Step = 'welcome' | 'templates' | 'background' | 'capture' | 'generating' | 'result';

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [backgroundsLoading, setBackgroundsLoading] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  /** Number of photos for this strip (2, 3, or 4). Set from template.slotCount when template is selected. */
  const [selectedSlotCount, setSelectedSlotCount] = useState<2 | 3 | 4>(3);
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

  // When step is 'generating', read photos to base64 and call Gemini via server
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
        const slotCount = Math.min(4, Math.max(2, selectedSlotCount)) || photos.length;
        const result = await generateStrip({
          templateId: template.id,
          templateImageUrl: template.imageUrl,
          backgroundImageUrl: background?.imageUrl ?? null,
          slotCount,
          photoBase64s,
          title,
          names,
          date,
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

  const goTo = useCallback((s: Step) => setStep(s), []);
  const goBack = useCallback(() => {
    if (step === 'templates') setStep('welcome');
    else if (step === 'background') setStep('templates');
    else if (step === 'capture') setStep('background');
    else if (step === 'result') {
      setStep('capture');
      setGeneratedImageBase64(null);
      setGeneratedStripUrl(null);
      setGenerateError(null);
    }
  }, [step]);

  const handleNewStrip = useCallback(() => {
    setStep('welcome');
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {step === 'welcome' && (
        <WelcomeScreen onStart={() => goTo('templates')} />
      )}
      {step === 'templates' && (
        <TemplateScreen
          templates={templates}
          selected={template}
          loading={templatesLoading}
          onSelect={(t) => {
            setTemplate(t);
            const valid = Math.min(4, Math.max(2, t.slotCount ?? 3)) as 2 | 3 | 4;
            setSelectedSlotCount(valid);
          }}
          selectedSlotCount={selectedSlotCount}
          onSlotCountChange={setSelectedSlotCount}
          onBack={goBack}
          onContinue={() => goTo('background')}
        />
      )}
      {step === 'background' && (
        <BackgroundScreen
          backgrounds={backgrounds}
          selected={background}
          title={title}
          names={names}
          date={date}
          loading={backgroundsLoading}
          onSelectBackground={setBackground}
          onTitleChange={setTitle}
          onNamesChange={setNames}
          onDateChange={setDate}
          onBack={goBack}
          onContinue={() => goTo('capture')}
        />
      )}
      {step === 'capture' && template !== null && (
        <CaptureScreen
          template={template}
          slotCount={selectedSlotCount}
          onBack={goBack}
          onDone={handleDoneCapture}
        />
      )}
      {step === 'generating' && (
        <GeneratingScreen
          error={generateError}
          onBack={() => {
            setStep('capture');
            setGenerateError(null);
          }}
        />
      )}
      {step === 'result' && (generatedStripUrl || generatedImageBase64) && (
        <ResultScreen
          generatedStripUrl={generatedStripUrl}
          generatedImageBase64={generatedImageBase64}
          generatedImageMimeType={generatedImageMimeType}
          generateError={generateError}
          slotCount={selectedSlotCount}
          onBack={goBack}
          onNewStrip={handleNewStrip}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
});
