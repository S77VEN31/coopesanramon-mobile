import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { IbanInput } from '@/components/ui/IbanInput';
import MessageCard from '@/components/cards/MessageCard';
import LocalInfoCard from '@/components/cards/LocalInfoCard';
import { getBorderColor, getCardBgColor } from '../../../../App';

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
        <LocalInfoCard
          titular={validatedAccount.titular || null}
          numeroCuenta={validatedAccount.cuentaIBAN || null}
          moneda={validatedAccount.codigoMoneda || null}
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
