import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useColorScheme } from 'react-native';
import { ChevronDown, Phone, Mail, Send, Loader2 } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SelectInput } from '../inputs/SelectInput';
import { formatCurrency } from '../../lib/utils/format.utils';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../App';
import { TRANSFER_SINPE_MOVIL_FORM_TEXT } from '../../constants/transfers.constants';
import { useSinpeMovilTransfersStore } from '../../lib/states/sinpeMovilTransfers.store';
import type { DtoCuenta } from '../../services/api/accounts.api';
import type { ObtenerMonederoSinpeResponse } from '../../services/api';
import type { MonederoFavoritoItem } from '../../hooks/use-sinpe-movil-transfer';

interface TransferSinpeMovilFormProps {
  selectedSourceAccount: DtoCuenta | null;
  isLoadingAccounts: boolean;
  onSourceAccountClick: () => void;
  sinpeMovilDestinationType: "favorites" | "manual";
  onSinpeMovilDestinationTypeChange: (value: "favorites" | "manual") => void;
  selectedSinpeMovilFavoriteWallet: MonederoFavoritoItem | null;
  filteredSinpeMovilFavoriteWallets: MonederoFavoritoItem[];
  favoriteWallets: MonederoFavoritoItem[];
  onDestinationSheetOpen: () => void;
  sinpeMovilPhoneNumber: string;
  onSinpeMovilPhoneChange: (value: string) => void;
  isValidatingSinpeMovilMonedero: boolean;
  sinpeMovilMonederoError: string | null;
  sinpeMovilMonederoInfo: ObtenerMonederoSinpeResponse | null;
  sinpeMovilAmount: string;
  sinpeMovilAmountError: string | null;
  onSinpeMovilAmountChange: (value: string) => void;
  onAmountKeyDown: (e: any) => void;
  sinpeMovilEmail: string;
  sinpeMovilEmailError: string | null;
  onSinpeMovilEmailChange: (value: string) => void;
  sinpeMovilDescription: string;
  onSinpeMovilDescriptionChange: (value: string) => void;
  isSinpeMovilFormValid: () => boolean;
  onSubmit: () => void;
}

