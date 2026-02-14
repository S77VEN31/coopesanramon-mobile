import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Home, Landmark, Smartphone } from 'lucide-react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { getBackgroundColor } from '../../App';
import ContentCard from '../components/cards/ContentCard';
import OptionCard from '../components/cards/OptionCard';
import type { MainDrawerParamList } from '../navigation/types';

type Props = DrawerScreenProps<MainDrawerParamList, 'FavoriteAccounts'>;

interface FavoriteTypeItem {
  key: 'local' | 'sinpe' | 'wallets';
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const favoriteTypes: FavoriteTypeItem[] = [
  {
    key: 'local',
    title: 'Cuentas Locales',
    description: 'Favoritas del mismo banco',
    icon: Home,
  },
  {
    key: 'sinpe',
    title: 'Cuentas SINPE',
    description: 'Favoritas de otros bancos',
    icon: Landmark,
  },
  {
    key: 'wallets',
    title: 'SINPE Móvil',
    description: 'Monederos favoritos',
    icon: Smartphone,
  },
];

export default function FavoriteAccountsScreen({ navigation }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);

  const handlePress = (item: FavoriteTypeItem) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('MyFavoriteAccounts' as any, { type: item.key });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard
          description="Selecciona el tipo de cuenta favorita"
          fullHeight={true}
        >
          <View style={styles.optionsContainer}>
            {favoriteTypes.map((type) => (
              <OptionCard
                key={type.key}
                title={type.title}
                description={type.description}
                icon={type.icon}
                onPress={() => handlePress(type)}
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
    gap: 16,
  },
});
