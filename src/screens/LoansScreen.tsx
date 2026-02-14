import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { BookOpen, FileText, Clock } from 'lucide-react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { getBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor, getCardBackgroundColor } from '../../App';
import { LOANS_PAGE_TEXT } from '../constants/loans.constants';
import ContentCard from '../components/cards/ContentCard';
import type { MainDrawerParamList } from '../navigation/types';

type Props = DrawerScreenProps<MainDrawerParamList, 'Loans'>;

interface CategoryItem {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  enabled: boolean;
  screen: string;
}

const categories: CategoryItem[] = [
  { key: 'myLoans', title: LOANS_PAGE_TEXT.categoryMyLoans, description: LOANS_PAGE_TEXT.categoryMyLoansDescription, icon: BookOpen, enabled: true, screen: 'MyLoans' },
  { key: 'paymentPlan', title: LOANS_PAGE_TEXT.categoryPaymentPlan, description: LOANS_PAGE_TEXT.categoryPaymentPlanDescription, icon: FileText, enabled: true, screen: 'PaymentPlan' },
  { key: 'payments', title: LOANS_PAGE_TEXT.categoryPaymentsHistory, description: LOANS_PAGE_TEXT.categoryPaymentsHistoryDescription, icon: Clock, enabled: true, screen: 'Payments' },
];

export default function LoansScreen({ navigation }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

  const handlePress = (item: CategoryItem) => {
    if (!item.enabled) return;
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(item.screen as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard
          description={LOANS_PAGE_TEXT.description}
          fullHeight={true}
        >
          <View style={styles.optionsContainer}>
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: cardBackgroundColor,
                      borderColor: borderColor,
                    },
                    !item.enabled && styles.optionCardDisabled,
                  ]}
                  onPress={() => handlePress(item)}
                  disabled={!item.enabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Icon size={32} color={item.enabled ? '#a61612' : '#9ca3af'} />
                    <Text style={[styles.optionTitle, { color: item.enabled ? textColor : '#9ca3af' }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.optionDescription, { color: item.enabled ? secondaryTextColor : '#9ca3af' }]}>
                      {item.description}
                    </Text>
                    {!item.enabled && (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Próximamente</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ContentCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    padding: 16,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionDescription: {
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
