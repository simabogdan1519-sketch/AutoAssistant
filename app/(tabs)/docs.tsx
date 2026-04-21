import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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

  const exportPDF = async () => {
    if (cars.length === 0) {
      Alert.alert('Nicio mașină', 'Adaugă cel puțin o mașină ca să poți exporta.');
      return;
    }

    const activeCar = cars[0];
    const carDocs = documents.filter((d) => d.carId === activeCar.id);

    const docsHtml = carDocs
      .map((d) => {
        const status = getExpiryStatus(d.expiryDate);
        const statusLabel = status === 'ok' ? 'VALABIL' : status === 'warn' ? 'EXPIRĂ CURÂND' : status === 'bad' ? 'URGENT' : 'EXPIRAT';
        const statusColor = status === 'ok' ? '#2d7a4f' : status === 'warn' ? '#c07a00' : '#b23a3a';
        return `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">
              <strong>${d.name}</strong><br>
              <span style="color:#888;font-size:11px;">${(d.type || '').toUpperCase()} ${d.issuer ? '· ' + d.issuer : ''}</span>
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
              ${d.expiryDate ? formatShortDate(d.expiryDate) : '—'}
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
              <span style="color:${statusColor};font-size:11px;font-weight:600;">${statusLabel}</span>
            </td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, sans-serif; margin: 0; padding: 32px; color: #111; }
          h1 { font-size: 28px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: -1px; }
          h1 em { font-style: italic; color: #7a9c00; font-weight: 400; }
          .header { border-bottom: 2px solid #d4ff3a; padding-bottom: 16px; margin-bottom: 24px; }
          .meta { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; }
          .car-card { background: #f8f8f3; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .car-name { font-size: 22px; font-weight: 700; margin: 4px 0; }
          .car-plate { font-family: monospace; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #f5f5f2; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 10px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="meta">AutoAssistant · Export documente</div>
          <h1>${activeCar.make} <em>${activeCar.model}</em></h1>
          <div class="meta">Generat la ${new Date().toLocaleDateString('ro-RO')} · ${new Date().toLocaleTimeString('ro-RO')}</div>
        </div>

        <div class="car-card">
          <div class="meta">Mașină</div>
          <div class="car-name">${activeCar.make} ${activeCar.model}</div>
          <div class="car-plate">${activeCar.plate} · ${activeCar.year} · ${activeCar.fuelType} · ${activeCar.currentMileage.toLocaleString('ro-RO')} km</div>
        </div>

        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #666;">
          Documente (${carDocs.length})
        </h2>
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th style="text-align:right;">Expiră</th>
              <th style="text-align:right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${docsHtml || '<tr><td colspan="3" style="padding:20px;text-align:center;color:#999;">Niciun document adăugat</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          AutoAssistant · Generat ${new Date().toISOString().slice(0, 10)}<br>
          Datele sunt stocate local pe dispozitiv — nicio informație nu este partajată online.
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partajează sau salvează PDF-ul',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Gata', `PDF salvat: ${uri}`);
      }
    } catch (err) {
      Alert.alert('Eroare export', String(err));
    }
  };

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
        onPress={exportPDF}
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
