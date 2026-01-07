import React from 'react';
import { View, Text, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { Mail, DollarSign, FileText } from 'lucide-react-native';
import { Card, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../../App';
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
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);

  const currencySymbol = sourceAccount?.moneda === 'USD' ? '$' : '₡';
  const amountNum = parseFloat(amount) || 0;
  const exceedsBalance = sourceAccount && amountNum > sourceAccount.saldo;
  const availableBalance = sourceAccount?.saldo || 0;
  const currency = sourceAccount?.moneda || 'CRC';

  const isSinpeMovil = transferType === 'sinpe-mobile';
  const descriptionMaxLength = isSinpeMovil ? 20 : 255;
  const descriptionMinLength = isSinpeMovil ? 0 : 15;
  const descriptionValidLength =
    description.trim().length >= descriptionMinLength &&
    description.trim().length <= descriptionMaxLength;

  return (
    <View style={styles.container}>
      {/* Amount Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Monto
        </Text>
        {sourceAccount && (
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: secondaryTextColor }]}>
              Saldo disponible:
            </Text>
            <Text style={[styles.balanceAmount, { color: '#a61612' }]}>
              {formatCurrency(availableBalance, currency)}
            </Text>
          </View>
        )}
        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: secondaryTextColor }]}>
            {currencySymbol}
          </Text>
          <TextInput
            style={[
              styles.amountInput,
              {
                backgroundColor: inputBackgroundColor,
                borderColor:
                  amountError || exceedsBalance ? '#991b1b' : borderColor,
                color: textColor,
              },
            ]}
            placeholder="0.00"
            placeholderTextColor={secondaryTextColor}
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            autoFocus
          />
        </View>
        {exceedsBalance && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              El monto excede el saldo disponible
            </Text>
          </View>
        )}
        {amountError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{amountError}</Text>
          </View>
        )}
        {amount && !amountError && !exceedsBalance && (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewLabel, { color: secondaryTextColor }]}>
              Monto a transferir:
            </Text>
            <Text style={[styles.previewAmount, { color: '#a61612' }]}>
              {formatCurrency(amountNum, currency)}
            </Text>
          </View>
        )}
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Descripción
          {!isSinpeMovil && (
            <Text style={styles.required}> *</Text>
          )}
        </Text>
        <TextInput
          style={[
            styles.descriptionInput,
            {
              backgroundColor: inputBackgroundColor,
              borderColor:
                descriptionValidLength || description.length === 0
                  ? borderColor
                  : '#dc2626',
              color: textColor,
            },
          ]}
          placeholder={
            isSinpeMovil
              ? 'Descripción (opcional)'
              : 'Ej: Pago de servicios, Transferencia personal, etc.'
          }
          placeholderTextColor={secondaryTextColor}
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          numberOfLines={isSinpeMovil ? 3 : 4}
          textAlignVertical="top"
          maxLength={descriptionMaxLength}
        />
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
                      : secondaryTextColor,
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
                    : secondaryTextColor,
              },
            ]}
          >
            {description.length}/{descriptionMaxLength}
          </Text>
        </View>
        {description.trim().length > 0 &&
          description.trim().length < descriptionMinLength &&
          !isSinpeMovil && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                La descripción debe tener al menos {descriptionMinLength}{' '}
                caracteres
              </Text>
            </View>
          )}
      </View>

      {/* Email Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Correo Electrónico
          {isEmailRequired && <Text style={styles.required}> *</Text>}
        </Text>
        <Input
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={emailError || undefined}
          leftIcon={<Mail size={16} color={secondaryTextColor} />}
        />
        {emailError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{emailError}</Text>
          </View>
        )}
        {!isEmailRequired && (
          <View style={styles.optionalContainer}>
            <Text style={[styles.optionalText, { color: secondaryTextColor }]}>
              Este campo es opcional. Puedes omitirlo si no deseas enviar un
              comprobante por correo.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  required: {
    color: '#dc2626',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(166, 22, 18, 0.05)',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    fontSize: 24,
    fontWeight: '700',
    zIndex: 1,
  },
  amountInput: {
    height: 64,
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingLeft: 48,
    textAlign: 'center',
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(166, 22, 18, 0.05)',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  previewAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  descriptionInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 16,
    padding: 16,
    marginBottom: 8,
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
  },
  counter: {
    fontSize: 12,
    fontWeight: '500',
  },
  warningContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  optionalContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(166, 22, 18, 0.05)',
  },
  optionalText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

