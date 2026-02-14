import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { type DtoPagoEfectuado } from '../../services/api/loans.api';
import { formatCurrency, formatDate } from '../../lib/utils/format.utils';

interface PaymentHistoryCardProps {
  payment: DtoPagoEfectuado;
  moneda?: string;
  onPress: () => void;
}

export default function PaymentHistoryCard({ payment, moneda = 'CRC', onPress }: PaymentHistoryCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressablePressed,
      ]}
    >
      <Card style={styles.card} colorScheme={colorScheme}>
        <View style={styles.topBorder} />
        <CardContent style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.cuotaNumber, { color: textColor }]}>Cuota #{payment.numeroCuota}</Text>
            <Text style={[styles.fecha, { color: secondaryTextColor }]}>{formatDate(payment.fechaPago)}</Text>
          </View>
          <View style={[styles.bottomRow, { borderTopColor: borderColor }]}>
            <View style={styles.amountCol}>
              <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Pagado</Text>
              <Text style={[styles.amountValue, { color: textColor }]}>{formatCurrency(payment.montoPagado, moneda)}</Text>
            </View>
            <View style={styles.amountCol}>
              <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Intereses</Text>
              <Text style={[styles.amountValue, { color: textColor }]}>{formatCurrency(payment.montoInteres, moneda)}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 12,
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
  },
  card: {
    overflow: 'hidden',
  },
  topBorder: {
    height: 4,
    backgroundColor: '#a61612',
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cuotaNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  fecha: {
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  amountCol: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
