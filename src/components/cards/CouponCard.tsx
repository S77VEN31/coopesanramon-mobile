import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Ticket, Calendar, CalendarCheck } from 'lucide-react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import DetailField from '../ui/DetailField';
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

  return (
    <Card style={styles.card} colorScheme={colorScheme}>
      <CardHeader style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ticket size={16} color="#ffffff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Cupón {coupon.numeroCupon || '—'}
            </Text>
          </View>
        </View>
        <View style={estadoStyle === 'success' ? styles.statusBadgeSuccess : styles.statusBadgeDefault}>
          <Text style={estadoStyle === 'success' ? styles.statusTextSuccess : styles.statusTextDefault}>
            {estadoLabel}
          </Text>
        </View>
      </CardHeader>

      <CardContent style={styles.body}>
        <View style={styles.amountsRow}>
          <View style={styles.amountColumn}>
            <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Monto Neto</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.amountValue, { color: textColor }]}>
                {formatCurrency(coupon.montoNeto, moneda)}
              </Text>
            </View>
          </View>
          <View style={styles.amountColumnRight}>
            <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Interés Neto</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.amountValueSecondary, { color: textColor }]}>
                {formatCurrency(coupon.interesNeto, moneda)}
              </Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>{moneda}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.detailsSection, { borderTopColor: borderColor }]}>
          <DetailField
            icon={Calendar}
            label="Vencimiento"
            showDivider={!!coupon.fechaPagado}
            value={
              <Text style={[styles.detailValue, { color: textColor }]}>
                {formatDate(coupon.fechaVencimiento)}
              </Text>
            }
          />
          {coupon.fechaPagado && (
            <DetailField
              icon={CalendarCheck}
              label="Fecha Pagado"
              showDivider={false}
              value={
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {formatDate(coupon.fechaPagado)}
                </Text>
              }
            />
          )}
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#a61612',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountColumn: {
    flex: 1,
  },
  amountColumnRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  amountValueSecondary: {
    fontSize: 15,
    fontWeight: '600',
  },
  currencyBadge: {
    backgroundColor: '#a61612',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currencyBadgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  detailsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadgeSuccess: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    marginLeft: 8,
  },
  statusTextSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadgeDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    marginLeft: 8,
  },
  statusTextDefault: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
