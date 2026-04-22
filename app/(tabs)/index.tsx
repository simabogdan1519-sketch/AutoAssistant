import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { CarSelector } from '@/components/CarSelector';
import { SectionHeader } from '@/components/SectionHeader';
import { useStore, useActiveCar } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';
import {
  daysUntil,
  formatDaysLeft,
  getExpiryStatus,
  formatMileage,
  calcActivePoints,
} from '@/lib/utils';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function HomeScreen() {
  const router = useRouter();
  const car = useActiveCar();
  const cars = useStore((s) => s.cars);
  const documents = useStore((s) => s.documents);
  const fuelEntries = useStore((s) => s.fuelEntries);
  const expenses = useStore((s) => s.expenses);
  const fines = useStore((s) => s.fines);

  const today = useMemo(() => format(new Date(), 'EEEE dd MMM', { locale: ro }), []);

  if (cars.length === 0) {
    return <EmptyState />;
  }

  const carDocs = documents.filter((d) => d.carId === car?.id);
  const expiring = carDocs
    .filter((d) => d.expiryDate)
    .sort((a, b) => (a.expiryDate || 0) - (b.expiryDate || 0))
    .slice(0, 3);

  const carFuel = fuelEntries.filter((f) => f.carId === car?.id);
  const avgConsumption =
    carFuel.filter((f) => f.consumption).reduce((s, f) => s + (f.consumption || 0), 0) /
      (carFuel.filter((f) => f.consumption).length || 1);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthExpenses = expenses
    .filter((e) => e.carId === car?.id && e.date >= monthStart)
    .reduce((s, e) => s + e.amount, 0);

  const carFines = fines.filter((f) => f.carId === car?.id);
  const { total: activePoints } = calcActivePoints(carFines);

  const user = useStore((s) => s.user);
  const firstName = (user.name || 'Șofer').split(' ')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Salut,"
        titleAccent={firstName.toLowerCase()}
        eyebrow={today.toUpperCase()}
        rightIcon="notifications-outline"
        onRightPress={() => router.push('/notificari')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CarSelector />

        {car && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/car/${car.id}` as any)}
            style={styles.instrument}
          >
            <View style={styles.accentLine} />
            <View style={styles.instTop}>
              <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <View style={styles.liveLabel}>
                  <View style={styles.liveDot} />
                  <Text variant="mono" size={10} tracking={2} color={Colors.inkDim}>
                    MAȘINĂ ACTIVĂ
                  </Text>
                </View>
                <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'baseline', flexWrap: 'nowrap' }}>
                  <Text
                    variant="heading"
                    size={28}
                    tracking={-1}
                    numberOfLines={1}
                    style={{ textTransform: 'uppercase', flexShrink: 1 }}
                  >
                    {car.make}
                  </Text>
                  <Text
                    variant="serif"
                    size={28}
                    color={Colors.accent}
                    numberOfLines={1}
                    style={{ marginLeft: 6, flexShrink: 1 }}
                  >
                    {car.model}
                  </Text>
                </View>
                <Text variant="mono" size={11} color={Colors.inkDim} tracking={1} numberOfLines={1} style={{ marginTop: 4 }}>
                  {car.plate}
                </Text>
              </View>
              <View style={styles.instChip}>
                <Text variant="mono" size={9} tracking={1.5} color={Colors.bg}>
                  {car.year} · {car.fuelType.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.gaugeGrid}>
              <View style={{ flex: 1 }}>
                <Text variant="mono" size={9} tracking={2} color={Colors.inkDim}>
                  KILOMETRAJ
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
                  <Text variant="heading" size={26} tracking={-0.5}>
                    {formatMileage(car.currentMileage)}
                  </Text>
                  <Text variant="mono" size={11} color={Colors.inkDim} style={{ marginLeft: 4 }}>
                    KM
                  </Text>
                </View>
                <View style={styles.gaugeBar}>
                  <View style={[styles.gaugeBarFill, { width: '72%' }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="mono" size={9} tracking={2} color={Colors.inkDim}>
                  CONSUM MEDIU
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
                  <Text variant="heading" size={26} tracking={-0.5}>
                    {avgConsumption ? avgConsumption.toFixed(1) : '—'}
                  </Text>
                  <Text variant="mono" size={11} color={Colors.inkDim} style={{ marginLeft: 4 }}>
                    L/100
                  </Text>
                </View>
                <View style={styles.gaugeBar}>
                  <View style={[styles.gaugeBarFill, { width: `${Math.min(100, (avgConsumption / 12) * 100)}%` }]} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <SectionHeader title="Expiră curând" action="VEZI TOT" onAction={() => router.push('/docs')} />

        {expiring.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text variant="mono" size={11} color={Colors.inkDim} tracking={1}>
              NICIUN DOCUMENT ADĂUGAT
            </Text>
          </View>
        ) : (
          <View>
            {expiring.map((d, i) => {
              const days = daysUntil(d.expiryDate!);
              const status = getExpiryStatus(d.expiryDate);
              return (
                <View key={d.id} style={styles.alertRow}>
                  <Text variant="mono" size={10} color={Colors.inkDimmer} tracking={1}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <View style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
                    <Text variant="heading" size={14} weight="600" numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text
                      variant="mono"
                      size={10}
                      color={Colors.inkDim}
                      tracking={0.5}
                      numberOfLines={1}
                      style={{ marginTop: 2 }}
                    >
                      {(d.issuer || d.type.toUpperCase())} · {format(new Date(d.expiryDate!), 'dd MMM yyyy', { locale: ro })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', marginRight: 14 }}>
                    <Text variant="heading" size={18} tracking={-0.5}>
                      {formatDaysLeft(days)}
                    </Text>
                  </View>
                  <View style={[styles.statusDot, styles[`status_${status}`]]} />
                </View>
              );
            })}
          </View>
        )}

        <SectionHeader title="Acțiuni rapide" />

        <View style={styles.bento}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/expenses')}
            style={[styles.bentoItem, styles.bentoAccent, styles.bentoTall]}
          >
            <View>
              <Text variant="mono" size={9} tracking={2} color={Colors.bg}>
                CHELTUIELI · LUNA
              </Text>
              <Text variant="heading" size={16} color={Colors.bg} style={{ marginTop: 8 }} numberOfLines={1}>
                {new Date().toLocaleDateString('ro-RO', { month: 'long' })}
              </Text>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text variant="heading" size={32} color={Colors.bg} tracking={-1.5} weight="800">
                  {monthExpenses.toLocaleString('ro-RO')}
                </Text>
                <Text variant="mono" size={12} color={Colors.bg} style={{ marginLeft: 4, opacity: 0.6 }}>
                  LEI
                </Text>
              </View>
              <Text variant="mono" size={10} color={Colors.bg} tracking={1} style={{ marginTop: 8, opacity: 0.8 }}>
                {expenses.filter((e) => e.carId === car?.id && e.date >= monthStart).length} TRANZACȚII
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bentoRight}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/fuel')}
              style={styles.bentoItem}
            >
              <Text variant="mono" size={9} tracking={2} color={Colors.inkDim}>
                CONSUM
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text variant="heading" size={24} tracking={-1} weight="800">
                  {avgConsumption ? avgConsumption.toFixed(1) : '—'}
                </Text>
                <Text variant="mono" size={11} color={Colors.inkDim} style={{ marginLeft: 4 }}>
                  L
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/fines')}
              style={styles.bentoItem}
            >
              <Text variant="mono" size={9} tracking={2} color={Colors.inkDim}>
                PUNCTE
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text variant="heading" size={24} tracking={-1} weight="800">
                  {activePoints}
                </Text>
                <Text variant="mono" size={11} color={Colors.inkDim} style={{ marginLeft: 4 }}>
                  /15
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Auto" titleAccent="assistant" eyebrow="BUILD 2026.04.21" />
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="car-sport-outline" size={48} color={Colors.inkDim} />
        </View>
        <Text variant="heading" size={24} tracking={-0.5} style={{ marginTop: 24, textAlign: 'center' }}>
          Niciun autovehicul
        </Text>
        <Text
          variant="body"
          size={14}
          color={Colors.inkDim}
          style={{ textAlign: 'center', marginTop: 8, maxWidth: 280 }}
        >
          Începe prin a-ți adăuga prima mașină. Poți urmări documentele, consumul și cheltuielile pentru fiecare.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push('/car/new')}
          activeOpacity={0.8}
        >
          <Text variant="heading" size={13} color={Colors.bg} tracking={1}>
            ADAUGĂ MAȘINĂ
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 140 },
  instrument: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.accent,
    opacity: 0.4,
  },
  instTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  liveLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  instChip: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  gaugeGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    borderStyle: 'dashed',
  },
  gaugeBar: {
    marginTop: 8,
    height: 2,
    backgroundColor: Colors.surface3,
    overflow: 'hidden',
  },
  gaugeBarFill: { height: '100%', backgroundColor: Colors.accent },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  status_ok: { backgroundColor: Colors.ok },
  status_warn: { backgroundColor: Colors.warn },
  status_bad: { backgroundColor: Colors.danger },
  status_expired: { backgroundColor: Colors.danger },
  emptyRow: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
  bento: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    minHeight: 230,
  },
  bentoItem: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    padding: 18,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  bentoAccent: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  bentoTall: {
    flex: 2,
  },
  bentoRight: {
    flex: 1,
    gap: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBtn: {
    marginTop: 32,
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
});
