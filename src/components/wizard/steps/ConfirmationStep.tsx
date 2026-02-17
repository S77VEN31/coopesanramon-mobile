import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import {
  CreditCard,
  Wallet,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  FileText,
  Mail,
  User,
  Banknote,
} from 'lucide-react-native';
import InfoCard from '../../cards/InfoCard';
import { getSecondaryTextColor } from '../../../../App';
import { formatCurrency, formatIBAN } from '../../../lib/utils/format.utils';
import type { DtoCuenta } from '../../../services/api/accounts.api';
import type { CuentaFavoritaInternaItem } from '../../../hooks/use-local-transfer';
import type { CuentaSinpeFavoritaItem } from '../../../hooks/use-sinpe-transfer';
import type { MonederoFavoritoItem } from '../../../hooks/use-sinpe-movil-transfer';

interface ConfirmationStepProps {
  transferType: 'local' | 'sinpe' | 'sinpe-mobile';
  sourceAccount: DtoCuenta | null;
  // SINPE flow type
  sinpeFlowType?: 'enviar-fondos' | 'recibir-fondos';
  sinpeTransferType?: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null;
  // Local transfer
  localDestinationType?: 'favorites' | 'own' | 'manual';
  selectedFavoriteAccount?: CuentaFavoritaInternaItem | null;
  selectedOwnAccount?: DtoCuenta | null;
  destinationIban?: string;
  // SINPE transfer
  sinpeDestinationType?: 'favorites' | 'manual';
  selectedSinpeFavoriteAccount?: CuentaSinpeFavoritaItem | null;
  sinpeDestinationIban?: string;
  // SINPE Móvil transfer
  sinpeMovilDestinationType?: 'favorites' | 'manual';
  selectedSinpeMovilFavoriteWallet?: MonederoFavoritoItem | null;
  sinpeMovilPhoneNumber?: string;
  // Common
  amount: string;
  description: string;
  email: string;
}

export default function ConfirmationStep({
  transferType,
  sourceAccount,
  sinpeFlowType,
  sinpeTransferType,
  localDestinationType,
  selectedFavoriteAccount,
  selectedOwnAccount,
  destinationIban,
  sinpeDestinationType,
  selectedSinpeFavoriteAccount,
  sinpeDestinationIban,
  sinpeMovilDestinationType,
  selectedSinpeMovilFavoriteWallet,
  sinpeMovilPhoneNumber,
  amount,
  description,
  email,
}: ConfirmationStepProps) {
  const colorScheme = useColorScheme();
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  const getDestinationInfo = () => {
    if (transferType === 'local') {
      if (localDestinationType === 'favorites' && selectedFavoriteAccount) {
        return {
          label: 'Cuenta Destino',
          account: selectedFavoriteAccount.numeroCuenta || '',
          titular: selectedFavoriteAccount.titular || 'N/A',
        };
      }
      if (localDestinationType === 'own' && selectedOwnAccount) {
        return {
          label: 'Cuenta Destino',
          account: selectedOwnAccount.numeroCuentaIban || selectedOwnAccount.numeroCuenta || '',
          titular: selectedOwnAccount.alias || 'N/A',
        };
      }
      if (localDestinationType === 'manual' && destinationIban) {
        return { label: 'Cuenta Destino', account: destinationIban, titular: 'Validado' };
      }
    }
    if (transferType === 'sinpe') {
      if (sinpeDestinationType === 'favorites' && selectedSinpeFavoriteAccount) {
        return {
          label: 'Cuenta Destino',
          account: selectedSinpeFavoriteAccount.numeroCuentaDestino || '',
          titular: selectedSinpeFavoriteAccount.titularDestino || 'N/A',
        };
      }
      if (sinpeDestinationType === 'manual' && sinpeDestinationIban) {
        return { label: 'Cuenta Destino', account: sinpeDestinationIban, titular: 'Validado' };
      }
    }
    if (transferType === 'sinpe-mobile') {
      if (sinpeMovilDestinationType === 'favorites' && selectedSinpeMovilFavoriteWallet) {
        return {
          label: 'Monedero Destino',
          account: selectedSinpeMovilFavoriteWallet.monedero || '',
          titular: selectedSinpeMovilFavoriteWallet.titular || 'N/A',
        };
      }
      if (sinpeMovilDestinationType === 'manual' && sinpeMovilPhoneNumber) {
        return { label: 'Monedero Destino', account: sinpeMovilPhoneNumber, titular: 'Validado' };
      }
    }
    return null;
  };

  const destinationInfo = getDestinationInfo();
  const amountNum = parseFloat(amount) || 0;
  const currency = sourceAccount?.moneda || 'CRC';
  const isUSD = currency === 'USD';

  const getTransferTypeLabel = () => {
    if (transferType === 'local') return 'Transferencia Local';
    if (transferType === 'sinpe') return 'Transferencia SINPE';
    return 'Transferencia SINPE Móvil';
  };

  const getTransferTypeIcon = () => {
    if (transferType === 'local') return <CreditCard />;
    if (transferType === 'sinpe') return <Wallet />;
    return <Smartphone />;
  };

  // Build account items (source + destination)
  const accountItems = [];
  if (sourceAccount) {
    accountItems.push({
      icon: <CreditCard />,
      label: 'Cuenta Origen',
      value: formatIBAN(sourceAccount.numeroCuentaIban) || sourceAccount.numeroCuenta || '',
    });
  }
  if (destinationInfo) {
    accountItems.push({
      icon: <CreditCard />,
      label: destinationInfo.label,
      value: formatIBAN(destinationInfo.account) || destinationInfo.account,
    });
    accountItems.push({
      icon: <User />,
      label: 'Titular',
      value: destinationInfo.titular,
    });
  }

  // Build transfer details items
  const detailItems = [];
  detailItems.push({
    icon: getTransferTypeIcon(),
    label: 'Tipo',
    value: getTransferTypeLabel(),
  });
  detailItems.push({
    icon: isUSD ? <Banknote /> : <ArrowRightLeft />,
    label: 'Monto',
    value: formatCurrency(amountNum, currency),
  });
  if (description) {
    detailItems.push({
      icon: <FileText />,
      label: 'Descripción',
      value: description,
    });
  }
  if (email) {
    detailItems.push({
      icon: <Mail />,
      label: 'Correo Electrónico',
      value: email,
    });
  }

  // SINPE flow info
  if (transferType === 'sinpe' && sinpeFlowType && sinpeTransferType) {
    const flowLabel = sinpeFlowType === 'enviar-fondos' ? 'Enviar fondos' : 'Traer fondos';
    const modeLabel =
      sinpeTransferType === 'pagos-inmediatos' ? 'Tiempo real' :
      sinpeTransferType === 'creditos-directos' ? 'Diferido' :
      'Débito tiempo real';
    detailItems.push({
      icon: sinpeFlowType === 'enviar-fondos' ? <ArrowUpRight /> : <ArrowDownLeft />,
      label: 'Operación',
      value: `${flowLabel} - ${modeLabel}`,
    });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardsContainer}>
        {/* Accounts */}
        {accountItems.length > 0 && (
          <View>
            <Text style={[styles.sectionLabel, { color: secondaryTextColor }]}>Cuentas</Text>
            <InfoCard items={accountItems} />
          </View>
        )}

        {/* Transfer Details */}
        <View>
          <Text style={[styles.sectionLabel, { color: secondaryTextColor }]}>Detalles</Text>
          <InfoCard items={detailItems} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsContainer: {
    gap: 16,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});
