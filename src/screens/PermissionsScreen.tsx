import { Camera } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { useCameraPermissions } from 'expo-camera';
import { theme } from '../theme';

interface Props {
  onContinue: () => void;
}

export function PermissionsScreen({ onContinue }: Props) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationStatus, setLocationStatus] = useState<Location.PermissionStatus | null>(null);
  const [requesting, setRequesting] = useState(false);

  const cameraGranted = cameraPermission?.granted ?? false;
  const locationGranted = locationStatus === Location.PermissionStatus.GRANTED;

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationStatus(status);
    })();
  }, []);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      if (!cameraGranted && cameraPermission) {
        const { granted } = await requestCameraPermission();
        if (!granted) {
          setRequesting(false);
          return;
        }
      }
      if (!locationGranted) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationStatus(status);
      }
      onContinue();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Camera size={48} color={theme.colors.primary} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.sub}>
          Mipo needs access to your camera to take photos and to your location to tag your strips. You can change these later in Settings.
        </Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Camera</Text>
          <Text style={styles.statusValue}>{cameraGranted ? 'Allowed' : 'Not allowed'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Location</Text>
          <Text style={styles.statusValue}>
            {locationStatus === null ? '…' : locationGranted ? 'Allowed' : 'Not allowed'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, requesting && styles.btnDisabled]}
          onPress={handleAllow}
          disabled={requesting}
          activeOpacity={0.9}
        >
          {requesting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>Allow & continue</Text>
          )}
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
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconWrap: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  statusLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  statusValue: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  btn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
});
