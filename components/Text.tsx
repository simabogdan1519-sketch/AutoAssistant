import React from 'react';
import { Text as RNText, TextProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';

type Variant = 'display' | 'heading' | 'body' | 'mono' | 'monoBold' | 'serif';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  size?: number;
  tracking?: number;
  weight?: '400' | '500' | '600' | '700' | '800' | '900';
  children?: React.ReactNode;
};

const fontMap: Record<string, string> = {
  '400': 'Archivo_400Regular',
  '500': 'Archivo_500Medium',
  '600': 'Archivo_600SemiBold',
  '700': 'Archivo_700Bold',
  '800': 'Archivo_800ExtraBold',
  '900': 'Archivo_900Black',
};

export function Text({
  variant = 'body',
  color = Colors.ink,
  size,
  tracking,
  weight,
  style,
  children,
  ...rest
}: Props) {
  const variantStyle = styles[variant];

  let fontFamily = variantStyle.fontFamily;
  if (weight && variant !== 'mono' && variant !== 'monoBold' && variant !== 'serif') {
    fontFamily = fontMap[weight] || fontFamily;
  }

  const computedStyle: StyleProp<TextStyle> = [
    variantStyle,
    { color, fontFamily },
    size !== undefined && { fontSize: size },
    tracking !== undefined && { letterSpacing: tracking },
    style,
  ];

  return (
    <RNText style={computedStyle} {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: 'Archivo_900Black',
    letterSpacing: -1.5,
    fontSize: 32,
  },
  heading: {
    fontFamily: 'Archivo_700Bold',
    letterSpacing: -0.5,
    fontSize: 18,
  },
  body: {
    fontFamily: 'Archivo_400Regular',
    letterSpacing: -0.2,
    fontSize: 14,
  },
  mono: {
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  monoBold: {
    fontFamily: 'JetBrainsMono_500Medium',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  serif: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    letterSpacing: -0.3,
    fontSize: 20,
  },
});
