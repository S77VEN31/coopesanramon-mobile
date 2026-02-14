import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { type DtoCupon } from '../../services/api/investments.api';
import { ESTADO_CUPON_LABELS, ESTADO_CUPON_STYLE } from '../../constants/coupons.constants';
import { formatCurrency, formatDate } from '../../lib/utils/format.utils';

interface CouponCardProps {
  coupon: DtoCupon;
  moneda?: string;
}

export default function CouponCard({ coupon, moneda = 'CRC' }: CouponCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const estadoLabel = ESTADO_CUPON_LABELS[coupon.estado] ?? 'No Definido';
  const estadoStyle = ESTADO_CUPON_STYLE[coupon.estado] ?? 'default';

  const renderStatusBadge = () => {
    if (estadoStyle === 'success') {
      return (
        <View style={styles.statusBadgeSuccess}>
          <Text style={styles.statusTextSuccess}>{estadoLabel}</Text>
        </View>
      );
    }
    return (
      <View style={styles.statusBadgeDefault}>
        <Text style={styles.statusTextDefault}>{estadoLabel}</Text>
      </View>
    );
  };

  return (
    <Card style={styles.card} colorScheme={colorScheme}>
      <CardContent style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.couponInfo}>
            <Text style={[styles.couponNumber, { color: textColor }]}>
              Cupón {coupon.numeroCupon || '—'}
            </Text>
          </View>
          {renderStatusBadge()}
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Vencimiento</Text>
          <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(coupon.fechaVencimiento)}</Text>
        </View>

        {coupon.fechaPagado && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Fecha Pagado</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(coupon.fechaPagado)}</Text>
          </View>
        )}

        <View style={[styles.footerSection, { borderTopColor: borderColor }]}>
          <View style={styles.amountColumn}>
            <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Interés Neto</Text>
            <Text style={[styles.amountValue, { color: textColor }]}>
              {formatCurrency(coupon.interesNeto, moneda)}
            </Text>
          </View>
          <View style={styles.amountColumnRight}>
            <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Monto Neto</Text>
            <Text style={[styles.amountValue, { color: textColor }]}>
              {formatCurrency(coupon.montoNeto, moneda)}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  couponInfo: {
    flex: 1,
    minWidth: 0,
  },
  couponNumber: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  amountColumn: {
    flex: 1,
  },
  amountColumnRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadgeSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  statusTextSuccess: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  statusBadgeDefault: {
    backgroundColor: 'rgba(115, 115, 115, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(115, 115, 115, 0.2)',
  },
  statusTextDefault: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737373',
  },
});
