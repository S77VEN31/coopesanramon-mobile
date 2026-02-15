import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Tag, Mail, Phone, Banknote, X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { PHONE_MASK } from '@/constants/input-masks';
import { getSecondaryTextColor } from '../../../../App';
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
  onPhoneChange?: (value: string) => void;
  phoneLabel?: string;
  showPhone?: boolean;
  initialPhone?: string;
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
  onPhoneChange,
  phoneLabel = 'Teléfono (Opcional)',
  showPhone = false,
  initialPhone = '',
}: FavoriteDataStepProps) {
  const colorScheme = useColorScheme();
  const iconColor = getSecondaryTextColor(colorScheme);
  const [maskedPhone, setMaskedPhone] = useState('');

  useEffect(() => {
    if (initialPhone) {
      const digits = initialPhone.replace(/\D/g, '');
      if (digits.length === 8) {
        setMaskedPhone(`${digits.slice(0, 4)}-${digits.slice(4)}`);
      } else {
        setMaskedPhone(initialPhone);
      }
    }
  }, [initialPhone]);

  const handleMaxAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onMaxAmountChange(value);
    }
  };

  const handlePhoneChange = (masked: string, unmasked: string) => {
    setMaskedPhone(masked);
    onPhoneChange?.(unmasked);
  };

  return (
    <View style={styles.container}>
      <Input
        label={aliasLabel}
        placeholder={aliasPlaceholder}
        value={alias}
        onChangeText={onAliasChange}
        leftIcon={<Tag size={16} color={iconColor} />}
        rightIcon={alias ? <X size={18} color={iconColor} /> : undefined}
        onRightIconPress={() => onAliasChange('')}
        colorScheme={colorScheme}
      />
      <Input
        label={emailLabel}
        placeholder={emailPlaceholder}
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={16} color={iconColor} />}
        rightIcon={email ? <X size={18} color={iconColor} /> : undefined}
        onRightIconPress={() => onEmailChange('')}
        error={email && !isEmailValid(email) ? 'Correo electrónico no válido' : undefined}
        colorScheme={colorScheme}
      />
      {showPhone && (
        <MaskedInput
          label={phoneLabel}
          placeholder="8888-7777"
          value={maskedPhone}
          onChangeText={handlePhoneChange}
          mask={PHONE_MASK}
          maxLength={9}
          keyboardType="phone-pad"
          leftIcon={<Phone size={16} color={iconColor} />}
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
          leftIcon={<Banknote size={16} color={iconColor} />}
          rightIcon={maxAmount ? <X size={18} color={iconColor} /> : undefined}
          onRightIconPress={() => onMaxAmountChange('')}
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
