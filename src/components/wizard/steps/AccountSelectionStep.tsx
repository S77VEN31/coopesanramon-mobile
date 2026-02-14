import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Pressable, Modal, FlatList } from 'react-native';
import { ChevronDown, CreditCard, Phone, Star, Hash, User, ArrowUpRight, ArrowDownLeft, Clock, Clock3, X } from 'lucide-react-native';
import { Card, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { AccountSelect } from '../../inputs/AccountSelect';
import { getTextColor, getSecondaryTextColor, getBorderColor, getInputBackgroundColor, getCardBackgroundColor } from '../../../../App';
import { formatCurrency, formatIBAN } from '../../../lib/utils/format.utils';
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
  localFavoriteAccounts?: CuentaFavoritaInternaItem[];
  onLocalFavoriteSelect?: (account: CuentaFavoritaInternaItem) => void;
  selectedOwnAccount?: DtoCuenta | null;
  ownAccounts?: DtoCuenta[];
  onOwnAccountSelect?: (accountIdentifier: string) => void;
  destinationIban?: string;
  onDestinationIbanChange?: (value: string) => void;
  destinationFormatError?: string | null;
  isValidatingAccount?: boolean;
  accountValidationError?: string | null;
  validatedAccountInfo?: GetCuentaDestinoInternaResponse | null;
  // SINPE flow type props
  sinpeFlowType?: 'enviar-fondos' | 'recibir-fondos';
  onSinpeFlowTypeChange?: (value: 'enviar-fondos' | 'recibir-fondos') => void;
  sinpeTransferType?: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null;
  onSinpeTransferTypeChange?: (value: 'pagos-inmediatos' | 'creditos-directos') => void;
  // SINPE transfer props
  sinpeDestinationType?: 'favorites' | 'manual';
  onSinpeDestinationTypeChange?: (value: 'favorites' | 'manual') => void;
  selectedSinpeFavoriteAccount?: CuentaSinpeFavoritaItem | null;
  sinpeFavoriteAccounts?: CuentaSinpeFavoritaItem[];
  onSinpeFavoriteSelect?: (account: CuentaSinpeFavoritaItem) => void;
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
  sinpeMovilFavoriteWallets?: MonederoFavoritoItem[];
  onSinpeMovilFavoriteSelect?: (wallet: MonederoFavoritoItem) => void;
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
  localFavoriteAccounts = [],
  onLocalFavoriteSelect,
  selectedOwnAccount,
  ownAccounts = [],
  onOwnAccountSelect,
  destinationIban,
  onDestinationIbanChange,
  destinationFormatError,
  isValidatingAccount,
  accountValidationError,
  validatedAccountInfo,
  sinpeFlowType,
  onSinpeFlowTypeChange,
  sinpeTransferType,
  onSinpeTransferTypeChange,
  sinpeDestinationType,
  onSinpeDestinationTypeChange,
  selectedSinpeFavoriteAccount,
  sinpeFavoriteAccounts = [],
  onSinpeFavoriteSelect,
  sinpeDestinationIban,
  onSinpeDestinationIbanChange,
  sinpeDestinationFormatError,
  isValidatingSinpeAccount,
  sinpeAccountValidationError,
  validatedSinpeAccountInfo,
  sinpeMovilDestinationType,
  onSinpeMovilDestinationTypeChange,
  selectedSinpeMovilFavoriteWallet,
  sinpeMovilFavoriteWallets = [],
  onSinpeMovilFavoriteSelect,
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
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);
  const [localFavModalVisible, setLocalFavModalVisible] = useState(false);
  const [sinpeFavModalVisible, setSinpeFavModalVisible] = useState(false);
  const [sinpeMovilFavModalVisible, setSinpeMovilFavModalVisible] = useState(false);

  const renderLocalDestination = () => {
    if (!localDestinationType || !onLocalDestinationTypeChange) return null;

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
            <TouchableOpacity
              onPress={() => setLocalFavModalVisible(true)}
              disabled={isLoadingFavorites || localFavoriteAccounts.length === 0}
              style={[
                styles.dropdownTrigger,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: (isLoadingFavorites || localFavoriteAccounts.length === 0) ? borderColor + '80' : borderColor,
                  opacity: (isLoadingFavorites || localFavoriteAccounts.length === 0) ? 0.5 : 1,
                },
              ]}
            >
              <View style={styles.dropdownTriggerContent}>
                {selectedFavoriteAccount ? (
                  <View style={styles.dropdownSelected}>
                    <CreditCard size={16} color="#a61612" />
                    <Text style={[styles.dropdownSelectedText, { color: textColor }]} numberOfLines={1}>
                      {formatIBAN(selectedFavoriteAccount.numeroCuenta) || selectedFavoriteAccount.numeroCuenta || ''}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.dropdownPlaceholder, { color: secondaryTextColor }]}>
                    Seleccionar cuenta favorita
                  </Text>
                )}
                <ChevronDown size={20} color={secondaryTextColor} />
              </View>
            </TouchableOpacity>

            {selectedFavoriteAccount && (
              <View style={styles.favInfoRow}>
                <Text style={[styles.favInfoText, { color: secondaryTextColor }]}>
                  Titular: {selectedFavoriteAccount.titular || 'N/A'}
                </Text>
              </View>
            )}

            <Modal
              visible={localFavModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setLocalFavModalVisible(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: '#a61612' }]}>
                      Seleccionar Cuenta Favorita
                    </Text>
                    <TouchableOpacity
                      onPress={() => setLocalFavModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color={textColor} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalListContainer}>
                    <FlatList
                      data={localFavoriteAccounts}
                      keyExtractor={(item) => item.id?.toString() || item.numeroCuenta || ''}
                      style={styles.flatList}
                      contentContainerStyle={styles.flatListContent}
                      renderItem={({ item }) => {
                        const isSelected = selectedFavoriteAccount?.numeroCuenta === item.numeroCuenta;
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              onLocalFavoriteSelect?.(item);
                              setLocalFavModalVisible(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              isSelected && { backgroundColor: '#a61612' + '15' },
                              { borderBottomColor: borderColor + '30' },
                            ]}
                          >
                            <View style={styles.dropdownItemContent}>
                              <View style={styles.dropdownItemHeader}>
                                <CreditCard size={18} color={isSelected ? '#a61612' : secondaryTextColor} />
                                <View style={styles.dropdownItemText}>
                                  <Text
                                    style={[
                                      styles.dropdownItemAccount,
                                      { color: isSelected ? '#a61612' : textColor },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {formatIBAN(item.numeroCuenta) || item.numeroCuenta || 'Sin número'}
                                  </Text>
                                  {item.titular && (
                                    <Text
                                      style={[
                                        styles.dropdownItemSubtext,
                                        { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {item.titular}
                                    </Text>
                                  )}
                                  {item.alias && (
                                    <Text
                                      style={[
                                        styles.dropdownItemSubtext,
                                        { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {item.alias}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                            No hay cuentas favoritas disponibles
                          </Text>
                        </View>
                      }
                    />
                  </View>
                </View>
              </View>
            </Modal>
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

  const getInfoBoxMessage = () => {
    if (sinpeTransferType === 'pagos-inmediatos') {
      return 'Los 365 días del año con aplicación inmediata entre las 7:00am y las 10:00pm.';
    }
    if (sinpeTransferType === 'creditos-directos') {
      return 'Lunes a viernes: solicitudes antes de las 2:00pm se acreditan el mismo día. Después de las 2:00pm, sábados, domingos y feriados se acreditan el siguiente día hábil.';
    }
    if (sinpeTransferType === 'debitos-tiempo-real') {
      return 'Los 365 días del año con aplicación inmediata entre las 7:00am y las 10:00pm.';
    }
    return null;
  };

  const renderSinpeDestination = () => {
    if (!sinpeDestinationType || !onSinpeDestinationTypeChange) return null;

    const destinationLabel = sinpeFlowType === 'recibir-fondos'
      ? 'Cuenta origen del débito'
      : 'Cuenta Destino';

    return (
      <>
        {/* SINPE Flow Type Tabs */}
        {onSinpeFlowTypeChange && (
          <View style={styles.field}>
            <Text style={[styles.inputLabel, { color: textColor }]}>
              Tipo de operación
            </Text>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  sinpeFlowType === 'enviar-fondos' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
                ]}
                onPress={() => onSinpeFlowTypeChange('enviar-fondos')}
              >
                <ArrowUpRight
                  size={16}
                  color={sinpeFlowType === 'enviar-fondos' ? '#a61612' : secondaryTextColor}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: sinpeFlowType === 'enviar-fondos' ? '#a61612' : secondaryTextColor },
                  ]}
                >
                  Enviar fondos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  sinpeFlowType === 'recibir-fondos' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
                ]}
                onPress={() => onSinpeFlowTypeChange('recibir-fondos')}
              >
                <ArrowDownLeft
                  size={16}
                  color={sinpeFlowType === 'recibir-fondos' ? '#a61612' : secondaryTextColor}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: sinpeFlowType === 'recibir-fondos' ? '#a61612' : secondaryTextColor },
                  ]}
                >
                  Traer fondos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Execution Type Tabs (only for enviar-fondos) */}
        {sinpeFlowType === 'enviar-fondos' && onSinpeTransferTypeChange && (
          <View style={styles.field}>
            <Text style={[styles.inputLabel, { color: textColor }]}>
              Tipo de ejecución
            </Text>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  sinpeTransferType === 'pagos-inmediatos' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
                ]}
                onPress={() => onSinpeTransferTypeChange('pagos-inmediatos')}
              >
                <Clock
                  size={16}
                  color={sinpeTransferType === 'pagos-inmediatos' ? '#a61612' : secondaryTextColor}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: sinpeTransferType === 'pagos-inmediatos' ? '#a61612' : secondaryTextColor },
                  ]}
                >
                  Tiempo real
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  sinpeTransferType === 'creditos-directos' && { borderBottomColor: '#a61612', borderBottomWidth: 2 },
                ]}
                onPress={() => onSinpeTransferTypeChange('creditos-directos')}
              >
                <Clock3
                  size={16}
                  color={sinpeTransferType === 'creditos-directos' ? '#a61612' : secondaryTextColor}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: sinpeTransferType === 'creditos-directos' ? '#a61612' : secondaryTextColor },
                  ]}
                >
                  Diferido
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info Box */}
        {sinpeTransferType && getInfoBoxMessage() && (
          <View style={styles.infoBox}>
            <Clock size={16} color="#a61612" style={styles.infoBoxIcon} />
            <Text style={styles.infoBoxText}>{getInfoBoxMessage()}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={[styles.inputLabel, { color: textColor }]}>
            {destinationLabel}
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
            <TouchableOpacity
              onPress={() => setSinpeFavModalVisible(true)}
              disabled={isLoadingFavorites || sinpeFavoriteAccounts.length === 0}
              style={[
                styles.dropdownTrigger,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: (isLoadingFavorites || sinpeFavoriteAccounts.length === 0) ? borderColor + '80' : borderColor,
                  opacity: (isLoadingFavorites || sinpeFavoriteAccounts.length === 0) ? 0.5 : 1,
                },
              ]}
            >
              <View style={styles.dropdownTriggerContent}>
                {selectedSinpeFavoriteAccount ? (
                  <View style={styles.dropdownSelected}>
                    <CreditCard size={16} color="#a61612" />
                    <Text style={[styles.dropdownSelectedText, { color: textColor }]} numberOfLines={1}>
                      {formatIBAN(selectedSinpeFavoriteAccount.numeroCuentaDestino) || selectedSinpeFavoriteAccount.numeroCuentaDestino || ''}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.dropdownPlaceholder, { color: secondaryTextColor }]}>
                    Seleccionar cuenta favorita
                  </Text>
                )}
                <ChevronDown size={20} color={secondaryTextColor} />
              </View>
            </TouchableOpacity>

            {selectedSinpeFavoriteAccount && (
              <View style={styles.favInfoRow}>
                <Text style={[styles.favInfoText, { color: secondaryTextColor }]}>
                  Titular: {selectedSinpeFavoriteAccount.titularDestino || 'N/A'}
                </Text>
              </View>
            )}

            <Modal
              visible={sinpeFavModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setSinpeFavModalVisible(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: '#a61612' }]}>
                      Seleccionar Cuenta Favorita
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSinpeFavModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color={textColor} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalListContainer}>
                    <FlatList
                      data={sinpeFavoriteAccounts}
                      keyExtractor={(item) => item.id?.toString() || item.numeroCuentaDestino || ''}
                      style={styles.flatList}
                      contentContainerStyle={styles.flatListContent}
                      renderItem={({ item }) => {
                        const isSelected = selectedSinpeFavoriteAccount?.numeroCuentaDestino === item.numeroCuentaDestino;
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              onSinpeFavoriteSelect?.(item);
                              setSinpeFavModalVisible(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              isSelected && { backgroundColor: '#a61612' + '15' },
                              { borderBottomColor: borderColor + '30' },
                            ]}
                          >
                            <View style={styles.dropdownItemContent}>
                              <View style={styles.dropdownItemHeader}>
                                <CreditCard size={18} color={isSelected ? '#a61612' : secondaryTextColor} />
                                <View style={styles.dropdownItemText}>
                                  <Text
                                    style={[
                                      styles.dropdownItemAccount,
                                      { color: isSelected ? '#a61612' : textColor },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {formatIBAN(item.numeroCuentaDestino) || item.numeroCuentaDestino || 'Sin número'}
                                  </Text>
                                  {item.titularDestino && (
                                    <Text
                                      style={[
                                        styles.dropdownItemSubtext,
                                        { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {item.titularDestino}
                                    </Text>
                                  )}
                                  {item.alias && (
                                    <Text
                                      style={[
                                        styles.dropdownItemSubtext,
                                        { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {item.alias}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                            No hay cuentas favoritas disponibles
                          </Text>
                        </View>
                      }
                    />
                  </View>
                </View>
              </View>
            </Modal>
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
            <TouchableOpacity
              onPress={() => setSinpeMovilFavModalVisible(true)}
              disabled={isLoadingFavorites || sinpeMovilFavoriteWallets.length === 0}
              style={[
                styles.dropdownTrigger,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: (isLoadingFavorites || sinpeMovilFavoriteWallets.length === 0) ? borderColor + '80' : borderColor,
                  opacity: (isLoadingFavorites || sinpeMovilFavoriteWallets.length === 0) ? 0.5 : 1,
                },
              ]}
            >
              <View style={styles.dropdownTriggerContent}>
                {selectedSinpeMovilFavoriteWallet ? (
                  <View style={styles.dropdownSelected}>
                    <Phone size={16} color="#a61612" />
                    <Text style={[styles.dropdownSelectedText, { color: textColor }]} numberOfLines={1}>
                      {selectedSinpeMovilFavoriteWallet.monedero || ''}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.dropdownPlaceholder, { color: secondaryTextColor }]}>
                    Seleccionar monedero favorito
                  </Text>
                )}
                <ChevronDown size={20} color={secondaryTextColor} />
              </View>
            </TouchableOpacity>

            {selectedSinpeMovilFavoriteWallet && (
              <View style={styles.favInfoRow}>
                <Text style={[styles.favInfoText, { color: secondaryTextColor }]}>
                  Titular: {selectedSinpeMovilFavoriteWallet.titular || 'N/A'}
                </Text>
              </View>
            )}

            <Modal
              visible={sinpeMovilFavModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setSinpeMovilFavModalVisible(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: '#a61612' }]}>
                      Seleccionar Monedero Favorito
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSinpeMovilFavModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color={textColor} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalListContainer}>
                    <FlatList
                      data={sinpeMovilFavoriteWallets}
                      keyExtractor={(item) => item.id?.toString() || item.monedero || ''}
                      style={styles.flatList}
                      contentContainerStyle={styles.flatListContent}
                      renderItem={({ item }) => {
                        const isSelected = selectedSinpeMovilFavoriteWallet?.monedero === item.monedero;
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              onSinpeMovilFavoriteSelect?.(item);
                              setSinpeMovilFavModalVisible(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              isSelected && { backgroundColor: '#a61612' + '15' },
                              { borderBottomColor: borderColor + '30' },
                            ]}
                          >
                            <View style={styles.dropdownItemContent}>
                              <View style={styles.dropdownItemHeader}>
                                <Phone size={18} color={isSelected ? '#a61612' : secondaryTextColor} />
                                <View style={styles.dropdownItemText}>
                                  <Text
                                    style={[
                                      styles.dropdownItemAccount,
                                      { color: isSelected ? '#a61612' : textColor },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {item.monedero || 'Sin número'}
                                  </Text>
                                  {item.titular && (
                                    <Text
                                      style={[
                                        styles.dropdownItemSubtext,
                                        { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {item.titular}
                                    </Text>
                                  )}
                                  {item.alias && (
                                    <Text
                                      style={[
                                        styles.dropdownItemSubtext,
                                        { color: isSelected ? '#a61612' + 'CC' : secondaryTextColor },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {item.alias}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                            No hay monederos favoritos disponibles
                          </Text>
                        </View>
                      }
                    />
                  </View>
                </View>
              </View>
            </Modal>
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
  dropdownTrigger: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dropdownTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dropdownSelectedText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  favInfoRow: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  favInfoText: {
    fontSize: 13,
    opacity: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    height: '50%',
    width: '100%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalListContainer: {
    flex: 1,
    flexShrink: 1,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dropdownItemContent: {
    gap: 8,
  },
  dropdownItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemText: {
    flex: 1,
    gap: 4,
  },
  dropdownItemAccount: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownItemSubtext: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(166, 22, 18, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(166, 22, 18, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  infoBoxIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    flex: 1,
  },
});

