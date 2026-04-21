import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function DespreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Despre" titleAccent="aplicație" eyebrow="V1.0.0" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroLogo}>
          <View style={styles.accentLine} />
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text variant="heading" size={32} tracking={-1.5} style={{ textTransform: 'uppercase' }}>
                Auto
              </Text>
              <Text variant="serif" size={32} color={Colors.accent}>
                assistant
              </Text>
            </View>
            <Text variant="mono" size={10} tracking={2} color={Colors.inkDim} style={{ marginTop: 4 }}>
              V1.0.0 · BUILD 2026.04.21
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text variant="mono" size={10} tracking={2} color={Colors.accent}>
            CE FACE APLICAȚIA
          </Text>
          <Text variant="body" size={13} style={{ marginTop: 10, lineHeight: 20 }}>
            AutoAssistant te ajută să îți gestionezi mașinile conform legislației rutiere din România: documente (RCA, ITP, rovinietă, extinctor ISCIR, trusă medicală), consum plin-la-plin, cheltuieli, amenzi și puncte de penalizare.
          </Text>
        </View>

        <View style={styles.card}>
          <Text variant="mono" size={10} tracking={2} color={Colors.accent}>
            CONFIDENȚIALITATE
          </Text>
          <Text variant="body" size={13} style={{ marginTop: 10, lineHeight: 20 }}>
            Toate datele rămân pe telefonul tău. Nu trimitem nimic pe servere, nu colectăm analytics, nu urmărim comportamentul. Zero tracking, zero cloud.
          </Text>
        </View>

        <View style={styles.card}>
          <Text variant="mono" size={10} tracking={2} color={Colors.accent}>
            LEGISLAȚIE DE REFERINȚĂ
          </Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            <LegalRow code="OUG 195/2002" text="Regimul circulației pe drumurile publice" />
            <LegalRow code="Ordin 2290/1995" text="Conținut trusă medicală" />
            <LegalRow code="Ordin 2133/2005" text="Inspecția tehnică periodică" />
            <LegalRow code="OG 15/2002" text="Rovinieta" />
            <LegalRow code="Legea 132/2017" text="Asigurarea obligatorie RCA" />
            <LegalRow code="Normativ ISCIR" text="Verificare extinctor" />
          </View>
        </View>

        <View style={styles.card}>
          <Text variant="mono" size={10} tracking={2} color={Colors.accent}>
            TEHNOLOGII
          </Text>
          <View style={{ marginTop: 10, gap: 4 }}>
            <TechRow label="React Native" version="0.83" />
            <TechRow label="Expo SDK" version="55" />
            <TechRow label="TypeScript" version="5.9" />
            <TechRow label="Zustand" version="5.0" />
          </View>
        </View>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://docs.expo.dev')}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={18} color={Colors.ink} />
          <Text variant="heading" size={13} weight="500" style={{ flex: 1 }}>
            Website
          </Text>
          <Ionicons name="open-outline" size={14} color={Colors.inkDim} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text variant="mono" size={10} tracking={2} color={Colors.inkDimmer} style={{ textAlign: 'center' }}>
            MADE IN 🇷🇴 · FOR DRIVERS
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegalRow({ code, text }: { code: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text variant="mono" size={11} tracking={0.5} color={Colors.accent} style={{ width: 110 }}>
        {code}
      </Text>
      <Text variant="body" size={12} color={Colors.inkDim} style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

function TechRow({ label, version }: { label: string; version: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text variant="body" size={13}>{label}</Text>
      <Text variant="mono" size={11} tracking={0.5} color={Colors.inkDim}>{version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 80 },
  heroLogo: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    padding: 32,
    marginTop: 12,
    marginBottom: 16,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  accentLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: Colors.accent, opacity: 0.4 },
  logo: { width: 100, height: 100, borderRadius: 22 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    paddingVertical: 20,
  },
});
