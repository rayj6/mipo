import { Images } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { theme } from '../theme';
import type { GalleryEntry } from '../storage';

interface Props {
  entries: GalleryEntry[];
  onRefresh: () => Promise<void>;
}

export function GalleryScreen({ entries, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const gap = theme.spacing.sm;
  const padding = theme.spacing.lg;
  const numCols = 2;
  const cardSize = (width - padding * 2 - gap) / numCols;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Images size={56} color={theme.colors.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No strips yet</Text>
          <Text style={styles.emptySub}>
            Create a strip and save it to your gallery. It will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Your strips</Text>
      <Text style={styles.headerSub}>{entries.length} saved</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        numColumns={numCols}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: padding }]}
        columnWrapperStyle={{ gap, marginBottom: gap }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: cardSize, height: cardSize + 44 }]}>
            <Image
              source={{ uri: item.uri }}
              style={[styles.thumb, { width: cardSize, height: cardSize }]}
              resizeMode="cover"
            />
            <View style={styles.cardFooter}>
              <Text style={styles.cardDate} numberOfLines={1}>
                {formatDate(item.createdAt)}
              </Text>
              {item.templateName ? (
                <Text style={styles.cardTemplate} numberOfLines={1}>
                  {item.templateName}
                </Text>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  headerSub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumb: {
    backgroundColor: theme.colors.border,
  },
  cardFooter: {
    padding: theme.spacing.sm,
  },
  cardDate: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardTemplate: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyIconWrap: {
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
