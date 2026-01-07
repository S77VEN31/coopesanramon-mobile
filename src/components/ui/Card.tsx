import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  colorScheme?: 'light' | 'dark' | null | undefined;
}

export const Card: React.FC<CardProps> = ({ children, style, colorScheme = 'light' }) => {
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  
  return (
    <View 
      style={[
        styles.card,
        { backgroundColor, borderColor },
        style
      ]}
    >
      {children}
    </View>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  style?: any;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  style?: any;
  colorScheme?: 'light' | 'dark' | null | undefined;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, style, colorScheme = 'light' }) => {
  const textColor = getTextColor(colorScheme);
  return (
    <Text style={[styles.cardTitle, { color: textColor }, style]}>
      {children}
    </Text>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: any;
  colorScheme?: 'light' | 'dark' | null | undefined;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style, colorScheme = 'light' }) => {
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  return (
    <Text style={[styles.cardDescription, { color: secondaryTextColor }, style]}>
      {children}
    </Text>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  style?: any;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return (
    <View style={style}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'column',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});

