import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Colors, Spacing, Radius } from '@/constants/theme';

type Section = {
  id: string;
  title: string;
  titleAccent?: string;
  icon: keyof typeof Ionicons.glyphMap;
  eyebrow: string;
  content: { heading?: string; text: string; highlight?: string }[];
};

const SECTIONS: Section[] = [
  {
    id: 'puncte',
    title: 'Puncte de',
    titleAccent: 'penalizare',
    icon: 'alert-circle-outline',
    eyebrow: 'OUG 195/2002 · ART. 108',
    content: [
      {
        heading: 'Cum funcționează',
        text: 'Fiecare conducător auto are 15 puncte de penalizare disponibile. La fiecare contravenție primești 2, 3, 4 sau 6 puncte, în funcție de gravitate.',
      },
      {
        heading: 'Resetare automată',
        highlight: 'Toate punctele se anulează după 6 luni',
        text: 'de la ultima contravenție, dacă nu primești altele noi în acest interval.',
      },
      {
        heading: 'Suspendare permis',
        text: 'Dacă acumulezi 15 puncte într-un interval de 12 luni, ți se suspendă permisul pentru 30 zile.',
      },
      {
        heading: 'Exemple puncte',
        text: '• 2 pct: Depășire viteză 11-30 km/h · Nefolosirea semnalizării\n• 3 pct: Depășire 31-40 km/h\n• 4 pct: Depășire 41-50 km/h · Neacordare prioritate\n• 6 pct: Depășire +50 km/h · Trecere pe roșu · Depășire interzisă',
      },
    ],
  },
  {
    id: 'amenzi',
    title: 'Plata',
    titleAccent: 'amenzilor',
    icon: 'cash-outline',
    eyebrow: 'OG 2/2001 · REDUCERE 50%',
    content: [
      {
        heading: 'Reducere de 50%',
        highlight: 'Dacă achiți în 15 zile',
        text: 'de la primirea procesului-verbal, plătești jumătate din minimul amenzii.',
      },
      {
        heading: 'Contestare',
        text: 'Ai 15 zile de la primire să contești amenda la judecătorie. Dacă nu contești, după 30 zile devine titlu executoriu.',
      },
      {
        heading: 'Amenzile neachitate',
        text: 'Pot fi executate silit. Poți fi blocat la ITP, schimbarea proprietarului sau la reînnoirea permisului.',
      },
    ],
  },
  {
    id: 'itp',
    title: 'Inspecția',
    titleAccent: 'tehnică',
    icon: 'construct-outline',
    eyebrow: 'ORDINUL 2133/2005',
    content: [
      {
        heading: 'Interval ITP',
        text: '• Autoturisme până la 3.5t: la fiecare 2 ani\n• Taxi, Uber/Bolt, școală de șoferi, transport persoane: 1 an\n• Autocare peste 3.5t: 1 an\n• Remorci, rulote: 2 ani',
      },
      {
        heading: 'Valabilitate',
        highlight: 'ITP expirat = amendă',
        text: 'între 2,900 - 5,800 lei + reținere certificat de înmatriculare. Circulația fără ITP valabil e interzisă.',
      },
      {
        heading: 'Prima ITP la mașini noi',
        text: 'Mașinile noi au prima ITP după 3 ani de la înmatriculare.',
      },
    ],
  },
  {
    id: 'trusa',
    title: 'Trusa',
    titleAccent: 'medicală',
    icon: 'medkit-outline',
    eyebrow: 'ORDIN 2290/1995',
    content: [
      {
        heading: 'Obligatorie la bord',
        text: 'Orice autovehicul trebuie să aibă trusă medicală conformă cu Ordinul 2290/1995 al Ministerului Sănătății.',
      },
      {
        heading: 'Ce trebuie să conțină',
        text: '• Leucoplast rolă · Comprese sterile · Fașă elastică · Garou · Pansament individual\n• Atele · Mănuși de unică folosință · Mască de resuscitare · Foarfecă · Ace de siguranță\n• Soluție de rivanol · Alcool sanitar · Apă oxigenată · Paracetamol · Antispastice',
      },
      {
        heading: 'Termen de valabilitate',
        highlight: 'Produsele din trusă expiră',
        text: 'Verifică anual data de expirare a medicamentelor. O trusă cu produse expirate e ca și cum nu ai avea trusă deloc.',
      },
      {
        heading: 'Amenda',
        text: '580-1,450 lei pentru lipsa trusei medicale sau pentru conținut neconform.',
      },
    ],
  },
  {
    id: 'extinctor',
    title: 'Extinctorul',
    titleAccent: 'auto',
    icon: 'flame-outline',
    eyebrow: 'ISCIR · NORMATIV PSI',
    content: [
      {
        heading: 'Obligatoriu',
        text: 'Orice autovehicul trebuie să aibă extinctor la bord, conform normativului PSI.',
      },
      {
        heading: 'Verificare periodică',
        highlight: 'La 2 ani — verificare tehnică',
        text: 'de către operator ISCIR autorizat.',
      },
      {
        heading: 'Reîncărcare',
        text: 'La 5 ani de la fabricație sau după utilizare (chiar parțială). Extinctoarele cu data de fabricație mai veche de 10 ani trebuie înlocuite.',
      },
      {
        heading: 'Tip recomandat',
        text: 'P2 (pulbere ABC, 2 kg) — cel mai des întâlnit pentru autoturisme. Poziționat la îndemâna șoferului.',
      },
    ],
  },
  {
    id: 'rca',
    title: 'RCA',
    titleAccent: 'asigurare',
    icon: 'shield-outline',
    eyebrow: 'LEGEA 132/2017',
    content: [
      {
        heading: 'Obligatorie',
        text: 'Răspundere Civilă Auto e obligatorie pentru circulația pe drumuri publice. Se încheie pe 6 sau 12 luni.',
      },
      {
        heading: 'Fără RCA',
        highlight: 'Amendă 2,000-8,000 lei',
        text: '+ reținerea certificatului de înmatriculare + plăcuțe. Dacă produci accident fără RCA, plătești personal toate pagubele.',
      },
      {
        heading: 'Clasa de bonus-malus (B-M)',
        text: 'Începi de la clasa 0. Fără daune → urci 1 clasă pe an (până la B-15, reducere ~40%). Cu daune → cobori în clase malus (M-1 la M-8, mărire până la +175%).',
      },
      {
        heading: 'Transfer la vânzare',
        text: 'Polița RCA rămâne pe mașină, nu pe persoană. Poți cere restituirea primei neconsummate la vânzare.',
      },
    ],
  },
  {
    id: 'rovinieta',
    title: 'Rovinieta',
    titleAccent: 'CNAIR',
    icon: 'trail-sign-outline',
    eyebrow: 'OG 15/2002',
    content: [
      {
        heading: 'Obligatorie',
        text: 'Rovinieta e obligatorie pe drumurile naționale și autostrăzi, pentru toate vehiculele înmatriculate în România sau care tranzitează țara.',
      },
      {
        heading: 'Perioade',
        text: '• 1 zi · 7 zile · 30 zile · 90 zile · 12 luni\n• Pentru autoturisme B (sub 3.5t) — cele mai accesate sunt 30 zile sau 12 luni',
      },
      {
        heading: 'Fără rovinietă',
        highlight: 'Tarif de despăgubire',
        text: '(nu amendă) de 3x tariful rovinietei anuale, între 250-750 EUR în funcție de categoria vehiculului.',
      },
      {
        heading: 'Cumpărare',
        text: 'Online pe erovinieta.ro, prin SMS, la benzinării (OMV, Rompetrol, etc.) sau oficii poștale. E înregistrată electronic pe baza numărului de înmatriculare.',
      },
    ],
  },
];

