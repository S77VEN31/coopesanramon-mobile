import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { IbanInput } from '@/components/ui/IbanInput';
import MessageCard from '@/components/cards/MessageCard';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../../App';

interface ValidatedAccount {
  titular: string | null;
  cuentaIBAN: string | null;
  codigoMoneda: string | null;
  [key: string]: any;
}

interface LocalAccountSearchStepProps {
  iban: string;
  onIbanChange: (masked: string, unmasked: string) => void;
  onClear: () => void;
  onBlur?: () => void;
  onSearch: () => void;
  isLoading?: boolean;
  validatedAccount: ValidatedAccount | null;
  error: string | null;
  searchLabel?: string;
}

export default function LocalAccountSearchStep({
  iban,
  onIbanChange,
  onClear,
  onBlur,
  onSearch,
  isLoading = false,
  validatedAccount,
  error,
  searchLabel = 'Número de Cuenta IBAN',
}: LocalAccountSearchStepProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  return (
    <View style={styles.container}>
      <IbanInput
        label={searchLabel}
        placeholder="12 3456 7890 1234 5678 90"
        value={iban}
        onChangeText={onIbanChange}
        onClear={onClear}
        onBlur={onBlur}
        colorScheme={colorScheme}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />

      {error && !isLoading && (
        <MessageCard message={error} type="error" style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]} />
      )}

      {isLoading && (
        <MessageCard message="Buscando cuenta..." type="loading" style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]} />
      )}

      {validatedAccount && !isLoading && (
        <View style={[styles.accountCard, { borderColor }]}>
          <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>Titular</Text>
          <Text style={[styles.accountValue, { color: textColor }]}>
            {validatedAccount.titular || '-'}
          </Text>
          <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>IBAN</Text>
          <Text style={[styles.accountValue, { color: textColor }]}>
            {validatedAccount.cuentaIBAN || '-'}
          </Text>
          <Text style={[styles.accountLabel, { color: secondaryTextColor }]}>Moneda</Text>
          <Text style={[styles.accountValue, { color: textColor }]}>
            {validatedAccount.codigoMoneda || '-'}
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
  accountCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  accountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
});
