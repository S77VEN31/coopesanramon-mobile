import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import {
  CheckCircle2,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  FileText,
  Mail,
  Hash,
  Calendar,
  Smartphone,
  Receipt,
  User,
} from 'lucide-react-native';
import InfoCard from '../../cards/InfoCard';
import { getSecondaryTextColor } from '../../../../App';
import { formatCurrency, formatDateTime, formatIBAN } from '../../../lib/utils/format.utils';
import type {
  EnviarTransferenciaInternaResponse,
  EnviarTransferenciaSinpeResponse,
  EnviarTransferenciaCreditosDirectosResponse,
  EnviarTransferenciaDebitosTiempoRealResponse,
  EnviarSinpeMovilResponse,
} from '../../../services/api/transfers.api';

type TransferResponse =
  | EnviarTransferenciaInternaResponse
  | EnviarTransferenciaSinpeResponse
  | EnviarTransferenciaCreditosDirectosResponse
  | EnviarTransferenciaDebitosTiempoRealResponse
  | EnviarSinpeMovilResponse;

interface TransferSuccessStepProps {
  transfer: TransferResponse;
  emailDestino?: string | null;
}

const isLocalTransfer = (transfer: TransferResponse): transfer is EnviarTransferenciaInternaResponse => {
  return 'origen' in transfer && 'destino' in transfer;
};

const isSinpeMovilTransfer = (transfer: TransferResponse): transfer is EnviarSinpeMovilResponse => {
  return 'monederoDestino' in transfer;
};

export default function TransferSuccessStep({ transfer, emailDestino }: TransferSuccessStepProps) {
  const colorScheme = useColorScheme();
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const isDark = colorScheme === 'dark';

  const isLocal = isLocalTransfer(transfer);
  const isSinpeMovil = isSinpeMovilTransfer(transfer);

  const getReferenceNumber = () => {
    if (isLocal) return transfer.numeroDocumentoCore;
    return transfer.codigoReferenciaSinpe || transfer.numeroTransCore?.toString() || null;
  };

  const getCurrency = () => {
    if (isLocal) return transfer.codigoMoneda || 'CRC';
    return transfer.codigoMonedaOrigen || transfer.codigoMonedaDestino || 'CRC';
  };

  const getCommission = () => {
    if (isLocal) return transfer.montoComision;
    return null;
  };

  const referenceNumber = getReferenceNumber();
  const currency = getCurrency();
  const commission = getCommission();
  const isUSD = currency === 'USD';

  // Build account items
  const accountItems = [];
  if (isLocal) {
    if (transfer.origen) {
      accountItems.push({
        icon: <CreditCard />,
        label: 'Cuenta Origen',
        value: formatIBAN(transfer.origen.cuentaIBAN) || transfer.origen.cuentaIBAN,
      });
    }
    if (transfer.destino) {
      accountItems.push({
        icon: <CreditCard />,
        label: 'Cuenta Destino',
        value: formatIBAN(transfer.destino.cuentaIBAN) || transfer.destino.cuentaIBAN,
      });
      if (transfer.destino.cliente) {
        accountItems.push({
          icon: <User />,
          label: 'Titular Cuenta Destino',
          value: transfer.destino.cliente.toUpperCase(),
        });
      }
    }
  } else if (isSinpeMovil) {
    if (transfer.numeroCuentaOrigen) {
      accountItems.push({
        icon: <CreditCard />,
        label: 'Cuenta Origen',
        value: formatIBAN(transfer.numeroCuentaOrigen) || transfer.numeroCuentaOrigen,
      });
    }
    if (transfer.monederoDestino) {
      accountItems.push({
        icon: <Smartphone />,
        label: 'Monedero Destino',
        value: transfer.monederoDestino,
      });
    }
    if (transfer.titularDestino) {
      accountItems.push({
        icon: <User />,
        label: 'Titular Destino',
        value: transfer.titularDestino.toUpperCase(),
      });
    }
  } else {
    if (transfer.numeroCuentaOrigen) {
      accountItems.push({
        icon: <CreditCard />,
        label: 'Cuenta Origen',
        value: formatIBAN(transfer.numeroCuentaOrigen) || transfer.numeroCuentaOrigen,
      });
    }
    if (transfer.numeroCuentaDestino) {
      accountItems.push({
        icon: <CreditCard />,
        label: 'Cuenta Destino',
        value: formatIBAN(transfer.numeroCuentaDestino) || transfer.numeroCuentaDestino,
      });
    }
    if ('titularDestino' in transfer && transfer.titularDestino) {
      accountItems.push({
        icon: <User />,
        label: 'Titular Cuenta Destino',
        value: transfer.titularDestino.toUpperCase(),
      });
    }
  }

  // Build detail items
  const detailItems = [];

  if (referenceNumber) {
    detailItems.push({
      icon: <Hash />,
      label: 'Número de Referencia',
      value: referenceNumber,
    });
  }

  detailItems.push({
    icon: isUSD ? <Banknote /> : <ArrowRightLeft />,
    label: 'Monto',
    value: formatCurrency(transfer.monto, currency),
  });

  if (commission !== null && commission !== undefined && commission > 0) {
    detailItems.push({
      icon: <Receipt />,
      label: 'Comisión',
      value: formatCurrency(commission, currency),
    });
  }

  detailItems.push({
    icon: <Calendar />,
    label: 'Fecha',
    value: formatDateTime(transfer.fechaCreacion),
  });

  if (transfer.detalle) {
    detailItems.push({
      icon: <FileText />,
      label: 'Descripción',
      value: transfer.detalle,
    });
  }

  if (emailDestino) {
    detailItems.push({
      icon: <Mail />,
      label: 'Email Destino',
      value: emailDestino,
    });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardsContainer}>
        {accountItems.length > 0 && (
          <View>
            <Text style={[styles.sectionLabel, { color: secondaryTextColor }]}>Cuentas</Text>
            <InfoCard items={accountItems} />
          </View>
        )}

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
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
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
