import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { CreditCard, Star, Hash } from 'lucide-react-native';
import { IbanInput } from '@/components/ui/IbanInput';
import { FavoriteAccountSelect } from '@/components/inputs/FavoriteAccountSelect';
import { getTextColor, getSecondaryTextColor } from '../../../../App';
import type { CuentaSinpeFavoritaItem } from '@/services/api/favorites.api';
import type { GetCuentaDestinoSinpeResponse } from '@/services/api/transfers.api';

interface SinpeDestinationSectionProps {
  sinpeFlowType: 'enviar-fondos' | 'recibir-fondos';
  sinpeDestinationType: 'favorites' | 'manual';
  onSinpeDestinationTypeChange: (value: 'favorites' | 'manual') => void;
  selectedSinpeFavoriteAccount: CuentaSinpeFavoritaItem | null;
  sinpeFavoriteAccounts: CuentaSinpeFavoritaItem[];
  onSinpeFavoriteSelect: (account: CuentaSinpeFavoritaItem) => void;
  sinpeDestinationIban: string;
  onSinpeDestinationIbanChange: (value: string) => void;
  sinpeDestinationFormatError: string | null;
  isValidatingSinpeAccount: boolean;
  sinpeAccountValidationError: string | null;
  validatedSinpeAccountInfo: GetCuentaDestinoSinpeResponse | null;
  isLoadingFavorites: boolean;
}

export default function SinpeDestinationSection({
  sinpeFlowType,
  sinpeDestinationType,
  onSinpeDestinationTypeChange,
  selectedSinpeFavoriteAccount,
  sinpeFavoriteAccounts,
  onSinpeFavoriteSelect,
  sinpeDestinationIban,
  onSinpeDestinationIbanChange,
  sinpeDestinationFormatError,
  sinpeAccountValidationError,
  isLoadingFavorites,
}: SinpeDestinationSectionProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  const destinationLabel = sinpeFlowType === 'recibir-fondos'
    ? 'Cuenta Origen del Debito'
    : 'Cuenta Destino';

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.inputLabel, { color: textColor }]}>
          {destinationLabel}
        </Text>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, sinpeDestinationType === 'favorites' && styles.tabActive]}
            onPress={() => onSinpeDestinationTypeChange('favorites')}
          >
            <Star size={16} color={sinpeDestinationType === 'favorites' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: sinpeDestinationType === 'favorites' ? '#a61612' : secondaryTextColor }]}>
              Favorita
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, sinpeDestinationType === 'manual' && styles.tabActive]}
            onPress={() => onSinpeDestinationTypeChange('manual')}
          >
            <Hash size={16} color={sinpeDestinationType === 'manual' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: sinpeDestinationType === 'manual' ? '#a61612' : secondaryTextColor }]}>
              Manual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {sinpeDestinationType === 'favorites' && (
        <FavoriteAccountSelect<CuentaSinpeFavoritaItem>
          label="Cuenta Favorita"
          items={sinpeFavoriteAccounts}
          value={selectedSinpeFavoriteAccount}
          onSelect={onSinpeFavoriteSelect}
          placeholder="Seleccionar cuenta favorita"
          disabled={isLoadingFavorites || sinpeFavoriteAccounts.length === 0}
          modalTitle="Seleccionar Cuenta Favorita"
          emptyMessage="No hay cuentas favoritas disponibles"
          getKey={(item) => item.id?.toString() || item.numeroCuentaDestino || ''}
          getDisplayText={(item) => item.numeroCuentaDestino || ''}
          getAlias={(item) => item.alias}
          getTitular={(item) => item.titularDestino}
          formatAsIban={true}
          icon={<CreditCard size={18} />}
        />
      )}

      {sinpeDestinationType === 'manual' && (
        <IbanInput
          label="Numero de Cuenta (IBAN)"
          placeholder="00 0000 0000 0000 0000 00"
          value={sinpeDestinationIban}
          onChangeText={(_masked, unmasked) => onSinpeDestinationIbanChange(unmasked)}
          onClear={() => onSinpeDestinationIbanChange('')}
          error={sinpeDestinationFormatError || sinpeAccountValidationError || undefined}
          colorScheme={colorScheme}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
