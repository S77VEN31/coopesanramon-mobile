import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import type { DtoCuenta } from '../../services/api/accounts.api';
import { EstadoCuenta } from '../../constants/enums';
import { formatCurrency } from '../../lib/utils/format.utils';

interface SourceAccountSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  accounts: DtoCuenta[];
  isLoading: boolean;
  transferType: 'local' | 'sinpe' | 'sinpe-mobile';
  onSelect: (account: DtoCuenta) => void;
}

export default function SourceAccountSelectionModal({
  visible,
  onClose,
  accounts,
  isLoading,
  transferType,
  onSelect,
}: SourceAccountSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const filteredAccounts = (accounts || []).filter((account: DtoCuenta) => {
    if (account.estadoCuenta !== EstadoCuenta.Activa) {
      return false;
    }

    if (transferType === 'sinpe-mobile') {
      const accountCurrency = account.moneda || 'CRC';
      if (accountCurrency !== 'CRC') {
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

  const handleAccountSelect = (account: DtoCuenta) => {
    onSelect(account);
    setSearchTerm('');
    onClose();
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
            Selecciona la cuenta desde la cual deseas realizar el envío
          </Text>

          <View style={[styles.searchContainer, { borderColor }]}>
            <Search size={20} color={secondaryTextColor} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Buscar"
              placeholderTextColor={secondaryTextColor}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#a61612" />
              </View>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((account: DtoCuenta, index: number) => (
                <TouchableOpacity
                  key={`${account.numeroCuenta}-${index}`}
                  style={[styles.accountCard, { borderColor, backgroundColor }]}
                  onPress={() => handleAccountSelect(account)}
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
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                  {transferType === 'sinpe-mobile'
                    ? 'No se encontraron cuentas en colones. SINPE Móvil solo permite transferencias en colones.'
                    : 'No se encontraron cuentas'}
                </Text>
              </View>
            )}
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

