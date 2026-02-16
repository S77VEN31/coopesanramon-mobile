import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor, getCardBackgroundColor } from '../../../App';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "DD/MM/AAAA",
  disabled = false,
  fromDate,
  toDate,
  maxDate,
}: DatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(date || new Date());
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

  // Update tempDate when date prop changes
  useEffect(() => {
    if (date) {
      setTempDate(date);
    } else {
      setTempDate(new Date());
    }
  }, [date]);

  const formatDateForDisplay = (dateToFormat?: Date): string => {
    if (!dateToFormat) return "";
    const day = String(dateToFormat.getDate()).padStart(2, '0');
    const month = String(dateToFormat.getMonth() + 1).padStart(2, '0');
    const year = dateToFormat.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (selectedDate: Date) => {
    setTempDate(selectedDate);
    
    // On iOS, the picker closes automatically, so we confirm immediately
    if (Platform.OS === 'ios') {
      onDateChange?.(selectedDate);
      setModalVisible(false);
    }
  };

  const handleConfirm = () => {
    onDateChange?.(tempDate);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempDate(date || new Date());
    setModalVisible(false);
  };

  const getMinDate = (): Date | undefined => {
    return fromDate;
  };

  const getMaxDate = (): Date | undefined => {
    if (maxDate) return maxDate;
    if (toDate) return toDate;
    return new Date(); // Today as max
  };

  const displayValue = date ? formatDateForDisplay(date) : "";

  return (
    <>
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
          {displayValue ? (
            <Text style={[styles.dateText, { color: textColor }]}>
              {displayValue}
            </Text>
          ) : (
            <Text style={[styles.placeholder, { color: secondaryTextColor }]}>
              {placeholder}
            </Text>
          )}
          <Calendar size={18} color={secondaryTextColor} />
        </View>
      </TouchableOpacity>

      {Platform.OS === 'android' && modalVisible ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={(event: any, selectedDate?: Date) => {
            setModalVisible(false);
            if (event.type === 'set' && selectedDate) {
              onDateChange?.(selectedDate);
            }
          }}
          minimumDate={getMinDate()}
          maximumDate={getMaxDate()}
          textColor={textColor}
          accentColor="#a61612"
        />
      ) : (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: '#a61612' }]}>
                  Seleccionar Fecha
                </Text>
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                  <X size={20} color={textColor} />
                </TouchableOpacity>
              </View>

              <View style={[styles.pickerContainer, { backgroundColor: cardBackgroundColor }]}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      handleDateChange(selectedDate);
                    }
                  }}
                  minimumDate={getMinDate()}
                  maximumDate={getMaxDate()}
                  locale="es-CR"
                  textColor={textColor}
                  themeVariant={colorScheme || 'light'}
                  accentColor="#a61612"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.button, styles.cancelButton, { borderColor }]}
                >
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[styles.button, styles.confirmButton]}
                >
                  <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
  dateText: {
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
    paddingBottom: 20,
    maxHeight: '85%',
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
  pickerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: '#a61612',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackContainer: {
    padding: 40,
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

