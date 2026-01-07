import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import type { DtoCuenta } from '../../services/api/accounts.api';
import { EstadoCuenta } from '../../constants/enums';
import { formatCurrency } from '../../lib/utils/format.utils';
import type { CuentaFavoritaInternaItem } from '../../hooks/use-local-transfer';
import type { CuentaSinpeFavoritaItem } from '../../hooks/use-sinpe-transfer';
import type { MonederoFavoritoItem } from '../../hooks/use-sinpe-movil-transfer';

interface DestinationAccountSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  transferType: 'local' | 'sinpe' | 'sinpe-mobile';
  destinationType: 'favorites' | 'own' | 'manual';
  sinpeDestinationType?: 'favorites' | 'manual';
  sinpeMovilDestinationType?: 'favorites' | 'manual';
  ownAccounts: DtoCuenta[];
  isLoadingOwnAccounts: boolean;
  selectedSourceAccount: DtoCuenta | null;
  favoriteAccounts?: CuentaFavoritaInternaItem[];
  isLoadingFavorites?: boolean;
  sinpeFavoriteAccounts?: CuentaSinpeFavoritaItem[];
  isLoadingSinpeFavorites?: boolean;
  favoriteWallets?: MonederoFavoritoItem[];
  isLoadingFavoriteWallets?: boolean;
  onSelectFavorite?: (account: CuentaFavoritaInternaItem) => void;
  onSelectOwnAccount: (account: DtoCuenta) => void;
  onSelectSinpeFavorite?: (account: CuentaSinpeFavoritaItem) => void;
  onSelectSinpeMovilFavorite?: (wallet: MonederoFavoritoItem) => void;
}

