import React, { useState, forwardRef } from 'react';
import { TextInput, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  textAlignVertical?: 'auto' | 'top' | 'center' | 'bottom';
  maxLength?: number;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
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
  autoFocus = false,
  multiline = false,
  numberOfLines,
  textAlignVertical,
  maxLength,
  required = false,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = backgroundColor || getInputBackgroundColor(colorScheme);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>
          {label}{required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        {leftIcon && (
          <View style={[styles.leftIconContainer, multiline ? styles.iconContainerMultiline : undefined]}>
            {leftIcon}
          </View>
        )}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={secondaryTextColor}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? (textAlignVertical || 'top') : textAlignVertical}
          maxLength={maxLength}
          onPressIn={() => setIsFocused(true)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            !editable ? styles.inputDisabled : undefined,
            multiline ? { height: undefined, minHeight: numberOfLines ? numberOfLines * 24 + 20 : 100, paddingTop: 12 } : undefined,
            {
              backgroundColor: inputBackgroundColor,
              borderColor: error ? '#991b1b' : (isFocused ? '#a61612' : borderColor),
              color: textColor,
            }
          ]}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={[styles.rightIconContainer, multiline ? styles.rightIconContainerMultiline : undefined]}
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
});

const styles = StyleSheet.create({
  container: {
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
  iconContainerMultiline: {
    top: 14,
    transform: [],
  },
  rightIconContainerMultiline: {
    top: 'auto',
    bottom: 12,
    transform: [],
  },
  requiredAsterisk: {
    color: '#dc2626',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
});

