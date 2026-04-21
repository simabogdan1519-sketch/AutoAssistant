import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Colors } from '@/constants/theme';

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, action, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.line} />
        <Text variant="heading" size={12} tracking={1.5} style={{ textTransform: 'uppercase' }}>
          {title}
        </Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.6}>
          <Text variant="mono" color={Colors.inkDim} size={10} tracking={1}>
            {action.toUpperCase()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 28,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  line: {
    width: 16,
    height: 1,
    backgroundColor: Colors.accent,
  },
});
