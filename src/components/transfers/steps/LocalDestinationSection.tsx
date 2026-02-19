import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { CreditCard, Star, Hash, User } from 'lucide-react-native';
import { IbanInput } from '@/components/ui/IbanInput';
import { AccountSelect } from '@/components/inputs/AccountSelect';
import { FavoriteAccountSelect } from '@/components/inputs/FavoriteAccountSelect';
import { getTextColor, getSecondaryTextColor } from '../../../../App';
import { getAccountIdentifier } from '@/lib/utils/accounts.utils';
import type { DtoCuenta } from '@/services/api/accounts.api';
import type { CuentaFavoritaInternaItem } from '@/services/api/favorites.api';
import type { GetCuentaDestinoInternaResponse } from '@/services/api/transfers.api';

interface LocalDestinationSectionProps {
  destinationType: 'favorites' | 'own' | 'manual';
  onDestinationTypeChange: (value: 'favorites' | 'own' | 'manual') => void;
  selectedFavoriteAccount: CuentaFavoritaInternaItem | null;
  favoriteAccounts: CuentaFavoritaInternaItem[];
  onFavoriteSelect: (account: CuentaFavoritaInternaItem) => void;
  selectedOwnAccount: DtoCuenta | null;
  ownAccounts: DtoCuenta[];
  onOwnAccountSelect: (accountIdentifier: string) => void;
  destinationIban: string;
  onDestinationIbanChange: (value: string) => void;
  destinationFormatError: string | null;
  isValidatingAccount: boolean;
  accountValidationError: string | null;
  validatedAccountInfo: GetCuentaDestinoInternaResponse | null;
  isLoadingFavorites: boolean;
}

export default function LocalDestinationSection({
  destinationType,
  onDestinationTypeChange,
  selectedFavoriteAccount,
  favoriteAccounts,
  onFavoriteSelect,
  selectedOwnAccount,
  ownAccounts,
  onOwnAccountSelect,
  destinationIban,
  onDestinationIbanChange,
  destinationFormatError,
  isValidatingAccount,
  accountValidationError,
  validatedAccountInfo,
  isLoadingFavorites,
}: LocalDestinationSectionProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.inputLabel, { color: textColor }]}>
          Cuenta Destino
        </Text>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              destinationType === 'favorites' && styles.tabActive,
            ]}
            onPress={() => onDestinationTypeChange('favorites')}
          >
            <Star size={16} color={destinationType === 'favorites' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: destinationType === 'favorites' ? '#a61612' : secondaryTextColor }]}>
              Favorita
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              destinationType === 'manual' && styles.tabActive,
            ]}
            onPress={() => onDestinationTypeChange('manual')}
          >
            <Hash size={16} color={destinationType === 'manual' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: destinationType === 'manual' ? '#a61612' : secondaryTextColor }]}>
              Manual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              destinationType === 'own' && styles.tabActive,
            ]}
            onPress={() => onDestinationTypeChange('own')}
          >
            <User size={16} color={destinationType === 'own' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: destinationType === 'own' ? '#a61612' : secondaryTextColor }]}>
              Propia
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {destinationType === 'favorites' && (
        <FavoriteAccountSelect<CuentaFavoritaInternaItem>
          label="Cuenta Favorita"
          items={favoriteAccounts}
          value={selectedFavoriteAccount}
          onSelect={onFavoriteSelect}
          placeholder="Seleccionar cuenta favorita"
          disabled={isLoadingFavorites || favoriteAccounts.length === 0}
          modalTitle="Seleccionar Cuenta Favorita"
          emptyMessage="No hay cuentas favoritas disponibles"
          getKey={(item) => item.id?.toString() || item.numeroCuenta || ''}
          getDisplayText={(item) => item.numeroCuenta || ''}
          getAlias={(item) => item.alias}
          getTitular={(item) => item.titular}
          formatAsIban={true}
          icon={<CreditCard size={18} />}
        />
      )}

      {destinationType === 'own' && (
        <AccountSelect
          label="Cuenta Propia"
          accounts={ownAccounts}
          value={selectedOwnAccount ? getAccountIdentifier(selectedOwnAccount) : ''}
          onValueChange={onOwnAccountSelect}
          placeholder="Seleccionar cuenta propia"
          disabled={ownAccounts.length === 0}
        />
      )}

      {destinationType === 'manual' && (
        <View style={styles.manualContainer}>
          <IbanInput
            label="Numero de Cuenta (IBAN)"
            placeholder="00 0000 0000 0000 0000 00"
            value={destinationIban}
            onChangeText={(_masked, unmasked) => onDestinationIbanChange(unmasked)}
            onClear={() => onDestinationIbanChange('')}
            error={destinationFormatError || accountValidationError || undefined}
            colorScheme={colorScheme}
          />
          {isValidatingAccount && (
            <View style={styles.validationRow}>
              <ActivityIndicator size="small" color="#a61612" />
              <Text style={[styles.validatingText, { color: secondaryTextColor }]}>
                Validando cuenta...
              </Text>
            </View>
          )}
          {validatedAccountInfo && !isValidatingAccount && (
            <View style={styles.accountInfoCard}>
              {validatedAccountInfo.titular && (
                <Text style={[styles.accountInfoName, { color: textColor }]}>
                  {validatedAccountInfo.titular}
                </Text>
              )}
              {validatedAccountInfo.identificacion && (
                <Text style={[styles.accountInfoId, { color: secondaryTextColor }]}>
                  {validatedAccountInfo.identificacion}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  manualContainer: {
    gap: 8,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  validatingText: {
    fontSize: 13,
  },
  accountInfoCard: {
    flexDirection: 'column',
    gap: 2,
    paddingHorizontal: 4,
  },
accountInfoName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountInfoId: {
    fontSize: 12,
  },
  field: {
    marginBottom: 12,
  },
  tabsField: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
