import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { CreditCard, Star, Hash, ArrowUpRight, ArrowDownLeft, Clock, Clock3 } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { FavoriteAccountSelect } from '@/components/inputs/FavoriteAccountSelect';
import { getTextColor, getSecondaryTextColor } from '../../../../App';
import type { CuentaSinpeFavoritaItem } from '@/services/api/favorites.api';
import type { GetCuentaDestinoSinpeResponse } from '@/services/api/transfers.api';

interface SinpeDestinationSectionProps {
  sinpeFlowType: 'enviar-fondos' | 'recibir-fondos';
  onSinpeFlowTypeChange: (value: 'enviar-fondos' | 'recibir-fondos') => void;
  sinpeTransferType: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null;
  onSinpeTransferTypeChange: (value: 'pagos-inmediatos' | 'creditos-directos') => void;
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

const getInfoBoxMessage = (sinpeTransferType: string | null) => {
  if (sinpeTransferType === 'pagos-inmediatos') {
    return 'Los 365 dias del ano con aplicacion inmediata entre las 7:00am y las 10:00pm.';
  }
  if (sinpeTransferType === 'creditos-directos') {
    return 'Lunes a viernes: solicitudes antes de las 2:00pm se acreditan el mismo dia. Despues de las 2:00pm, sabados, domingos y feriados se acreditan el siguiente dia habil.';
  }
  if (sinpeTransferType === 'debitos-tiempo-real') {
    return 'Los 365 dias del ano con aplicacion inmediata entre las 7:00am y las 10:00pm.';
  }
  return null;
};

export default function SinpeDestinationSection({
  sinpeFlowType,
  onSinpeFlowTypeChange,
  sinpeTransferType,
  onSinpeTransferTypeChange,
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
    ? 'Cuenta origen del debito'
    : 'Cuenta Destino';

  const infoMessage = getInfoBoxMessage(sinpeTransferType);

  return (
    <>
      {/* SINPE Flow Type Tabs */}
      <View style={styles.field}>
        <Text style={[styles.inputLabel, { color: textColor }]}>
          Tipo de operacion
        </Text>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, sinpeFlowType === 'enviar-fondos' && styles.tabActive]}
            onPress={() => onSinpeFlowTypeChange('enviar-fondos')}
          >
            <ArrowUpRight size={16} color={sinpeFlowType === 'enviar-fondos' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: sinpeFlowType === 'enviar-fondos' ? '#a61612' : secondaryTextColor }]}>
              Enviar fondos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, sinpeFlowType === 'recibir-fondos' && styles.tabActive]}
            onPress={() => onSinpeFlowTypeChange('recibir-fondos')}
          >
            <ArrowDownLeft size={16} color={sinpeFlowType === 'recibir-fondos' ? '#a61612' : secondaryTextColor} />
            <Text style={[styles.tabText, { color: sinpeFlowType === 'recibir-fondos' ? '#a61612' : secondaryTextColor }]}>
              Traer fondos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Execution Type Tabs (only for enviar-fondos) */}
      {sinpeFlowType === 'enviar-fondos' && (
        <View style={styles.field}>
          <Text style={[styles.inputLabel, { color: textColor }]}>
            Tipo de ejecucion
          </Text>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, sinpeTransferType === 'pagos-inmediatos' && styles.tabActive]}
              onPress={() => onSinpeTransferTypeChange('pagos-inmediatos')}
            >
              <Clock size={16} color={sinpeTransferType === 'pagos-inmediatos' ? '#a61612' : secondaryTextColor} />
              <Text style={[styles.tabText, { color: sinpeTransferType === 'pagos-inmediatos' ? '#a61612' : secondaryTextColor }]}>
                Tiempo real
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, sinpeTransferType === 'creditos-directos' && styles.tabActive]}
              onPress={() => onSinpeTransferTypeChange('creditos-directos')}
            >
              <Clock3 size={16} color={sinpeTransferType === 'creditos-directos' ? '#a61612' : secondaryTextColor} />
              <Text style={[styles.tabText, { color: sinpeTransferType === 'creditos-directos' ? '#a61612' : secondaryTextColor }]}>
                Diferido
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Info Box */}
      {sinpeTransferType && infoMessage && (
        <View style={styles.infoBox}>
          <Clock size={16} color="#a61612" style={styles.infoBoxIcon} />
          <Text style={styles.infoBoxText}>{infoMessage}</Text>
        </View>
      )}

      {/* Destination Type Tabs */}
      <View style={styles.field}>
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
        <View style={styles.field}>
          <FavoriteAccountSelect<CuentaSinpeFavoritaItem>
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
        </View>
      )}

      {sinpeDestinationType === 'manual' && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>
            Numero de Cuenta (IBAN)
          </Text>
          <Input
            placeholder="CRXX XXXX XXXX XXXX XXXX XXXX"
            value={sinpeDestinationIban}
            onChangeText={onSinpeDestinationIbanChange}
            keyboardType="default"
            error={sinpeDestinationFormatError || sinpeAccountValidationError || undefined}
            leftIcon={<CreditCard size={16} color={secondaryTextColor} />}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
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