export default function DestinationAccountSelectionModal({
  visible,
  onClose,
  searchTerm,
  onSearchTermChange,
  transferType,
  destinationType,
  sinpeDestinationType,
  sinpeMovilDestinationType,
  ownAccounts,
  isLoadingOwnAccounts,
  selectedSourceAccount,
  favoriteAccounts = [],
  isLoadingFavorites = false,
  sinpeFavoriteAccounts = [],
  isLoadingSinpeFavorites = false,
  favoriteWallets = [],
  isLoadingFavoriteWallets = false,
  onSelectFavorite,
  onSelectOwnAccount,
  onSelectSinpeFavorite,
  onSelectSinpeMovilFavorite,
}: DestinationAccountSelectionModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const getDescription = () => {
    if (transferType === 'sinpe-mobile' && sinpeMovilDestinationType === 'favorites') {
      return 'Selecciona una favorita SINPE Móvil';
    }
    if (transferType === 'sinpe' && sinpeDestinationType === 'favorites') {
      return 'Selecciona una cuenta favorita SINPE';
    }
    if (destinationType === 'favorites') {
      return 'Selecciona una cuenta favorita';
    }
    return 'Selecciona una cuenta propia';
  };

  const filteredOwnAccounts = (ownAccounts || []).filter((account: DtoCuenta) => {
    if (account.estadoCuenta !== EstadoCuenta.Activa) {
      return false;
    }
    
    if (selectedSourceAccount) {
      const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
      const accountCurrency = account.moneda || 'CRC';
      if (sourceCurrency !== accountCurrency) {
        return false;
      }
      
      // Don't show the source account itself
      if (account.numeroCuenta === selectedSourceAccount.numeroCuenta) {
        return false;
      }
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      account.numeroCuenta?.toLowerCase().includes(searchLower) ||
      account.numeroCuentaIban?.toLowerCase().includes(searchLower) ||
      account.alias?.toLowerCase().includes(searchLower)
    );
  });

  const filteredFavorites = (favoriteAccounts || []).filter((account) => {
    if (!selectedSourceAccount) return false;
    
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    const accountCurrency = account.codigoMoneda || 'CRC';
    if (sourceCurrency !== accountCurrency) {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      account.numeroCuenta?.toLowerCase().includes(searchLower) ||
      account.alias?.toLowerCase().includes(searchLower) ||
      account.titular?.toLowerCase().includes(searchLower)
    );
  });

  const filteredSinpeFavorites = (sinpeFavoriteAccounts || []).filter((account) => {
    if (!selectedSourceAccount) return false;
    
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    const accountCurrency = account.codigoMonedaDestino || 'CRC';
    if (sourceCurrency !== accountCurrency) {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      account.numeroCuentaDestino?.toLowerCase().includes(searchLower) ||
      account.alias?.toLowerCase().includes(searchLower) ||
      account.titularDestino?.toLowerCase().includes(searchLower)
    );
  });

  const filteredWallets = (favoriteWallets || []).filter((wallet) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      wallet.monedero?.toLowerCase().includes(searchLower) ||
      wallet.alias?.toLowerCase().includes(searchLower) ||
      wallet.titular?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (account: DtoCuenta | CuentaFavoritaInternaItem | CuentaSinpeFavoritaItem | MonederoFavoritoItem) => {
    if (transferType === 'sinpe-mobile' && sinpeMovilDestinationType === 'favorites' && onSelectSinpeMovilFavorite && 'monedero' in account) {
      onSelectSinpeMovilFavorite(account as MonederoFavoritoItem);
    } else if (transferType === 'sinpe' && sinpeDestinationType === 'favorites' && onSelectSinpeFavorite && 'numeroCuentaDestino' in account) {
      onSelectSinpeFavorite(account as CuentaSinpeFavoritaItem);
    } else if (destinationType === 'favorites' && onSelectFavorite && 'numeroCuenta' in account && !('numeroCuentaIban' in account)) {
      onSelectFavorite(account as CuentaFavoritaInternaItem);
    } else if ('numeroCuentaIban' in account || 'numeroCuenta' in account) {
      onSelectOwnAccount(account as DtoCuenta);
    }
    onClose();
  };

  const renderContent = () => {
    if (transferType === 'sinpe-mobile' && sinpeMovilDestinationType === 'favorites') {
      if (isLoadingFavoriteWallets) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a61612" />
          </View>
        );
      }
      if (filteredWallets.length > 0) {
        return filteredWallets.map((wallet) => (
          <TouchableOpacity
            key={wallet.id}
            style={[styles.accountCard, { borderColor, backgroundColor }]}
            onPress={() => handleSelect(wallet)}
            activeOpacity={0.7}
          >
            <Text style={[styles.accountNumber, { color: textColor }]}>
              {wallet.monedero || ''}
            </Text>
            <Text style={[styles.accountAlias, { color: secondaryTextColor }]}>
              {wallet.alias || wallet.titular || 'Sin alias'}
            </Text>
          </TouchableOpacity>
        ));
      }
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
            {favoriteWallets.length === 0
              ? 'No se encontraron favoritas SINPE Móvil'
              : 'No se encontraron favoritas SINPE Móvil que coincidan con tu búsqueda'}
          </Text>
        </View>
      );
    }

    if (transferType === 'sinpe' && sinpeDestinationType === 'favorites') {
      if (isLoadingSinpeFavorites) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a61612" />
          </View>
        );
      }
      if (filteredSinpeFavorites.length > 0) {
        return filteredSinpeFavorites.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[styles.accountCard, { borderColor, backgroundColor }]}
            onPress={() => handleSelect(account)}
            activeOpacity={0.7}
          >
            <Text style={[styles.accountNumber, { color: textColor }]}>
              {account.numeroCuentaDestino}
            </Text>
            <Text style={[styles.accountAlias, { color: secondaryTextColor }]}>
              {account.alias || account.titularDestino || 'Sin alias'}
            </Text>
          </TouchableOpacity>
        ));
      }
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
            {sinpeFavoriteAccounts.length === 0
              ? 'No se encontraron cuentas favoritas SINPE'
              : selectedSourceAccount
              ? `No hay cuentas favoritas SINPE en ${selectedSourceAccount.moneda === 'USD' ? 'dólares' : 'colones'} disponibles`
              : 'Selecciona una cuenta origen para ver las cuentas favoritas SINPE'}
          </Text>
        </View>
      );
    }

    if (destinationType === 'favorites') {
      if (isLoadingFavorites) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a61612" />
          </View>
        );
      }
      if (filteredFavorites.length > 0) {
        return filteredFavorites.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[styles.accountCard, { borderColor, backgroundColor }]}
            onPress={() => handleSelect(account)}
            activeOpacity={0.7}
          >
            <Text style={[styles.accountNumber, { color: textColor }]}>
              {account.numeroCuenta || ''}
            </Text>
            <Text style={[styles.accountAlias, { color: secondaryTextColor }]}>
              {account.alias || account.titular || 'Sin alias'}
            </Text>
          </TouchableOpacity>
        ));
      }
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
            {favoriteAccounts.length === 0
              ? 'No se encontraron cuentas favoritas'
              : selectedSourceAccount
              ? `No hay cuentas favoritas en ${selectedSourceAccount.moneda === 'USD' ? 'dólares' : 'colones'} disponibles`
              : 'Selecciona una cuenta origen para ver las cuentas favoritas'}
          </Text>
        </View>
      );
    }

    if (isLoadingOwnAccounts) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a61612" />
        </View>
      );
    }

    if (filteredOwnAccounts.length > 0) {
      return filteredOwnAccounts.map((account: DtoCuenta, index: number) => (
        <TouchableOpacity
          key={`${account.numeroCuenta}-${index}`}
          style={[styles.accountCard, { borderColor, backgroundColor }]}
          onPress={() => handleSelect(account)}
          activeOpacity={0.7}
        >
          <View style={styles.accountHeader}>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountNumber, { color: textColor }]}>
                {account.numeroCuentaIban || account.numeroCuenta}
              </Text>
              <Text style={[styles.accountAlias, { color: secondaryTextColor }]}>
                {account.alias || 'Sin alias'}
              </Text>
            </View>
            <View style={[styles.currencyBadge, { backgroundColor: colorScheme === 'dark' ? '#a6161233' : '#fee2e2', borderColor: '#a61612' }]}>
              <Text style={[styles.currencyText, { color: '#a61612' }]}>
                {account.moneda || 'CRC'}
              </Text>
            </View>
          </View>
          <View style={[styles.balanceContainer, { borderTopColor: borderColor }]}>
            <Text style={[styles.balanceLabel, { color: secondaryTextColor }]}>
              Saldo disponible
            </Text>
            <Text style={[styles.balanceAmount, { color: textColor }]}>
              {formatCurrency(account.saldo, account.moneda || 'CRC')}
            </Text>
          </View>
        </TouchableOpacity>
      ));
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
          {ownAccounts.length === 0
            ? 'No se encontraron cuentas'
            : selectedSourceAccount
            ? `No tienes otras cuentas propias en ${selectedSourceAccount.moneda === 'USD' ? 'dólares' : 'colones'}`
            : 'Selecciona una cuenta origen para ver tus cuentas disponibles'}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.title, { color: textColor }]}>Seleccione una cuenta</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.description, { color: secondaryTextColor }]}>
            {getDescription()}
          </Text>

          <View style={[styles.searchContainer, { borderColor }]}>
            <Search size={20} color={secondaryTextColor} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Buscar"
              placeholderTextColor={secondaryTextColor}
              value={searchTerm}
              onChangeText={onSearchTermChange}
            />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  accountCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
    marginRight: 12,
  },
  accountNumber: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
    marginBottom: 4,
  },
  accountAlias: {
    fontSize: 14,
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  balanceLabel: {
    fontSize: 12,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

