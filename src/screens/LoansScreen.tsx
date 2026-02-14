import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { BookOpen, FileText, Clock } from 'lucide-react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { Card, CardContent } from '../components/ui/Card';
import { getBackgroundColor, getTextColor, getSecondaryTextColor } from '../../App';
import { LOANS_PAGE_TEXT } from '../constants/loans.constants';
import type { MainDrawerParamList } from '../navigation/types';

type Props = DrawerScreenProps<MainDrawerParamList, 'Loans'>;

interface CategoryItem {
  key: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  enabled: boolean;
  screen: string;
}

const categories: CategoryItem[] = [
  { key: 'myLoans', title: LOANS_PAGE_TEXT.categoryMyLoans, icon: BookOpen, enabled: true, screen: 'MyLoans' },
  { key: 'paymentPlan', title: LOANS_PAGE_TEXT.categoryPaymentPlan, icon: FileText, enabled: true, screen: 'PaymentPlan' },
  { key: 'payments', title: LOANS_PAGE_TEXT.categoryPaymentsHistory, icon: Clock, enabled: true, screen: 'Payments' },
];

export default function LoansScreen({ navigation }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

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
        <Text style={[styles.description, { color: secondaryTextColor }]}>
          {LOANS_PAGE_TEXT.description}
        </Text>

        {categories.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => handlePress(item)}
            disabled={!item.enabled}
            style={({ pressed }) => [
              styles.categoryPressable,
              pressed && item.enabled && styles.categoryPressed,
            ]}
          >
            <Card style={[styles.categoryCard, !item.enabled && styles.categoryCardDisabled]} colorScheme={colorScheme}>
              <View style={[styles.topBorder, !item.enabled && styles.topBorderDisabled]} />
              <CardContent style={styles.categoryContent}>
                <View style={styles.categoryRow}>
                  <View style={[styles.categoryIconContainer, !item.enabled && styles.categoryIconDisabled]}>
                    <item.icon size={22} color={item.enabled ? '#a61612' : '#9ca3af'} />
                  </View>
                  <Text style={[styles.categoryTitle, { color: item.enabled ? textColor : '#9ca3af' }]}>
                    {item.title}
                  </Text>
                  {!item.enabled && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Próximamente</Text>
                    </View>
                  )}
                </View>
              </CardContent>
            </Card>
          </Pressable>
        ))}
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
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryPressable: {
    marginBottom: 12,
  },
  categoryPressed: {
    transform: [{ scale: 0.98 }],
  },
  categoryCard: {
    overflow: 'hidden',
  },
  categoryCardDisabled: {
    opacity: 0.6,
  },
  topBorder: {
    height: 4,
    backgroundColor: '#a61612',
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  topBorderDisabled: {
    backgroundColor: '#9ca3af',
  },
  categoryContent: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a61612',
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    flexShrink: 0,
  },
  categoryIconDisabled: {
    borderColor: '#9ca3af',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
});
