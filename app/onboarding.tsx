import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { useStore } from '@/lib/store';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const router = useRouter();
  const updateUser = useStore((s) => s.updateUser);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisiune necesară');
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
      // silent
    }
  };

  const finish = () => {
    updateUser({
      name: name.trim() || 'Șofer',
      avatar: avatar || undefined,
    });
    completeOnboarding();
    router.replace('/');
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const skip = () => {
    updateUser({ name: 'Șofer' });
    completeOnboarding();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with progress + skip */}
      <View style={styles.topBar}>
        <View style={styles.progressWrap}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === step && styles.progressDotActive,
                i < step && styles.progressDotDone,
              ]}
            />
          ))}
        </View>
        {step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity onPress={skip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text variant="mono" size={11} tracking={1} color={Colors.inkDim}>
              SARI
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepProfile name={name} setName={setName} avatar={avatar} onPickImage={pickImage} />}
        {step === 2 && <StepFeatures />}
        {step === 3 && <StepReady />}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.ctaWrap}>
        <Button
          label={step === TOTAL_STEPS - 1 ? 'Începe să folosesc' : 'Continuă'}
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
}

// ==================== STEP 1: WELCOME ====================
function StepWelcome() {
  return (
    <View style={styles.step}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text variant="mono" size={10} tracking={2} color={Colors.accent} style={styles.eyebrow}>
        BUN VENIT ÎN
      </Text>
      <View style={styles.titleRow}>
        <Text variant="heading" size={40} tracking={-2} style={{ textTransform: 'uppercase' }}>
          Auto
        </Text>
        <Text variant="serif" size={40} color={Colors.accent}>
          assistant
        </Text>
      </View>

      <Text variant="body" size={15} color={Colors.inkDim} style={styles.description}>
        Aplicația care îți gestionează mașinile conform legislației rutiere din România. Documentele, consumul, amenzile — toate într-un singur loc, pe telefonul tău.
      </Text>

      <View style={styles.features}>
        <FeatureRow icon="shield-checkmark-outline" text="100% local — datele tale nu pleacă de pe telefon" />
        <FeatureRow icon="flash-outline" text="Remindere automate pentru expirări" />
        <FeatureRow icon="receipt-outline" text="Conform OUG 195/2002 și legislație RO" />
      </View>
    </View>
  );
}

// ==================== STEP 2: PROFILE ====================
function StepProfile({
  name,
  setName,
  avatar,
  onPickImage,
}: {
  name: string;
  setName: (v: string) => void;
  avatar: string | null;
  onPickImage: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text variant="mono" size={10} tracking={2} color={Colors.accent} style={styles.eyebrow}>
        PASUL 1 DIN 3
      </Text>
      <View style={styles.titleRow}>
        <Text variant="heading" size={32} tracking={-1.5} style={{ textTransform: 'uppercase' }}>
          Hai să ne
        </Text>
        <Text variant="serif" size={32} color={Colors.accent}>
          cunoaștem
        </Text>
      </View>

      <Text variant="body" size={14} color={Colors.inkDim} style={styles.description}>
        Adaugă numele tău și opțional o poză de profil. Le poți modifica oricând din secțiunea "Eu".
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPickImage}
        style={styles.profileCircle}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.profileImg} />
        ) : (
          <Ionicons name="person" size={56} color={Colors.inkDim} />
        )}
        <View style={styles.plusBadge}>
          <Ionicons name={avatar ? 'pencil' : 'camera'} size={16} color={Colors.bg} />
        </View>
      </TouchableOpacity>
      <Text
        variant="mono"
        size={10}
        tracking={1.5}
        color={Colors.inkDim}
        style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}
      >
        POZĂ DE PROFIL · OPȚIONAL
      </Text>

      <Field
        label="Nume"
        placeholder="Cum vrei să te numim?"
        value={name}
        onChangeText={setName}
        maxLength={40}
        autoFocus={false}
      />

      <Text variant="mono" size={10} tracking={1} color={Colors.inkDim} style={{ marginTop: 8 }}>
        POȚI SĂRI PESTE ȘI ADĂUGA MAI TÂRZIU
      </Text>
    </View>
  );
}

