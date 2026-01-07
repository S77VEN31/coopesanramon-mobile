import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';

// Export TabType for use in other components
export type TabType =
  | "accounts"
  | "savings"
  | "loans"
  | "investments"
  | "creditCards"
  | "electricServices"
  | "others";

export interface SummaryCardData {
  id: TabType;
  title: string;
  value: string;
  valueUSD?: string;
  subtitle: string;
  icon: LucideIcon;
}

interface SummaryCardProps {
  card: SummaryCardData;
  activeTab: TabType;
  index: number;
  onCardPress: (cardId: TabType, index: number) => void;
}

export default function SummaryCard({
  card,
  activeTab,
  index,
  onCardPress,
}: SummaryCardProps) {
  const colorScheme = useColorScheme();
  const isActive = card.id === activeTab;
  const Icon = card.icon;
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  // Extract number from subtitle (e.g., "2 cuentas" -> "2")
  const countMatch = card.subtitle.match(/\d+/);
  const count = countMatch ? countMatch[0] : '';
  const titleWithCount = count ? `${card.title} (${count})` : card.title;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onCardPress(card.id, index)}
      style={styles.touchable}
    >
      <Card
        style={[
          styles.card,
          { borderColor: isActive ? '#a61612' : borderColor },
        ]}
        colorScheme={colorScheme}
      >
        <CardContent style={styles.content}>
          {/* Header row: Title and Icon */}
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: isActive ? '#a61612' : textColor }]}>
                {titleWithCount}
              </Text>
            </View>
            <View
              style={[
                styles.iconContainer,
                isActive
                  ? styles.activeIconContainer
                  : { borderColor },
              ]}
            >
              <Icon
                size={22}
                color={isActive ? '#ffffff' : secondaryTextColor}
              />
            </View>
          </View>

          {/* Values row */}
          <View style={styles.valuesRow}>
            <Text 
              style={[styles.value, { color: textColor }]} 
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {card.value}
            </Text>
            {card.valueUSD && (
              <Text 
                style={[styles.valueUSD, { color: secondaryTextColor }]} 
                numberOfLines={1}
              >
                {card.valueUSD}
              </Text>
            )}
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: undefined,
    borderWidth: 2,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  activeIconContainer: {
    backgroundColor: '#a61612',
    borderColor: '#a61612',
  },
  valuesRow: {
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  valueUSD: {
    fontSize: 16,
    fontWeight: '500',
  },
});
