import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, TextInput, Keyboard, TouchableOpacity, Pressable, Modal, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, X, ArrowDown, ArrowUp, ChevronDown, Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInvestmentsStore } from '../lib/states/investments.store';
import { useCouponsStore } from '../lib/states/coupons.store';
import { useAuthStore } from '../lib/states/auth.store';
import CouponCard from '../components/cards/CouponCard';
import MessageCard from '../components/cards/MessageCard';
import ContentCard from '../components/cards/ContentCard';
import { COUPONS_PAGE_TEXT, COUPONS_METRICS } from '../constants/coupons.constants';
import { TIPO_INVERSION_LABELS } from '../constants/investments.constants';
import { filterCoupons, sortCouponsByDate, getCouponIdentifier } from '../lib/utils/coupons.utils';
import { formatCurrency } from '../lib/utils/format.utils';
import { getBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor, getCardBackgroundColor } from '../../App';
import type { MainStackParamList } from '../navigation/types';
import type { DtoInversion } from '../services/api/investments.api';
import CustomHeader from '../components/header/CustomHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'Coupons'>;

export default function CouponsScreen({ navigation, route }: Props) {
  const initialInversion = route.params?.numeroInversion || '';
  const [selectedInversion, setSelectedInversion] = useState(initialInversion);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const cardBg = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const searchInputRef = useRef<TextInput>(null);

  const { investments, isLoading: isLoadingInvestments, loadInvestments } = useInvestmentsStore();
  const { coupons, isLoading, error, loadCoupons, clearCoupons } = useCouponsStore();
  const { isAuthenticated } = useAuthStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={COUPONS_PAGE_TEXT.title}
          showBackButton={true}
          titleComponent={
            showSearch ? (
              <View style={styles.headerSearchWrapper}>
                <View style={styles.searchIconContainer}>
                  <Search size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <TextInput
                  ref={searchInputRef}
                  style={styles.headerSearchInput}
                  placeholder={COUPONS_PAGE_TEXT.searchPlaceholder}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoFocus
                  selectionColor="rgba(255,255,255,0.5)"
                  returnKeyType="search"
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowSearch(false);
                    setSearchTerm('');
                    Keyboard.dismiss();
                  }}
                  activeOpacity={0.7}
                  style={styles.clearButton}
                >
                  <X size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            ) : undefined
          }
          rightComponent={
            !showSearch ? (
              <TouchableOpacity
                onPress={() => setShowSearch(true)}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Search size={22} color="#ffffff" />
              </TouchableOpacity>
            ) : null
          }
        />
      ),
    });
  }, [navigation, showSearch, searchTerm]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      Keyboard.dismiss();
      searchInputRef.current?.blur();
      setShowSearch(false);
      setSearchTerm('');
    });
    return unsubscribeBlur;
  }, [navigation]);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (showSearch) {
        searchInputRef.current?.blur();
      }
    });
    return () => keyboardDidHideListener.remove();
  }, [showSearch]);

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        if (!showSearch) {
          searchInputRef.current?.blur();
          Keyboard.dismiss();
        }
      }, 100);

      if (isAuthenticated) {
        loadInvestments();
      }

      return () => clearTimeout(timer);
    }, [isAuthenticated, loadInvestments])
  );

  // Load coupons when selected investment changes
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!selectedInversion) {
      clearCoupons();
      return;
    }
    loadCoupons(selectedInversion);
  }, [selectedInversion, isAuthenticated, loadCoupons, clearCoupons]);

  const selectedInvestmentData = investments.find((i) => i.numeroInversion === selectedInversion);
  const moneda = selectedInvestmentData?.moneda || 'CRC';

  const processedCoupons = useMemo(() => {
    const sorted = sortCouponsByDate(coupons, sortOrder);
    return filterCoupons(sorted, searchTerm);
  }, [coupons, sortOrder, searchTerm]);

  const totalCupones = coupons.length;
  const montoTotal = coupons.reduce((sum, c) => sum + c.montoNeto, 0);
  const interesTotal = coupons.reduce((sum, c) => sum + c.interesNeto, 0);

  const handleRefresh = async () => {
    if (!selectedInversion) return;
    setRefreshing(true);
    try {
      await loadCoupons(selectedInversion);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectInversion = (value: string) => {
    setSelectedInversion(value);
    setIsPickerOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <MessageCard message="Cargando cupones..." type="loading" />;
    }
    if (error) {
      return <MessageCard message={error} type="error" />;
    }
    if (processedCoupons.length === 0) {
      return (
        <MessageCard
          message={searchTerm ? COUPONS_PAGE_TEXT.emptyMessageSearch : COUPONS_PAGE_TEXT.emptyMessage}
          type="info"
        />
      );
    }
    return (
      <View style={styles.couponsList}>
        {processedCoupons.map((coupon, index) => (
          <CouponCard
            key={getCouponIdentifier(coupon) || `coupon-${index}`}
            coupon={coupon}
            moneda={moneda}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ContentCard
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
          <View style={styles.filterRow}>
            <View style={styles.filterSelectWrapper}>
              <Pressable
                onPress={() => {
                  if (!isLoadingInvestments && investments.length > 0) setIsPickerOpen(true);
                }}
                disabled={isLoadingInvestments || investments.length === 0}
                style={({ pressed }) => [
                  styles.trigger,
                  { borderColor, backgroundColor: cardBg },
                  pressed && styles.triggerPressed,
                  (isLoadingInvestments || investments.length === 0) && styles.triggerDisabled,
                ]}
              >
                <View style={styles.triggerContent}>
                  {selectedInversion && selectedInvestmentData ? (
                    <View style={styles.selectedRow}>
                      <Text style={[styles.selectedType, { color: textColor }]}>
                        {TIPO_INVERSION_LABELS[selectedInvestmentData.tipoInversion] || 'No Definido'}
                      </Text>
                      <Text style={[styles.selectedOp, { color: secondaryTextColor }]}>
                        No. {selectedInvestmentData.numeroInversion}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.placeholder, { color: secondaryTextColor }]}>
                      {COUPONS_PAGE_TEXT.investmentAll}
                    </Text>
                  )}
                </View>
                <ChevronDown size={18} color={(isLoadingInvestments || investments.length === 0) ? '#9ca3af' : secondaryTextColor} />
              </Pressable>
            </View>
            <TouchableOpacity
              onPress={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              style={[styles.sortButton, { borderColor }]}
              activeOpacity={0.7}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown size={18} color={secondaryTextColor} />
              ) : (
                <ArrowUp size={18} color={secondaryTextColor} />
              )}
              <Text style={[styles.sortLabel, { color: secondaryTextColor }]}>
                {sortOrder === 'desc' ? 'Reciente' : 'Antiguo'}
              </Text>
            </TouchableOpacity>
          </View>

          {!isLoading && coupons.length > 0 && (
            <View style={styles.metricsContainer}>
              <View style={styles.metricsTopRow}>
                <View style={[styles.metricTile, { borderColor }]}>
                  <Text style={[styles.metricTileLabel, { color: secondaryTextColor }]}>{COUPONS_METRICS.totalCupones}</Text>
                  <Text style={[styles.metricTileValue, { color: textColor }]}>{totalCupones}</Text>
                </View>
                <View style={[styles.metricTile, styles.metricTileSuccess]}>
                  <Text style={[styles.metricTileLabel, { color: secondaryTextColor }]}>{COUPONS_METRICS.montoTotal}</Text>
                  <Text style={[styles.metricTileValue, styles.metricTileValueSuccess]}>{formatCurrency(montoTotal, moneda)}</Text>
                </View>
              </View>
              <View style={[styles.metricTileWide, { borderColor }]}>
                <Text style={[styles.metricTileLabel, { color: secondaryTextColor }]}>{COUPONS_METRICS.interesTotal}</Text>
                <Text style={[styles.metricTileValue, { color: textColor }]}>{formatCurrency(interesTotal, moneda)}</Text>
              </View>
            </View>
          )}

          {renderContent()}
        </ContentCard>
      </View>

      <Modal visible={isPickerOpen} transparent animationType="fade" onRequestClose={() => setIsPickerOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { backgroundColor: cardBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>{COUPONS_PAGE_TEXT.investmentLabel}</Text>
              <Pressable onPress={() => setIsPickerOpen(false)}>
                <Text style={styles.modalClose}>Cerrar</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => handleSelectInversion('')}
                style={[
                  styles.investmentItem,
                  { borderBottomColor: borderColor },
                  !selectedInversion && styles.investmentItemSelected,
                ]}
              >
                <View style={styles.investmentItemContent}>
                  <Text style={[styles.investmentItemType, { color: !selectedInversion ? '#fff' : textColor }]}>
                    {COUPONS_PAGE_TEXT.investmentAll}
                  </Text>
                </View>
                {!selectedInversion && <Check size={18} color="#fff" />}
              </Pressable>
              {investments.map((inv) => {
                if (!inv.numeroInversion) return null;
                const isSelected = inv.numeroInversion === selectedInversion;
                return (
                  <Pressable
                    key={inv.numeroInversion}
                    onPress={() => handleSelectInversion(inv.numeroInversion!)}
                    style={[
                      styles.investmentItem,
                      { borderBottomColor: borderColor },
                      isSelected && styles.investmentItemSelected,
                    ]}
                  >
                    <View style={styles.investmentItemContent}>
                      <View style={styles.investmentItemTop}>
                        <Text style={[styles.investmentItemType, { color: isSelected ? '#fff' : textColor }]}>
                          {TIPO_INVERSION_LABELS[inv.tipoInversion] || 'No Definido'}
                        </Text>
                        <Text style={[styles.investmentItemOp, { color: isSelected ? 'rgba(255,255,255,0.8)' : secondaryTextColor }]}>
                          {inv.numeroInversion}
                        </Text>
                      </View>
                      <View style={styles.investmentItemBottom}>
                        <Text style={[styles.investmentItemMoneda, { color: isSelected ? 'rgba(255,255,255,0.7)' : secondaryTextColor }]}>
                          {inv.moneda || 'CRC'}
                        </Text>
                        <Text style={[styles.investmentItemMonto, { color: isSelected ? '#fff' : textColor }]}>
                          {formatCurrency(inv.monto, inv.moneda || 'CRC')}
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Check size={18} color="#fff" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterSelectWrapper: {
    flex: 1,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  triggerPressed: {
    opacity: 0.8,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerContent: {
    flex: 1,
    minWidth: 0,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedType: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedOp: {
    fontSize: 13,
  },
  placeholder: {
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexShrink: 0,
  },
  sortLabel: {
    fontSize: 13,
  },
  metricsContainer: {
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
  metricsTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  metricTileSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  metricTileWide: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  metricTileLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricTileValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricTileValueSuccess: {
    color: '#15803d',
  },
  couponsList: {
    gap: 4,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a61612',
  },
  modalList: {
    maxHeight: 320,
  },
  investmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  investmentItemSelected: {
    backgroundColor: '#a61612',
  },
  investmentItemContent: {
    flex: 1,
    minWidth: 0,
  },
  investmentItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  investmentItemType: {
    fontSize: 14,
    fontWeight: '600',
  },
  investmentItemOp: {
    fontSize: 13,
  },
  investmentItemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  investmentItemMoneda: {
    fontSize: 12,
  },
  investmentItemMonto: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerSearchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    gap: 6,
    minWidth: 0,
  },
  searchIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerSearchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: '#ffffff',
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  clearButton: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerButton: {
    padding: 6,
  },
});
