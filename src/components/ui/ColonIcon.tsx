import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface ColonIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function ColonIcon({ size = 24, color = 'currentColor', strokeWidth = 2 }: ColonIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* C shape */}
      <Path
        d="M17 6.5C15.8 4.5 13.6 3.5 11.5 3.5C7.9 3.5 5 6.4 5 10V14C5 17.6 7.9 20.5 11.5 20.5C13.6 20.5 15.8 19.5 17 17.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Two diagonal strokes crossing the center */}
      <Line x1="13" y1="1" x2="8" y2="23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="16" y1="1" x2="11" y2="23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
