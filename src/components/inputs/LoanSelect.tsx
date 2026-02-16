import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { type DtoPrestamo } from '../../services/api/loans.api';
import { TIPO_PRESTAMO_LABELS } from '../../constants/loans.constants';
import { formatCurrency } from '../../lib/utils/format.utils';

interface LoanSelectProps {
  loans: DtoPrestamo[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function LoanSelect({
  loans,
  value,
  onValueChange,
  placeholder = 'Seleccionar préstamo',
  disabled = false,
}: LoanSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const cardBg = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const selectedLoan = loans.find((l) => l.numeroOperacion === value);

  return (
    <>
      <Pressable
        onPress={() => {
          if (!disabled) setIsOpen(true);
        }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          { borderColor, backgroundColor: cardBg },
          pressed && !disabled && styles.triggerPressed,
          disabled && styles.triggerDisabled,
        ]}
      >
        <View style={styles.triggerContent}>
          {selectedLoan ? (
            <View style={styles.selectedRow}>
              <Text style={[styles.selectedType, { color: textColor }]}>
                {TIPO_PRESTAMO_LABELS[selectedLoan.tipoPrestamo] || 'No Definido'}
              </Text>
              <Text style={[styles.selectedOp, { color: secondaryTextColor }]}>
                Op. {selectedLoan.numeroOperacion}
              </Text>
            </View>
          ) : (
            <Text style={[styles.placeholder, { color: secondaryTextColor }]}>{placeholder}</Text>
          )}
        </View>
        <ChevronDown size={18} color={disabled ? '#9ca3af' : secondaryTextColor} />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { backgroundColor: cardBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: '#a61612' }]}>Seleccionar préstamo</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text style={styles.modalClose}>Cerrar</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {loans.length === 0 ? (
                <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                  No hay préstamos disponibles
                </Text>
              ) : (
                loans.map((loan) => {
                  if (!loan.numeroOperacion) return null;
                  const isSelected = loan.numeroOperacion === value;
                  const moneda = loan.moneda || 'CRC';
                  return (
                    <Pressable
                      key={loan.numeroOperacion}
                      onPress={() => {
                        onValueChange(loan.numeroOperacion!);
                        setIsOpen(false);
                      }}
                      style={[
                        styles.loanItem,
                        { borderBottomColor: borderColor },
                        isSelected && styles.loanItemSelected,
                      ]}
                    >
                      <View style={styles.loanItemContent}>
                        <View style={styles.loanItemTop}>
                          <Text style={[styles.loanItemType, { color: isSelected ? '#fff' : textColor }]}>
                            {TIPO_PRESTAMO_LABELS[loan.tipoPrestamo] || 'No Definido'}
                          </Text>
                          <Text style={[styles.loanItemOp, { color: isSelected ? 'rgba(255,255,255,0.8)' : secondaryTextColor }]}>
                            {loan.numeroOperacion}
                          </Text>
                        </View>
                        <View style={styles.loanItemBottom}>
                          <Text style={[styles.loanItemMoneda, { color: isSelected ? 'rgba(255,255,255,0.7)' : secondaryTextColor }]}>
                            {moneda}
                          </Text>
                          <Text style={[styles.loanItemSaldo, { color: isSelected ? '#fff' : textColor }]}>
                            {formatCurrency(loan.saldo, moneda)}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Check size={18} color="#fff" />}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  loanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  loanItemSelected: {
    backgroundColor: '#a61612',
  },
  loanItemContent: {
    flex: 1,
    minWidth: 0,
  },
  loanItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  loanItemType: {
    fontSize: 14,
    fontWeight: '600',
  },
  loanItemOp: {
    fontSize: 13,
  },
  loanItemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loanItemMoneda: {
    fontSize: 12,
  },
  loanItemSaldo: {
    fontSize: 14,
    fontWeight: '600',
  },
});
