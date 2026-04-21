import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Text } from './Text';
import { Colors, Radius } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  unit?: string;
};

export function Field({ label, unit, style, ...rest }: Props) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View
      style={[
        styles.wrap,
        focused && { borderColor: Colors.accent },
      ]}
    >
      <Text variant="mono" color={Colors.inkDim} size={9} tracking={1.5} style={styles.label}>
        {label.toUpperCase()}
      </Text>
      <View style={styles.row}>
        <TextInput
          placeholderTextColor={Colors.inkDimmer}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, style]}
          {...rest}
        />
        {unit && (
          <Text variant="mono" color={Colors.inkDim} size={10} tracking={1.5}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    color: Colors.ink,
    fontFamily: 'Archivo_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
    padding: 0,
  },
});
