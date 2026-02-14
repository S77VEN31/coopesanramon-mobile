import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { View, Text, RefreshControl, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, TextInput, Keyboard, Dimensions, Platform } from 'react-native';
import { useColorScheme } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, X, ArrowUp, ArrowDown, Wallet, Filter } from 'lucide-react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import CustomHeader from '../components/header/CustomHeader';
import { useMovementsStore } from '../lib/states/movements.store';
import { useAccountsStore } from '../lib/states/accounts.store';
import { useAuthStore } from '../lib/states/auth.store';
import { AccountSelect } from '../components/inputs/AccountSelect';
import { DatePicker } from '../components/inputs/DatePicker';
import { SelectInput } from '../components/inputs/SelectInput';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import MetricCard from '../components/cards/MetricCard';
import MetricCarousel from '../components/carousels/MetricCarousel';
import MessageCard from '../components/cards/MessageCard';
import ContentCard from '../components/cards/ContentCard';
import { MovementCellRenderer } from '../components/renderers/MovementCellRenderer';
import {
  MOVEMENTS_PAGE_TEXT,
  MOVEMENTS_METRICS,
  MOVEMENTS_ERROR_MESSAGES,
  MOVEMENTS_INFO_MESSAGES,
  MOVEMENT_TYPE_FILTER_OPTIONS,
  MOVEMENT_TYPE_TO_TIPO_MOVIMIENTO,
  ALL_TYPES_VALUE,
} from '../constants/movements.constants';
import {
  areDatesValid,
  filterMovements,
  calculateTotalIngresos,
  calculateTotalEgresos,
  countCreditos,
  countDebitos,
  sortMovementsByDate,
} from '../lib/utils/movements.utils';
import { formatCurrency, formatDateForApiStart, formatDateForApiEnd } from '../lib/utils/format.utils';
import { getAccountIdentifier } from '../lib/utils/accounts.utils';
import { getBackgroundColor, getTextColor, getCardBackgroundColor } from '../../App';
import { MovementType, TipoMovimiento } from '../constants/enums'; // Keeping this if it was needed, but looking at code it seems not used directly or maybe I should remove the import from api entirely if TipoMovimiento was the only one.
import type { MainDrawerParamList } from '../navigation/types';

type Props = DrawerScreenProps<MainDrawerParamList, 'Movements'>;

