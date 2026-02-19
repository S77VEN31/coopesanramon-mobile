import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { getTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  colorScheme?: 'light' | 'dark' | null | undefined;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  colorScheme = 'light',
  autoFocus = false,
}) => {
  const inputRefs = useRef<TextInput[]>([]);
  const backspaceHandledRef = useRef(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const textColor = getTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first empty input when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = value.split('').findIndex((v) => !v);
      const indexToFocus = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
      setTimeout(() => {
        inputRefs.current[indexToFocus]?.focus();
      }, 100);
    }
  }, [autoFocus, disabled]);

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
      // Backspace/delete - skip if already handled by onKeyPress
      if (backspaceHandledRef.current) {
        backspaceHandledRef.current = false;
        return;
      }
      // Fallback for devices where onKeyPress doesn't fire
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      backspaceHandledRef.current = true;
      const newValue = value.split('');
      if (value[index]) {
        // Field has a value - clear it, stay on same field
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Field is empty - move to previous and clear it
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
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
    gap: 6,
  },
  input: {
    width: 40,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

