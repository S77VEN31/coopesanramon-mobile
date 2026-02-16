import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Mail, DollarSign, FileText, X } from 'lucide-react-native';
import { Input } from '../../ui/Input';
import { getSecondaryTextColor } from '../../../../App';
import { formatCurrency } from '../../../lib/utils/format.utils';
import type { DtoCuenta } from '../../../services/api/accounts.api';

interface TransferDetailsStepProps {
  // Amount
  amount: string;
  onAmountChange: (value: string) => void;
  amountError: string | null;
  sourceAccount: DtoCuenta | null;
  transferType: 'local' | 'sinpe' | 'sinpe-mobile' | null;
  // Description
  description: string;
  onDescriptionChange: (value: string) => void;
  // Email
  email: string;
  onEmailChange: (value: string) => void;
  emailError: string | null;
  isEmailRequired?: boolean;
}

export default function TransferDetailsStep({
  amount,
  onAmountChange,
  amountError,
  sourceAccount,
  transferType,
  description,
  onDescriptionChange,
  email,
  onEmailChange,
  emailError,
  isEmailRequired = false,
}: TransferDetailsStepProps) {
  const colorScheme = useColorScheme();
  const iconColor = getSecondaryTextColor(colorScheme);

  const currencySymbol = sourceAccount?.moneda === 'USD' ? '$' : '₡';
  const amountNum = parseFloat(amount) || 0;
  const exceedsBalance = sourceAccount && amountNum > sourceAccount.saldo;
  const availableBalance = sourceAccount?.saldo || 0;
  const currency = sourceAccount?.moneda || 'CRC';

  const isSinpeMovil = transferType === 'sinpe-mobile';
  const descriptionMaxLength = isSinpeMovil ? 20 : 255;
  const descriptionMinLength = isSinpeMovil ? 0 : 15;

  const getAmountError = (): string | undefined => {
    if (exceedsBalance) return 'El monto excede el saldo disponible';
    if (amountError) return amountError;
    return undefined;
  };

  const getDescriptionError = (): string | undefined => {
    if (
      !isSinpeMovil &&
      description.trim().length > 0 &&
      description.trim().length < descriptionMinLength
    ) {
      return `La descripción debe tener al menos ${descriptionMinLength} caracteres`;
    }
    return undefined;
  };

  const showAmountPreview = amount && !amountError && !exceedsBalance;

  return (
    <View style={styles.container}>
      {/* Balance & preview info */}
      {sourceAccount && (
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: iconColor }]}>
              Saldo disponible:
            </Text>
            <Text style={styles.infoValue}>
              {formatCurrency(availableBalance, currency)}
            </Text>
          </View>
          {showAmountPreview && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: iconColor }]}>
                Monto a transferir:
              </Text>
              <Text style={styles.infoValue}>
                {formatCurrency(amountNum, currency)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Amount */}
      <Input
        label="Monto"
        placeholder="0.00"
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
        autoFocus
        leftIcon={
          <Text style={[styles.currencyIcon, { color: iconColor }]}>
            {currencySymbol}
          </Text>
        }
        rightIcon={amount ? <X size={18} color={iconColor} /> : undefined}
        onRightIconPress={() => onAmountChange('')}
        error={getAmountError()}
        colorScheme={colorScheme}
      />

      {/* Description */}
      <Input
        label={isSinpeMovil ? 'Descripción' : 'Descripción *'}
        placeholder={
          isSinpeMovil
            ? 'Descripción (opcional)'
            : 'Ej: Pago de servicios, Transferencia personal, etc.'
        }
        value={description}
        onChangeText={onDescriptionChange}
        multiline
        numberOfLines={isSinpeMovil ? 3 : 4}
        maxLength={descriptionMaxLength}
        leftIcon={<FileText size={16} color={iconColor} />}
        rightIcon={description ? <X size={18} color={iconColor} /> : undefined}
        onRightIconPress={() => onDescriptionChange('')}
        error={getDescriptionError()}
        colorScheme={colorScheme}
      />

      {/* Description footer */}
      <View style={styles.descriptionFooter}>
        {!isSinpeMovil && (
          <Text
            style={[
              styles.helperText,
              {
                color:
                  description.trim().length < descriptionMinLength &&
                  description.length > 0
                    ? '#dc2626'
                    : iconColor,
              },
            ]}
          >
            Mínimo {descriptionMinLength} caracteres
          </Text>
        )}
        <Text
          style={[
            styles.counter,
            {
              color:
                description.length > descriptionMaxLength
                  ? '#dc2626'
                  : iconColor,
            },
          ]}
        >
          {description.length}/{descriptionMaxLength}
        </Text>
      </View>

      {/* Email */}
      <Input
        label={isEmailRequired ? 'Correo Electrónico *' : 'Correo Electrónico'}
        placeholder="ejemplo@correo.com"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={16} color={iconColor} />}
        rightIcon={email ? <X size={18} color={iconColor} /> : undefined}
        onRightIconPress={() => onEmailChange('')}
        error={emailError || undefined}
        colorScheme={colorScheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(166, 22, 18, 0.05)',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a61612',
  },
  currencyIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -8,
  },
  helperText: {
    fontSize: 12,
  },
  counter: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionalText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
});
