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

const POINT_OPTIONS = [0, 2, 3, 4, 6];

export default function NewFineScreen() {
  const router = useRouter();
  const car = useActiveCar();
  const addFine = useStore((s) => s.addFine);

  const [article, setArticle] = useState('');
  const [offense, setOffense] = useState('');
  const [amount, setAmount] = useState('');
  const [points, setPoints] = useState(2);
  const [location, setLocation] = useState('');

  const handleSave = () => {
    if (!car) return;
    if (!offense || !amount) {
      Alert.alert('Date lipsă', 'Completează contravenția și suma.');
      return;
    }
    addFine({
      carId: car.id,
      date: Date.now(),
      article: article || 'Art. —',
      offense,
      amount: parseFloat(amount),
      points,
      location: location || undefined,
      paid: false,
    });
    requestAnimationFrame(() => {
      router.back();
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Amendă" titleAccent="nouă" eyebrow="OUG 195 / 2002" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Field
          label="Articol"
          placeholder="Art. 108"
          value={article}
          onChangeText={setArticle}
        />
        <Field
          label="Contravenție"
          placeholder="Depășire viteză 21–30 km/h"
          value={offense}
          onChangeText={setOffense}
        />
        <Field
          label="Sumă"
          placeholder="580"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          unit="LEI"
        />

        <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim} style={{ marginTop: 8, marginBottom: 8 }}>
          PUNCTE PENALIZARE
        </Text>
        <View style={styles.pointsRow}>
          {POINT_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPoints(p)}
              activeOpacity={0.7}
              style={[
                styles.pointChip,
                points === p && { backgroundColor: Colors.accent, borderColor: Colors.accent },
              ]}
            >
              <Text
                variant="heading"
                size={18}
                tracking={-0.5}
                color={points === p ? Colors.bg : Colors.ink}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field
          label="Locație"
          placeholder="DN1 Băneasa (opțional)"
          value={location}
          onChangeText={setLocation}
        />

        <Button label="Salvează amendă" onPress={handleSave} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 64 },
  pointsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  pointChip: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    alignItems: 'center',
  },
});
