import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, ChevronLeft, FlipHorizontal } from 'lucide-react-native';
import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import type { Template } from '../types';
import { theme } from '../theme';

const ICON_SIZE = 24;
const ICON_COLOR = '#FFFFFF';

const TIMER_OPTIONS = [0, 3, 5, 10] as const;

interface Props {
  template: Template;
  slotCount: 1 | 2 | 3 | 4;
  onBack: () => void;
  onDone: (photos: string[]) => void;
}

export function CaptureScreen({ template, slotCount, onBack, onDone }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 5 | 10>(3);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const cameraRef = useRef<CameraView>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = Math.min(4, Math.max(1, slotCount));
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
          <View style={styles.permIconWrap}>
            <Camera size={48} color={theme.colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.permTitle}>Camera access</Text>
          <Text style={styles.permText}>
            Mipo needs camera access to take photos for your strip.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.permBtnText}>Allow camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permBack} onPress={onBack}>
            <ChevronLeft size={20} color={theme.colors.textSecondary} strokeWidth={2.5} />
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
        facing={facing}
        mode="picture"
      />

      {countdown !== null && (
        <View style={styles.countdownOverlay} pointerEvents="none">
          <View style={styles.countdownRing}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </View>
          <Text style={styles.countdownLabel}>Get ready</Text>
        </View>
      )}

      {/* Minimal top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={16}>
          <ChevronLeft size={ICON_SIZE} color={ICON_COLOR} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Shoot</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          disabled={countdown !== null}
        >
          <FlipHorizontal size={ICON_SIZE} color={ICON_COLOR} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Slot strip – visual progress */}
      <View style={styles.slotStrip}>
        {Array.from({ length: count }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.slotCell, i < photos.length && styles.slotCellFilled]}
            onPress={i === photos.length - 1 && !isComplete ? handleRemoveLast : undefined}
            activeOpacity={i === photos.length - 1 && !isComplete ? 0.7 : 1}
          >
            {i < photos.length ? (
              <Image source={{ uri: photos[i] }} style={styles.slotThumb} />
            ) : (
              <View style={styles.slotEmpty}>
                <Text style={styles.slotEmptyText}>{i + 1}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {photos.length > 0 && !isComplete && (
        <TouchableOpacity style={styles.undoBtn} onPress={handleRemoveLast}>
          <Text style={styles.undoBtnText}>Undo last</Text>
        </TouchableOpacity>
      )}

      {/* Timer row */}
      <View style={styles.timerRow}>
        <Text style={styles.timerLabel}>Timer</Text>
        <View style={styles.timerOptions}>
          {TIMER_OPTIONS.map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[styles.timerChip, timerSeconds === sec && styles.timerChipActive]}
              onPress={() => setTimerSeconds(sec)}
              disabled={countdown !== null}
            >
              <Text style={[styles.timerChipText, timerSeconds === sec && styles.timerChipTextActive]}>
                {sec === 0 ? 'Now' : `${sec}s`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Shutter + Create strip */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.shutterBtn, (isCapturing || isComplete) && styles.shutterBtnDisabled]}
          onPress={handleCapture}
          disabled={isCapturing || isComplete}
          activeOpacity={0.85}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createBtn, !isComplete && styles.createBtnDisabled]}
          onPress={handleDone}
          disabled={!isComplete}
          activeOpacity={0.9}
        >
          <Text style={styles.createBtnText}>Create strip</Text>
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
  permIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  countdownRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },

  // Top bar – minimal
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingBottom: theme.spacing.sm,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 32,
  },
  topTitle: {
    ...theme.typography.bodySmall,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Slot strip – film-style progress
  slotStrip: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 108 : 96,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  slotCell: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  slotCellFilled: {
    borderColor: 'rgba(255,255,255,0.8)',
  },
  slotThumb: {
    width: '100%',
    height: '100%',
  },
  slotEmpty: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotEmptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  undoBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 172 : 160,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  undoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Timer
  timerRow: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 200 : 184,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    zIndex: 10,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timerOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timerChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.radii.full,
  },
  timerChipActive: {
    backgroundColor: theme.colors.primary,
  },
  timerChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  timerChipTextActive: {
    color: '#FFFFFF',
  },

  // Controls – shutter + create
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: (Platform.OS === 'ios' ? 34 : 20) + theme.spacing.md,
    zIndex: 10,
    alignItems: 'center',
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 4,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  shutterBtnDisabled: {
    opacity: 0.6,
    borderColor: theme.colors.border,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
  },
  createBtn: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    opacity: 0.9,
  },
  createBtnText: {
    ...theme.typography.button,
    color: theme.colors.surface,
    fontSize: 17,
  },
});
