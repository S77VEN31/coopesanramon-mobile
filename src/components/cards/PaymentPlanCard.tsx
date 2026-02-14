import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor } from '../../../App';
import { type DtoCuotaPlanPagos } from '../../services/api/loans.api';
import { ESTADO_CUOTA_LABELS, ESTADO_CUOTA_STYLE } from '../../constants/loans.constants';
import { formatCurrency, formatDate } from '../../lib/utils/format.utils';

interface PaymentPlanCardProps {
  cuota: DtoCuotaPlanPagos;
  moneda?: string;
}

export default function PaymentPlanCard({ cuota, moneda = 'CRC' }: PaymentPlanCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  const estadoStyle = ESTADO_CUOTA_STYLE[cuota.estado] ?? 'default';
  const estadoLabel = ESTADO_CUOTA_LABELS[cuota.estado] ?? 'No Definido';

  const renderBadge = () => {
    switch (estadoStyle) {
      case 'success':
        return <View style={styles.badgeSuccess}><Text style={styles.badgeTextSuccess}>{estadoLabel}</Text></View>;
      case 'danger':
        return <View style={styles.badgeDanger}><Text style={styles.badgeTextDanger}>{estadoLabel}</Text></View>;
      case 'warning':
        return <View style={styles.badgeWarning}><Text style={styles.badgeTextWarning}>{estadoLabel}</Text></View>;
      default:
        return <View style={styles.badgeDefault}><Text style={styles.badgeTextDefault}>{estadoLabel}</Text></View>;
    }
  };

  return (
    <Card style={styles.card} colorScheme={colorScheme}>
      <CardContent style={styles.content}>
        <View style={styles.leftCol}>
          <Text style={[styles.cuotaNumber, { color: textColor }]}>Cuota #{cuota.numeroCuota}</Text>
          <Text style={[styles.fecha, { color: secondaryTextColor }]}>{formatDate(cuota.fechaPago)}</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={[styles.monto, { color: textColor }]}>{formatCurrency(cuota.montoTotal, moneda)}</Text>
          {renderBadge()}
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  leftCol: {
    flex: 1,
  },
  cuotaNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  fecha: {
    fontSize: 13,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  monto: {
    fontSize: 15,
    fontWeight: '700',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  badgeTextSuccess: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  badgeDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  badgeTextDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  badgeWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  badgeTextWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a16207',
  },
  badgeDefault: {
    backgroundColor: 'rgba(115, 115, 115, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(115, 115, 115, 0.2)',
  },
  badgeTextDefault: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737373',
  },
});
