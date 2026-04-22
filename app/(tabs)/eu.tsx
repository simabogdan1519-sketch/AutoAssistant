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
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useStore } from '@/lib/store';

export default function EuScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const cars = useStore((s) => s.cars);
  const documents = useStore((s) => s.documents);
  const fines = useStore((s) => s.fines);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Profil" eyebrow="UTILIZATOR" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/profil-edit')}
          style={styles.hero}
        >
          <View style={styles.avatarWrap}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={Colors.inkDim} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color={Colors.bg} />
            </View>
          </View>

          <Text
            variant="heading"
            size={22}
            tracking={-0.5}
            numberOfLines={1}
            style={{ marginTop: 16, maxWidth: '90%', textAlign: 'center' }}
          >
            {user.name || 'Șofer'}
          </Text>
          <Text
            variant="mono"
            size={10}
            tracking={1.5}
            color={Colors.inkDim}
            style={{ marginTop: 4 }}
          >
            ATINGE PENTRU EDITARE
          </Text>

          <View style={styles.stats}>
            <View style={styles.statBlock}>
              <Text variant="heading" size={22} tracking={-1}>
                {cars.length}
              </Text>
              <Text variant="mono" size={9} tracking={1.5} color={Colors.inkDim}>
                MAȘINI
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBlock}>
              <Text variant="heading" size={22} tracking={-1}>
                {documents.length}
              </Text>
              <Text variant="mono" size={9} tracking={1.5} color={Colors.inkDim}>
                DOCS
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBlock}>
              <Text variant="heading" size={22} tracking={-1}>
                {fines.length}
              </Text>
              <Text variant="mono" size={9} tracking={1.5} color={Colors.inkDim}>
                AMENZI
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.menu}>
          <MenuRow
            icon="alert-circle-outline"
            title="Amenzi & puncte penalizare"
            subtitle="OUG 195/2002"
            onPress={() => router.push('/fines')}
          />
          <MenuRow
            icon="card-outline"
            title="Permis de conducere"
            subtitle="10 ANI VALIDITATE"
            onPress={() => router.push('/permis')}
          />
          <MenuRow
            icon="notifications-outline"
            title="Notificări"
            subtitle="REMINDERE · EXPIRĂRI"
            onPress={() => router.push('/notificari')}
          />
          <MenuRow
            icon="cloud-upload-outline"
            title="Backup date"
            subtitle="EXPORT JSON"
            onPress={() => router.push('/backup')}
          />
          <MenuRow
            icon="book-outline"
            title="Ghid legislativ RO"
            subtitle="REDUCERE 50% · RESET PUNCTE"
            onPress={() => router.push('/ghid')}
          />
          <MenuRow
            icon="information-circle-outline"
            title="Despre aplicație"
            subtitle="V1.0 · BUILD 2026.04.22"
            onPress={() => router.push('/despre')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={menuStyles.row}>
      <View style={menuStyles.iconWrap}>
        <Ionicons name={icon} size={18} color={Colors.ink} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="heading" size={14} weight="600" numberOfLines={1}>
          {title}
        </Text>
        <Text
          variant="mono"
          size={10}
          tracking={1}
          color={Colors.inkDim}
          numberOfLines={1}
          style={{ marginTop: 2 }}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.inkDim} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    marginTop: 8,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  stats: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  statBlock: { alignItems: 'center', minWidth: 60 },
  divider: { width: 1, height: 28, backgroundColor: Colors.line },
  menu: {},
});

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
