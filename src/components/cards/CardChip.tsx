import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface CardChipProps {
  width?: number;
  height?: number;
}

export default function CardChip({ width = 40, height = 32 }: CardChipProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 40 32" preserveAspectRatio="none">
        {/* Chip body */}
        <Rect
          x="2"
          y="2"
          width="36"
          height="28"
          rx="4"
          fill="#FFC107"
          stroke="#F57C00"
          strokeWidth="0.5"
        />
        
        {/* Horizontal lines inside chip */}
        <Path
          d="M6 10 L34 10"
          stroke="#F57C00"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <Path
          d="M6 14 L34 14"
          stroke="#F57C00"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <Path
          d="M6 18 L34 18"
          stroke="#F57C00"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <Path
          d="M6 22 L34 22"
          stroke="#F57C00"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        
        {/* Corner detail */}
        <Rect
          x="4"
          y="4"
          width="6"
          height="4"
          rx="1"
          fill="#FFD54F"
          opacity="0.6"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
  },
});

