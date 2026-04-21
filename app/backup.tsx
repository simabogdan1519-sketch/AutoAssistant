import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { useStore } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function BackupScreen() {
  const [isWorking, setIsWorking] = useState(false);
  const cars = useStore((s) => s.cars);
  const documents = useStore((s) => s.documents);
  const fuelEntries = useStore((s) => s.fuelEntries);
  const expenses = useStore((s) => s.expenses);
  const serviceRecords = useStore((s) => s.serviceRecords);
  const fines = useStore((s) => s.fines);

  const totalItems = cars.length + documents.length + fuelEntries.length + expenses.length + serviceRecords.length + fines.length;

  const exportData = async () => {
    setIsWorking(true);
    try {
      const data = {
        version: 1,
        exportedAt: Date.now(),
        cars,
        documents,
        fuelEntries,
        expenses,
        serviceRecords,
        fines,
      };

      const json = JSON.stringify(data, null, 2);
      const fileName = `autoassistant-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const fileUri = (FileSystem.documentDirectory || '') + fileName;

      await FileSystem.writeAsStringAsync(fileUri, json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Salvează backup-ul AutoAssistant',
        });
      } else {
        Alert.alert('Gata', `Fișierul a fost salvat: ${fileName}`);
      }
    } catch (err) {
      Alert.alert('Eroare', String(err));
    } finally {
      setIsWorking(false);
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return;

      setIsWorking(true);
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(content);

      if (!data.version || !Array.isArray(data.cars)) {
        throw new Error('Fișier invalid — nu pare a fi un backup AutoAssistant.');
      }

      Alert.alert(
        'Confirmă import',
        `Backup-ul conține ${(data.cars || []).length} mașini, ${(data.documents || []).length} documente și alte date. Aceasta va ÎNLOCUI datele actuale. Continui?`,
        [
          { text: 'Anulează', style: 'cancel' },
          {
            text: 'Importă',
            style: 'destructive',
            onPress: async () => {
              useStore.setState({
                cars: data.cars || [],
                documents: data.documents || [],
                fuelEntries: data.fuelEntries || [],
                expenses: data.expenses || [],
                serviceRecords: data.serviceRecords || [],
                fines: data.fines || [],
                activeCarId: (data.cars || [])[0]?.id || null,
              });
              Alert.alert('Gata', 'Datele au fost importate cu succes.');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut citi fișierul: ' + String(err));
    } finally {
      setIsWorking(false);
    }
  };

  const clearAll = () => {
    Alert.alert(
      'ȘTERGE TOATE DATELE?',
      'Această acțiune e ireversibilă. Toate mașinile, documentele, plinurile, cheltuielile și amenzile vor fi șterse pentru totdeauna.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'ȘTERGE TOT',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Ești sigur?', 'Ultima confirmare — nu se mai poate recupera nimic.', [
              { text: 'Nu', style: 'cancel' },
              {
                text: 'Da, șterge',
                style: 'destructive',
                onPress: async () => {
                  useStore.setState({
                    cars: [],
                    documents: [],
                    fuelEntries: [],
                    expenses: [],
                    serviceRecords: [],
                    fines: [],
                    activeCarId: null,
                  });
                  Alert.alert('Gata', 'Toate datele au fost șterse.');
                },
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Backup &" titleAccent="restore" eyebrow="EXPORT JSON · LOCAL" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <View style={styles.accentLine} />
          <Text variant="mono" size={10} tracking={2} color={Colors.inkDim}>
            DATE STOCATE LOCAL
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
            <Text variant="heading" size={64} weight="900" tracking={-3}>
              {totalItems}
            </Text>
            <Text variant="serif" size={24} color={Colors.accent} style={{ marginLeft: 8 }}>
              înregistrări
            </Text>
          </View>
          <View style={styles.statGrid}>
            <StatItem label="Mașini" value={cars.length} />
            <StatItem label="Documente" value={documents.length} />
            <StatItem label="Plinuri" value={fuelEntries.length} />
            <StatItem label="Cheltuieli" value={expenses.length} />
            <StatItem label="Service" value={serviceRecords.length} />
            <StatItem label="Amenzi" value={fines.length} />
          </View>
        </View>

        <SectionHeader title="Backup" />
        <TouchableOpacity activeOpacity={0.85} onPress={exportData} disabled={isWorking || totalItems === 0} style={styles.actionCard}>
          <View style={styles.iconLg}>
            <Ionicons name="cloud-upload-outline" size={20} color={Colors.accent} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="heading" size={15} weight="600" numberOfLines={1}>
              Exportă date
            </Text>
            <Text variant="mono" size={10} tracking={0.8} color={Colors.inkDim} numberOfLines={1} style={{ marginTop: 2 }}>
              SALVEAZĂ FIȘIER .JSON
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.inkDim} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} onPress={importData} disabled={isWorking} style={styles.actionCard}>
          <View style={styles.iconLg}>
            <Ionicons name="cloud-download-outline" size={20} color={Colors.accent} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="heading" size={15} weight="600" numberOfLines={1}>
              Importă date
            </Text>
            <Text variant="mono" size={10} tracking={0.8} color={Colors.inkDim} numberOfLines={1} style={{ marginTop: 2 }}>
              RESTABILEȘTE DINTR-UN BACKUP
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.inkDim} />
        </TouchableOpacity>

        <SectionHeader title="Zonă periculoasă" />
        <TouchableOpacity activeOpacity={0.85} onPress={clearAll} style={[styles.actionCard, { borderColor: 'rgba(255,90,79,0.3)' }]}>
          <View style={[styles.iconLg, { backgroundColor: 'rgba(255,90,79,0.1)' }]}>
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="heading" size={15} weight="600" color={Colors.danger} numberOfLines={1}>
              Șterge toate datele
            </Text>
            <Text variant="mono" size={10} tracking={0.8} color={Colors.inkDim} numberOfLines={1} style={{ marginTop: 2 }}>
              IREVERSIBIL · RESET COMPLET
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.danger} />
        </TouchableOpacity>

        <View style={styles.info}>
          <Text variant="mono" size={9} tracking={2} color={Colors.accent}>
            CONFIDENȚIALITATE
          </Text>
          <Text variant="body" size={12} style={{ marginTop: 8, lineHeight: 18 }}>
            Toate datele se stochează doar pe telefonul tău. Niciun server, niciun cloud. Backup-ul rămâne la tine — îl salvezi unde vrei (Drive, email, memorie internă).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <Text variant="mono" size={9} tracking={1.5} color={Colors.inkDim}>{label.toUpperCase()}</Text>
      <Text variant="heading" size={18} tracking={-0.5} weight="700">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 80 },
  stats: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    marginBottom: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  accentLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: Colors.accent, opacity: 0.4 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    borderStyle: 'dashed',
  },
  statItem: { flex: 1, minWidth: '28%' },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    marginBottom: 8,
  },
  iconLg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(212,255,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
  },
});
