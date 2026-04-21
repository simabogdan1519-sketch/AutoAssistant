import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { Colors, Spacing } from '@/constants/theme';

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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.ink} />
          </TouchableOpacity>
        )}
        <View style={styles.textWrap}>
          {eyebrow ? (
            <Text
              variant="mono"
              color={Colors.inkDim}
              size={9}
              tracking={2}
              numberOfLines={1}
              style={{ marginBottom: 2 }}
            >
              {eyebrow}
            </Text>
          ) : null}
          <View style={styles.titleRow}>
            <Text
              variant="heading"
              size={22}
              numberOfLines={1}
              style={styles.titleMain}
            >
              {title.toUpperCase()}
            </Text>
            {titleAccent ? (
              <Text
                variant="serif"
                color={Colors.accent}
                size={22}
                numberOfLines={1}
                style={styles.titleAccent}
              >
                {titleAccent}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {rightIcon ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onRightPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={rightIcon} size={18} color={Colors.ink} />
        </TouchableOpacity>
      ) : null}
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
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
  },
  titleMain: {
    flexShrink: 1,
  },
  titleAccent: {
    marginLeft: 4,
    flexShrink: 1,
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
    flexShrink: 0,
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
    flexShrink: 0,
  },
});
