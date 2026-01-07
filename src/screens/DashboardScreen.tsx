import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { useProductBalancesStore } from '../lib/states/productBalances.store';
import { useAuthStore } from '../lib/states/auth.store';
import { getProductBalances } from '../services/api/shared.api';
import { type TabType } from '../components/cards/SummaryCard';
import SummaryCarousel from '../components/carousels/SummaryCarousel';
import ProductCard from '../components/cards/ProductCard';
import MessageCard from '../components/cards/MessageCard';
import ContentCard from '../components/cards/ContentCard';
import { TAB_CONFIG } from '../constants/dashboard.constants';
import { getProductosByTabType, formatProductoSaldo } from '../lib/utils/dashboard.utils';
import { getBackgroundColor } from '../../App';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList, MainDrawerParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  DrawerScreenProps<MainDrawerParamList, 'Dashboard'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function DashboardScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("accounts");
  const colorScheme = useColorScheme();
  const { productBalances, isLoading, setProductBalances, setLoading, setError } = useProductBalancesStore();
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Configure header title based on active tab
  useLayoutEffect(() => {
    const config = TAB_CONFIG[activeTab];
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>{config.title}</Text>
        </View>
      ),
      headerTitleStyle: {
        flex: 1,
        marginHorizontal: 0,
        paddingHorizontal: 0,
      },
      headerTitleContainerStyle: {
        flex: 1,
        marginHorizontal: 0,
        paddingRight: 0,
        paddingLeft: 0,
        left: 0,
        right: 0,
        minWidth: 0,
        maxWidth: '100%',
      },
      headerRightContainerStyle: {
        paddingLeft: 0,
        marginLeft: 0,
        flexShrink: 0,
      },
    });
  }, [navigation, activeTab]);

  // Fetch saldos productos on component mount
  useEffect(() => {
    const fetchSaldosProductos = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        setLoading(true);
        const data = await getProductBalances();
        setProductBalances(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchSaldosProductos();
  }, [isAuthenticated, setProductBalances, setLoading, setError]);

  const handleRefresh = async () => {
    if (!isAuthenticated) {
      return;
    }

    setRefreshing(true);
    try {
      setLoading(true);
      const data = await getProductBalances();
      setProductBalances(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleCardPress = (_cardId: TabType, _index: number) => {
    // Can be extended if needed
  };

  // Build summary cards using TAB_CONFIG as source of truth
  const summaryCards = useMemo(() => {
    const productos = productBalances?.productos || null;
    return Object.values(TAB_CONFIG).map((config) => ({
      id: config.id,
      title: config.title,
      value: config.getSummaryValue(productos),
      valueUSD: config.getSummaryValueUSD(productos),
      subtitle: config.getSummarySubtitle(productos),
      icon: config.summaryIcon,
    }));
  }, [productBalances]);

  // Get all products for the active tab
  const productosActivos = useMemo(() => {
    const productos = productBalances?.productos || null;
    return getProductosByTabType(productos, activeTab);
  }, [productBalances, activeTab]);

  const config = TAB_CONFIG[activeTab];
  const backgroundColor = getBackgroundColor(colorScheme);

  const renderEmpty = () => {
    return (
      <MessageCard
        message="No tienes productos de este tipo disponibles"
        description="No se encontraron productos del tipo seleccionado en tu cuenta. Si crees que esto es un error, contacta con soporte."
        type="info"
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Sticky Carousel */}
      <SummaryCarousel
        cards={summaryCards}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCardPress={handleCardPress}
      />

      {/* Scrollable Content */}
      <View style={styles.content}>
        <ContentCard
          description={config.description}
          fullHeight={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#a61612"
              colors={['#a61612']}
            />
          }
        >
          {isLoading ? (
            <MessageCard
              message="Cargando productos..."
              type="loading"
            />
          ) : productosActivos.length > 0 ? (
            <View style={styles.productList}>
              {productosActivos.map((producto, index) => (
                <ProductCard
                  key={index}
                  producto={producto}
                  icon={config.icon}
                  formattedValue={formatProductoSaldo(producto)}
                  moneyColor={config.moneyColor}
                />
              ))}
            </View>
          ) : (
            renderEmpty()
          )}
        </ContentCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productList: {
    gap: 8,
  },
});