export default function TransferSinpeMovilForm({
  selectedSourceAccount,
  isLoadingAccounts,
  onSourceAccountClick,
  sinpeMovilDestinationType,
  onSinpeMovilDestinationTypeChange,
  selectedSinpeMovilFavoriteWallet,
  filteredSinpeMovilFavoriteWallets,
  favoriteWallets,
  onDestinationSheetOpen,
  sinpeMovilPhoneNumber,
  onSinpeMovilPhoneChange,
  isValidatingSinpeMovilMonedero,
  sinpeMovilMonederoError,
  sinpeMovilMonederoInfo,
  sinpeMovilAmount,
  sinpeMovilAmountError,
  onSinpeMovilAmountChange,
  onAmountKeyDown,
  sinpeMovilEmail,
  sinpeMovilEmailError,
  onSinpeMovilEmailChange,
  sinpeMovilDescription,
  onSinpeMovilDescriptionChange,
  isSinpeMovilFormValid,
  onSubmit,
}: TransferSinpeMovilFormProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const { isSending } = useSinpeMovilTransfersStore();

  const destinationTypeOptions = [
    { value: "favorites", label: TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationType.options.favorites },
    { value: "manual", label: TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationType.options.manual },
  ];

  const amountNum = parseFloat(sinpeMovilAmount) || 0;
  const exceedsBalance = selectedSourceAccount && amountNum > selectedSourceAccount.saldo;
  const accountCurrency = selectedSourceAccount?.moneda || "CRC";
  const isInvalidCurrency = accountCurrency !== "CRC";

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Source Account */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>
            {TRANSFER_SINPE_MOVIL_FORM_TEXT.sourceAccount.label}
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
                ? TRANSFER_SINPE_MOVIL_FORM_TEXT.sourceAccount.placeholder.loading
                : selectedSourceAccount
                ? selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || ""
                : TRANSFER_SINPE_MOVIL_FORM_TEXT.sourceAccount.placeholder.select}
            </Text>
            {selectedSourceAccount && (
              <Text style={[styles.balanceText, { color: '#a61612' }]}>
                {formatCurrency(selectedSourceAccount.saldo, selectedSourceAccount.moneda || "CRC")}
              </Text>
            )}
            <ChevronDown size={20} color={secondaryTextColor} />
          </TouchableOpacity>
          {isInvalidCurrency && (
            <Text style={styles.errorText}>
              SINPE Móvil solo permite cuentas en colones (CRC)
            </Text>
          )}
        </View>

        {selectedSourceAccount && !isInvalidCurrency && (
          <>
            {/* Destination Type */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>
                {TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationType.label}
              </Text>
              <SelectInput
                options={destinationTypeOptions}
                value={sinpeMovilDestinationType}
                onValueChange={onSinpeMovilDestinationTypeChange}
                placeholder="Seleccionar tipo"
              />
            </View>

            {/* Favorites Section */}
            {sinpeMovilDestinationType === "favorites" && (
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationFavorites.label}
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
                          { color: selectedSinpeMovilFavoriteWallet ? textColor : secondaryTextColor },
                        ]}
                        numberOfLines={1}
                      >
                        {selectedSinpeMovilFavoriteWallet
                          ? `${selectedSinpeMovilFavoriteWallet.titular || "Sin titular"} - ${selectedSinpeMovilFavoriteWallet.monedero || ""}`
                          : TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationFavorites.placeholder.select}
                      </Text>
                      <ChevronDown size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                    {filteredSinpeMovilFavoriteWallets.length === 0 && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {favoriteWallets.length === 0
                          ? "No tienes favoritas SINPE Móvil. Puedes agregar una desde el menú de Cuentas Favoritas."
                          : "No se encontraron favoritas SINPE Móvil que coincidan con tu búsqueda."}
                      </Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label="Destinatario"
                      placeholder={TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationFavorites.recipientPlaceholder}
                      value={selectedSinpeMovilFavoriteWallet?.titular || ""}
                      onChangeText={() => {}}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Manual Section */}
            {sinpeMovilDestinationType === "manual" && (
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationManual.label}
                    </Text>
                    <Input
                      placeholder={TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationManual.placeholder}
                      value={sinpeMovilPhoneNumber}
                      onChangeText={onSinpeMovilPhoneChange}
                      keyboardType="phone-pad"
                      maxLength={8}
                      error={sinpeMovilMonederoError || undefined}
                      leftIcon={<Phone size={16} color={secondaryTextColor} />}
                      rightIcon={isValidatingSinpeMovilMonedero ? <Loader2 size={16} color={secondaryTextColor} /> : undefined}
                    />
                    {isValidatingSinpeMovilMonedero && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationManual.validating}
                      </Text>
                    )}
                    {!isValidatingSinpeMovilMonedero && !sinpeMovilMonederoError && !sinpeMovilMonederoInfo && sinpeMovilPhoneNumber && sinpeMovilPhoneNumber.length < 8 && (
                      <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                        {TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationManual.completeNumber}
                      </Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label="Destinatario"
                      placeholder={TRANSFER_SINPE_MOVIL_FORM_TEXT.destinationManual.recipientPlaceholder}
                      value={sinpeMovilMonederoInfo?.titular || ""}
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
                    {TRANSFER_SINPE_MOVIL_FORM_TEXT.amount.label} <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.amountContainer}>
                    <Text style={[styles.currencySymbol, { color: secondaryTextColor }]}>
                      ₡
                    </Text>
                    <TextInput
                      style={[
                        styles.amountInput,
                        {
                          backgroundColor: inputBackgroundColor,
                          borderColor: sinpeMovilAmountError || exceedsBalance ? '#991b1b' : borderColor,
                          color: textColor,
                        },
                      ]}
                      placeholder={TRANSFER_SINPE_MOVIL_FORM_TEXT.amount.placeholder}
                      placeholderTextColor={secondaryTextColor}
                      value={sinpeMovilAmount}
                      onChangeText={onSinpeMovilAmountChange}
                      keyboardType="numeric"
                      editable={
                        !(
                          (sinpeMovilDestinationType === "favorites" && !selectedSinpeMovilFavoriteWallet) ||
                          (sinpeMovilDestinationType === "manual" && !sinpeMovilMonederoInfo)
                        )
                      }
                    />
                  </View>
                  {exceedsBalance && (
                    <Text style={styles.errorText}>
                      {TRANSFER_SINPE_MOVIL_FORM_TEXT.amount.exceedsBalance}
                    </Text>
                  )}
                  {sinpeMovilAmountError && <Text style={styles.errorText}>{sinpeMovilAmountError}</Text>}
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label={TRANSFER_SINPE_MOVIL_FORM_TEXT.email.label}
                    placeholder={TRANSFER_SINPE_MOVIL_FORM_TEXT.email.placeholder}
                    value={sinpeMovilEmail}
                    onChangeText={onSinpeMovilEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={sinpeMovilEmailError || undefined}
                    leftIcon={<Mail size={16} color={secondaryTextColor} />}
                    editable={sinpeMovilDestinationType === "favorites" || (sinpeMovilDestinationType === "manual" && !!sinpeMovilMonederoInfo)}
                  />
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>
                {TRANSFER_SINPE_MOVIL_FORM_TEXT.description.label}
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
                placeholder={TRANSFER_SINPE_MOVIL_FORM_TEXT.description.placeholder}
                placeholderTextColor={secondaryTextColor}
                value={sinpeMovilDescription}
                onChangeText={onSinpeMovilDescriptionChange}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={20}
              />
              <View style={styles.descriptionFooter}>
                <Text style={[styles.descriptionCounter, { color: secondaryTextColor }]}>
                  {sinpeMovilDescription.length}/20
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <Button
                onPress={onSubmit}
                disabled={!isSinpeMovilFormValid() || exceedsBalance || isSending}
                loading={isSending}
                size="lg"
              >
                {!isSending && (
                  <View style={styles.buttonContent}>
                    <Send size={20} color="#ffffff" />
                    <Text style={styles.buttonText}>
                      {TRANSFER_SINPE_MOVIL_FORM_TEXT.submit.send}
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
    minHeight: 60,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
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

