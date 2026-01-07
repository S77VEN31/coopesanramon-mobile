import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useColorScheme } from 'react-native';
import { ChevronDown, Hash, Mail, Send, Loader2 } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SelectInput } from '../inputs/SelectInput';
import { formatCurrency } from '../../lib/utils/format.utils';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';
import { TRANSFER_SINPE_FORM_TEXT } from '../../constants/transfers.constants';
import { useSinpeTransfersStore } from '../../lib/states/sinpeTransfers.store';
import type { DtoCuenta } from '../../services/api/accounts.api';
import type { GetCuentaDestinoSinpeResponse } from '../../services/api';
import type { CuentaSinpeFavoritaItem } from '../../hooks/use-sinpe-transfer';

interface TransferSinpeFormProps {
  selectedSourceAccount: DtoCuenta | null;
  isLoadingAccounts: boolean;
  onSourceAccountClick: () => void;
  sinpeDestinationType: "favorites" | "manual";
  onSinpeDestinationTypeChange: (value: "favorites" | "manual") => void;
  selectedSinpeFavoriteAccount: CuentaSinpeFavoritaItem | null;
  isLoadingSinpeFavorites: boolean;
  filteredSinpeFavorites: CuentaSinpeFavoritaItem[];
  sinpeFavoriteAccounts: CuentaSinpeFavoritaItem[];
  onDestinationSheetOpen: () => void;
  sinpeDestinationIban: string;
  onSinpeDestinationIbanChange: (value: string) => void;
  sinpeDestinationFormatError: string | null;
  isValidatingSinpeAccount: boolean;
  sinpeAccountValidationError: string | null;
  validatedSinpeAccountInfo: GetCuentaDestinoSinpeResponse | null;
  sinpeAmount: string;
  sinpeAmountError: string | null;
  onSinpeAmountChange: (value: string) => void;
  onAmountKeyDown: (e: any) => void;
  sinpeEmail: string;
  sinpeEmailError: string | null;
  onSinpeEmailChange: (value: string) => void;
  sinpeDescription: string;
  onSinpeDescriptionChange: (value: string) => void;
  isSinpeFormValid: () => boolean;
  onSubmit: () => void;
  sinpeTransferType: "pagos-inmediatos" | "creditos-directos" | "debitos-tiempo-real" | null;
  onSinpeTransferTypeChange: (type: "pagos-inmediatos" | "creditos-directos" | "debitos-tiempo-real" | null) => void;
  sinpeFlowType: "enviar-fondos" | "recibir-fondos";
  onSinpeFlowTypeChange: (type: "enviar-fondos" | "recibir-fondos") => void;
}

