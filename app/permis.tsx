import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors, Spacing, Radius } from '@/constants/theme';
import {
  formatShortDate,
  daysUntil,
  formatDaysLeft,
  getExpiryStatus,
} from '@/lib/utils';

const STORAGE_KEY = 'autoassistant-license';

const CATEGORIES = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'BE', 'C1', 'C', 'CE', 'D1', 'D', 'DE'];

type License = {
  number: string;
  categories: string[];
  issueDate: number;
  expiryDate: number;
  issuedBy?: string;
};

export default function PermisScreen() {
  const [license, setLicense] = useState<License | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [number, setNumber] = useState('');
  const [categories, setCategories] = useState<string[]>(['B']);
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issuedBy, setIssuedBy] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        const parsed: License = JSON.parse(data);
        setLicense(parsed);
        setNumber(parsed.number);
        setCategories(parsed.categories);
        setIssueDate(formatShortDate(parsed.issueDate));
        setExpiryDate(formatShortDate(parsed.expiryDate));
        setIssuedBy(parsed.issuedBy || '');
      } else {
        setIsEditing(true);
      }
    });
  }, []);

  const parseDate = (str: string): number | null => {
    const parts = str.split(/[./-]/);
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map((p) => parseInt(p));
    if (!d || !m || !y) return null;
    return new Date(y < 100 ? 2000 + y : y, m - 1, d).getTime();
  };

  const save = async () => {
    const issueTs = parseDate(issueDate);
    const expiryTs = parseDate(expiryDate);
    if (!number || !issueTs || !expiryTs) {
      Alert.alert('Date incomplete', 'Completează număr, data emiterii și expirării.');
      return;
    }
    const data: License = {
      number,
      categories,
      issueDate: issueTs,
      expiryDate: expiryTs,
      issuedBy: issuedBy || undefined,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLicense(data);
    setIsEditing(false);
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const deleteLicense = () => {
    Alert.alert('Ștergi permisul?', 'Datele vor fi șterse.', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setLicense(null);
          setIsEditing(true);
        },
      },
    ]);
  };

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Permis" titleAccent="conducere" eyebrow="10 ANI VALIDITATE · CAT. B" showBack />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Field label="Număr permis" placeholder="AB 123456" value={number} onChangeText={setNumber} autoCapitalize="characters" />

          <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim} style={{ marginTop: 12, marginBottom: 8 }}>
            CATEGORII
          </Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => toggleCategory(cat)}
                activeOpacity={0.7}
                style={[
                  styles.catChip,
                  categories.includes(cat) && { backgroundColor: Colors.accent, borderColor: Colors.accent },
                ]}
              >
                <Text variant="heading" size={14} tracking={-0.3} color={categories.includes(cat) ? Colors.bg : Colors.ink}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 12 }}>
            <Field label="Data emiterii" placeholder="ZZ.LL.AAAA" value={issueDate} onChangeText={setIssueDate} keyboardType="numbers-and-punctuation" />
            <Field label="Data expirării" placeholder="ZZ.LL.AAAA" value={expiryDate} onChangeText={setExpiryDate} keyboardType="numbers-and-punctuation" />
            <Field label="Emis de" placeholder="SPCLEP opțional" value={issuedBy} onChangeText={setIssuedBy} />
          </View>

          <Button label="Salvează" onPress={save} style={{ marginTop: 16 }} />

          {license && (
            <TouchableOpacity onPress={() => setIsEditing(false)} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text variant="mono" size={11} tracking={1} color={Colors.inkDim}>
                ANULEAZĂ
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!license) return null;

  const status = getExpiryStatus(license.expiryDate);
  const days = daysUntil(license.expiryDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Permis"
        titleAccent="conducere"
        eyebrow={license.number}
        showBack
        rightIcon="create-outline"
        onRightPress={() => setIsEditing(true)}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.accentLine} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.dot, styles[`dot_${status}`]]} />
                <Text variant="mono" size={10} tracking={2} color={Colors.inkDim}>
                  VALABIL
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
                <Text variant="heading" size={72} weight="900" tracking={-4}>
                  {days > 0 ? days : 0}
                </Text>
                <Text variant="serif" size={28} color={Colors.inkDim} style={{ marginLeft: 8 }}>
                  zile
                </Text>
              </View>
              <Text variant="mono" size={11} tracking={1} color={Colors.inkDim} style={{ marginTop: 6 }}>
                PÂNĂ LA {formatShortDate(license.expiryDate).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.catRow}>
            {license.categories.map((cat) => (
              <View key={cat} style={styles.catBadge}>
                <Text variant="heading" size={14} tracking={-0.3} color={Colors.accent}>
                  {cat}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.specs}>
          <SpecRow label="Număr" value={license.number} />
          <SpecRow label="Emis" value={formatShortDate(license.issueDate)} />
          <SpecRow label="Expiră" value={formatShortDate(license.expiryDate)} />
          {license.issuedBy && <SpecRow label="Emitent" value={license.issuedBy} />}
        </View>

        <View style={styles.info}>
          <Text variant="mono" size={9} tracking={2} color={Colors.accent}>
            ȘTIAI CĂ?
          </Text>
          <Text variant="body" size={13} style={{ marginTop: 8, lineHeight: 20 }}>
            Permisul auto categoria B e valabil <Text variant="body" size={13} weight="700" color={Colors.accent}>10 ani</Text> de la emitere. Îl poți reînnoi cu până la 6 luni înainte de expirare.
          </Text>
        </View>

        <TouchableOpacity onPress={deleteLicense} style={{ marginTop: 20, alignItems: 'center', padding: 12 }}>
          <Text variant="mono" size={11} tracking={1} color={Colors.danger}>
            ȘTERGE PERMISUL
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim}>{label.toUpperCase()}</Text>
      <Text
        variant="heading"
        size={14}
        weight="500"
        numberOfLines={1}
        style={{ maxWidth: '60%', textAlign: 'right' }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 80 },
  hero: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  accentLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: Colors.accent, opacity: 0.4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dot_ok: { backgroundColor: Colors.ok, shadowColor: Colors.ok, shadowOpacity: 0.6, shadowRadius: 4 },
  dot_warn: { backgroundColor: Colors.warn },
  dot_bad: { backgroundColor: Colors.danger },
  dot_expired: { backgroundColor: Colors.danger },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.line, borderStyle: 'dashed' },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 6,
  },
  specs: { borderTopWidth: 1, borderTopColor: Colors.line, marginBottom: 20 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: {
    width: 56,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
});
