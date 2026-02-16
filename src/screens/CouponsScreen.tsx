import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, TextInput, Keyboard, TouchableOpacity, Pressable, Modal, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, X, Filter } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInvestmentsStore } from '../lib/states/investments.store';
import { useCouponsStore } from '../lib/states/coupons.store';
import { useAuthStore } from '../lib/states/auth.store';
import CouponCard from '../components/cards/CouponCard';
import MessageCard from '../components/cards/MessageCard';
import ContentCard from '../components/cards/ContentCard';
import { SelectInput } from '../components/inputs/SelectInput';
import { InvestmentSelect } from '../components/inputs/InvestmentSelect';
import { Button } from '../components/ui/Button';
import { COUPONS_PAGE_TEXT, SORT_ORDER_OPTIONS } from '../constants/coupons.constants';
import { filterCoupons, sortCouponsByDate, getCouponIdentifier } from '../lib/utils/coupons.utils';
import { getBackgroundColor, getTextColor, getBorderColor, getCardBackgroundColor } from '../../App';
import type { MainStackParamList } from '../navigation/types';
import CustomHeader from '../components/header/CustomHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'Coupons'>;

export default function CouponsScreen({ navigation, route }: Props) {
  const initialInversion = route.params?.numeroInversion || '';
  const [selectedInversion, setSelectedInversion] = useState(initialInversion);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [tempInversion, setTempInversion] = useState(initialInversion);
  const [tempSortOrder, setTempSortOrder] = useState<'asc' | 'desc'>('desc');
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const cardBg = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
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


  const handleRefresh = async () => {
    if (!selectedInversion) return;
    setRefreshing(true);
    try {
      await loadCoupons(selectedInversion);
    } finally {
      setRefreshing(false);
    }
  };

  const openFiltersModal = () => {
    setTempInversion(selectedInversion);
    setTempSortOrder(sortOrder);
    setFiltersModalVisible(true);
  };

  const handleSearch = () => {
    setSelectedInversion(tempInversion);
    setSortOrder(tempSortOrder);
    setFiltersModalVisible(false);
  };

  const handleClearFilters = () => {
    setSelectedInversion('');
    setTempInversion('');
    setSearchTerm('');
    setSortOrder('desc');
    setTempSortOrder('desc');
    clearCoupons();
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
      {/* Metrics Carousel */}
      <View style={styles.content}>
        <ContentCard
          description={COUPONS_PAGE_TEXT.description}
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
          {renderContent()}
        </ContentCard>
      </View>

      {/* Floating Buttons */}
      <View style={styles.floatingButtonsContainer}>
        {/* Clear Filters Button */}
        {(selectedInversion || searchTerm || coupons.length > 0) && (
          <TouchableOpacity
            style={styles.floatingClearButton}
            onPress={handleClearFilters}
            activeOpacity={0.8}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
        {/* Filter Button */}
        <TouchableOpacity
          style={styles.floatingFilterButton}
          onPress={openFiltersModal}
          activeOpacity={0.8}
        >
          <Filter size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={filtersModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFiltersModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFiltersModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: cardBg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.filtersModalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.filtersModalTitle, { color: '#a61612' }]}>
                {COUPONS_PAGE_TEXT.filtersTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setFiltersModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.filtersContainer}>
                {/* Investment Select */}
                <InvestmentSelect
                  investments={investments}
                  value={tempInversion}
                  onValueChange={setTempInversion}
                  placeholder={COUPONS_PAGE_TEXT.investmentPlaceholder}
                  disabled={isLoadingInvestments || investments.length === 0}
                  label={COUPONS_PAGE_TEXT.investmentLabel}
                />

                {/* Sort Order */}
                <SelectInput
                  options={SORT_ORDER_OPTIONS}
                  value={tempSortOrder}
                  onValueChange={(val) => setTempSortOrder(val as 'asc' | 'desc')}
                  label={COUPONS_PAGE_TEXT.sortLabel}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setFiltersModalVisible(false)}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onPress={handleSearch}
                style={styles.searchButton}
              >
                {COUPONS_PAGE_TEXT.searchButton}
              </Button>
            </View>
          </Pressable>
        </Pressable>
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
  couponsList: {
    gap: 8,
  },
  // Floating buttons
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'column',
    gap: 12,
    alignItems: 'flex-end',
  },
  floatingFilterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a61612',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingClearButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Filters modal (bottom-sheet style)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    height: '50%',
    width: '100%',
    flexDirection: 'column',
    flex: 0,
  },
  filtersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexShrink: 0,
  },
  filtersModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
    flexShrink: 1,
  },
  modalScrollContent: {
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  filtersContainer: {
    gap: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    flexShrink: 0,
  },
  cancelButton: {
    flex: 1,
  },
  searchButton: {
    flex: 1,
  },
  // Header search
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