export default function TransferSinpeForm({
  selectedSourceAccount,
  isLoadingAccounts,
  onSourceAccountClick,
  sinpeDestinationType,
  onSinpeDestinationTypeChange,
  selectedSinpeFavoriteAccount,
  isLoadingSinpeFavorites,
  filteredSinpeFavorites,
  sinpeFavoriteAccounts,
  onDestinationSheetOpen,
  sinpeDestinationIban,
  onSinpeDestinationIbanChange,
  sinpeDestinationFormatError,
  isValidatingSinpeAccount,
  sinpeAccountValidationError,
  validatedSinpeAccountInfo,
  sinpeAmount,
  sinpeAmountError,
  onSinpeAmountChange,
  onAmountKeyDown,
  sinpeEmail,
  sinpeEmailError,
  onSinpeEmailChange,
  sinpeDescription,
  onSinpeDescriptionChange,
  isSinpeFormValid,
  onSubmit,
  sinpeTransferType,
  onSinpeTransferTypeChange,
  sinpeFlowType,
  onSinpeFlowTypeChange,
}: TransferSinpeFormProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const { isSending } = useSinpeTransfersStore();

  const flowTypeOptions = [
    { value: "enviar-fondos", label: TRANSFER_SINPE_FORM_TEXT.flowType.options.send },
    { value: "recibir-fondos", label: TRANSFER_SINPE_FORM_TEXT.flowType.options.receive },
  ];

  const destinationTypeOptions = [
    { value: "favorites", label: TRANSFER_SINPE_FORM_TEXT.destinationType.options.favorites },
    { value: "manual", label: TRANSFER_SINPE_FORM_TEXT.destinationType.options.manual },
  ];

  const transferTypeOptions = [
    { value: "pagos-inmediatos", label: "Pagos Inmediatos" },
    { value: "creditos-directos", label: "Créditos Directos" },
    { value: "debitos-tiempo-real", label: "Débitos Tiempo Real" },
  ];

  const currencySymbol = selectedSourceAccount?.moneda === "USD" ? "$" : "₡";
  const amountNum = parseFloat(sinpeAmount) || 0;
  const exceedsBalance = selectedSourceAccount && sinpeFlowType === "enviar-fondos" && amountNum > selectedSourceAccount.saldo;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Flow Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>
            {TRANSFER_SINPE_FORM_TEXT.flowType.label}
          </Text>
          <SelectInput
            options={flowTypeOptions}
            value={sinpeFlowType}
            onValueChange={onSinpeFlowTypeChange}
            placeholder="Seleccionar tipo"
          />
        </View>

        {/* Source Account */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>
            {sinpeFlowType === "recibir-fondos"
              ? TRANSFER_SINPE_FORM_TEXT.sourceAccount.label.receive
              : TRANSFER_SINPE_FORM_TEXT.sourceAccount.label.send}
          </Text>
          <TouchableOpacity
            onPress={onSourceAccountClick}
            style={[
              styles.accountSelector,
              { backgroundColor: inputBackgroundColor, borderColor },
            ]}
            disabled={isLoadingAccounts}
          >
            <Text
              style={[
                styles.accountSelectorText,
                { color: selectedSourceAccount ? textColor : secondaryTextColor },
              ]}
              numberOfLines={1}
            >
              {isLoadingAccounts
                ? TRANSFER_SINPE_FORM_TEXT.sourceAccount.placeholder.loading
                : selectedSourceAccount
                ? selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || ""
                : TRANSFER_SINPE_FORM_TEXT.sourceAccount.placeholder.select}
            </Text>
            {selectedSourceAccount && (
              <Text style={[styles.balanceText, { color: '#a61612' }]}>
                {formatCurrency(selectedSourceAccount.saldo, selectedSourceAccount.moneda || "CRC")}
              </Text>
            )}
            <ChevronDown size={20} color={secondaryTextColor} />
          </TouchableOpacity>
        </View>

        {selectedSourceAccount && (
          <>
            {/* Transfer Type (only for enviar-fondos) */}
            {sinpeFlowType === "enviar-fondos" && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: textColor }]}>
                  Tipo de transferencia SINPE:
                </Text>
                <SelectInput
                  options={transferTypeOptions}
                  value={sinpeTransferType || undefined}
                  onValueChange={(value) => onSinpeTransferTypeChange(value as "pagos-inmediatos" | "creditos-directos" | "debitos-tiempo-real" | null)}
                  placeholder="Seleccionar tipo"
                />
              </View>
            )}

            {/* Destination Type */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>
                {sinpeFlowType === "recibir-fondos"
                  ? TRANSFER_SINPE_FORM_TEXT.destinationType.label.receive
                  : TRANSFER_SINPE_FORM_TEXT.destinationType.label.send}
              </Text>
              <SelectInput
                options={destinationTypeOptions}
                value={sinpeDestinationType}
                onValueChange={onSinpeDestinationTypeChange}
                placeholder="Seleccionar tipo"
              />
            </View>

            {/* Favorites Section */}
            {sinpeDestinationType === "favorites" && (
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {TRANSFER_SINPE_FORM_TEXT.destinationFavorites.label}
                    </Text>
                    <TouchableOpacity
                      onPress={onDestinationSheetOpen}
                      style={[
                        styles.accountSelector,
                        { backgroundColor: inputBackgroundColor, borderColor },
                      ]}
                      disabled={isLoadingSinpeFavorites}
                    >
                      <Text
                        style={[
                          styles.accountSelectorText,
                          { color: selectedSinpeFavoriteAccount ? textColor : secondaryTextColor },
                        ]}
                        numberOfLines={1}
                      >
                        {isLoadingSinpeFavorites
                          ? TRANSFER_SINPE_FORM_TEXT.destinationFavorites.placeholder.loading
                          : selectedSinpeFavoriteAccount
                          ? selectedSinpeFavoriteAccount.numeroCuentaDestino || ""
                          : TRANSFER_SINPE_FORM_TEXT.destinationFavorites.placeholder.select}
                      </Text>
                      <ChevronDown size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                    {sinpeAccountValidationError && (
                      <Text style={styles.errorText}>{sinpeAccountValidationError}</Text>
                    )}
                    {filteredSinpeFavorites.length === 0 && !isLoadingSinpeFavorites && !sinpeAccountValidationError && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {sinpeFavoriteAccounts.length === 0
                          ? "No tienes cuentas favoritas SINPE. Puedes agregar una desde el menú de Cuentas Favoritas."
                          : `No tienes cuentas favoritas SINPE en ${selectedSourceAccount.moneda === "USD" ? "dólares" : "colones"}.`}
                      </Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label={TRANSFER_SINPE_FORM_TEXT.destinationFavorites.recipientLabel}
                      placeholder={TRANSFER_SINPE_FORM_TEXT.destinationFavorites.recipientPlaceholder}
                      value={selectedSinpeFavoriteAccount?.titularDestino || selectedSinpeFavoriteAccount?.numeroCuentaDestino || ""}
                      onChangeText={() => {}}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Manual Section */}
            {sinpeDestinationType === "manual" && (
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {sinpeFlowType === "recibir-fondos"
                        ? TRANSFER_SINPE_FORM_TEXT.destinationManual.label.receive
                        : TRANSFER_SINPE_FORM_TEXT.destinationManual.label.send}
                    </Text>
                    <Input
                      placeholder="CRXX XXXX XXXX XXXX XXXX XXXX"
                      value={sinpeDestinationIban}
                      onChangeText={onSinpeDestinationIbanChange}
                      keyboardType="default"
                      error={sinpeDestinationFormatError || sinpeAccountValidationError || undefined}
                      rightIcon={isValidatingSinpeAccount ? <Loader2 size={16} color={secondaryTextColor} /> : undefined}
                    />
                    {isValidatingSinpeAccount && !sinpeDestinationFormatError && !sinpeAccountValidationError && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {TRANSFER_SINPE_FORM_TEXT.destinationManual.validating}
                      </Text>
                    )}
                    {!isValidatingSinpeAccount && !sinpeDestinationFormatError && !sinpeAccountValidationError && !validatedSinpeAccountInfo && sinpeDestinationIban && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        Complete el IBAN (22 caracteres) para validar la cuenta
                      </Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label={TRANSFER_SINPE_FORM_TEXT.destinationFavorites.recipientLabel}
                      placeholder={TRANSFER_SINPE_FORM_TEXT.destinationManual.recipientPlaceholder}
                      value={validatedSinpeAccountInfo?.titularDestino || validatedSinpeAccountInfo?.numeroCuentaDestino || ""}
                      onChangeText={() => {}}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Amount and Email Row */}
            <View style={styles.field}>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Monto <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.amountContainer}>
                    <Text style={[styles.currencySymbol, { color: secondaryTextColor }]}>
                      {currencySymbol}
                    </Text>
                    <TextInput
                      style={[
                        styles.amountInput,
                        {
                          backgroundColor: inputBackgroundColor,
                          borderColor: sinpeAmountError || exceedsBalance ? '#991b1b' : borderColor,
                          color: textColor,
                        },
                      ]}
                      placeholder={TRANSFER_SINPE_FORM_TEXT.amount.placeholder}
                      placeholderTextColor={secondaryTextColor}
                      value={sinpeAmount}
                      onChangeText={onSinpeAmountChange}
                      keyboardType="numeric"
                      editable={
                        !(
                          (sinpeDestinationType === "favorites" && !selectedSinpeFavoriteAccount) ||
                          (sinpeDestinationType === "manual" && !validatedSinpeAccountInfo)
                        )
                      }
                    />
                  </View>
                  {exceedsBalance && (
                    <Text style={styles.errorText}>
                      {TRANSFER_SINPE_FORM_TEXT.amount.exceedsBalance}
                    </Text>
                  )}
                  {sinpeAmountError && <Text style={styles.errorText}>{sinpeAmountError}</Text>}
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label={
                      sinpeFlowType === "recibir-fondos"
                        ? TRANSFER_SINPE_FORM_TEXT.email.label.receive
                        : TRANSFER_SINPE_FORM_TEXT.email.label.send
                    }
                    placeholder={TRANSFER_SINPE_FORM_TEXT.email.placeholder}
                    value={sinpeEmail}
                    onChangeText={onSinpeEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={sinpeEmailError || undefined}
                    leftIcon={<Mail size={16} color={secondaryTextColor} />}
                    editable={sinpeDestinationType === "manual" && !!validatedSinpeAccountInfo}
                  />
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>
                {TRANSFER_SINPE_FORM_TEXT.description.label}{' '}
                <Text style={styles.required}>{TRANSFER_SINPE_FORM_TEXT.description.required}</Text>
              </Text>
              <TextInput
                style={[
                  styles.descriptionInput,
                  {
                    backgroundColor: inputBackgroundColor,
                    borderColor,
                    color: textColor,
                  },
                ]}
                placeholder={TRANSFER_SINPE_FORM_TEXT.description.placeholder}
                placeholderTextColor={secondaryTextColor}
                value={sinpeDescription}
                onChangeText={onSinpeDescriptionChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={255}
              />
              <View style={styles.descriptionFooter}>
                <Text
                  style={[
                    styles.descriptionHelper,
                    { color: sinpeDescription.trim().length < 15 ? '#dc2626' : secondaryTextColor },
                  ]}
                >
                  Mínimo 15 caracteres
                </Text>
                <Text style={[styles.descriptionCounter, { color: secondaryTextColor }]}>
                  {sinpeDescription.length}/255
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <Button
                onPress={onSubmit}
                disabled={!isSinpeFormValid() || (sinpeFlowType === "enviar-fondos" && exceedsBalance) || isSending}
                loading={isSending}
                size="lg"
              >
                {!isSending && (
                  <View style={styles.buttonContent}>
                    <Send size={20} color="#ffffff" />
                    <Text style={styles.buttonText}>
                      {TRANSFER_SINPE_FORM_TEXT.submit.send}
                    </Text>
                  </View>
                )}
              </Button>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  accountSelector: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountSelectorText: {
    flex: 1,
    fontSize: 16,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1,
  },
  amountInput: {
    height: 44,
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingLeft: 32,
  },
  descriptionInput: {
    minHeight: 80,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  descriptionHelper: {
    fontSize: 12,
  },
  descriptionCounter: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitContainer: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

