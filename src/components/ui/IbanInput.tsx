import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaskInput, { Mask } from 'react-native-mask-input';
import { X } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';

interface IbanInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (masked: string, unmasked: string) => void;
  onClear?: () => void;
  onBlur?: () => void;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  style?: any;
  editable?: boolean;
  colorScheme?: 'light' | 'dark' | null | undefined;
  backgroundColor?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send' | 'default';
  onSubmitEditing?: () => void;
}

// Máscara solo para los 20 dígitos después de CR
const IBAN_DIGITS_MASK: Mask = [
  /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/, /\d/, /\d/, ' ',
  /\d/, /\d/
];

export const IbanInput: React.FC<IbanInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onClear,
  onBlur,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  editable = true,
  colorScheme = 'light',
  backgroundColor,
  returnKeyType = 'default',
  onSubmitEditing,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = backgroundColor || getInputBackgroundColor(colorScheme);

  // Inicializar con "CR" si está vacío
  useEffect(() => {
    if (!value) {
      onChangeText('CR', 'CR');
    }
  }, []);

  const handleChangeText = (masked: string, unmasked: string) => {
    // Limitar a exactamente 20 dígitos (sin contar CR)
    if (unmasked.length <= 20) {
      // Siempre agregar CR al inicio
      const fullMasked = 'CR' + (masked ? ' ' + masked : '');
      const fullUnmasked = 'CR' + unmasked;
      onChangeText(fullMasked, fullUnmasked);
    }
  };

  // Extraer solo los dígitos (sin CR) para el input
  const displayValue = value.startsWith('CR') ? value.substring(2).trim() : value;

  const handleClear = () => {
    onChangeText('CR', 'CR');
    if (onClear) {
      onClear();
    }
  };

  const showClearButton = value && value.length > 2; // Mostrar si hay más que "CR"

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        {/* Prefijo CR fijo */}
        <Text style={[styles.prefix, { color: textColor }]}>CR</Text>

        <MaskInput
          value={displayValue}
          onChangeText={handleChangeText}
          mask={IBAN_DIGITS_MASK}
          placeholder={placeholder}
          placeholderTextColor={secondaryTextColor}
          keyboardType="numeric"
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          maxLength={27} // 20 dígitos + 5 espacios + 2 caracteres extra de margen
          style={[
            styles.input,
            styles.inputWithPrefix,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || showClearButton) ? styles.inputWithRightIcon : undefined,
            !editable ? styles.inputDisabled : undefined,
            {
              backgroundColor: inputBackgroundColor,
              borderColor: error ? '#991b1b' : (isFocused ? '#a61612' : borderColor),
              color: textColor,
            }
          ]}
        />

        {showClearButton && !rightIcon && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <X size={18} color={secondaryTextColor} />
          </TouchableOpacity>
        )}

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    position: 'absolute',
    left: 12,
    fontSize: 16,
    fontWeight: '600',
    zIndex: 10,
  },
  input: {
    height: 44,
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  inputWithPrefix: {
    paddingLeft: 38,
  },
  inputWithLeftIcon: {
    paddingLeft: 60,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    top: '50%',
    zIndex: 10,
    transform: [{ translateY: -8 }],
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    zIndex: 10,
    transform: [{ translateY: -8 }],
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    zIndex: 10,
    transform: [{ translateY: -9 }],
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
});
