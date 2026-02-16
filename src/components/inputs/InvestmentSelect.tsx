import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { TrendingUp, ChevronDown, X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor, getCardBackgroundColor } from '../../../App';
import { formatCurrency } from '../../lib/utils/format.utils';
import { TIPO_INVERSION_LABELS } from '../../constants/investments.constants';
import { type DtoInversion } from '../../services/api/investments.api';

interface InvestmentSelectProps {
  investments: DtoInversion[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export function InvestmentSelect({
  investments,
  value,
  onValueChange,
  placeholder = 'Seleccionar inversión',
  disabled = false,
  label,
}: InvestmentSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

  const validInvestments = investments.filter((inv) => inv.numeroInversion);

  const selectedInvestment = validInvestments.find(
    (inv) => inv.numeroInversion === value
  );

  const handleSelect = (numeroInversion: string) => {
    onValueChange(numeroInversion);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>
          {label}
        </Text>
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
          {selectedInvestment ? (
            <View style={styles.selectedInvestment}>
              <TrendingUp size={16} color="#a61612" />
              <Text style={[styles.selectedText, { color: textColor }]} numberOfLines={1}>
                {TIPO_INVERSION_LABELS[selectedInvestment.tipoInversion] || 'No Definido'} — No. {selectedInvestment.numeroInversion}
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
                Seleccionar Inversión
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
                data={validInvestments}
                keyExtractor={(item) => item.numeroInversion!}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item }) => {
                  const isSelected = value === item.numeroInversion;
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item.numeroInversion!)}
                      style={[
                        styles.investmentItem,
                        isSelected && { backgroundColor: '#a61612' + '15' },
                        { borderBottomColor: borderColor + '30' },
                      ]}
                    >
                      <View style={styles.investmentItemContent}>
                        <View style={styles.investmentItemHeader}>
                          <View style={styles.investmentItemText}>
                            <Text
                              style={[
                                styles.investmentType,
                                { color: isSelected ? '#a61612' : textColor },
                              ]}
                              numberOfLines={1}
                            >
                              {TIPO_INVERSION_LABELS[item.tipoInversion] || 'No Definido'}
                            </Text>
                            <Text
                              style={[
                                styles.investmentNumber,
                                { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                              ]}
                            >
                              No. {item.numeroInversion}
                            </Text>
                          </View>
                          <TrendingUp size={18} color={isSelected ? '#a61612' : secondaryTextColor} />
                        </View>
                        <View style={styles.investmentItemFooter}>
                          <Text
                            style={[
                              styles.investmentCurrency,
                              { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                            ]}
                          >
                            {item.moneda || 'CRC'}
                          </Text>
                          <Text
                            style={[
                              styles.investmentAmount,
                              { color: isSelected ? '#a61612' : textColor },
                            ]}
                          >
                            {formatCurrency(item.monto, item.moneda || 'CRC')}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                      No hay inversiones disponibles
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
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
  selectedInvestment: {
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
  investmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  investmentItemContent: {
    flex: 1,
    gap: 8,
  },
  investmentItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  investmentItemText: {
    flex: 1,
    gap: 4,
  },
  investmentType: {
    fontSize: 16,
    fontWeight: '600',
  },
  investmentNumber: {
    fontSize: 14,
  },
  investmentItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentCurrency: {
    fontSize: 14,
  },
  investmentAmount: {
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
