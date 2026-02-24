import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import type { Template } from '../types';
import { theme } from '../theme';

const TIMER_OPTIONS = [0, 3, 5, 10] as const;

interface Props {
  template: Template;
  slotCount: 2 | 3 | 4;
  onBack: () => void;
  onDone: (photos: string[]) => void;
}

export function CaptureScreen({ template, slotCount, onBack, onDone }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 5 | 10>(3);
  const cameraRef = useRef<CameraView>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = Math.min(4, Math.max(2, slotCount));
  const currentIndex = photos.length;
  const isComplete = currentIndex >= count;

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing || isComplete) return;
    try {
      setIsCapturing(true);
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
      });
      if (result?.uri) setPhotos((prev) => [...prev, result.uri]);
    } catch (e) {
      console.warn('Capture error', e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCapture = () => {
    if (!cameraRef.current || isCapturing || isComplete || countdown !== null) return;
    if (timerSeconds === 0) {
      takePhoto();
      return;
    }
    setCountdown(timerSeconds);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = timerSeconds - elapsed;
      if (left <= 0) {
        clearInterval(interval);
        countdownRef.current = null;
        setCountdown(null);
        takePhoto();
        return;
      }
      setCountdown(left);
    }, 100);
    countdownRef.current = interval;
  };

  const handleRemoveLast = () => {
    setPhotos((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  const handleDone = () => {
    if (photos.length === count) onDone(photos);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permCard}>
          <Text style={styles.permEmoji}>📷</Text>
          <Text style={styles.permTitle}>Camera access</Text>
          <Text style={styles.permText}>
            Allow camera access to take photos for your strip.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.permBtnText}>Allow camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permBack} onPress={onBack}>
            <Text style={styles.permBackText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        mode="picture"
      />

      {countdown !== null && (
        <View style={styles.countdownOverlay} pointerEvents="none">
          <View style={styles.countdownRing}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </View>
          <Text style={styles.countdownHint}>Get ready!</Text>
        </View>
      )}

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={onBack} hitSlop={12}>
          <Text style={styles.topBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>3. Shoot</Text>
        </View>
        <View style={styles.timerChips}>
          {TIMER_OPTIONS.map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[styles.chip, timerSeconds === sec && styles.chipActive]}
              onPress={() => setTimerSeconds(sec)}
              disabled={countdown !== null}
            >
              <Text style={[styles.chipText, timerSeconds === sec && styles.chipTextActive]}>
                {sec === 0 ? 'Now' : `${sec}s`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom control card - compact */}
      <View style={styles.bottomCard}>
        <View style={styles.bottomRow}>
          <Text style={styles.progressText}>{currentIndex}/{count}</Text>
          {photos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbsScroll}
              contentContainerStyle={styles.thumbsContent}
            >
              {photos.map((uri, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <View style={styles.thumbBadge}>
                    <Text style={styles.thumbBadgeText}>{i + 1}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : null}
          {photos.length > 0 && !isComplete && (
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveLast}>
              <Text style={styles.removeBtnText}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.captureRow}>
          <TouchableOpacity
            style={[styles.captureBtn, (isCapturing || isComplete) && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={isCapturing || isComplete}
            activeOpacity={0.9}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.doneBtn, !isComplete && styles.doneBtnDisabled]}
          onPress={handleDone}
          disabled={!isComplete}
          activeOpacity={0.9}
        >
          <Text style={styles.doneBtnText}>Create strip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Permission
  permCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  permEmoji: {
    fontSize: 56,
    marginBottom: theme.spacing.md,
  },
  permTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  permText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  permBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl * 1.5,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  permBtnText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
  permBack: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  permBackText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },

  // Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  countdownRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countdownHint: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: theme.spacing.sm,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topBtn: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  topBtnText: {
    ...theme.typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.radii.full,
  },
  stepPillText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timerChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.radii.full,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Bottom card - compact
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 10,
    paddingBottom: (Platform.OS === 'ios' ? 28 : 16) + 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: theme.spacing.sm,
    minHeight: 44,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    minWidth: 28,
  },
  thumbsScroll: {
    flex: 1,
    maxHeight: 48,
  },
  thumbsContent: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: theme.colors.border,
  },
  thumbBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  removeBtnText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  captureRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  captureBtnDisabled: {
    opacity: 0.5,
    borderColor: theme.colors.border,
  },
  captureBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  doneBtnDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.8,
  },
  doneBtnText: {
    ...theme.typography.button,
    color: theme.colors.surface,
    fontSize: 16,
  },
});
