import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Mail, DollarSign, X, Wallet, Clock, Clock3, Info } from 'lucide-react-native';
import { ColonIcon } from '../../ui/ColonIcon';
import { Input } from '../../ui/Input';
import InfoCard from '../../cards/InfoCard';
import { getTextColor, getSecondaryTextColor } from '../../../../App';
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
  sinpeTransferType?: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null;
  onSinpeTransferTypeChange?: (value: 'pagos-inmediatos' | 'creditos-directos') => void;
  sinpeFlowType?: 'enviar-fondos' | 'recibir-fondos';
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
  sinpeTransferType,
  onSinpeTransferTypeChange,
  sinpeFlowType,
}: TransferDetailsStepProps) {
  const colorScheme = useColorScheme();
  const iconColor = getSecondaryTextColor(colorScheme);

  const descriptionRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const isUSD = sourceAccount?.moneda === 'USD';
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


  return (
    <View style={styles.container}>
      {/* Balance info */}
      {sourceAccount && (
        <InfoCard
          items={[
            {
              icon: <Wallet />,
              label: 'Saldo disponible',
              value: formatCurrency(availableBalance, currency),
            },
          ]}
        />
      )}

      {/* Amount */}
      <Input
        label="Monto"
        placeholder="0.00"
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => descriptionRef.current?.focus()}
        leftIcon={
          isUSD
            ? <DollarSign size={16} color={iconColor} />
            : <ColonIcon size={16} color={iconColor} strokeWidth={2} />
        }
        rightIcon={amount ? <X size={18} color={iconColor} /> : undefined}
        onRightIconPress={() => onAmountChange('')}
        error={getAmountError()}
        colorScheme={colorScheme}
      />

      {/* Description */}
      <View>
        <Input
          ref={descriptionRef}
          label="Descripción"
          required={!isSinpeMovil}
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
          rightIcon={description ? <X size={18} color={iconColor} /> : undefined}
          onRightIconPress={() => onDescriptionChange('')}
          colorScheme={colorScheme}
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
      </View>

      {/* Email */}
      <Input
        ref={emailRef}
        label={isEmailRequired ? 'Correo Electrónico *' : 'Correo Electrónico'}
        placeholder="ejemplo@correo.com"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
        leftIcon={<Mail size={16} color={iconColor} />}
        rightIcon={email ? <X size={18} color={iconColor} /> : undefined}
        onRightIconPress={() => onEmailChange('')}
        error={emailError || undefined}
        colorScheme={colorScheme}
      />

      {/* Execution type tabs (SINPE enviar-fondos only) */}
      {transferType === 'sinpe' && sinpeFlowType === 'enviar-fondos' && onSinpeTransferTypeChange && (
        <View style={styles.executionTypeSection}>
          <Text style={[styles.inputLabel, { color: getTextColor(colorScheme) }]}>
            Tipo de ejecución
          </Text>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, sinpeTransferType === 'pagos-inmediatos' && styles.tabActive]}
              onPress={() => onSinpeTransferTypeChange('pagos-inmediatos')}
            >
              <Clock size={16} color={sinpeTransferType === 'pagos-inmediatos' ? '#a61612' : iconColor} />
              <Text style={[styles.tabText, { color: sinpeTransferType === 'pagos-inmediatos' ? '#a61612' : iconColor }]}>
                Tiempo real
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, sinpeTransferType === 'creditos-directos' && styles.tabActive]}
              onPress={() => onSinpeTransferTypeChange('creditos-directos')}
            >
              <Clock3 size={16} color={sinpeTransferType === 'creditos-directos' ? '#a61612' : iconColor} />
              <Text style={[styles.tabText, { color: sinpeTransferType === 'creditos-directos' ? '#a61612' : iconColor }]}>
                Diferido
              </Text>
            </TouchableOpacity>
          </View>
          <InfoCard
            items={
              sinpeTransferType === 'pagos-inmediatos'
                ? [
                    {
                      icon: <Info />,
                      label: 'Pagos inmediatos',
                      value: 'La transferencia se ejecuta en tiempo real y los fondos se acreditan de forma inmediata.',
                    },
                  ]
                : [
                    {
                      icon: <Info />,
                      label: 'Créditos directos',
                      value: 'La transferencia se procesa de forma diferida. Los fondos se acreditan en el próximo ciclo de compensación.',
                    },
                  ]
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 16,
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
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
  executionTypeSection: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#a61612',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
