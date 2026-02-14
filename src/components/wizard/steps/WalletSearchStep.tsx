import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { MaskedInput } from '@/components/ui/MaskedInput';
import MessageCard from '@/components/cards/MessageCard';
import { PHONE_MASK } from '@/constants/input-masks';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../../App';

interface ValidatedWallet {
  monedero: string | null;
  titular: string | null;
  nombreBanco: string | null;
  [key: string]: any;
}

interface WalletSearchStepProps {
  phone: string;
  onPhoneChange: (masked: string, unmasked: string) => void;
  onClear: () => void;
  onBlur?: () => void;
  onSearch: () => void;
  isLoading?: boolean;
  validatedWallet: ValidatedWallet | null;
  error: string | null;
  searchLabel?: string;
}

export default function WalletSearchStep({
  phone,
  onPhoneChange,
  onClear,
  onBlur,
  onSearch,
  isLoading = false,
  validatedWallet,
  error,
  searchLabel = 'Número de Teléfono',
}: WalletSearchStepProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  return (
    <View style={styles.container}>
      <MaskedInput
        label={searchLabel}
        placeholder="8888-7777"
        value={phone}
        onChangeText={onPhoneChange}
        onClear={onClear}
        onBlur={onBlur}
        mask={PHONE_MASK}
        maxLength={9}
        keyboardType="phone-pad"
        colorScheme={colorScheme}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />

      {error && !isLoading && (
        <MessageCard message={error} type="error" style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]} />
      )}

      {isLoading && (
        <MessageCard message="Buscando monedero..." type="loading" style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]} />
      )}

      {validatedWallet && !isLoading && (
        <View style={[styles.walletCard, { borderColor }]}>
          <Text style={[styles.walletLabel, { color: secondaryTextColor }]}>Titular</Text>
          <Text style={[styles.walletValue, { color: textColor }]}>
            {validatedWallet.titular || '-'}
          </Text>
          <Text style={[styles.walletLabel, { color: secondaryTextColor }]}>Teléfono</Text>
          <Text style={[styles.walletValue, { color: textColor }]}>
            {validatedWallet.monedero || '-'}
          </Text>
          <Text style={[styles.walletLabel, { color: secondaryTextColor }]}>Entidad</Text>
          <Text style={[styles.walletValue, { color: textColor }]}>
            {validatedWallet.nombreBanco || '-'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: 12,
    flex: 0,
    minHeight: 0,
  },
  walletCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  walletLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  walletValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
});
