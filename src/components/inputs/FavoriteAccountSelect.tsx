import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor, getCardBackgroundColor } from '../../../App';
import { formatIBAN } from '../../lib/utils/format.utils';

interface FavoriteAccountSelectProps<T> {
  items: T[];
  value: T | null | undefined;
  onSelect: (item: T) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  modalTitle?: string;
  emptyMessage?: string;
  /** Return a unique key for each item */
  getKey: (item: T) => string;
  /** Return the display text for the trigger and item title (e.g. IBAN or phone) */
  getDisplayText: (item: T) => string;
  /** Return the alias if available */
  getAlias?: (item: T) => string | null | undefined;
  /** Return the titular/owner name if available */
  getTitular?: (item: T) => string | null | undefined;
  /** Whether to format display text as IBAN */
  formatAsIban?: boolean;
  /** Icon element to show on the right side of each modal item */
  icon?: React.ReactElement;
}

export function FavoriteAccountSelect<T>({
  items,
  value,
  onSelect,
  placeholder = 'Seleccionar cuenta favorita',
  disabled = false,
  label,
  modalTitle = 'Seleccionar Cuenta Favorita',
  emptyMessage = 'No hay cuentas favoritas disponibles',
  getKey,
  getDisplayText,
  getAlias,
  getTitular,
  formatAsIban = false,
  icon,
}: FavoriteAccountSelectProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

  const selectedKey = value ? getKey(value) : null;

  const getFormattedText = (item: T): string => {
    const raw = getDisplayText(item);
    if (formatAsIban) {
      return formatIBAN(raw) || raw || 'Sin número';
    }
    return raw || 'Sin número';
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setModalVisible(false);
  };

  const titular = value && getTitular ? getTitular(value) : null;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: textColor }]}>
            {label}
          </Text>
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
          },
        ]}
      >
        <View style={styles.triggerContent}>
          {value ? (
            <Text style={[styles.selectedText, { color: textColor }]} numberOfLines={1}>
              {getFormattedText(value)}
            </Text>
          ) : (
            <Text style={[styles.placeholder, { color: secondaryTextColor }]}>
              {placeholder}
            </Text>
          )}
          <ChevronDown size={20} color={secondaryTextColor} />
        </View>
      </TouchableOpacity>

      {titular && (
        <View style={styles.titularRow}>
          <Text style={[styles.titularText, { color: secondaryTextColor }]}>
            Titular: {titular}
          </Text>
        </View>
      )}

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
                {modalTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              <FlatList
                data={items}
                keyExtractor={(item) => getKey(item)}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item }) => {
                  const isSelected = selectedKey === getKey(item);
                  const alias = getAlias ? getAlias(item) : null;
                  const itemTitular = getTitular ? getTitular(item) : null;

                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      style={[
                        styles.accountItem,
                        isSelected && { backgroundColor: '#a61612' + '15' },
                        { borderBottomColor: borderColor + '30' },
                      ]}
                    >
                      <View style={styles.accountItemContent}>
                        <View style={styles.accountItemHeader}>
                          <View style={styles.accountItemText}>
                            <Text
                              style={[
                                styles.accountNumber,
                                { color: isSelected ? '#a61612' : textColor },
                              ]}
                              numberOfLines={1}
                            >
                              {getFormattedText(item)}
                            </Text>
                            {alias && (
                              <Text
                                style={[
                                  styles.accountAlias,
                                  { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                                ]}
                                numberOfLines={1}
                              >
                                {alias}
                              </Text>
                            )}
                          </View>
                          {icon && React.cloneElement(icon, {
                            color: isSelected ? '#a61612' : secondaryTextColor,
                          })}
                        </View>
                        {itemTitular && (
                          <View style={styles.accountItemFooter}>
                            <Text
                              style={[
                                styles.accountTitular,
                                { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                              ]}
                              numberOfLines={1}
                            >
                              {itemTitular}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                      {emptyMessage}
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
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    flex: 1,
  },
  titularRow: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  titularText: {
    fontSize: 13,
    opacity: 0.8,
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
  accountTitular: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
