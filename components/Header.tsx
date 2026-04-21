import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { Colors, Spacing, Radius } from '@/constants/theme';

type Props = {
  title: string;
  titleAccent?: string;
  eyebrow?: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

export function Header({
  title,
  titleAccent,
  eyebrow,
  showBack = false,
  rightIcon,
  onRightPress,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.ink} />
          </TouchableOpacity>
        )}
        <View>
          {eyebrow && (
            <Text variant="mono" color={Colors.inkDim} size={9} style={{ marginBottom: 2 }}>
              {eyebrow}
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text variant="heading" size={22} style={{ textTransform: 'uppercase' }}>
              {title}
            </Text>
            {titleAccent && (
              <Text variant="serif" color={Colors.accent} size={22} style={{ marginLeft: 4 }}>
                {titleAccent}
              </Text>
            )}
          </View>
        </View>
      </View>

      {rightIcon && (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Ionicons name={rightIcon} size={18} color={Colors.ink} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
