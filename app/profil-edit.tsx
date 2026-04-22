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

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);

  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune necesară', 'Avem nevoie de acces la galerie.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut selecta poza.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune necesară', 'Avem nevoie de acces la cameră.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut deschide camera.');
    }
  };

  const chooseImageSource = () => {
    Alert.alert('Poză profil', 'De unde alegi poza?', [
      { text: 'Galerie', onPress: pickImage },
      { text: 'Cameră', onPress: takePhoto },
      { text: 'Anulează', style: 'cancel' },
    ]);
  };

  const removeAvatar = () => {
    Alert.alert('Elimină poza?', '', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Elimină', style: 'destructive', onPress: () => setAvatar(null) },
    ]);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Nume lipsă', 'Adaugă un nume pentru profil.');
      return;
    }
    updateUser({
      name: name.trim(),
      avatar: avatar || undefined,
    });
    requestAnimationFrame(() => {
      router.back();
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Editează" titleAccent="profil" eyebrow="UTILIZATOR" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={chooseImageSource}
            style={styles.uploadCircle}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.uploadImg} />
            ) : (
              <Ionicons name="person" size={56} color={Colors.inkDim} />
            )}
            <View style={styles.plusBadge}>
              <Ionicons
                name={avatar ? 'pencil' : 'camera'}
                size={16}
                color={Colors.bg}
              />
            </View>
          </TouchableOpacity>
          {avatar ? (
            <TouchableOpacity onPress={removeAvatar} style={styles.removeImgBtn}>
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

        <Field
          label="Nume"
          placeholder="Cum vrei să te numim?"
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        <Button label="Salvează profil" onPress={handleSave} style={{ marginTop: 16 }} />
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
    marginBottom: 24,
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
});
