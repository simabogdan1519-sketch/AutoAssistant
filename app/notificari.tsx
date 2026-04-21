import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors, Spacing, Radius } from '@/constants/theme';

const STORAGE_KEY = 'autoassistant-notif-settings';

type Settings = {
  enabled: boolean;
  daysBeforeExpiry: number[];
  notifyRca: boolean;
  notifyItp: boolean;
  notifyRovinieta: boolean;
  notifyFirstAid: boolean;
  notifyExtinguisher: boolean;
  notifyServiceKm: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  daysBeforeExpiry: [30, 7, 1],
  notifyRca: true,
  notifyItp: true,
  notifyRovinieta: true,
  notifyFirstAid: true,
  notifyExtinguisher: true,
  notifyServiceKm: true,
};

const ALL_DAYS = [60, 30, 14, 7, 3, 1];

export default function NotificariScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setSettings(JSON.parse(data));
    });
    Notifications.getPermissionsAsync().then((result) => {
      setPermissionStatus(result.status);
    });
  }, []);

  const save = async (newSettings: Settings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status !== 'granted') {
      Alert.alert(
        'Permisiune necesară',
        'Ca să primești remindere, trebuie să activezi notificările din setările telefonului.'
      );
    }
  };

  const toggleDay = (day: number) => {
    const newDays = settings.daysBeforeExpiry.includes(day)
      ? settings.daysBeforeExpiry.filter((d) => d !== day)
      : [...settings.daysBeforeExpiry, day].sort((a, b) => b - a);
    save({ ...settings, daysBeforeExpiry: newDays });
  };

  const toggleField = (key: keyof Settings) => {
    save({ ...settings, [key]: !settings[key] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Notificări" eyebrow="REMINDERE · EXPIRĂRI" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {permissionStatus !== 'granted' && (
          <TouchableOpacity activeOpacity={0.8} onPress={requestPermission} style={styles.permBanner}>
            <Ionicons name="warning-outline" size={20} color={Colors.warn} />
            <View style={{ flex: 1 }}>
              <Text variant="heading" size={13} color={Colors.warn} tracking={0.3}>
                Permisiune dezactivată
              </Text>
              <Text variant="mono" size={10} tracking={0.5} color={Colors.inkDim} style={{ marginTop: 2 }}>
                ATINGE PENTRU A ACTIVA NOTIFICĂRILE
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.mainRow}>
          <View style={{ flex: 1 }}>
            <Text variant="heading" size={16} weight="600">
              Toate notificările
            </Text>
            <Text variant="mono" size={10} tracking={0.5} color={Colors.inkDim} style={{ marginTop: 2 }}>
              MASTER SWITCH
            </Text>
          </View>
          <Switch
            value={settings.enabled && permissionStatus === 'granted'}
            onValueChange={() => toggleField('enabled')}
            trackColor={{ false: Colors.surface3, true: Colors.accent }}
            thumbColor="#fff"
          />
        </View>

        <SectionHeader title="Cu cât timp înainte?" />
        <Text variant="mono" size={10} tracking={0.5} color={Colors.inkDim} style={{ marginBottom: 12 }}>
          NUMĂRUL DE ZILE ÎNAINTE DE EXPIRARE
        </Text>
        <View style={styles.dayGrid}>
          {ALL_DAYS.map((day) => {
            const active = settings.daysBeforeExpiry.includes(day);
            return (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(day)}
                activeOpacity={0.7}
                style={[styles.dayChip, active && { backgroundColor: Colors.accent, borderColor: Colors.accent }]}
              >
                <Text variant="heading" size={16} tracking={-0.3} color={active ? Colors.bg : Colors.ink}>
                  {day}
                </Text>
                <Text variant="mono" size={8} tracking={1} color={active ? Colors.bg : Colors.inkDim}>
                  {day === 1 ? 'ZI' : 'ZILE'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionHeader title="Pentru ce să notific" />
        <View style={styles.togglesList}>
          <ToggleRow label="RCA" subtitle="ASIGURARE OBLIGATORIE" value={settings.notifyRca} onToggle={() => toggleField('notifyRca')} />
          <ToggleRow label="ITP" subtitle="INSPECȚIE TEHNICĂ 2 ANI" value={settings.notifyItp} onToggle={() => toggleField('notifyItp')} />
          <ToggleRow label="Rovinietă" subtitle="CNAIR · TAXĂ DE DRUM" value={settings.notifyRovinieta} onToggle={() => toggleField('notifyRovinieta')} />
          <ToggleRow label="Trusă medicală" subtitle="ORD. 2290/1995" value={settings.notifyFirstAid} onToggle={() => toggleField('notifyFirstAid')} />
          <ToggleRow label="Extinctor" subtitle="ISCIR · VERIF. 2 ANI" value={settings.notifyExtinguisher} onToggle={() => toggleField('notifyExtinguisher')} />
          <ToggleRow label="Service & revizii" subtitle="LA KM PROGRAMAȚI" value={settings.notifyServiceKm} onToggle={() => toggleField('notifyServiceKm')} />
        </View>

        <View style={styles.noteCard}>
          <Text variant="mono" size={9} tracking={2} color={Colors.accent}>
            NOTĂ
          </Text>
          <Text variant="body" size={12} style={{ marginTop: 8, lineHeight: 18 }}>
            Notificările se programează local pe telefon. Nimic nu e trimis pe internet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ label, subtitle, value, onToggle }: { label: string; subtitle: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text variant="heading" size={14} weight="500">{label}</Text>
        <Text variant="mono" size={10} tracking={0.8} color={Colors.inkDim} style={{ marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.surface3, true: Colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 80 },
  permBanner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,181,71,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,181,71,0.25)',
    borderRadius: Radius.lg,
    padding: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    marginTop: 12,
  },
  dayGrid: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChip: {
    width: 56,
    height: 56,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglesList: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    paddingHorizontal: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  noteCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
  },
});
