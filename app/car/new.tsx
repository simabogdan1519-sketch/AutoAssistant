import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { useStore } from '@/lib/store';
import { Colors, Spacing } from '@/constants/theme';
import type { FuelType } from '@/types';

const FUEL_TYPES: FuelType[] = ['Diesel', 'Benzină', 'GPL', 'Hybrid', 'Electric'];

export default function NewCarScreen() {
  const router = useRouter();
  const addCar = useStore((s) => s.addCar);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Diesel');
  const [tankCapacity, setTankCapacity] = useState('');
  const [mileage, setMileage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisiune necesară', 'Avem nevoie de acces la galerie pentru a adăuga o poză.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!make || !model || !plate || !mileage) {
      Alert.alert('Date lipsă', 'Completează cel puțin marca, modelul, numărul și kilometrajul.');
      return;
    }

    addCar({
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year) || new Date().getFullYear(),
      plate: plate.trim().toUpperCase(),
      vin: vin.trim() || undefined,
      fuelType,
      tankCapacity: tankCapacity ? parseFloat(tankCapacity) : undefined,
      currentMileage: parseInt(mileage.replace(/\D/g, '')) || 0,
      profileImage: profileImage || undefined,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Mașină" titleAccent="nouă" eyebrow="DATE GENERALE" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={pickImage}
          style={styles.uploadCircle}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.uploadImg} />
          ) : (
            <Ionicons name="image-outline" size={36} color={Colors.inkDim} />
          )}
          <View style={styles.plusBadge}>
            <Ionicons name={profileImage ? 'pencil' : 'add'} size={16} color={Colors.bg} />
          </View>
        </TouchableOpacity>
        <Text
          variant="mono"
          size={10}
          tracking={2}
          color={Colors.inkDim}
          style={{ textAlign: 'center', marginBottom: 24 }}
        >
          POZĂ DE PROFIL · OPȚIONAL
        </Text>

        <Field
          label="Marcă"
          placeholder="ex. Volkswagen"
          value={make}
          onChangeText={setMake}
        />
        <Field
          label="Model"
          placeholder="ex. Passat B8"
          value={model}
          onChangeText={setModel}
        />
        <Field
          label="Număr înmatriculare"
          placeholder="B 123 AUT"
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Field
              label="An fabricație"
              placeholder="2018"
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Rezervor"
              placeholder="66"
              value={tankCapacity}
              onChangeText={setTankCapacity}
              keyboardType="decimal-pad"
              unit="L"
            />
          </View>
        </View>

        <Text variant="mono" size={10} tracking={1.5} color={Colors.inkDim} style={{ marginTop: 4, marginBottom: 8 }}>
          COMBUSTIBIL
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FUEL_TYPES.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFuelType(f)}
                activeOpacity={0.7}
                style={[
                  styles.fuelChip,
                  fuelType === f && { backgroundColor: Colors.accent, borderColor: Colors.accent },
                ]}
              >
                <Text
                  variant="mono"
                  size={11}
                  tracking={1}
                  color={fuelType === f ? Colors.bg : Colors.ink}
                >
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Field
          label="Kilometraj actual"
          placeholder="142,000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="number-pad"
          unit="KM"
        />

        <Field
          label="Serie șasiu (VIN)"
          placeholder="OPȚIONAL · 17 CARACTERE"
          value={vin}
          onChangeText={setVin}
          autoCapitalize="characters"
          maxLength={17}
        />

        <Button label="Salvează mașina" onPress={handleSave} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 64 },
  uploadCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  uploadImg: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.bg,
  },
  fuelChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 999,
  },
});
