import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Pressable } from 'react-native';
import { ChevronDown, CreditCard, Phone, Star, Hash, User } from 'lucide-react-native';
import { Card, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { AccountSelect } from '../../inputs/AccountSelect';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor } from '../../../../App';
import { formatCurrency } from '../../../lib/utils/format.utils';
import { getAccountIdentifier } from '../../../lib/utils/accounts.utils';
import type { DtoCuenta } from '../../../services/api/accounts.api';
import type { CuentaFavoritaInternaItem } from '../../../hooks/use-local-transfer';
import type { CuentaSinpeFavoritaItem } from '../../../hooks/use-sinpe-transfer';
import type { MonederoFavoritoItem } from '../../../hooks/use-sinpe-movil-transfer';
import type { GetCuentaDestinoInternaResponse, GetCuentaDestinoSinpeResponse, ObtenerMonederoSinpeResponse } from '../../../services/api';

interface AccountSelectionStepProps {
  transferType: 'local' | 'sinpe' | 'sinpe-mobile';
  // Source Account
  selectedSourceAccount: DtoCuenta | null;
  accounts: DtoCuenta[];
  isLoadingAccounts: boolean;
  onSourceAccountSelect: (accountIdentifier: string) => void;
  // Local transfer props
  localDestinationType?: 'favorites' | 'own' | 'manual';
  onLocalDestinationTypeChange?: (value: 'favorites' | 'own' | 'manual') => void;
  selectedFavoriteAccount?: CuentaFavoritaInternaItem | null;
  selectedOwnAccount?: DtoCuenta | null;
  ownAccounts?: DtoCuenta[];
  onOwnAccountSelect?: (accountIdentifier: string) => void;
  destinationIban?: string;
  onDestinationIbanChange?: (value: string) => void;
  destinationFormatError?: string | null;
  isValidatingAccount?: boolean;
  accountValidationError?: string | null;
  validatedAccountInfo?: GetCuentaDestinoInternaResponse | null;
  // SINPE transfer props
  sinpeDestinationType?: 'favorites' | 'manual';
  onSinpeDestinationTypeChange?: (value: 'favorites' | 'manual') => void;
  selectedSinpeFavoriteAccount?: CuentaSinpeFavoritaItem | null;
  sinpeDestinationIban?: string;
  onSinpeDestinationIbanChange?: (value: string) => void;
  sinpeDestinationFormatError?: string | null;
  isValidatingSinpeAccount?: boolean;
  sinpeAccountValidationError?: string | null;
  validatedSinpeAccountInfo?: GetCuentaDestinoSinpeResponse | null;
  // SINPE Móvil transfer props
  sinpeMovilDestinationType?: 'favorites' | 'manual';
  onSinpeMovilDestinationTypeChange?: (value: 'favorites' | 'manual') => void;
  selectedSinpeMovilFavoriteWallet?: MonederoFavoritoItem | null;
  sinpeMovilPhoneNumber?: string;
  onSinpeMovilPhoneChange?: (value: string) => void;
  isValidatingSinpeMovilMonedero?: boolean;
  sinpeMovilMonederoError?: string | null;
  sinpeMovilMonederoInfo?: ObtenerMonederoSinpeResponse | null;
  // Common props
  onDestinationSheetOpen: () => void;
  isLoadingFavorites?: boolean;
}

