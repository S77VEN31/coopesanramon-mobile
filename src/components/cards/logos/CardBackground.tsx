import React from 'react';
import { View, StyleSheet } from 'react-native';
import CardBackgroundSvg from '../../../../assets/tarjeta-card.svg';

interface CardBackgroundProps {
  width: number;
  height: number;
}

export default function CardBackground({ width, height }: CardBackgroundProps) {
  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]}>
      <CardBackgroundSvg width={width} height={height} />
    </View>
  );
}
