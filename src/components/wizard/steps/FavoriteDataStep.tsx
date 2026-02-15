import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Input } from '@/components/ui/Input';
import { isEmailValid } from '@/lib/utils/email.utils';

interface FavoriteDataStepProps {
  alias: string;
  onAliasChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  maxAmount: string;
  onMaxAmountChange: (value: string) => void;
  aliasLabel?: string;
  aliasPlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  maxAmountLabel?: string;
  maxAmountPlaceholder?: string;
  showMaxAmount?: boolean;
  phone?: string;
  onPhoneChange?: (value: string) => void;
  phoneLabel?: string;
  phonePlaceholder?: string;
  showPhone?: boolean;
}

export default function FavoriteDataStep({
  alias,
  onAliasChange,
  email,
  onEmailChange,
  maxAmount,
  onMaxAmountChange,
  aliasLabel = 'Alias',
  aliasPlaceholder = 'Ej: Mi cuenta favorita',
  emailLabel = 'Correo Electrónico (Opcional)',
  emailPlaceholder = 'correo@ejemplo.com',
  maxAmountLabel = 'Monto Máximo (Opcional)',
  maxAmountPlaceholder = '0.00',
  showMaxAmount = true,
  phone = '',
  onPhoneChange,
  phoneLabel = 'Teléfono (Opcional)',
  phonePlaceholder = '88887777',
  showPhone = false,
}: FavoriteDataStepProps) {
  const colorScheme = useColorScheme();

  const handleMaxAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onMaxAmountChange(value);
    }
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 8);
    onPhoneChange?.(digitsOnly);
  };

  return (
    <View style={styles.container}>
      <Input
        label={aliasLabel}
        placeholder={aliasPlaceholder}
        value={alias}
        onChangeText={onAliasChange}
        colorScheme={colorScheme}
      />
      <Input
        label={emailLabel}
        placeholder={emailPlaceholder}
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        error={email && !isEmailValid(email) ? 'Correo electrónico no válido' : undefined}
        colorScheme={colorScheme}
      />
      {showPhone && (
        <Input
          label={phoneLabel}
          placeholder={phonePlaceholder}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          colorScheme={colorScheme}
        />
      )}
      {showMaxAmount && (
        <Input
          label={maxAmountLabel}
          placeholder={maxAmountPlaceholder}
          value={maxAmount}
          onChangeText={handleMaxAmountChange}
          keyboardType="numeric"
          colorScheme={colorScheme}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
