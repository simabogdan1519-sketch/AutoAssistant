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
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { useStore, useActiveCar } from '@/lib/store';
import { Colors, Spacing } from '@/constants/theme';
import type { Expense } from '@/types';

const CATEGORIES: { key: Expense['category']; label: string }[] = [
  { key: 'fuel', label: 'COMBUSTIBIL' },
  { key: 'service', label: 'SERVICE' },
  { key: 'insurance', label: 'ASIGURARE' },
  { key: 'tax', label: 'TAXE' },
  { key: 'parking', label: 'PARCARE' },
  { key: 'other', label: 'ALTA' },
];

export default function NewExpenseScreen() {
  const router = useRouter();
  const car = useActiveCar();
  const addExpense = useStore((s) => s.addExpense);

  const [category, setCategory] = useState<Expense['category']>('fuel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');

  const handleSave = () => {
    if (!car) return;
    if (!amount || !description) {
      Alert.alert('Date lipsă');
      return;
    }
    addExpense({
      carId: car.id,
      category,
      amount: parseFloat(amount),
      date: Date.now(),
      description,
      vendor: vendor || undefined,
    });
    requestAnimationFrame(() => {
      router.back();
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Cheltuială" titleAccent="nouă" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim} style={{ marginBottom: 8 }}>
          CATEGORIE
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  category === c.key && { backgroundColor: Colors.accent, borderColor: Colors.accent },
                ]}
              >
                <Text
                  variant="mono"
                  size={11}
                  tracking={1}
                  color={category === c.key ? Colors.bg : Colors.ink}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Field label="Sumă" placeholder="0" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" unit="LEI" />
        <Field label="Descriere" placeholder="ex. Schimb ulei" value={description} onChangeText={setDescription} />
        <Field label="Furnizor" placeholder="opțional" value={vendor} onChangeText={setVendor} />

        <Button label="Salvează cheltuială" onPress={handleSave} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 64 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 999,
  },
});
