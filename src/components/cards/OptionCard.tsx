import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';

interface OptionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
  disabled?: boolean;
}

export default function OptionCard({ title, description, icon: Icon, onPress, disabled = false }: OptionCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBgColor = getCardBgColor(colorScheme);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardBgColor, borderColor },
        disabled && styles.cardDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, disabled && { backgroundColor: '#9ca3af' }]}>
          <Icon size={24} color="#ffffff" />
        </View>
        <Text style={[styles.title, { color: disabled ? '#9ca3af' : textColor }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: disabled ? '#9ca3af' : secondaryTextColor }]}>
          {description}
        </Text>
        {disabled && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Próximamente</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    padding: 16,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a61612',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
});
