import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { useStore, useActiveCar } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { formatShortDate } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  fuel: 'Combustibil',
  service: 'Service & piese',
  insurance: 'Asigurări',
  tax: 'Taxe',
  parking: 'Parcare',
  other: 'Diverse',
};

const CATEGORY_COLORS: Record<string, string> = {
  fuel: Colors.accent,
  service: '#8a8a87',
  insurance: '#6b6b6b',
  tax: '#555553',
  parking: '#444441',
  other: '#333330',
};

export default function ExpensesScreen() {
  const router = useRouter();
  const car = useActiveCar();
  const expenses = useStore((s) => s.expenses);

  const carExpenses = useMemo(
    () => expenses.filter((e) => e.carId === car?.id).sort((a, b) => b.date - a.date),
    [expenses, car?.id]
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const monthTotal = carExpenses
    .filter((e) => e.date >= monthStart)
    .reduce((s, e) => s + e.amount, 0);

  const prevMonthTotal = carExpenses
    .filter((e) => e.date >= prevMonthStart && e.date < monthStart)
    .reduce((s, e) => s + e.amount, 0);

  const monthCount = carExpenses.filter((e) => e.date >= monthStart).length;

  const trendPercent = prevMonthTotal > 0 ? Math.round(((monthTotal - prevMonthTotal) / prevMonthTotal) * 100) : 0;

  // Distribuție categorii
  const categoryBreakdown = useMemo(() => {
    const thisMonth = carExpenses.filter((e) => e.date >= monthStart);
    const grouped: Record<string, { count: number; total: number }> = {};
    thisMonth.forEach((e) => {
      if (!grouped[e.category]) grouped[e.category] = { count: 0, total: 0 };
      grouped[e.category].count += 1;
      grouped[e.category].total += e.amount;
    });
    return Object.entries(grouped)
      .map(([cat, data]) => ({
        category: cat,
        ...data,
        percent: monthTotal > 0 ? Math.round((data.total / monthTotal) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [carExpenses, monthStart, monthTotal]);

  // Evoluție 6 luni
  const monthlyData = useMemo(() => {
    const months: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const total = carExpenses
        .filter((e) => e.date >= monthDate.getTime() && e.date < nextMonth.getTime())
        .reduce((s, e) => s + e.amount, 0);
      const label = monthDate.toLocaleDateString('ro-RO', { month: 'short' }).toUpperCase();
      months.push({ label, total });
    }
    return months;
  }, [carExpenses, now]);

  const maxMonth = Math.max(...monthlyData.map((m) => m.total), 1);
  const avgMonth = monthlyData.reduce((s, m) => s + m.total, 0) / monthlyData.length;

  const currentMonthLabel = now.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });

  if (!car) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Cheltuieli" showBack />
        <View style={styles.center}>
          <Text variant="body" color={Colors.inkDim}>Nicio mașină activă.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Cheltuieli"
        eyebrow={currentMonthLabel.toUpperCase()}
        showBack
        rightIcon="add"
        onRightPress={() => router.push('/expense/new')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.accentLine} />
          <View style={styles.heroTop}>
            <View style={styles.liveLabel}>
              <View style={styles.liveDot} />
              <Text variant="mono" size={10} tracking={2} color={Colors.inkDim}>
                TOTAL LUNA ASTA
              </Text>
            </View>
            {prevMonthTotal > 0 ? (
              <View
                style={[
                  styles.trend,
                  trendPercent < 0 ? styles.trendDown : styles.trendUp,
                ]}
              >
                <Text
                  variant="mono"
                  size={10}
                  tracking={1}
                  color={trendPercent < 0 ? Colors.ok : Colors.danger}
                  weight="500"
                >
                  {trendPercent > 0 ? '↑' : '↓'} {Math.abs(trendPercent)}%
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.valueRow}>
            <Text variant="heading" size={56} weight="900" tracking={-3}>
              {monthTotal.toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
            </Text>
            <Text variant="serif" size={24} color={Colors.accent} style={{ marginLeft: 6 }}>
              lei
            </Text>
          </View>
          <Text variant="mono" size={10} tracking={2} color={Colors.inkDim} style={{ marginTop: 4 }}>
            {monthCount} {monthCount === 1 ? 'TRANZACȚIE' : 'TRANZACȚII'}
          </Text>
        </View>

        {carExpenses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={40} color={Colors.inkDimmer} />
            <Text variant="heading" size={16} tracking={-0.3} style={{ marginTop: 16 }}>
              Nicio cheltuială
            </Text>
            <Text
              variant="mono"
              size={10}
              tracking={1}
              color={Colors.inkDim}
              style={{ marginTop: 8, textAlign: 'center' }}
            >
              ADAUGĂ PRIMA CHELTUIALĂ
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/expense/new')}
              style={styles.emptyBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={14} color={Colors.bg} />
              <Text variant="mono" size={11} tracking={1} color={Colors.bg} weight="600">
                ADAUGĂ
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.chartBox}>
              <View style={styles.chartHeader}>
                <Text variant="heading" size={12} weight="700" tracking={1} style={{ textTransform: 'uppercase' }}>
                  Evoluție · 6 luni
                </Text>
                <Text variant="mono" size={10} tracking={1} color={Colors.inkDim}>
                  MEDIE · <Text variant="mono" size={10} color={Colors.accent}>{Math.round(avgMonth)} LEI</Text>
                </Text>
              </View>

              <View style={styles.bars}>
                {monthlyData.map((m, i) => {
                  const isLast = i === monthlyData.length - 1;
                  const heightPct = maxMonth > 0 ? (m.total / maxMonth) * 100 : 0;
                  return (
                    <View key={i} style={styles.barWrap}>
                      <View
                        style={[
                          styles.bar,
                          { height: `${Math.max(4, heightPct)}%` },
                          isLast && styles.barHighlight,
                        ]}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={styles.chartLabels}>
                {monthlyData.map((m, i) => (
                  <Text
                    key={i}
                    variant="mono"
                    size={9}
                    tracking={0.8}
                    color={Colors.inkDim}
                  >
                    {m.label}
                  </Text>
                ))}
              </View>
            </View>

            {categoryBreakdown.length > 0 ? (
              <>
                <SectionHeader title="Distribuție categorii" />
                {categoryBreakdown.map((c) => (
                  <View key={c.category} style={styles.catRow}>
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: CATEGORY_COLORS[c.category] || Colors.inkDim },
                      ]}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="heading" size={14} weight="500" numberOfLines={1}>
                        {CATEGORY_LABELS[c.category] || c.category}
                      </Text>
                      <Text variant="mono" size={10} tracking={1} color={Colors.inkDim}>
                        {c.percent}% · {c.count} {c.count === 1 ? 'tranz.' : 'tranz.'}
                      </Text>
                    </View>
                    <Text variant="heading" size={16} weight="700" tracking={-0.5}>
                      {c.total.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} <Text variant="mono" size={10} color={Colors.inkDim}>LEI</Text>
                    </Text>
                  </View>
                ))}
              </>
            ) : null}

            <SectionHeader
              title="Tranzacții recente"
              action="+ ADAUGĂ"
              onAction={() => router.push('/expense/new')}
            />
            {carExpenses.slice(0, 10).map((e) => (
              <View key={e.id} style={styles.txRow}>
                <View
                  style={[
                    styles.txIcon,
                    { backgroundColor: `${CATEGORY_COLORS[e.category] || Colors.inkDim}20` },
                  ]}
                >
                  <Ionicons
                    name={
                      e.category === 'fuel'
                        ? 'flash-outline'
                        : e.category === 'service'
                        ? 'construct-outline'
                        : e.category === 'insurance'
                        ? 'shield-outline'
                        : e.category === 'tax'
                        ? 'trail-sign-outline'
                        : e.category === 'parking'
                        ? 'car-outline'
                        : 'ellipsis-horizontal-outline'
                    }
                    size={16}
                    color={CATEGORY_COLORS[e.category] === Colors.accent ? Colors.accent : Colors.ink}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="heading" size={14} weight="500" numberOfLines={1}>
                    {e.description}
                  </Text>
                  <Text
                    variant="mono"
                    size={10}
                    tracking={0.8}
                    color={Colors.inkDim}
                    numberOfLines={1}
                    style={{ marginTop: 2 }}
                  >
                    {formatShortDate(e.date)}
                    {e.vendor ? ` · ${e.vendor.toUpperCase()}` : ''}
                  </Text>
                </View>
                <Text variant="heading" size={15} weight="700" tracking={-0.3}>
                  {e.amount.toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
                </Text>
              </View>
            ))}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 6, height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  trend: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  trendUp: {
    backgroundColor: 'rgba(255,90,79,0.08)',
    borderColor: 'rgba(255,90,79,0.3)',
  },
  trendDown: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderColor: 'rgba(74,222,128,0.3)',
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  empty: {
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
  emptyBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    padding: 20,
    marginBottom: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  bars: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingBottom: 8,
  },
  barWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    backgroundColor: Colors.surface3,
    borderRadius: 3,
    minHeight: 4,
  },
  barHighlight: {
    backgroundColor: Colors.accent,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
