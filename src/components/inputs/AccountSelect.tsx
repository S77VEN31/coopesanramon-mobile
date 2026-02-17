import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { CreditCard, ChevronDown, X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor, getCardBackgroundColor } from '../../../App';
import { formatIBAN } from '../../lib/utils/format.utils';
import { formatAccountCurrency } from '../../lib/utils/accounts.utils';
import { EstadoCuenta } from '../../constants/enums';
import { type DtoCuenta } from '../../services/api/accounts.api';

interface AccountSelectProps {
  accounts: DtoCuenta[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export function AccountSelect({
  accounts,
  value,
  onValueChange,
  placeholder = "Seleccionar cuenta",
  disabled = false,
  label,
}: AccountSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

  // Filter only active accounts
  const activeAccounts = accounts.filter(
    (acc) => acc.estadoCuenta === EstadoCuenta.Activa
  );

  const selectedAccount = activeAccounts.find(
    (acc) => (acc.numeroCuentaIban || acc.numeroCuenta) === value
  );

  const getAccountIdentifier = (account: DtoCuenta): string => {
    return account.numeroCuentaIban || account.numeroCuenta || "";
  };

  const handleSelect = (account: DtoCuenta) => {
    const identifier = getAccountIdentifier(account);
    onValueChange(identifier);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: textColor }]}>
            {label}
          </Text>
          {selectedAccount && (
            <Text style={[styles.balanceLabel, { color: '#a61612' }]}>
              {formatAccountCurrency(selectedAccount.saldo, selectedAccount.moneda || 'CRC')}
            </Text>
          )}
        </View>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        style={[
          styles.trigger,
          {
            backgroundColor: inputBackgroundColor,
            borderColor: disabled ? borderColor + '80' : borderColor,
            opacity: disabled ? 0.5 : 1,
          }
        ]}
      >
        <View style={styles.triggerContent}>
          {selectedAccount ? (
            <View style={styles.selectedAccount}>
              <Text style={[styles.selectedText, { color: textColor }]} numberOfLines={1}>
                {formatIBAN(selectedAccount.numeroCuentaIban) ||
                  selectedAccount.numeroCuenta ||
                  "Sin número"}
              </Text>
            </View>
          ) : (
            <Text style={[styles.placeholder, { color: secondaryTextColor }]}>
              {placeholder}
            </Text>
          )}
          <ChevronDown size={20} color={secondaryTextColor} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: '#a61612' }]}>
                Seleccionar Cuenta
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={getTextColor(colorScheme)} />
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              <FlatList
                data={activeAccounts}
                keyExtractor={(item) => getAccountIdentifier(item)}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item }) => {
                const identifier = getAccountIdentifier(item);
                const isSelected = value === identifier;
                
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.accountItem,
                      isSelected && { backgroundColor: '#a61612' + '15' },
                      { borderBottomColor: borderColor + '30' }
                    ]}
                  >
                    <View style={styles.accountItemContent}>
                      <View style={styles.accountItemHeader}>
                        <View style={styles.accountItemText}>
                          <Text
                            style={[
                              styles.accountNumber,
                              { color: isSelected ? '#a61612' : textColor }
                            ]}
                            numberOfLines={1}
                          >
                            {formatIBAN(item.numeroCuentaIban) ||
                              item.numeroCuenta ||
                              "Sin número"}
                          </Text>
                          {item.alias && (
                            <Text
                              style={[
                                styles.accountAlias,
                                { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor }
                              ]}
                              numberOfLines={1}
                            >
                              {item.alias}
                            </Text>
                          )}
                        </View>
                        <CreditCard size={18} color={isSelected ? '#a61612' : secondaryTextColor} />
                      </View>
                      <View style={styles.accountItemFooter}>
                        <Text
                          style={[
                            styles.accountCurrency,
                            { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor }
                          ]}
                        >
                          {item.moneda || "CRC"}
                        </Text>
                        <Text
                          style={[
                            styles.accountBalance,
                            { color: isSelected ? '#a61612' : textColor }
                          ]}
                        >
                          {formatAccountCurrency(item.saldo, item.moneda || "CRC")}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                    No hay cuentas disponibles
                  </Text>
                </View>
              }
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  trigger: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    flex: 1,
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
  },
  listContainer: {
    flex: 1,
    flexShrink: 1,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  accountItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  accountItemContent: {
    gap: 8,
  },
  accountItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountItemText: {
    flex: 1,
    gap: 4,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountAlias: {
    fontSize: 14,
  },
  accountItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountCurrency: {
    fontSize: 14,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

