import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useColorScheme } from 'react-native';
import { ChevronDown, CreditCard, User, Mail, Send, Loader2 } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SelectInput } from '../inputs/SelectInput';
import { formatCurrency } from '../../lib/utils/format.utils';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';
import { TRANSFER_LOCAL_FORM_TEXT } from '../../constants/transfers.constants';
import { useInternalTransfersStore } from '../../lib/states/internalTransfers.store';
import type { DtoCuenta } from '../../services/api/accounts.api';
import type { GetCuentaDestinoInternaResponse } from '../../services/api';
import type { CuentaFavoritaInternaItem } from '../../hooks/use-local-transfer';

interface TransferLocalFormProps {
  selectedSourceAccount: DtoCuenta | null;
  isLoadingAccounts: boolean;
  onSourceAccountClick: () => void;
  destinationType: "favorites" | "own" | "manual";
  onDestinationTypeChange: (value: "favorites" | "own" | "manual") => void;
  selectedFavoriteAccount: CuentaFavoritaInternaItem | null;
  filteredFavorites: CuentaFavoritaInternaItem[];
  onDestinationSheetOpen: () => void;
  selectedOwnAccount: DtoCuenta | null;
  destinationIban: string;
  onDestinationIbanChange: (value: string) => void;
  destinationFormatError: string | null;
  isValidatingAccount: boolean;
  accountValidationError: string | null;
  validatedAccountInfo: GetCuentaDestinoInternaResponse | null;
  amount: string;
  amountError: string | null;
  onAmountChange: (value: string) => void;
  onAmountKeyDown: (e: any) => void;
  email: string;
  emailError: string | null;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isFormValid: () => boolean;
  onSubmit: () => void;
  isLoadingFavoriteAccounts?: boolean;
  favoriteAccounts?: CuentaFavoritaInternaItem[];
}

