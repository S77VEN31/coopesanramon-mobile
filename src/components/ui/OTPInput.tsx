import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { getTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  colorScheme?: 'light' | 'dark' | null | undefined;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  colorScheme = 'light',
}) => {
  const inputRefs = useRef<TextInput[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const textColor = getTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digits = text.replace(/\D/g, '');
    
    if (digits.length > 1) {
      // Handle paste
      const newValue = value.split('');
      for (let i = 0; i < Math.min(digits.length, length - index); i++) {
        newValue[index + i] = digits[i];
      }
      onChange(newValue.join('').slice(0, length));
      
      // Focus next empty input or last input
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else if (digits.length === 1) {
      // Single digit input
      const newValue = value.split('');
      newValue[index] = digits;
      onChange(newValue.join('').slice(0, length));
      
      // Focus next input if not last
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // Backspace/delete
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
      
      // Focus previous input if current is empty
      if (index > 0 && !value[index]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) {
              inputRefs.current[index] = ref;
            }
          }}
          style={[
            styles.input,
            {
              backgroundColor: inputBackgroundColor,
              borderColor: focusedIndex === index ? '#a61612' : borderColor,
              color: textColor,
            },
            disabled && styles.disabled,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
          autoFocus={index === 0 && !value}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

