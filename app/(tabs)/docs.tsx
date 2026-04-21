import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { useStore } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';
import {
  formatShortDate,
  daysUntil,
  formatDaysLeft,
  getExpiryStatus,
} from '@/lib/utils';
import type { DocumentType } from '@/types';

const FILTERS: { key: DocumentType | 'all'; label: string }[] = [
  { key: 'all', label: 'TOATE' },
  { key: 'rca', label: 'RCA' },
  { key: 'itp', label: 'ITP' },
  { key: 'rovinieta', label: 'ROVINIETĂ' },
  { key: 'service', label: 'SERVICE' },
  { key: 'fiscal', label: 'BONURI' },
];

export default function DocsScreen() {
  const router = useRouter();
  const documents = useStore((s) => s.documents);
  const cars = useStore((s) => s.cars);
  const [filter, setFilter] = useState<DocumentType | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return documents;
    return documents.filter((d) => d.type === filter);
  }, [documents, filter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Documente"
        eyebrow={`${documents.length} FIȘIERE · ${cars.length} MAȘINI`}
        rightIcon="add"
        onRightPress={() => router.push('/document/new')}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = f.key === 'all' ? documents.length : documents.filter((d) => d.type === f.key).length;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                variant="mono"
                size={10}
                tracking={1.2}
                color={active ? Colors.bg : Colors.inkDim}
              >
                {f.label} · {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={48} color={Colors.inkDim} />
          <Text variant="heading" size={16} tracking={-0.3} style={{ marginTop: 16 }}>
            Niciun document
          </Text>
          <Text variant="mono" size={10} tracking={1} color={Colors.inkDim} style={{ marginTop: 8 }}>
            ADAUGĂ RCA, ITP, ROVINIETĂ SAU BONURI
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const status = getExpiryStatus(item.expiryDate);
            return (
              <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
                <View style={[styles.typeBadge, { backgroundColor: Colors.accent }]}>
                  <Text variant="mono" size={8} tracking={1.8} color={Colors.bg} weight="600">
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.thumb} />
                <Text variant="heading" size={12} weight="600" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text variant="mono" size={9} color={Colors.inkDim} tracking={0.5} numberOfLines={1}>
                  {item.expiryDate
                    ? `EXP · ${formatShortDate(item.expiryDate)}`
                    : item.amount
                    ? `${item.amount} LEI`
                    : formatShortDate(item.createdAt)}
                </Text>
                {item.expiryDate && (
                  <View style={[styles.statusLine, status === 'bad' && { backgroundColor: Colors.danger }, status === 'warn' && { backgroundColor: Colors.warn }, status === 'ok' && { backgroundColor: Colors.ok }]} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.exportBanner}
        onPress={() => {/* TODO: export PDF */}}
      >
        <Ionicons name="cloud-upload-outline" size={18} color={Colors.accent} />
        <View style={{ flex: 1 }}>
          <Text variant="heading" size={12} color={Colors.accent} tracking={0.5} style={{ textTransform: 'uppercase' }}>
            Export PDF complet
          </Text>
          <Text variant="mono" size={10} color={Colors.inkDim} tracking={0.5} style={{ marginTop: 2 }}>
            TOATE DOCS PENTRU VÂNZARE
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.inkDim} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  filters: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 8,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 999,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  grid: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: 160,
    gap: 8,
  },
  tile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 12,
    aspectRatio: 0.9,
    marginBottom: 8,
    position: 'relative',
  },
  typeBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    zIndex: 2,
  },
  thumb: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.ok,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  exportBanner: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(212, 255, 58, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 255, 58, 0.2)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