export default function GhidScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('puncte');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Ghid" titleAccent="legislativ" eyebrow="LEGISLAȚIE RUTIERĂ RO" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text variant="mono" size={10} tracking={2} color={Colors.accent}>
            REFERINȚĂ RAPIDĂ
          </Text>
          <Text variant="body" size={13} style={{ marginTop: 8, lineHeight: 18 }}>
            Informațiile esențiale despre legislația rutieră din România, extrase din acte normative în vigoare.
          </Text>
        </View>

        {SECTIONS.map((section) => {
          const isExpanded = expandedId === section.id;
          return (
            <View key={section.id} style={styles.sectionCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setExpandedId(isExpanded ? null : section.id)}
                style={styles.sectionHead}
              >
                <View style={styles.sectionIcon}>
                  <Ionicons name={section.icon} size={20} color={Colors.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="mono" size={9} tracking={1.5} color={Colors.inkDim} numberOfLines={1}>
                    {section.eyebrow}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                    <Text
                      variant="heading"
                      size={18}
                      tracking={-0.5}
                      numberOfLines={1}
                      style={{ textTransform: 'uppercase', flexShrink: 1 }}
                    >
                      {section.title}
                    </Text>
                    {section.titleAccent && (
                      <Text
                        variant="serif"
                        size={18}
                        color={Colors.accent}
                        numberOfLines={1}
                        style={{ marginLeft: 4, flexShrink: 1 }}
                      >
                        {section.titleAccent}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.inkDim}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.sectionBody}>
                  {section.content.map((item, i) => (
                    <View key={i} style={i > 0 ? { marginTop: 16 } : undefined}>
                      {item.heading && (
                        <Text variant="heading" size={13} tracking={-0.2} weight="600" style={{ marginBottom: 6 }}>
                          {item.heading}
                        </Text>
                      )}
                      {item.highlight && (
                        <Text variant="body" size={13} color={Colors.accent} weight="700" style={{ marginBottom: 4, lineHeight: 18 }}>
                          {item.highlight}
                        </Text>
                      )}
                      <Text variant="body" size={13} color={Colors.inkDim} style={{ lineHeight: 20 }}>
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.disclaimer}>
          <Text variant="mono" size={9} tracking={2} color={Colors.inkDim}>
            DISCLAIMER
          </Text>
          <Text variant="body" size={12} color={Colors.inkDim} style={{ marginTop: 8, lineHeight: 18 }}>
            Informațiile sunt orientative și pot suferi modificări legislative. Pentru aplicarea corectă în cazuri specifice, consultă legislația actualizată sau un jurist.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 80 },
  intro: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(212,255,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    borderStyle: 'dashed',
  },
  disclaimer: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
});
