import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import ViewShot from 'react-native-view-shot';
import { writeAsStringAsync, cacheDirectory, readAsStringAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { theme } from '../theme';
import { uploadTempImage, getSaveFrameUrl } from '../api';

interface Props {
  generatedStripUrl: string | null;
  generatedImageBase64: string | null;
  generatedImageMimeType: string;
  generateError: string | null;
  /** Number of photo slots (2, 3, or 4) so strip height fits content */
  slotCount?: 2 | 3 | 4;
  onBack: () => void;
  onNewStrip: () => void;
}

const DATA_URI_PREFIX = 'data:';
const STRIP_CONTENT_WIDTH = 280;
const STRIP_HEIGHT_BY_SLOTS: Record<number, number> = {
  2: 798,
  3: 1148,
  4: 1498,
};

export function ResultScreen({
  generatedStripUrl,
  generatedImageBase64,
  generatedImageMimeType,
  generateError,
  slotCount = 3,
  onBack,
  onNewStrip,
}: Props) {
  const viewShotRef = useRef<ViewShot>(null);
  const saveFrameRef = useRef<ViewShot>(null);
  const pendingSaveRef = useRef<{ capture: () => Promise<void> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stripReady, setStripReady] = useState(false);
  const [saveFrameUrl, setSaveFrameUrl] = useState<string | null>(null);
  const { width: windowWidth } = useWindowDimensions();

  const SAVE_FRAME_WIDTH = 600;
  const SAVE_FRAME_HEIGHT = 800;
  const stripWidth = Math.min(320, windowWidth - theme.spacing.lg * 2);
  const contentHeight = STRIP_HEIGHT_BY_SLOTS[slotCount] ?? STRIP_HEIGHT_BY_SLOTS[3];
  const stripHeight = Math.round((contentHeight / STRIP_CONTENT_WIDTH) * stripWidth);

  useEffect(() => {
    if (generatedStripUrl) setStripReady(false);
  }, [generatedStripUrl]);

  const imageUri =
    generatedImageBase64 &&
    `${DATA_URI_PREFIX}${generatedImageMimeType};base64,${generatedImageBase64}`;

  const handleSaveToGallery = async () => {
    if (Platform.OS === 'web') return;
    setSaving(true);
    setSaved(false);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to save photos to your gallery.');
        return;
      }
      let stripBase64: string;
      if (generatedStripUrl && viewShotRef.current) {
        await new Promise((r) => setTimeout(r, 400));
        const uri = await (viewShotRef.current as any)?.capture?.();
        if (!uri) {
          Alert.alert('Save failed', 'Could not capture the strip. Try again.');
          return;
        }
        stripBase64 = await readAsStringAsync(uri, { encoding: 'base64' });
      } else if (generatedImageBase64) {
        stripBase64 = generatedImageBase64.includes(',') ? generatedImageBase64.split(',')[1] : generatedImageBase64;
      } else {
        Alert.alert('Save failed', 'No image to save.');
        return;
      }
      const uploadResult = await uploadTempImage(stripBase64);
      if ('error' in uploadResult) {
        Alert.alert('Save failed', uploadResult.error);
        return;
      }
      const doCaptureAndSave = async () => {
        try {
          await new Promise((r) => setTimeout(r, 500));
          const uri = await (saveFrameRef.current as any)?.capture?.();
          if (uri) {
            await MediaLibrary.saveToLibraryAsync(uri);
            setSaved(true);
          } else {
            Alert.alert('Save failed', 'Could not create save image.');
          }
        } catch (e) {
          Alert.alert('Save failed', e instanceof Error ? e.message : 'Try again.');
        } finally {
          setSaveFrameUrl(null);
          setSaving(false);
        }
      };
      pendingSaveRef.current = { capture: doCaptureAndSave };
      setSaveFrameUrl(getSaveFrameUrl(uploadResult.imageUrl));
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Try again.');
      setSaving(false);
    }
  };

  const handleSaveFrameLoad = () => {
    pendingSaveRef.current?.capture?.();
    pendingSaveRef.current = null;
  };

  const canSave = Platform.OS !== 'web' && (generatedStripUrl || generatedImageBase64);
  const saveReady = generatedStripUrl ? stripReady : true;
  const hasResult = !generateError && (generatedStripUrl || imageUri);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backPill} onPress={onBack} hitSlop={12}>
          <Text style={styles.backPillText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.step}>Your strip</Text>
      </View>

      {generateError ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{generateError}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.stripContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1 }}
            style={[styles.viewShot, { width: stripWidth, height: stripHeight }]}
          >
            {generatedStripUrl ? (
              <WebView
                source={{ uri: generatedStripUrl }}
                style={[styles.webview, { width: stripWidth, height: stripHeight }]}
                scrollEnabled={false}
                scalesPageToFit={false}
                onLoadEnd={() => setTimeout(() => setStripReady(true), 300)}
              />
            ) : imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[styles.resultImage, { width: stripWidth, height: stripHeight }]}
                resizeMode="cover"
              />
            ) : null}
          </ViewShot>
        </View>

        {hasResult ? (
          <View style={styles.downloadSection}>
            <Text style={styles.downloadTitle}>Download</Text>
            <Text style={styles.downloadSub}>
              Save your strip to your photo library.
            </Text>
            {canSave ? (
              <>
                <TouchableOpacity
                  style={[styles.saveBtn, (saving || !saveReady) && styles.saveBtnDisabled]}
                  onPress={handleSaveToGallery}
                  disabled={saving || !saveReady}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveBtnText}>
                    {saving ? 'Saving…' : saved ? 'Saved!' : !saveReady ? 'Loading…' : 'Save to gallery'}
                  </Text>
                </TouchableOpacity>
                {saved ? (
                  <Text style={styles.savedHint}>Strip saved to your gallery.</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.screenshotHint}>
                Take a screenshot to save the strip (e.g. power + volume).
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.newBtn} onPress={onNewStrip} activeOpacity={0.85}>
          <Text style={styles.newBtnText}>Create new strip</Text>
        </TouchableOpacity>
      </View>

      {saveFrameUrl ? (
        <View style={[styles.saveFrameOffscreen, { width: SAVE_FRAME_WIDTH, height: SAVE_FRAME_HEIGHT }]} pointerEvents="none">
          <ViewShot
            ref={saveFrameRef}
            options={{ format: 'png', quality: 1 }}
            style={{ width: SAVE_FRAME_WIDTH, height: SAVE_FRAME_HEIGHT }}
          >
            <WebView
              source={{ uri: saveFrameUrl }}
              style={{ width: SAVE_FRAME_WIDTH, height: SAVE_FRAME_HEIGHT }}
              scrollEnabled={false}
              scalesPageToFit={false}
              onLoadEnd={handleSaveFrameLoad}
            />
          </ViewShot>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  saveFrameOffscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
    overflow: 'hidden',
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
  errorBlock: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  stripContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  viewShot: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  webview: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
  },
  resultImage: {
    borderRadius: theme.radii.lg,
  },
  downloadSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  downloadTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  downloadSub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
  savedHint: {
    ...theme.typography.caption,
    color: theme.colors.success,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  screenshotHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 8,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  newBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  newBtnText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
});
