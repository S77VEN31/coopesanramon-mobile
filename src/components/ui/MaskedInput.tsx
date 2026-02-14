import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaskInput, { Mask } from 'react-native-mask-input';
import { X } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';

interface MaskedInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (masked: string, unmasked: string) => void;
  onClear?: () => void;
  onBlur?: () => void;
  mask: Mask;
  maxLength?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
}

export const MaskedInput: React.FC<MaskedInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onClear,
  onBlur,
  mask,
  maxLength,
  keyboardType = 'default',
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
  autoCapitalize = 'none',
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = backgroundColor || getInputBackgroundColor(colorScheme);

  const handleClear = () => {
    onChangeText('', '');
    if (onClear) {
      onClear();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const showClearButton = value && value.length > 0;

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
        <MaskInput
          value={value}
          onChangeText={onChangeText}
          mask={mask}
          placeholder={placeholder}
          placeholderTextColor={secondaryTextColor}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onPressIn={() => setIsFocused(true)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          style={[
            styles.input,
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
  },
  input: {
    height: 44,
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 40,
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
