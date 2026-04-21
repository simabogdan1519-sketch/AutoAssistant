import React from 'react';
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
import { useStore } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { formatMileage } from '@/lib/utils';

export default function GarajScreen() {
  const router = useRouter();
  const cars = useStore((s) => s.cars);
  const documents = useStore((s) => s.documents);
  const fuelEntries = useStore((s) => s.fuelEntries);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Garaj"
        eyebrow={`${cars.length} ${cars.length === 1 ? 'MAȘINĂ' : 'MAȘINI'}`}
        rightIcon="add"
        onRightPress={() => router.push('/car/new')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cars.map((car) => {
          const docCount = documents.filter((d) => d.carId === car.id).length;
          const fuelCount = fuelEntries.filter((f) => f.carId === car.id).length;

          return (
            <TouchableOpacity
              key={car.id}
              activeOpacity={0.9}
              onPress={() => router.push(`/car/${car.id}`)}
              style={styles.carCard}
            >
              <View style={styles.carImage}>
                {car.profileImage ? (
                  <Image source={{ uri: car.profileImage }} style={styles.img} />
                ) : (
                  <View style={styles.imgPlaceholder}>
                    <Ionicons name="car-sport-outline" size={40} color={Colors.inkDimmer} />
                  </View>
                )}
              </View>
              <View style={styles.carInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text variant="heading" size={20} tracking={-0.5} style={{ textTransform: 'uppercase' }}>
                    {car.make}
                  </Text>
                  <Text variant="serif" size={20} color={Colors.accent} style={{ marginLeft: 4 }}>
                    {car.model}
                  </Text>
                </View>
                <Text variant="mono" size={11} color={Colors.inkDim} tracking={1} style={{ marginTop: 2 }}>
                  {car.plate}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text variant="mono" size={9} color={Colors.inkDim} tracking={1.5}>
                      KM
                    </Text>
                    <Text variant="heading" size={14} tracking={-0.3}>
                      {formatMileage(car.currentMileage)}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text variant="mono" size={9} color={Colors.inkDim} tracking={1.5}>
                      DOCS
                    </Text>
                    <Text variant="heading" size={14} tracking={-0.3}>
                      {docCount}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text variant="mono" size={9} color={Colors.inkDim} tracking={1.5}>
                      PLINURI
                    </Text>
                    <Text variant="heading" size={14} tracking={-0.3}>
                      {fuelCount}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.inkDim} />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/car/new')}
          style={styles.addCard}
        >
          <Ionicons name="add-circle-outline" size={32} color={Colors.accent} />
          <Text variant="heading" size={14} tracking={1} style={{ marginTop: 8, textTransform: 'uppercase' }}>
            Adaugă mașină
          </Text>
          <Text variant="mono" size={10} color={Colors.inkDim} tracking={1} style={{ marginTop: 4 }}>
            INFORMAȚII · DOCUMENTE · POZĂ
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingVertical: 16, paddingBottom: 120 },
  carCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xxl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  carImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carInfo: { flex: 1 },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  stat: {},
  addCard: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.xxl,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
  },
});