export default function AccountSelectionStep({
  transferType,
  selectedSourceAccount,
  accounts,
  isLoadingAccounts,
  onSourceAccountSelect,
  localDestinationType,
  onLocalDestinationTypeChange,
  selectedFavoriteAccount,
  selectedOwnAccount,
  ownAccounts = [],
  onOwnAccountSelect,
  destinationIban,
  onDestinationIbanChange,
  destinationFormatError,
  isValidatingAccount,
  accountValidationError,
  validatedAccountInfo,
  sinpeDestinationType,
  onSinpeDestinationTypeChange,
  selectedSinpeFavoriteAccount,
  sinpeDestinationIban,
  onSinpeDestinationIbanChange,
  sinpeDestinationFormatError,
  isValidatingSinpeAccount,
  sinpeAccountValidationError,
  validatedSinpeAccountInfo,
  sinpeMovilDestinationType,
  onSinpeMovilDestinationTypeChange,
  selectedSinpeMovilFavoriteWallet,
  sinpeMovilPhoneNumber,
  onSinpeMovilPhoneChange,
  isValidatingSinpeMovilMonedero,
  sinpeMovilMonederoError,
  sinpeMovilMonederoInfo,
  onDestinationSheetOpen,
  isLoadingFavorites = false,
}: AccountSelectionStepProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const renderLocalDestination = () => {
    if (!localDestinationType || !onLocalDestinationTypeChange) return null;

    const inputBackgroundColor = getInputBackgroundColor(colorScheme);

    return (
      <>
        <View style={styles.field}>
          <Text style={[styles.inputLabel, { color: textColor }]}>
            Cuenta Destino
          </Text>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                localDestinationType === 'favorites' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
              ]}
              onPress={() => onLocalDestinationTypeChange('favorites')}
            >
              <Star 
                size={16} 
                color={localDestinationType === 'favorites' ? '#a61612' : secondaryTextColor} 
              />
              <Text
                style={[
                  styles.tabText,
                  { color: localDestinationType === 'favorites' ? '#a61612' : secondaryTextColor },
                ]}
              >
                Favorita
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                localDestinationType === 'manual' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
              ]}
              onPress={() => onLocalDestinationTypeChange('manual')}
            >
              <Hash 
                size={16} 
                color={localDestinationType === 'manual' ? '#a61612' : secondaryTextColor} 
              />
              <Text
                style={[
                  styles.tabText,
                  { color: localDestinationType === 'manual' ? '#a61612' : secondaryTextColor },
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                localDestinationType === 'own' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
              ]}
              onPress={() => onLocalDestinationTypeChange('own')}
            >
              <User 
                size={16} 
                color={localDestinationType === 'own' ? '#a61612' : secondaryTextColor} 
              />
              <Text
                style={[
                  styles.tabText,
                  { color: localDestinationType === 'own' ? '#a61612' : secondaryTextColor },
                ]}
              >
                Propia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {localDestinationType === 'favorites' && (
          <View style={styles.field}>
            <Pressable
              onPress={onDestinationSheetOpen}
              disabled={isLoadingFavorites}
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressablePressed,
              ]}
            >
              {({ pressed }) => (
                <Card style={styles.card} colorScheme={colorScheme}>
                  <View style={styles.topBorder} />
                  <CardContent style={styles.cardContent}>
                    <View style={styles.topSection}>
                      <View style={styles.iconContainer}>
                        <CreditCard size={20} color="#a61612" />
                      </View>
                      <View style={styles.accountInfo}>
                        <Text style={[styles.label, { color: secondaryTextColor }]}>
                          Cuenta Favorita
                        </Text>
                        <Text
                          style={[
                            styles.accountSelectorText,
                            {
                              color: selectedFavoriteAccount
                                ? textColor
                                : secondaryTextColor,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {selectedFavoriteAccount
                            ? `${selectedFavoriteAccount.titular || 'Sin titular'} - ${selectedFavoriteAccount.numeroCuenta || ''}`
                            : 'Seleccionar cuenta favorita'}
                        </Text>
                      </View>
                      <ChevronDown size={20} color={secondaryTextColor} />
                    </View>
                  </CardContent>
                </Card>
              )}
            </Pressable>
          </View>
        )}

        {localDestinationType === 'own' && (
          <View style={styles.field}>
            <AccountSelect
              accounts={ownAccounts}
              value={selectedOwnAccount ? getAccountIdentifier(selectedOwnAccount) : ''}
              onValueChange={onOwnAccountSelect || (() => {})}
              placeholder="Seleccionar cuenta propia"
              disabled={ownAccounts.length === 0}
            />
          </View>
        )}

        {localDestinationType === 'manual' && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor }]}>
              Número de Cuenta (IBAN)
            </Text>
            <Input
              placeholder="CRXX XXXX XXXX XXXX XXXX XXXX"
              value={destinationIban || ''}
              onChangeText={onDestinationIbanChange}
              keyboardType="default"
              error={destinationFormatError || accountValidationError || undefined}
              leftIcon={<CreditCard size={16} color={secondaryTextColor} />}
            />
            {validatedAccountInfo && (
              <Card style={styles.validatedCard} colorScheme={colorScheme}>
                <View style={styles.topBorder} />
                <CardContent style={styles.cardContent}>
                  <Text style={[styles.validatedText, { color: textColor }]}>
                    Titular: {validatedAccountInfo.titular || 'N/A'}
                  </Text>
                </CardContent>
              </Card>
            )}
          </View>
        )}
      </>
    );
  };

  const renderSinpeDestination = () => {
    if (!sinpeDestinationType || !onSinpeDestinationTypeChange) return null;

    return (
      <>
        <View style={styles.field}>
          <Text style={[styles.inputLabel, { color: textColor }]}>
            Cuenta Destino
          </Text>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                sinpeDestinationType === 'favorites' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
              ]}
              onPress={() => onSinpeDestinationTypeChange('favorites')}
            >
              <Star 
                size={16} 
                color={sinpeDestinationType === 'favorites' ? '#a61612' : secondaryTextColor} 
              />
              <Text
                style={[
                  styles.tabText,
                  { color: sinpeDestinationType === 'favorites' ? '#a61612' : secondaryTextColor },
                ]}
              >
                Favorita
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                sinpeDestinationType === 'manual' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
              ]}
              onPress={() => onSinpeDestinationTypeChange('manual')}
            >
              <Hash 
                size={16} 
                color={sinpeDestinationType === 'manual' ? '#a61612' : secondaryTextColor} 
              />
              <Text
                style={[
                  styles.tabText,
                  { color: sinpeDestinationType === 'manual' ? '#a61612' : secondaryTextColor },
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {sinpeDestinationType === 'favorites' && (
          <View style={styles.field}>
            <Pressable
              onPress={onDestinationSheetOpen}
              disabled={isLoadingFavorites}
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressablePressed,
              ]}
            >
              {({ pressed }) => (
                <Card style={styles.card} colorScheme={colorScheme}>
                  <View style={styles.topBorder} />
                  <CardContent style={styles.cardContent}>
                    <View style={styles.topSection}>
                      <View style={styles.iconContainer}>
                        <CreditCard size={20} color="#a61612" />
                      </View>
                      <View style={styles.accountInfo}>
                        <Text style={[styles.label, { color: secondaryTextColor }]}>
                          Cuenta Favorita SINPE
                        </Text>
                        <Text
                          style={[
                            styles.accountSelectorText,
                            {
                              color: selectedSinpeFavoriteAccount
                                ? textColor
                                : secondaryTextColor,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {selectedSinpeFavoriteAccount
                            ? selectedSinpeFavoriteAccount.numeroCuentaDestino || ''
                            : 'Seleccionar cuenta favorita'}
                        </Text>
                      </View>
                      <ChevronDown size={20} color={secondaryTextColor} />
                    </View>
                  </CardContent>
                </Card>
              )}
            </Pressable>
          </View>
        )}

        {sinpeDestinationType === 'manual' && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor }]}>
              Número de Cuenta (IBAN)
            </Text>
            <Input
              placeholder="CRXX XXXX XXXX XXXX XXXX XXXX"
              value={sinpeDestinationIban || ''}
              onChangeText={onSinpeDestinationIbanChange}
              keyboardType="default"
              error={
                sinpeDestinationFormatError ||
                sinpeAccountValidationError ||
                undefined
              }
              leftIcon={<CreditCard size={16} color={secondaryTextColor} />}
            />
            {validatedSinpeAccountInfo && (
              <Card style={styles.validatedCard} colorScheme={colorScheme}>
                <View style={styles.topBorder} />
                <CardContent style={styles.cardContent}>
                  <Text style={[styles.validatedText, { color: textColor }]}>
                    Titular: {validatedSinpeAccountInfo.titularDestino || 'N/A'}
                  </Text>
                </CardContent>
              </Card>
            )}
          </View>
        )}
      </>
    );
  };

  const renderSinpeMovilDestination = () => {
    if (!sinpeMovilDestinationType || !onSinpeMovilDestinationTypeChange)
      return null;

    return (
      <>
        <View style={styles.field}>
          <Text style={[styles.inputLabel, { color: textColor }]}>
            Cuenta Destino
          </Text>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                sinpeMovilDestinationType === 'favorites' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
              ]}
              onPress={() => onSinpeMovilDestinationTypeChange('favorites')}
            >
              <Star 
                size={16} 
                color={sinpeMovilDestinationType === 'favorites' ? '#a61612' : secondaryTextColor} 
              />
              <Text
                style={[
                  styles.tabText,
                  { color: sinpeMovilDestinationType === 'favorites' ? '#a61612' : secondaryTextColor },
                ]}
              >
                Favorito
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                sinpeMovilDestinationType === 'manual' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
              ]}
              onPress={() => onSinpeMovilDestinationTypeChange('manual')}
            >
              <Hash 
                size={16} 
                color={sinpeMovilDestinationType === 'manual' ? '#a61612' : secondaryTextColor} 
              />
              <Text
                style={[
                  styles.tabText,
                  { color: sinpeMovilDestinationType === 'manual' ? '#a61612' : secondaryTextColor },
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {sinpeMovilDestinationType === 'favorites' && (
          <View style={styles.field}>
            <Pressable
              onPress={onDestinationSheetOpen}
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressablePressed,
              ]}
            >
              {({ pressed }) => (
                <Card style={styles.card} colorScheme={colorScheme}>
                  <View style={styles.topBorder} />
                  <CardContent style={styles.cardContent}>
                    <View style={styles.topSection}>
                      <View style={styles.iconContainer}>
                        <Phone size={20} color="#a61612" />
                      </View>
                      <View style={styles.accountInfo}>
                        <Text style={[styles.label, { color: secondaryTextColor }]}>
                          Monedero Favorito
                        </Text>
                        <Text
                          style={[
                            styles.accountSelectorText,
                            {
                              color: selectedSinpeMovilFavoriteWallet
                                ? textColor
                                : secondaryTextColor,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {selectedSinpeMovilFavoriteWallet
                            ? `${selectedSinpeMovilFavoriteWallet.titular || 'Sin titular'} - ${selectedSinpeMovilFavoriteWallet.monedero || ''}`
                            : 'Seleccionar monedero favorito'}
                        </Text>
                      </View>
                      <ChevronDown size={20} color={secondaryTextColor} />
                    </View>
                  </CardContent>
                </Card>
              )}
            </Pressable>
          </View>
        )}

        {sinpeMovilDestinationType === 'manual' && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor }]}>
              Número de Teléfono
            </Text>
            <Input
              placeholder="12345678"
              value={sinpeMovilPhoneNumber || ''}
              onChangeText={onSinpeMovilPhoneChange}
              keyboardType="phone-pad"
              maxLength={8}
              error={sinpeMovilMonederoError || undefined}
              leftIcon={<Phone size={16} color={secondaryTextColor} />}
            />
            {sinpeMovilMonederoInfo && (
              <Card style={styles.validatedCard} colorScheme={colorScheme}>
                <View style={styles.topBorder} />
                <CardContent style={styles.cardContent}>
                  <Text style={[styles.validatedText, { color: textColor }]}>
                    Titular: {sinpeMovilMonederoInfo.titular || 'N/A'}
                  </Text>
                </CardContent>
              </Card>
            )}
          </View>
        )}
      </>
    );
  };

  const selectedSourceAccountIdentifier = selectedSourceAccount
    ? getAccountIdentifier(selectedSourceAccount)
    : '';

  return (
    <View style={styles.container}>
      {/* Source Account Section */}
      <View style={styles.section}>
        <AccountSelect
          accounts={accounts}
          value={selectedSourceAccountIdentifier}
          onValueChange={onSourceAccountSelect}
          placeholder="Seleccionar cuenta origen"
          disabled={isLoadingAccounts}
          label="Cuenta Origen"
        />
        {selectedSourceAccount && (
          <Card style={styles.infoCard} colorScheme={colorScheme}>
            <View style={styles.topBorder} />
            <CardContent style={styles.cardContent}>
              <View style={styles.balanceSection}>
                <Text style={[styles.balanceLabel, { color: secondaryTextColor }]}>
                  Saldo disponible:
                </Text>
                <Text style={[styles.balanceText, { color: '#a61612' }]}>
                  {formatCurrency(
                    selectedSourceAccount.saldo,
                    selectedSourceAccount.moneda || 'CRC'
                  )}
                </Text>
              </View>
              {(selectedSourceAccount.moneda || selectedSourceAccount.alias) && (
                <View style={styles.accountDetails}>
                  {selectedSourceAccount.moneda && (
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                      Moneda: {selectedSourceAccount.moneda}
                    </Text>
                  )}
                  {selectedSourceAccount.alias && (
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                      Alias: {selectedSourceAccount.alias}
                    </Text>
                  )}
                </View>
              )}
            </CardContent>
          </Card>
        )}
      </View>

      {/* Destination Account Section */}
      {selectedSourceAccount && (
        <View style={styles.section}>
          {transferType === 'local' && renderLocalDestination()}
          {transferType === 'sinpe' && renderSinpeDestination()}
          {transferType === 'sinpe-mobile' && renderSinpeMovilDestination()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  pressable: {
    marginBottom: 0,
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
  },
  card: {
    marginBottom: 0,
    overflow: 'hidden',
  },
  topBorder: {
    height: 4,
    backgroundColor: '#a61612',
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a61612',
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    flexShrink: 0,
  },
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  accountSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginBottom: 8,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  balanceLabel: {
    fontSize: 13,
    opacity: 0.8,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountDetails: {
    marginTop: 8,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    opacity: 0.8,
  },
  validatedCard: {
    marginTop: 12,
    marginBottom: 0,
    overflow: 'hidden',
  },
  validatedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    marginTop: 12,
    marginBottom: 0,
    overflow: 'hidden',
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
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

