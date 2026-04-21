import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { SectionHeader } from '@/components/SectionHeader';
import { useStore } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';
import {
  formatShortDate,
  daysUntil,
  formatDaysLeft,
  getExpiryStatus,
} from '@/lib/utils';

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const car = useStore((s) => s.cars.find((c) => c.id === id));
  const documents = useStore((s) => s.documents.filter((d) => d.carId === id));
  const deleteCar = useStore((s) => s.deleteCar);

  if (!car) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Eroare" showBack />
        <View style={styles.center}>
          <Text variant="body" color={Colors.inkDim}>Mașina nu există.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Șterge mașina?',
      'Toate documentele și datele asociate vor fi șterse definitiv.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => {
            deleteCar(car.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleMenu = () => {
    Alert.alert(
      'Opțiuni',
      car.make + ' ' + car.model,
      [
        { text: 'Editează', onPress: () => router.push(`/car/edit/${car.id}`) },
        { text: 'Șterge', style: 'destructive', onPress: handleDelete },
        { text: 'Anulează', style: 'cancel' },
      ]
    );
  };

  // Fix pentru VIN safe display
  const vinDisplay = car.vin && car.vin.length > 0
    ? `...${car.vin.slice(-6)}`
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={car.make}
        titleAccent={car.model}
        eyebrow={car.plate}
        showBack
        rightIcon="ellipsis-horizontal"
        onRightPress={handleMenu}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImg}>
          {car.profileImage ? (
            <Image source={{ uri: car.profileImage }} style={styles.img} />
          ) : (
            <View style={styles.imgPlaceholder}>
              <Ionicons name="car-sport-outline" size={56} color={Colors.inkDimmer} />
            </View>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/car/edit/${car.id}`)}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={14} color={Colors.ink} />
            <Text variant="mono" size={10} tracking={1.2} color={Colors.ink}>
              EDITEAZĂ
            </Text>
          </TouchableOpacity>
          <View style={styles.plateBadge}>
            <Text variant="mono" size={11} color={Colors.accent} tracking={1.2} weight="500">
              {car.plate}
            </Text>
          </View>
          {vinDisplay && (
            <View style={styles.vinBadge}>
              <Text variant="mono" size={9} color={Colors.inkDim} tracking={1}>
                VIN · {vinDisplay}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.specs}>
          <SpecRow label="Marcă" value={car.make} />
          <SpecRow label="Model" value={car.model} />
          <SpecRow label="An fabricație" value={String(car.year)} />
          <SpecRow label="Combustibil" value={car.fuelType} />
          {car.tankCapacity ? <SpecRow label="Rezervor" value={`${car.tankCapacity} L`} /> : null}
          <SpecRow label="Kilometraj" value={`${car.currentMileage.toLocaleString('ro-RO')} km`} />
        </View>

        <SectionHeader
          title={`Documente · ${documents.length}`}
          action="+ ADAUGĂ"
          onAction={() => router.push('/document/new')}
        />

        {documents.length === 0 ? (
          <View style={styles.emptyDoc}>
            <Ionicons name="document-outline" size={32} color={Colors.inkDimmer} />
            <Text variant="mono" size={11} tracking={1} color={Colors.inkDim} style={{ marginTop: 10 }}>
              NICIUN DOCUMENT
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/document/new')}
              style={styles.emptyBtn}
              activeOpacity={0.8}
            >
              <Text variant="mono" size={11} tracking={1} color={Colors.accent}>
                ADAUGĂ PRIMUL →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {documents.map((d) => {
              const status = d.expiryDate ? getExpiryStatus(d.expiryDate) : 'ok';
              const chipColor =
                status === 'bad' || status === 'expired'
                  ? Colors.danger
                  : status === 'warn'
                  ? Colors.warn
                  : Colors.ok;

              return (
                <View key={d.id} style={styles.docRow}>
                  <View style={styles.docIcon}>
                    <Ionicons name="document-outline" size={16} color={Colors.ink} />
                  </View>
                  <View style={styles.docInfo}>
                    <Text variant="heading" size={14} weight="500" numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text
                      variant="mono"
                      size={10}
                      tracking={0.6}
                      color={Colors.inkDim}
                      numberOfLines={1}
                      style={{ marginTop: 2 }}
                    >
                      {d.issuer ? d.issuer.toUpperCase() : d.type.toUpperCase()}
                      {d.expiryDate ? ` · EXP. ${formatShortDate(d.expiryDate)}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.chip, { borderColor: chipColor, backgroundColor: `${chipColor}15` }]}>
                    <Text variant="mono" size={9} tracking={1} color={chipColor} weight="600">
                      {d.expiryDate ? formatDaysLeft(daysUntil(d.expiryDate)) : 'OK'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim}>
        {label.toUpperCase()}
      </Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImg: {
    aspectRatio: 16 / 10,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  plateBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  vinBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(10,10,10,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specs: {
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  emptyDoc: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 8,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
  },
});
