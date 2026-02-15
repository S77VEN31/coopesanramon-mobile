import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Phone } from 'lucide-react-native';
import { MaskedInput } from '@/components/ui/MaskedInput';
import MessageCard from '@/components/cards/MessageCard';
import WalletInfoCard from '@/components/cards/WalletInfoCard';
import { PHONE_MASK } from '@/constants/input-masks';
import { getBorderColor, getCardBgColor, getSecondaryTextColor } from '../../../../App';

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
  const borderColor = getBorderColor(colorScheme);
  const iconColor = getSecondaryTextColor(colorScheme);

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
        leftIcon={<Phone size={16} color={iconColor} />}
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
        <WalletInfoCard
          titular={validatedWallet.titular}
          monedero={validatedWallet.monedero}
          nombreBanco={validatedWallet.nombreBanco}
        />
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
});