export default function TransferLocalForm({
  selectedSourceAccount,
  isLoadingAccounts,
  onSourceAccountClick,
  destinationType,
  onDestinationTypeChange,
  selectedFavoriteAccount,
  filteredFavorites,
  onDestinationSheetOpen,
  selectedOwnAccount,
  destinationIban,
  onDestinationIbanChange,
  destinationFormatError,
  isValidatingAccount,
  accountValidationError,
  validatedAccountInfo,
  amount,
  amountError,
  onAmountChange,
  onAmountKeyDown,
  email,
  emailError,
  onEmailChange,
  onEmailBlur,
  description,
  onDescriptionChange,
  isFormValid,
  onSubmit,
  isLoadingFavoriteAccounts = false,
  favoriteAccounts = [],
}: TransferLocalFormProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const { isSending } = useInternalTransfersStore();

  const destinationTypeOptions = [
    { value: "favorites", label: TRANSFER_LOCAL_FORM_TEXT.destinationType.options.favorites },
    { value: "manual", label: TRANSFER_LOCAL_FORM_TEXT.destinationType.options.manual },
    { value: "own", label: TRANSFER_LOCAL_FORM_TEXT.destinationType.options.own },
  ];

  const currencySymbol = selectedSourceAccount?.moneda === "USD" ? "$" : "₡";
  const amountNum = parseFloat(amount) || 0;
  const exceedsBalance = selectedSourceAccount && amountNum > selectedSourceAccount.saldo;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Source Account */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>
            {TRANSFER_LOCAL_FORM_TEXT.sourceAccount.label}
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
                ? TRANSFER_LOCAL_FORM_TEXT.sourceAccount.placeholder.loading
                : selectedSourceAccount
                ? selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || ""
                : TRANSFER_LOCAL_FORM_TEXT.sourceAccount.placeholder.select}
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
            {/* Destination Type */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>
                {TRANSFER_LOCAL_FORM_TEXT.destinationType.label}
              </Text>
              <SelectInput
                options={destinationTypeOptions}
                value={destinationType}
                onValueChange={onDestinationTypeChange}
                placeholder="Seleccionar tipo"
              />
            </View>

            {/* Favorites Section */}
            {destinationType === "favorites" && (
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {TRANSFER_LOCAL_FORM_TEXT.destinationFavorites.label}
                    </Text>
                    <TouchableOpacity
                      onPress={onDestinationSheetOpen}
                      style={[
                        styles.accountSelector,
                        { backgroundColor: inputBackgroundColor, borderColor },
                      ]}
                      disabled={isLoadingFavoriteAccounts}
                    >
                      <Text
                        style={[
                          styles.accountSelectorText,
                          { color: selectedFavoriteAccount ? textColor : secondaryTextColor },
                        ]}
                        numberOfLines={1}
                      >
                        {isLoadingFavoriteAccounts
                          ? TRANSFER_LOCAL_FORM_TEXT.destinationFavorites.placeholder.loading
                          : selectedFavoriteAccount
                          ? `${selectedFavoriteAccount.titular || "Sin titular"} - ${selectedFavoriteAccount.numeroCuenta || ""}`
                          : TRANSFER_LOCAL_FORM_TEXT.destinationFavorites.placeholder.select}
                      </Text>
                      <ChevronDown size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                    {filteredFavorites.length === 0 && !isLoadingFavoriteAccounts && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {favoriteAccounts.length === 0
                          ? TRANSFER_LOCAL_FORM_TEXT.destinationFavorites.emptyMessage.noFavorites
                          : TRANSFER_LOCAL_FORM_TEXT.destinationFavorites.emptyMessage.noMatchingCurrency(selectedSourceAccount.moneda || "CRC")}
                      </Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label={TRANSFER_LOCAL_FORM_TEXT.destinationFavorites.recipientLabel}
                      placeholder={TRANSFER_LOCAL_FORM_TEXT.destinationFavorites.recipientPlaceholder}
                      value={selectedFavoriteAccount?.titular || ""}
                      onChangeText={() => {}}
                      editable={false}
                      leftIcon={<User size={16} color={secondaryTextColor} />}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Manual Section */}
            {destinationType === "manual" && (
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {TRANSFER_LOCAL_FORM_TEXT.destinationManual.label}
                    </Text>
                    <Input
                      placeholder={TRANSFER_LOCAL_FORM_TEXT.destinationManual.placeholder}
                      value={destinationIban}
                      onChangeText={onDestinationIbanChange}
                      keyboardType="default"
                      error={destinationFormatError || accountValidationError || undefined}
                      leftIcon={<CreditCard size={16} color={secondaryTextColor} />}
                      rightIcon={isValidatingAccount ? <Loader2 size={16} color={secondaryTextColor} /> : undefined}
                    />
                    {isValidatingAccount && !destinationFormatError && !accountValidationError && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {TRANSFER_LOCAL_FORM_TEXT.destinationManual.validating}
                      </Text>
                    )}
                    {!isValidatingAccount && !destinationFormatError && !accountValidationError && !validatedAccountInfo && destinationIban && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {TRANSFER_LOCAL_FORM_TEXT.destinationManual.completeIban}
                      </Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label={TRANSFER_LOCAL_FORM_TEXT.destinationManual.recipientLabel}
                      placeholder={TRANSFER_LOCAL_FORM_TEXT.destinationManual.recipientPlaceholder}
                      value={validatedAccountInfo?.titular || validatedAccountInfo?.numeroCuenta || ""}
                      onChangeText={() => {}}
                      editable={false}
                      leftIcon={<User size={16} color={secondaryTextColor} />}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Own Section */}
            {destinationType === "own" && (
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {TRANSFER_LOCAL_FORM_TEXT.destinationOwn.label}
                    </Text>
                    <TouchableOpacity
                      onPress={onDestinationSheetOpen}
                      style={[
                        styles.accountSelector,
                        { backgroundColor: inputBackgroundColor, borderColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.accountSelectorText,
                          { color: selectedOwnAccount ? textColor : secondaryTextColor },
                        ]}
                        numberOfLines={1}
                      >
                        {selectedOwnAccount
                          ? selectedOwnAccount.numeroCuentaIban || selectedOwnAccount.numeroCuenta || ""
                          : TRANSFER_LOCAL_FORM_TEXT.destinationOwn.placeholder}
                      </Text>
                      <ChevronDown size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label={TRANSFER_LOCAL_FORM_TEXT.destinationOwn.recipientLabel}
                      placeholder={TRANSFER_LOCAL_FORM_TEXT.destinationOwn.recipientPlaceholder}
                      value={selectedOwnAccount?.alias || ""}
                      onChangeText={() => {}}
                      editable={false}
                      leftIcon={<User size={16} color={secondaryTextColor} />}
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
                    {TRANSFER_LOCAL_FORM_TEXT.amount.label} <Text style={styles.required}>*</Text>
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
                          borderColor: amountError || exceedsBalance ? '#991b1b' : borderColor,
                          color: textColor,
                        },
                      ]}
                      placeholder={TRANSFER_LOCAL_FORM_TEXT.amount.placeholder}
                      placeholderTextColor={secondaryTextColor}
                      value={amount}
                      onChangeText={onAmountChange}
                      keyboardType="numeric"
                      editable={
                        !(
                          (destinationType === "favorites" && !selectedFavoriteAccount) ||
                          (destinationType === "manual" && !validatedAccountInfo) ||
                          (destinationType === "own" && !selectedOwnAccount)
                        )
                      }
                    />
                  </View>
                  {exceedsBalance && (
                    <Text style={styles.errorText}>
                      {TRANSFER_LOCAL_FORM_TEXT.amount.exceedsBalance}
                    </Text>
                  )}
                  {amountError && <Text style={styles.errorText}>{amountError}</Text>}
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label={TRANSFER_LOCAL_FORM_TEXT.email.label}
                    placeholder={TRANSFER_LOCAL_FORM_TEXT.email.placeholder}
                    value={email}
                    onChangeText={onEmailChange}
                    onBlur={onEmailBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={emailError || undefined}
                    leftIcon={<Mail size={16} color={secondaryTextColor} />}
                    editable={destinationType === "manual" && !!validatedAccountInfo}
                  />
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>
                {TRANSFER_LOCAL_FORM_TEXT.description.label}{' '}
                <Text style={styles.required}>{TRANSFER_LOCAL_FORM_TEXT.description.required}</Text>
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
                placeholder={TRANSFER_LOCAL_FORM_TEXT.description.placeholder}
                placeholderTextColor={secondaryTextColor}
                value={description}
                onChangeText={onDescriptionChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={255}
              />
              <View style={styles.descriptionFooter}>
                <Text
                  style={[
                    styles.descriptionHelper,
                    { color: description.trim().length < 15 ? '#dc2626' : secondaryTextColor },
                  ]}
                >
                  Mínimo 15 caracteres
                </Text>
                <Text style={[styles.descriptionCounter, { color: secondaryTextColor }]}>
                  {description.length}/255
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <Button
                onPress={onSubmit}
                disabled={!isFormValid() || exceedsBalance || isSending}
                loading={isSending}
                size="lg"
              >
                {!isSending && (
                  <View style={styles.buttonContent}>
                    <Send size={20} color="#ffffff" />
                    <Text style={styles.buttonText}>
                      {TRANSFER_LOCAL_FORM_TEXT.submit.send}
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

