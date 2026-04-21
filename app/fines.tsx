import React from 'react';
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
import { useStore } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { calcActivePoints, formatShortDate } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

export default function FinesScreen() {
  const router = useRouter();
  const fines = useStore((s) => s.fines);
  const activeCarId = useStore((s) => s.activeCarId);

  const carFines = fines
    .filter((f) => f.carId === activeCarId)
    .sort((a, b) => b.date - a.date);

  const { total: activePoints, resetDate } = calcActivePoints(carFines);
  const daysToReset = resetDate ? differenceInDays(new Date(resetDate), new Date()) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Amenzi &"
        titleAccent="puncte"
        eyebrow="OUG 195 / 2002"
        showBack
        rightIcon="add"
        onRightPress={() => router.push('/fine/new')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pointsDisplay}>
          <View style={styles.accentLine} />
          <View style={styles.pointsTop}>
            <View>
              <Text variant="mono" size={10} tracking={2} color={Colors.inkDim}>
                PUNCTE ACTIVE
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
                <Text variant="heading" size={84} weight="900" tracking={-5}>
                  {String(activePoints).padStart(2, '0')}
                </Text>
                <Text
                  variant="serif"
                  size={28}
                  color={Colors.inkDim}
                  style={{ marginLeft: 4 }}
                >
                  /15
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: activePoints > 0 ? Colors.danger : Colors.ok,
                },
              ]}
            >
              <Text variant="mono" size={9} tracking={1.5} color={Colors.bg} weight="600">
                {activePoints > 0 ? 'ACTIVE' : 'CURAT'}
              </Text>
            </View>
          </View>

          <View style={styles.track}>
            {Array.from({ length: 15 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.slot,
                  i < activePoints && { backgroundColor: Colors.danger },
                ]}
              />
            ))}
          </View>

          <View style={styles.note}>
            <Text variant="mono" size={10} tracking={0.5} color={Colors.inkDim}>
              Punctele se <Text variant="mono" size={10} color={Colors.accent} weight="500">anulează automat după 6 luni</Text> de la ultima contravenție, dacă nu primești altele.
            </Text>
          </View>
        </View>

        {daysToReset !== null && daysToReset > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.warn} />
            <View style={{ flex: 1 }}>
              <Text variant="heading" size={12} color={Colors.warn} tracking={0.5} style={{ textTransform: 'uppercase' }}>
                Reset · {daysToReset} zile
              </Text>
              <Text variant="mono" size={10} tracking={0.5} color={Colors.inkDim} style={{ marginTop: 2 }}>
                ÎN {daysToReset} ZILE CONTORUL SE ANULEAZĂ
              </Text>
            </View>
          </View>
        )}

        <SectionHeader title="Istoric contravenții" action="+ ADAUGĂ" onAction={() => router.push('/fine/new')} />

        {carFines.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text variant="mono" size={11} tracking={1} color={Colors.inkDim}>
              NICIO AMENDĂ ÎNREGISTRATĂ
            </Text>
          </View>
        ) : (
          carFines.map((fine) => (
            <View key={fine.id} style={[styles.fineCard, fine.paid && { opacity: 0.5 }]}>
              <View style={styles.fineHead}>
                <View style={{ flex: 1 }}>
                  <Text variant="mono" size={9} tracking={1.5} color={Colors.inkDim}>
                    {fine.article.toUpperCase()}
                    {fine.paid && ' · PLĂTITĂ' + (fine.paidHalf ? ' 50%' : '')}
                  </Text>
                  <Text
                    variant="heading"
                    size={14}
                    weight="600"
                    style={{ marginTop: 4, lineHeight: 18 }}
                  >
                    {fine.offense}
                  </Text>
                </View>
                <Text variant="heading" size={22} weight="800" tracking={-1}>
                  {fine.amount}
                  <Text variant="mono" size={10} color={Colors.inkDim}> LEI</Text>
                </Text>
              </View>
              <View style={styles.fineFoot}>
                <Text variant="mono" size={10} tracking={0.8} color={Colors.inkDim}>
                  {formatShortDate(fine.date)}
                  {fine.location ? ` · ${fine.location.toUpperCase()}` : ''}
                </Text>
                <Text
                  variant="mono"
                  size={10}
                  tracking={0.8}
                  color={fine.paid ? Colors.ok : Colors.danger}
                  weight="500"
                >
                  {fine.paid ? 'ACHITATĂ' : fine.points > 0 ? `+ ${fine.points} PUNCTE` : 'NEPLĂTITĂ'}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.infoCard}>
          <Text variant="mono" size={9} tracking={2} color={Colors.accent}>
            ȘTIAI CĂ?
          </Text>
          <Text variant="body" size={13} style={{ marginTop: 8, lineHeight: 20 }}>
            Dacă achiți amenda în <Text variant="body" size={13} weight="700" color={Colors.accent}>15 zile</Text> primești <Text variant="body" size={13} weight="700" color={Colors.accent}>reducere de 50%</Text> — jumătate din minimul amenzii.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  pointsDisplay: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.danger,
    opacity: 0.5,
  },
  pointsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  track: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 16,
  },
  slot: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface3,
    borderRadius: 2,
  },
  note: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  alertBanner: {
    backgroundColor: 'rgba(255, 181, 71, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 181, 71, 0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
  fineCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  fineHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    borderStyle: 'dashed',
    gap: 12,
  },
  fineFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
});