export default function MovementsScreen({ navigation: routeNavigation, route }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedType, setSelectedType] = useState<MovementType | typeof ALL_TYPES_VALUE>(ALL_TYPES_VALUE);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [refreshing, setRefreshing] = useState(false);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { isAuthenticated } = useAuthStore();
  const { accounts, isLoading: isLoadingAccounts, loadAccounts } = useAccountsStore();
  const {
    movements,
    isLoading,
    error,
    loadMovements,
    clearMovements,
    setError,
    numeroCuenta: numeroCuentaLoaded,
  } = useMovementsStore();

  // Configure header with search
  useLayoutEffect(() => {
    routeNavigation.setOptions({
      header: () => (
        <CustomHeader
          title="Movimientos"
          showDrawerButton={true}
          titleComponent={
            showSearch ? (
              <View style={styles.headerSearchWrapper}>
                <View style={styles.searchIconContainer}>
                  <Search size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <TextInput
                  ref={searchInputRef}
                  style={styles.headerSearchInput}
                  placeholder={MOVEMENTS_PAGE_TEXT.searchPlaceholder}
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
                onPress={() => {
                  setShowSearch(true);
                }}
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
  }, [routeNavigation, showSearch, searchTerm]);

  // Dismiss keyboard when navigating away
  useEffect(() => {
    const unsubscribeBlur = routeNavigation.addListener('blur', () => {
      Keyboard.dismiss();
      searchInputRef.current?.blur();
      setShowSearch(false);
      setSearchTerm('');
    });

    return unsubscribeBlur;
  }, [navigation]);

  // Get account number from route params if available
  useEffect(() => {
    if (route.params?.numeroCuenta && accounts.length > 0) {
      const accountExists = accounts.some(
        (acc) => getAccountIdentifier(acc) === route.params.numeroCuenta
      );
      if (accountExists && selectedAccount !== route.params.numeroCuenta) {
        clearMovements();
        setSelectedAccount(route.params.numeroCuenta);
        setDateFrom(undefined);
        setDateTo(undefined);
        setSelectedType(ALL_TYPES_VALUE);
        setSearchTerm("");
        setSortOrder("desc");
      }
    }
  }, [route.params?.numeroCuenta, accounts.length]);

  // Load accounts on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Blur input and dismiss keyboard when screen gains focus (returning from navigation)
      // Use setTimeout to ensure the blur happens after the screen transition completes
      const timer = setTimeout(() => {
        if (!showSearch) {
          searchInputRef.current?.blur();
          Keyboard.dismiss();
        }
      }, 100);
      
      if (isAuthenticated) {
        setError(null);
        loadAccounts();
      }

      return () => clearTimeout(timer);
    }, [isAuthenticated, loadAccounts, setError, showSearch])
  );

  // Validate dates
  const datesValid = areDatesValid(dateFrom, dateTo);

  // Clear error when dates are corrected
  useEffect(() => {
    if (datesValid && error === MOVEMENTS_ERROR_MESSAGES.invalidDateRange) {
      setError(null);
    }
  }, [datesValid, error, setError]);

  // Clear dates and type when account is deselected
  useEffect(() => {
    if (!selectedAccount) {
      setDateFrom(undefined);
      setDateTo(undefined);
      setSelectedType(ALL_TYPES_VALUE);
    }
  }, [selectedAccount]);

  // Set default dates to today when account is selected and no dates are set
  useEffect(() => {
    if (selectedAccount && !dateFrom && !dateTo) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setDateFrom(today);
      setDateTo(today);
    }
  }, [selectedAccount, dateFrom, dateTo]);

  // Filter and sort movements
  const filteredMovements = useMemo(() => {
    return filterMovements(movements, searchTerm);
  }, [movements, searchTerm]);

  const sortedMovements = useMemo(() => {
    return sortMovementsByDate(filteredMovements, sortOrder);
  }, [filteredMovements, sortOrder]);

  // Get account currency
  const selectedAccountData = accounts.find(
    (acc) => getAccountIdentifier(acc) === selectedAccount
  );
  const accountCurrency = selectedAccountData?.moneda || "CRC";

  // Calculate metrics
  const totalIngresos = useMemo(() => calculateTotalIngresos(movements), [movements]);
  const totalEgresos = useMemo(() => calculateTotalEgresos(movements), [movements]);
  const saldoCuenta = selectedAccountData?.saldo ?? 0;

  // Prepare metrics cards data for carousel
  const metricsCards = useMemo(() => {
    if (movements.length === 0) return [];
    return [
      {
        title: MOVEMENTS_METRICS.saldoCuenta.title,
        value: formatCurrency(saldoCuenta, accountCurrency),
        description: MOVEMENTS_METRICS.saldoCuenta.description(),
        icon: Wallet,
        valueClassName: saldoCuenta >= 0 ? "text-green-600" : "text-destructive",
        iconClassName: "text-muted-foreground",
      },
      {
        title: MOVEMENTS_METRICS.totalIngresos.title,
        value: formatCurrency(totalIngresos, accountCurrency),
        description: MOVEMENTS_METRICS.totalIngresos.description(countCreditos(movements)),
        icon: ArrowUp,
        valueClassName: "text-green-600",
        iconClassName: "text-green-600",
      },
      {
        title: MOVEMENTS_METRICS.totalEgresos.title,
        value: formatCurrency(totalEgresos, accountCurrency),
        description: MOVEMENTS_METRICS.totalEgresos.description(countDebitos(movements)),
        icon: ArrowDown,
        valueClassName: "text-destructive",
        iconClassName: "text-destructive",
      },
    ];
  }, [movements, saldoCuenta, totalIngresos, totalEgresos, accountCurrency]);

  const handleSearch = () => {
    if (!datesValid) {
      setError(MOVEMENTS_ERROR_MESSAGES.invalidDateRange);
      return;
    }

    if (!selectedAccount) {
      setError(MOVEMENTS_ERROR_MESSAGES.noAccountSelected);
      return;
    }

    setError(null);

    let fechaInicial: string | undefined;
    let fechaFinal: string | undefined;

    if (dateFrom) {
      fechaInicial = formatDateForApiStart(new Date(dateFrom));
    }

    if (dateTo) {
      fechaFinal = formatDateForApiEnd(new Date(dateTo));
    }

    const tipoMovimiento: TipoMovimiento | undefined = selectedType === ALL_TYPES_VALUE
      ? undefined
      : MOVEMENT_TYPE_TO_TIPO_MOVIMIENTO[selectedType as MovementType];

    loadMovements(selectedAccount, fechaInicial, fechaFinal, tipoMovimiento);
    setFiltersModalVisible(false); // Close modal after search
  };

  const handleClearFilters = () => {
    setSelectedAccount("");
    setSelectedType(ALL_TYPES_VALUE);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchTerm("");
    setSortOrder("desc");
    setError(null);
    clearMovements();
  };

  const handleRefresh = async () => {
    if (!selectedAccount || !numeroCuentaLoaded) {
      return;
    }

    if (!datesValid) {
      setError(MOVEMENTS_ERROR_MESSAGES.invalidDateRange);
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      let fechaInicial: string | undefined;
      let fechaFinal: string | undefined;

      if (dateFrom) {
        fechaInicial = formatDateForApiStart(new Date(dateFrom));
      }

      if (dateTo) {
        fechaFinal = formatDateForApiEnd(new Date(dateTo));
      }

      const tipoMovimiento: TipoMovimiento | undefined = selectedType === ALL_TYPES_VALUE
        ? undefined
        : MOVEMENT_TYPE_TO_TIPO_MOVIMIENTO[selectedType as MovementType];

      await loadMovements(selectedAccount, fechaInicial, fechaFinal, tipoMovimiento);
    } catch (error) {
      // Error handled by store
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as MovementType | typeof ALL_TYPES_VALUE);
  };

  const backgroundColor = getBackgroundColor(colorScheme);

  const renderMovementItem = (item: any, index: number) => {
    return (
      <View key={`movement-${index}`} style={[styles.movementItem, { backgroundColor: getCardBackgroundColor(colorScheme) }]}>
        {/* Header: Date and Badge */}
        <View style={styles.movementHeader}>
          <View style={styles.movementDateContainer}>
            <MovementCellRenderer
              movement={item}
              columnKey="date"
              moneda={accountCurrency}
            />
          </View>
          <View style={styles.movementBadgeContainer}>
            <MovementCellRenderer
              movement={item}
              columnKey="type"
              moneda={accountCurrency}
            />
          </View>
        </View>

        {/* Main Content: Description */}
        <View style={styles.movementDescriptionContainer}>
          <MovementCellRenderer
            movement={item}
            columnKey="description"
            moneda={accountCurrency}
          />
        </View>

        {/* Footer: Amount and Transaction */}
        <View style={styles.movementFooter}>
          <View style={styles.movementAmountContainer}>
            <MovementCellRenderer
              movement={item}
              columnKey="amount"
              moneda={accountCurrency}
            />
          </View>
          <MovementCellRenderer
            movement={item}
            columnKey="transaccion"
            moneda={accountCurrency}
          />
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (error) {
      return <MessageCard message={error} type="error" />;
    }

    if (accounts.length === 0) {
      return (
        <MessageCard
          message={MOVEMENTS_INFO_MESSAGES.noAccountsAvailable}
          description={MOVEMENTS_INFO_MESSAGES.noAccountsAvailableDescription}
          type="info"
        />
      );
    }

    if (!datesValid) {
      return (
        <MessageCard
          message={MOVEMENTS_ERROR_MESSAGES.invalidDateRangeWithFuture}
          type="error"
        />
      );
    }

    if (isAuthenticated && accounts.length > 0 && movements.length === 0) {
      return (
        <MessageCard
          message={MOVEMENTS_ERROR_MESSAGES.selectAccountToSearch}
          type="error"
        />
      );
    }

    return (
      <MessageCard
        message={searchTerm ? MOVEMENTS_PAGE_TEXT.emptyMessageSearch : MOVEMENTS_PAGE_TEXT.emptyMessage}
        type="info"
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Metrics Carousel */}
      {movements.length > 0 && (
        <MetricCarousel cards={metricsCards} />
      )}

      <View style={[
        styles.mainContent,
        movements.length === 0 && styles.mainContentNoMetrics
      ]}>

        {/* Movements Card with Title and Description */}
        <ContentCard
          description={MOVEMENTS_PAGE_TEXT.description}
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
              message={MOVEMENTS_PAGE_TEXT.loadingMessage}
              type="loading"
            />
          ) : sortedMovements.length > 0 ? (
            <View style={styles.movementsList}>
              {sortedMovements.map((item, index) => renderMovementItem(item, index))}
            </View>
          ) : (
            renderEmpty()
          )}
        </ContentCard>
      </View>

      {/* Floating Buttons */}
      <View style={styles.floatingButtonsContainer}>
        {/* Clear Filters Button */}
        {(selectedAccount || selectedType !== ALL_TYPES_VALUE || dateFrom || dateTo || searchTerm || movements.length > 0) && (
          <TouchableOpacity
            style={styles.floatingClearButton}
            onPress={handleClearFilters}
            activeOpacity={0.8}
            disabled={accounts.length === 0}
          >
            <X size={24} color={accounts.length === 0 ? "rgba(255,255,255,0.5)" : "#ffffff"} />
          </TouchableOpacity>
        )}
        {/* Filter Button */}
        <TouchableOpacity
          style={styles.floatingFilterButton}
          onPress={() => setFiltersModalVisible(true)}
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
            style={[styles.modalContent, { backgroundColor: getCardBackgroundColor(colorScheme) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#a61612' }]}>
                Filtros
              </Text>
              <TouchableOpacity
                onPress={() => setFiltersModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={getTextColor(colorScheme)} />
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
                {/* Account Select */}
                <AccountSelect
                  accounts={accounts}
                  value={selectedAccount}
                  onValueChange={setSelectedAccount}
                  placeholder={MOVEMENTS_PAGE_TEXT.accountPlaceholder}
                  disabled={accounts.length === 0}
                  label={MOVEMENTS_PAGE_TEXT.accountLabel}
                />

                {/* Type Select */}
                <SelectInput
                  options={[...MOVEMENT_TYPE_FILTER_OPTIONS]}
                  value={selectedType}
                  onValueChange={handleTypeChange}
                  placeholder={MOVEMENTS_PAGE_TEXT.typePlaceholder}
                  disabled={!selectedAccount}
                  label={MOVEMENTS_PAGE_TEXT.typeLabel}
                />

                {/* Date From */}
                <View style={styles.dateRow}>
                  <View style={styles.dateInput}>
                    <Text style={[styles.dateLabel, { color: getTextColor(colorScheme) }]}>
                      {MOVEMENTS_PAGE_TEXT.dateFromLabel}
                    </Text>
                    <DatePicker
                      date={dateFrom}
                      onDateChange={setDateFrom}
                      placeholder={MOVEMENTS_PAGE_TEXT.datePlaceholder}
                      disabled={!selectedAccount}
                      toDate={dateTo || undefined}
                      maxDate={new Date()}
                    />
                  </View>

                  {/* Date To */}
                  <View style={styles.dateInput}>
                    <Text style={[styles.dateLabel, { color: getTextColor(colorScheme) }]}>
                      {MOVEMENTS_PAGE_TEXT.dateToLabel}
                    </Text>
                    <DatePicker
                      date={dateTo}
                      onDateChange={setDateTo}
                      placeholder={MOVEMENTS_PAGE_TEXT.datePlaceholder}
                      disabled={!selectedAccount}
                      fromDate={dateFrom || undefined}
                      maxDate={new Date()}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer with Action Buttons */}
            <View style={styles.modalFooter}>
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
                disabled={accounts.length === 0 || !datesValid}
                style={styles.searchButton}
              >
                {MOVEMENTS_PAGE_TEXT.searchButton}
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  mainContentNoMetrics: {
    paddingTop: 16,
  },
  filtersContainer: {
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  searchButton: {
    flex: 1,
  },
  movementItem: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  movementDateContainer: {
    flex: 1,
    minWidth: 0,
  },
  movementBadgeContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
    flexShrink: 0,
  },
  movementAmountContainer: {
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  movementDescriptionContainer: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  movementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  movementsList: {
    gap: 0,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    flexShrink: 0,
  },
  modalTitle: {
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
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    flexShrink: 0,
  },
});