// ==================== STEP 3: FEATURES ====================
function StepFeatures() {
  return (
    <View style={styles.step}>
      <Text variant="mono" size={10} tracking={2} color={Colors.accent} style={styles.eyebrow}>
        PASUL 2 DIN 3
      </Text>
      <View style={styles.titleRow}>
        <Text variant="heading" size={32} tracking={-1.5} style={{ textTransform: 'uppercase' }}>
          Ce poți
        </Text>
        <Text variant="serif" size={32} color={Colors.accent}>
          face
        </Text>
      </View>

      <Text variant="body" size={14} color={Colors.inkDim} style={styles.description}>
        Iată funcțiile principale pe care le ai la îndemână:
      </Text>

      <View style={styles.featureGrid}>
        <FeatureCard
          icon="car-sport-outline"
          title="Mașini multiple"
          description="Adaugă oricâte mașini ai, cu poze și date complete"
        />
        <FeatureCard
          icon="document-text-outline"
          title="Documente"
          description="RCA, ITP, rovinietă, extinctor, trusă — cu reminder la expirare"
        />
        <FeatureCard
          icon="calculator-outline"
          title="Consum real"
          description="Calcul plin-la-plin cu grafic istoric"
        />
        <FeatureCard
          icon="alert-circle-outline"
          title="Amenzi & puncte"
          description="Tracker cu reset automat la 6 luni (OUG 195)"
        />
        <FeatureCard
          icon="trending-up-outline"
          title="Cheltuieli"
          description="Urmărește bugetul lunar cu distribuție pe categorii"
        />
        <FeatureCard
          icon="cloud-download-outline"
          title="Export PDF"
          description="Raport complet pentru vânzare sau arhivă"
        />
      </View>
    </View>
  );
}

// ==================== STEP 4: READY ====================
function StepReady() {
  return (
    <View style={styles.step}>
      <Text variant="mono" size={10} tracking={2} color={Colors.accent} style={styles.eyebrow}>
        PASUL 3 DIN 3
      </Text>
      <View style={styles.titleRow}>
        <Text variant="heading" size={32} tracking={-1.5} style={{ textTransform: 'uppercase' }}>
          Ești gata
        </Text>
        <Text variant="serif" size={32} color={Colors.accent}>
          de drum
        </Text>
      </View>

      <Text variant="body" size={14} color={Colors.inkDim} style={styles.description}>
        Ce să faci după ce intri în aplicație:
      </Text>

      <View style={styles.stepsList}>
        <TipRow num="01" title="Adaugă prima mașină" description="Din tab-ul GARAJ → buton + din colț" />
        <TipRow num="02" title="Urcă documente" description="RCA, ITP, rovinietă — din detaliu mașină" />
        <TipRow num="03" title="Activează notificările" description="Din EU → Notificări" />
        <TipRow num="04" title="Citește ghidul legislativ" description="Din EU → Ghid legislativ RO" />
      </View>

      <View style={styles.noteCard}>
        <Text variant="mono" size={9} tracking={2} color={Colors.accent}>
          CONFIDENȚIALITATE
        </Text>
        <Text variant="body" size={12} style={{ marginTop: 8, lineHeight: 18 }}>
          Toate datele tale rămân pe acest telefon. Nimic nu e trimis pe servere. Fă backup din timp în timp din secțiunea "Eu → Backup date".
        </Text>
      </View>
    </View>
  );
}

// ==================== HELPERS ====================
function FeatureRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={16} color={Colors.accent} />
      </View>
      <Text variant="body" size={13} style={{ flex: 1, lineHeight: 18 }}>
        {text}
      </Text>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureCardIcon}>
        <Ionicons name={icon} size={18} color={Colors.accent} />
      </View>
      <Text variant="heading" size={13} weight="600" style={{ marginTop: 10 }} numberOfLines={1}>
        {title}
      </Text>
      <Text
        variant="mono"
        size={9}
        tracking={0.3}
        color={Colors.inkDim}
        style={{ marginTop: 4, lineHeight: 13 }}
        numberOfLines={3}
      >
        {description}
      </Text>
    </View>
  );
}

function TipRow({ num, title, description }: { num: string; title: string; description: string }) {
  return (
    <View style={styles.tipRow}>
      <Text variant="mono" size={11} tracking={1} color={Colors.accent} style={styles.tipNum}>
        {num}
      </Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="heading" size={14} weight="600" numberOfLines={1}>
          {title}
        </Text>
        <Text
          variant="mono"
          size={10}
          tracking={0.5}
          color={Colors.inkDim}
          style={{ marginTop: 2 }}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.surface3,
  },
  progressDotActive: {
    backgroundColor: Colors.accent,
    width: 32,
  },
  progressDotDone: {
    backgroundColor: Colors.accent,
    opacity: 0.4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  step: {
    paddingTop: 20,
  },
  logoWrap: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  logo: {
    width: 100,
    height: 100,
  },
  eyebrow: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  description: {
    lineHeight: 22,
    marginBottom: 24,
  },
  features: {
    gap: 14,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212,255,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCircle: {
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
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 0,
  },
  profileImg: {
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
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - 8) / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 14,
    minHeight: 120,
  },
  featureCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212,255,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsList: {
    gap: 4,
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  tipNum: {
    width: 28,
    paddingTop: 2,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 16,
    marginTop: 16,
  },
  ctaWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
});
