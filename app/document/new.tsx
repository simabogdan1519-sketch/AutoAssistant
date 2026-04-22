import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { useStore, useActiveCar } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';
import type { DocumentType } from '@/types';

const DOC_TYPES: { key: DocumentType; label: string }[] = [
  { key: 'rca', label: 'RCA' },
  { key: 'casco', label: 'CASCO' },
  { key: 'rovinieta', label: 'ROVINIETĂ' },
  { key: 'itp', label: 'ITP' },
  { key: 'extinctor', label: 'EXTINCTOR' },
  { key: 'trusa', label: 'TRUSĂ MED.' },
  { key: 'civ', label: 'CERT. ÎNM.' },
  { key: 'service', label: 'SERVICE' },
  { key: 'fiscal', label: 'BON FISCAL' },
  { key: 'other', label: 'ALTUL' },
];

export default function NewDocumentScreen() {
  const router = useRouter();
  const car = useActiveCar();
  const addDocument = useStore((s) => s.addDocument);

  const [type, setType] = useState<DocumentType>('rca');
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [amount, setAmount] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const parseDate = (dStr: string): number | undefined => {
    const parts = dStr.split(/[./-]/);
    if (parts.length !== 3) return undefined;
    const [day, month, year] = parts.map((p) => parseInt(p));
    if (!day || !month || !year) return undefined;
    const date = new Date(year < 100 ? 2000 + year : year, month - 1, day);
    return date.getTime();
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      setFileUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisiune necesară');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setFileUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!car) {
      Alert.alert('Nicio mașină activă');
      return;
    }
    if (!name) {
      Alert.alert('Date lipsă', 'Adaugă cel puțin un nume pentru document.');
      return;
    }

    addDocument({
      carId: car.id,
      type,
      name: name.trim(),
      issuer: issuer.trim() || undefined,
      expiryDate: expiryDate ? parseDate(expiryDate) : undefined,
      amount: amount ? parseFloat(amount) : undefined,
      fileUri: fileUri || undefined,
      notes: notes.trim() || undefined,
    });
    requestAnimationFrame(() => {
      router.back();
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Document" titleAccent="nou" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim} style={{ marginBottom: 8 }}>
          TIP DOCUMENT
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {DOC_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setType(t.key)}
                activeOpacity={0.7}
                style={[
                  styles.typeChip,
                  type === t.key && { backgroundColor: Colors.accent, borderColor: Colors.accent },
                ]}
              >
                <Text
                  variant="mono"
                  size={10}
                  tracking={1}
                  color={type === t.key ? Colors.bg : Colors.ink}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Field
          label="Nume document"
          placeholder={`ex. ${type.toUpperCase()} Allianz Țiriac`}
          value={name}
          onChangeText={setName}
        />
        <Field
          label="Emitent / furnizor"
          placeholder="Allianz Țiriac"
          value={issuer}
          onChangeText={setIssuer}
        />
        <Field
          label="Data expirare"
          placeholder="ZZ.LL.AAAA (opțional)"
          value={expiryDate}
          onChangeText={setExpiryDate}
          keyboardType="numbers-and-punctuation"
        />
        <Field
          label="Sumă plătită"
          placeholder="opțional"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          unit="LEI"
        />

        <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim} style={{ marginTop: 8, marginBottom: 8 }}>
          ATAȘAMENT
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <TouchableOpacity activeOpacity={0.7} onPress={pickFile} style={styles.uploadBtn}>
            <Ionicons name="document-outline" size={18} color={Colors.ink} />
            <Text variant="mono" size={11} tracking={1}>
              FIȘIER
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={takePhoto} style={styles.uploadBtn}>
            <Ionicons name="camera-outline" size={18} color={Colors.ink} />
            <Text variant="mono" size={11} tracking={1}>
              POZĂ
            </Text>
          </TouchableOpacity>
        </View>

        {fileUri && (
          <View style={styles.fileRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
            <Text variant="mono" size={10} tracking={0.5} color={Colors.accent}>
              FIȘIER ATAȘAT
            </Text>
          </View>
        )}

        <Button label="Salvează document" onPress={handleSave} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 64 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 999,
  },
  uploadBtn: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(212, 255, 58, 0.05)',
    borderRadius: Radius.md,
  },
});
