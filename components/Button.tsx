import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Colors, Spacing, Radius } from '@/constants/theme';

type Props = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Button({
  label,
  loading,
  variant = 'primary',
  icon,
  style,
  disabled,
  ...rest
}: Props) {
  const bg =
    variant === 'primary'
      ? Colors.accent
      : variant === 'danger'
      ? Colors.danger
      : Colors.surface;
  const fg = variant === 'secondary' ? Colors.ink : Colors.bg;
  const border =
    variant === 'secondary' ? Colors.line : 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {icon && <Ionicons name={icon} size={16} color={fg} />}
            <Text
              variant="heading"
              size={13}
              color={fg}
              tracking={1}
              style={{ textTransform: 'uppercase' }}
            >
              {label}
            </Text>
          </View>
          <View
            style={[
              styles.arrow,
              { backgroundColor: variant === 'secondary' ? Colors.ink : Colors.bg },
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={12}
              color={variant === 'secondary' ? Colors.bg : bg}
            />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
