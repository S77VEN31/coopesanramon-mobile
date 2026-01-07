import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { Card } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getCardBackgroundColor } from '../../../App';
import { LucideIcon } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate responsive card width based on screen size
const getMinCardWidth = () => {
  const padding = 16 * 2; // Left and right padding
  const gaps = 12 * 2; // Gaps between cards
  const availableWidth = SCREEN_WIDTH - padding - gaps;
  
  if (SCREEN_WIDTH < 360) {
    return '100%'; // Full width on very small screens
  }
  return Math.max(availableWidth / 3, 100); // Minimum 100px or 1/3 of available width
};

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  valueClassName?: string;
  iconClassName?: string;
}

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  valueClassName,
  iconClassName,
}: MetricCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

  // Determine value color from className or default
  const getValueColor = () => {
    if (valueClassName?.includes('green')) return '#16a34a';
    if (valueClassName?.includes('destructive') || valueClassName?.includes('red')) return '#dc2626';
    if (valueClassName?.includes('orange')) return '#ea580c';
    return textColor;
  };

  // Determine icon color from className or default
  const getIconColor = () => {
    if (iconClassName?.includes('green')) return '#16a34a';
    if (iconClassName?.includes('destructive') || iconClassName?.includes('red')) return '#dc2626';
    if (iconClassName?.includes('orange')) return '#ea580c';
    return secondaryTextColor;
  };

  // Determine icon container background color from className
  const getIconContainerBg = () => {
    if (iconClassName?.includes('green')) return 'rgba(22, 163, 74, 0.12)';
    if (iconClassName?.includes('destructive') || iconClassName?.includes('red')) return 'rgba(220, 38, 38, 0.12)';
    if (iconClassName?.includes('orange')) return 'rgba(234, 88, 12, 0.12)';
    return 'rgba(0, 0, 0, 0.04)';
  };

  const valueColor = getValueColor();
  const iconColor = getIconColor();
  const iconContainerBg = getIconContainerBg();

  return (
    <Card style={styles.card} colorScheme={colorScheme}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconContainerBg }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.value, { color: valueColor }]}
          numberOfLines={2}
        >
          {value}
        </Text>
        {description && (
          <Text style={[styles.description, { color: secondaryTextColor }]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: SCREEN_WIDTH < 360 ? 12 : 13,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  content: {
    gap: 6,
  },
  value: {
    fontSize: SCREEN_WIDTH < 360 ? 20 : 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: SCREEN_WIDTH < 360 ? 11 : 12,
    marginTop: 2,
    opacity: 0.8,
  },
});

