import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { useStore, useActiveCar } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function FuelScreen() {
  const router = useRouter();
  const car = useActiveCar();
  const addFuelEntry = useStore((s) => s.addFuelEntry);
  const addExpense = useStore((s) => s.addExpense);
  const fuelEntries = useStore((s) => s.fuelEntries);

  const carFuel = fuelEntries
    .filter((f) => f.carId === car?.id)
    .sort((a, b) => b.date - a.date);

  const lastEntry = carFuel[0];
  const lastMileage = lastEntry?.mileage || car?.currentMileage || 0;

  const [currentMileage, setCurrentMileage] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [isFull, setIsFull] = useState(true);

  const totalPrice = useMemo(() => {
    const l = parseFloat(liters);
    const p = parseFloat(pricePerLiter);
    if (!l || !p) return 0;
    return l * p;
  }, [liters, pricePerLiter]);

  const calculatedConsumption = useMemo(() => {
    const km = parseFloat(currentMileage) - lastMileage;
    const l = parseFloat(liters);
    if (!km || !l || km <= 0 || !lastEntry?.full || !isFull) return null;
    return (l / km) * 100;
  }, [currentMileage, liters, lastMileage, lastEntry?.full, isFull]);

  const avgConsumption = useMemo(() => {
    const withCons = carFuel.filter((f) => f.consumption);
    if (!withCons.length) return null;
    return withCons.reduce((s, f) => s + (f.consumption || 0), 0) / withCons.length;
  }, [carFuel]);

  const handleSave = () => {
    if (!car) {
      Alert.alert('Nicio mașină activă');
      return;
    }
    const km = parseInt(currentMileage.replace(/\D/g, ''));
    const l = parseFloat(liters);
    const p = parseFloat(pricePerLiter);

    if (!km || !l || !p || km <= lastMileage) {
      Alert.alert('Date invalide', 'Verifică kilometrajul, litrii și prețul.');
      return;
    }

    addFuelEntry({
      carId: car.id,
      date: Date.now(),
      mileage: km,
      liters: l,
      pricePerLiter: p,
      totalPrice: l * p,
      full: isFull,
    });

    addExpense({
      carId: car.id,
      category: 'fuel',
      amount: l * p,
      date: Date.now(),
      description: `Alimentare ${l.toFixed(2)} L`,
      mileage: km,
    });

    requestAnimationFrame(() => {
      router.back();
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Consum"
        titleAccent="real"
        eyebrow="METODA PLIN-LA-PLIN"
        showBack
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.liveLabel}>
            <View style={styles.liveDot} />
            <Text variant="mono" size={10} tracking={2} color={Colors.inkDim}>
              {calculatedConsumption ? 'CALCUL NOU' : avgConsumption ? 'MEDIE CURENTĂ' : 'PRIMUL PLIN'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 16 }}>
            <Text variant="heading" size={72} weight="900" tracking={-4}>
              {calculatedConsumption
                ? calculatedConsumption.toFixed(1).split('.')[0]
                : avgConsumption
                ? avgConsumption.toFixed(1).split('.')[0]
                : '—'}
            </Text>
            {(calculatedConsumption || avgConsumption) && (
              <Text variant="serif" size={48} color={Colors.accent} style={{ marginLeft: 2 }}>
                .{(calculatedConsumption || avgConsumption)!.toFixed(1).split('.')[1]}
              </Text>
            )}
          </View>
          <Text variant="mono" size={11} tracking={2} color={Colors.inkDim} style={{ marginTop: 4 }}>
            LITRI / 100 KM · {car?.fuelType.toUpperCase() || 'DIESEL'}
          </Text>
        </View>

        <Field
          label="Kilometraj actual"
          placeholder={lastMileage.toLocaleString('ro-RO')}
          value={currentMileage}
          onChangeText={setCurrentMileage}
          keyboardType="number-pad"
          unit="KM"
        />
        <View style={styles.hint}>
          <Text variant="mono" size={10} tracking={0.8} color={Colors.inkDim}>
            KM ANTERIOR · {lastMileage.toLocaleString('ro-RO')}
          </Text>
        </View>

        <Field
          label="Cantitate alimentată"
          placeholder="22.45"
          value={liters}
          onChangeText={setLiters}
          keyboardType="decimal-pad"
          unit="LITRI"
        />

        <Field
          label="Preț pe litru"
          placeholder="7.50"
          value={pricePerLiter}
          onChangeText={setPricePerLiter}
          keyboardType="decimal-pad"
          unit="LEI/L"
        />

        {totalPrice > 0 && (
          <View style={styles.totalCard}>
            <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim}>
              TOTAL PLATĂ
            </Text>
            <Text variant="heading" size={28} tracking={-1} weight="800" style={{ marginTop: 4 }}>
              {totalPrice.toFixed(2)} <Text variant="mono" size={12} color={Colors.inkDim}>LEI</Text>
            </Text>
          </View>
        )}

        <Button label="Calculează & salvează" onPress={handleSave} style={{ marginTop: 16 }} />

        {carFuel.length > 0 && (
          <>
            <SectionHeader title={`Istoric · ${Math.min(carFuel.length, 6)} plinuri`} />
            <View style={styles.historyList}>
              {carFuel.slice(0, 6).map((f) => (
                <View key={f.id} style={styles.historyRow}>
                  <View>
                    <Text variant="heading" size={14} weight="500">
                      {f.liters.toFixed(2)} L · {f.pricePerLiter.toFixed(2)} lei/L
                    </Text>
                    <Text variant="mono" size={10} color={Colors.inkDim} tracking={0.8} style={{ marginTop: 2 }}>
                      {new Date(f.date).toLocaleDateString('ro-RO')} · {f.mileage.toLocaleString('ro-RO')} KM
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    {f.consumption && (
                      <Text variant="heading" size={16} color={Colors.accent} tracking={-0.5}>
                        {f.consumption.toFixed(1)}
                      </Text>
                    )}
                    <Text variant="mono" size={10} color={Colors.inkDim} tracking={0.8}>
                      {f.consumption ? 'L/100' : `${f.totalPrice.toFixed(0)} LEI`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
    borderRadius: Radius.xxl,
    padding: 24,
    marginBottom: 20,
  },
  liveLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  hint: {
    paddingHorizontal: 18,
    marginTop: -4,
    marginBottom: 8,
  },
  totalCard: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: 16,
    marginTop: 8,
  },
  historyList: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    padding: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
});
