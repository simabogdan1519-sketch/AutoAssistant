import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function EditCarScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const car = useStore((s) => s.cars.find((c) => c.id === id));
  const updateCar = useStore((s) => s.updateCar);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Diesel');
  const [tankCapacity, setTankCapacity] = useState('');
  const [mileage, setMileage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Inițializare sigură într-un useEffect (nu în useState)
  useEffect(() => {
    if (car && !initialized) {
      setMake(car.make || '');
      setModel(car.model || '');
      setYear(String(car.year || ''));
      setPlate(car.plate || '');
      setVin(car.vin || '');
      setFuelType(car.fuelType || 'Diesel');
      setTankCapacity(car.tankCapacity ? String(car.tankCapacity) : '');
      setMileage(String(car.currentMileage || ''));
      setProfileImage(car.profileImage || null);
      setInitialized(true);
    }
  }, [car, initialized]);

  if (!car || !id) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Eroare" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text variant="body" color={Colors.inkDim}>
            Mașina nu a fost găsită.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 20, padding: 12 }}
          >
            <Text variant="mono" size={11} tracking={1} color={Colors.accent}>
              ← ÎNAPOI
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune necesară', 'Avem nevoie de acces la galerie pentru a schimba poza.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut selecta poza.');
    }
  };

  const removeImage = () => {
    Alert.alert('Elimină poza?', 'Mașina va rămâne fără poză de profil.', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Elimină', style: 'destructive', onPress: () => setProfileImage(null) },
    ]);
  };

  const handleSave = () => {
    if (!make.trim() || !model.trim() || !plate.trim() || !mileage) {
      Alert.alert('Date lipsă', 'Completează cel puțin marca, modelul, numărul și kilometrajul.');
      return;
    }

    const parsedYear = parseInt(year);
    const parsedMileage = parseInt(mileage.replace(/\D/g, '')) || 0;
    const parsedTank = tankCapacity ? parseFloat(tankCapacity) : undefined;

    try {
      updateCar(car.id, {
        make: make.trim(),
        model: model.trim(),
        year: isNaN(parsedYear) ? car.year : parsedYear,
        plate: plate.trim().toUpperCase(),
        vin: vin.trim() || undefined,
        fuelType,
        tankCapacity: parsedTank,
        currentMileage: parsedMileage,
        profileImage: profileImage || undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut salva. Încearcă din nou.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Editează"
        titleAccent={car.model || ''}
        eyebrow={car.plate || ''}
        showBack
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
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
          {profileImage ? (
            <TouchableOpacity onPress={removeImage} style={styles.removeImgBtn}>
              <Text variant="mono" size={10} tracking={1.2} color={Colors.danger}>
                ELIMINĂ POZA
              </Text>
            </TouchableOpacity>
          ) : null}
          <Text
            variant="mono"
            size={10}
            tracking={1.5}
            color={Colors.inkDim}
            style={{ textAlign: 'center', marginTop: 8 }}
          >
            POZĂ DE PROFIL
          </Text>
        </View>

        <Field label="Marcă" placeholder="ex. Volkswagen" value={make} onChangeText={setMake} />
        <Field label="Model" placeholder="ex. Passat B8" value={model} onChangeText={setModel} />
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
              label="An"
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

        <Text
          variant="mono"
          size={10}
          tracking={1.5}
          color={Colors.inkDim}
          style={{ marginTop: 8, marginBottom: 8 }}
        >
          COMBUSTIBIL
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FUEL_TYPES.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFuelType(f)}
                activeOpacity={0.7}
                style={[
                  styles.fuelChip,
                  fuelType === f && {
                    backgroundColor: Colors.accent,
                    borderColor: Colors.accent,
                  },
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

        <Button label="Salvează modificările" onPress={handleSave} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 64 },
  imageWrap: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  uploadCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.line,
    borderStyle: 'dashed',
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
  removeImgBtn: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
