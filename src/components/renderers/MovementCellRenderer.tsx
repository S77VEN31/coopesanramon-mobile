import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor } from '../../../App';
import { DtoMovimientoCuenta } from '../../services/api/accounts.api';
import { getMovementType } from '../../lib/utils/movements.utils';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils/format.utils';
import { MOVEMENT_TYPE_LABELS } from '../../constants/movements.constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MovementCellRendererProps {
  movement: DtoMovimientoCuenta;
  columnKey: string;
  moneda?: string;
}

export function MovementCellRenderer({
  movement,
  columnKey,
  moneda = "CRC",
}: MovementCellRendererProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  const movementType = getMovementType(movement.tipoMovimiento);
  const isReversion = movementType === "reversion";
  const isDebito = movementType === "debito";
  const isCredito = movementType === "credito";

  switch (columnKey) {
    case "date":
      return (
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: textColor }]}>
            {formatDate(movement.fechaHora)}
          </Text>
          <Text style={[styles.timeText, { color: secondaryTextColor }]}>
            {formatDateTime(movement.fechaHora).split(",")[1]?.trim() || ""}
          </Text>
        </View>
      );
    case "description":
      return (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, { color: textColor }]} numberOfLines={2}>
            {movement.descripcion || "Sin descripción"}
          </Text>
          {movement.nombreComercio && (
            <Text style={[styles.comercioText, { color: secondaryTextColor }]} numberOfLines={1}>
              {movement.nombreComercio}
            </Text>
          )}
        </View>
      );
    case "transaccion":
      return (
        <Text style={[styles.transaccionText, { color: secondaryTextColor }]} numberOfLines={1}>
          {movement.transaccion || movement.codigoTransaccion || "-"}
        </Text>
      );
    case "transactionType":
      return (
        <Text style={[styles.transaccionText, { color: secondaryTextColor }]} numberOfLines={1}>
          {movement.transaccion || movement.codigoTransaccion || "-"}
        </Text>
      );
    case "amount":
      if (isDebito) {
        return (
          <Text style={[styles.amountText, styles.amountDebito]} numberOfLines={1}>
            -{formatCurrency(Math.abs(movement.monto), moneda)}
          </Text>
        );
      } else if (isReversion) {
        return (
          <Text style={[styles.amountText, styles.amountReversion]} numberOfLines={1}>
            -{formatCurrency(Math.abs(movement.monto), moneda)}
          </Text>
        );
      } else {
        return (
          <Text style={[styles.amountText, styles.amountCredito]} numberOfLines={1}>
            +{formatCurrency(Math.abs(movement.monto), moneda)}
          </Text>
        );
      }
    case "balance":
      return (
        <Text style={[styles.balanceText, { color: textColor }]} numberOfLines={1}>
          {formatCurrency(movement.saldo, moneda)}
        </Text>
      );
    case "type":
      if (isReversion) {
        return (
          <View style={[styles.typeBadge, styles.typeBadgeReversion]}>
            <Text style={[styles.typeBadgeText, { color: '#ea580c' }]}>
              {MOVEMENT_TYPE_LABELS.reversion}
            </Text>
          </View>
        );
      } else if (isDebito) {
        return (
          <View style={[styles.typeBadge, styles.typeBadgeDebito]}>
            <Text style={[styles.typeBadgeText, { color: '#dc2626' }]}>
              {MOVEMENT_TYPE_LABELS.debito}
            </Text>
          </View>
        );
      } else {
        return (
          <View style={[styles.typeBadge, styles.typeBadgeCredito]}>
            <Text style={[styles.typeBadgeText, { color: '#16a34a' }]}>
              {MOVEMENT_TYPE_LABELS.credito}
            </Text>
          </View>
        );
      }
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  dateContainer: {
    gap: 2,
  },
  dateText: {
    fontSize: SCREEN_WIDTH < 360 ? 13 : 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  timeText: {
    fontSize: SCREEN_WIDTH < 360 ? 11 : 12,
    opacity: 0.7,
  },
  descriptionContainer: {
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  descriptionText: {
    fontSize: SCREEN_WIDTH < 360 ? 14 : 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  comercioText: {
    fontSize: SCREEN_WIDTH < 360 ? 12 : 13,
    opacity: 0.75,
    marginTop: 2,
  },
  transaccionText: {
    fontSize: SCREEN_WIDTH < 360 ? 11 : 12,
    opacity: 0.7,
    fontFamily: 'monospace',
  },
  amountText: {
    fontSize: SCREEN_WIDTH < 360 ? 16 : 18,
    fontWeight: '800',
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  amountDebito: {
    color: '#dc2626',
  },
  amountCredito: {
    color: '#16a34a',
  },
  amountReversion: {
    color: '#ea580c',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typeBadgeDebito: {
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
  },
  typeBadgeCredito: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  typeBadgeReversion: {
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

