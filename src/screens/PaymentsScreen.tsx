import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, X, ArrowDown, ArrowUp } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLoansStore } from '../lib/states/loans.store';
import { usePaymentsStore } from '../lib/states/payments.store';
import { useInstallmentDetailStore } from '../lib/states/installmentDetail.store';
import { useAuthStore } from '../lib/states/auth.store';
import LoanSelect from '../components/inputs/LoanSelect';
import PaymentHistoryCard from '../components/cards/PaymentHistoryCard';
import InstallmentDetailsModal from '../components/modals/InstallmentDetailsModal';
import MessageCard from '../components/cards/MessageCard';
import { PAYMENTS_PAGE_TEXT } from '../constants/payments.constants';
import { filterPayments, sortPaymentsByDate } from '../lib/utils/payments.utils';
import { formatCurrency } from '../lib/utils/format.utils';
import { getBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../App';
import type { MainStackParamList } from '../navigation/types';
import CustomHeader from '../components/header/CustomHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'Payments'>;

export default function PaymentsScreen({ navigation }: Props) {
  const [selectedLoan, setSelectedLoan] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const searchInputRef = useRef<TextInput>(null);

  const { loans, isLoading: isLoadingLoans, loadLoans } = useLoansStore();
  const { payments, response, isLoading, error, loadPayments, clearPayments } = usePaymentsStore();
  const {
    installmentDetail,
    isLoading: isLoadingDetail,
    error: detailError,
    isModalOpen,
    loadInstallmentDetail,
    setModalOpen,
    resetState: resetInstallmentDetail,
  } = useInstallmentDetailStore();
  const { isAuthenticated } = useAuthStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={PAYMENTS_PAGE_TEXT.title}
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
                  placeholder={PAYMENTS_PAGE_TEXT.searchPlaceholder}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoFocus
                  selectionColor="rgba(255,255,255,0.5)"
                  returnKeyType="search"
                />
                <TouchableOpacity
                  onPress={() => {
                    if (searchTerm.length > 0) {
                      setSearchTerm('');
                    } else {
                      setShowSearch(false);
                      Keyboard.dismiss();
                    }
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

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        if (!showSearch) {
          searchInputRef.current?.blur();
          Keyboard.dismiss();
        }
      }, 100);

      if (isAuthenticated) {
        loadLoans();
      }
      setSelectedLoan('');
      clearPayments();
      resetInstallmentDetail();

      return () => clearTimeout(timer);
    }, [isAuthenticated, loadLoans, clearPayments, resetInstallmentDetail])
  );

  useEffect(() => {
    if (selectedLoan && isAuthenticated) {
      loadPayments(selectedLoan);
    } else if (!selectedLoan) {
      clearPayments();
    }
  }, [selectedLoan, isAuthenticated, loadPayments, clearPayments]);

  const selectedLoanData = loans.find((l) => l.numeroOperacion === selectedLoan);
  const moneda = selectedLoanData?.moneda || 'CRC';

  const processedPayments = useMemo(() => {
    const sorted = sortPaymentsByDate(payments, sortOrder);
    return filterPayments(sorted, searchTerm);
  }, [payments, sortOrder, searchTerm]);

  const totalPagado = response?.montoTotalPagado ?? 0;
  const saldoPendiente = selectedLoanData?.saldo ?? 0;
  const proximaCuota = selectedLoanData?.proxCuota?.montoTotal ?? 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedLoan) {
        await loadPayments(selectedLoan);
      } else {
        await loadLoans();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handlePaymentPress = (numeroCuota: number) => {
    if (selectedLoan) {
      setModalOpen(true);
      loadInstallmentDetail(selectedLoan, numeroCuota);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <MessageCard message="Cargando pagos efectuados..." type="loading" />;
    }
    if (error) {
      return <MessageCard message={error} type="error" />;
    }
    if (!selectedLoan) {
      return <MessageCard message={PAYMENTS_PAGE_TEXT.selectLoan} type="info" />;
    }
    if (processedPayments.length === 0) {
      return (
        <MessageCard
          message={searchTerm ? PAYMENTS_PAGE_TEXT.emptyMessageSearch : PAYMENTS_PAGE_TEXT.emptyMessage}
          type="info"
        />
      );
    }
    return (
      <View style={styles.paymentsList}>
        {processedPayments.map((payment) => (
          <PaymentHistoryCard
            key={`pago-${payment.numeroCuota}`}
            payment={payment}
            moneda={moneda}
            onPress={() => handlePaymentPress(payment.numeroCuota)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#a61612"
            colors={['#a61612']}
          />
        }
      >
        <View style={styles.content}>
          <View style={styles.filterRow}>
            <View style={styles.filterSelectWrapper}>
              <LoanSelect
                loans={loans}
                value={selectedLoan}
                onValueChange={setSelectedLoan}
                placeholder={PAYMENTS_PAGE_TEXT.selectLoan}
                disabled={isLoadingLoans || loans.length === 0}
              />
            </View>
            {selectedLoan && (
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
            )}
          </View>

          {selectedLoan && !isLoading && (
            <View style={styles.metricsContainer}>
              <View style={styles.metricsTopRow}>
                <View style={[styles.metricTile, styles.metricTileSuccess]}>
                  <Text style={[styles.metricTileLabel, { color: secondaryTextColor }]}>{PAYMENTS_PAGE_TEXT.totalPaid}</Text>
                  <Text style={[styles.metricTileValue, styles.metricTileValueSuccess]}>{formatCurrency(totalPagado, moneda)}</Text>
                </View>
                <View style={[styles.metricTile, styles.metricTileDanger]}>
                  <Text style={[styles.metricTileLabel, { color: secondaryTextColor }]}>{PAYMENTS_PAGE_TEXT.pendingBalance}</Text>
                  <Text style={[styles.metricTileValue, styles.metricTileValueDanger]}>{formatCurrency(saldoPendiente, moneda)}</Text>
                </View>
              </View>
              <View style={[styles.metricTileWide, { borderColor }]}>
                <Text style={[styles.metricTileLabel, { color: secondaryTextColor }]}>{PAYMENTS_PAGE_TEXT.nextInstallment}</Text>
                <Text style={[styles.metricTileValue, { color: textColor }]}>{formatCurrency(proximaCuota, moneda)}</Text>
              </View>
            </View>
          )}

          {renderContent()}
        </View>
      </ScrollView>

      <InstallmentDetailsModal
        visible={isModalOpen}
        onClose={() => resetInstallmentDetail()}
        installmentDetail={installmentDetail}
        isLoading={isLoadingDetail}
        error={detailError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterSelectWrapper: {
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  metricTileDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderColor: 'rgba(220, 38, 38, 0.2)',
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
  metricTileValueDanger: {
    color: '#dc2626',
  },
  paymentsList: {
    gap: 4,
    marginTop: 4,
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
