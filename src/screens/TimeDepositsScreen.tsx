import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { TrendingUp, Banknote } from 'lucide-react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { getBackgroundColor } from '../../App';
import { INVESTMENTS_PAGE_TEXT } from '../constants/investments.constants';
import ContentCard from '../components/cards/ContentCard';
import OptionCard from '../components/cards/OptionCard';
import type { MainDrawerParamList } from '../navigation/types';

type Props = DrawerScreenProps<MainDrawerParamList, 'TimeDeposits'>;

interface CategoryItem {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  enabled: boolean;
  screen: string;
}

const categories: CategoryItem[] = [
  { key: 'myInvestments', title: INVESTMENTS_PAGE_TEXT.categoryMyInvestments, description: INVESTMENTS_PAGE_TEXT.categoryMyInvestmentsDescription, icon: TrendingUp, enabled: true, screen: 'MyInvestments' },
  { key: 'coupons', title: INVESTMENTS_PAGE_TEXT.categoryCoupons, description: INVESTMENTS_PAGE_TEXT.categoryCouponsDescription, icon: Banknote, enabled: true, screen: 'Coupons' },
];

export default function TimeDepositsScreen({ navigation }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);

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
          description={INVESTMENTS_PAGE_TEXT.description}
          fullHeight={true}
        >
          <View style={styles.optionsContainer}>
            {categories.map((item) => (
              <OptionCard
                key={item.key}
                title={item.title}
                description={item.description}
                icon={item.icon}
                onPress={() => handlePress(item)}
                disabled={!item.enabled}
              />
            ))}
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
});
