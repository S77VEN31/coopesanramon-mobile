import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { Landmark } from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { type DtoPrestamo } from '../../services/api/loans.api';
import { TIPO_PRESTAMO_LABELS, ESTADO_CUOTA_LABELS, ESTADO_CUOTA_STYLE } from '../../constants/loans.constants';
import { formatCurrency, formatIBAN } from '../../lib/utils/format.utils';

interface LoanCardProps {
  loan: DtoPrestamo;
  onPress: () => void;
}

export default function LoanCard({ loan, onPress }: LoanCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const moneda = loan.moneda || 'CRC';
  const tipoLabel = TIPO_PRESTAMO_LABELS[loan.tipoPrestamo] || 'No Definido';
  const estadoStyle = ESTADO_CUOTA_STYLE[loan.proxCuota.estado] ?? 'default';
  const estadoLabel = ESTADO_CUOTA_LABELS[loan.proxCuota.estado] ?? 'No Definido';

  const renderStatusBadge = () => {
    switch (estadoStyle) {
      case 'success':
        return (
          <View style={styles.statusBadgeSuccess}>
            <Text style={styles.statusTextSuccess}>{estadoLabel}</Text>
          </View>
        );
      case 'danger':
        return (
          <View style={styles.statusBadgeDanger}>
            <Text style={styles.statusTextDanger}>{estadoLabel}</Text>
          </View>
        );
      case 'warning':
        return (
          <View style={styles.statusBadgeWarning}>
            <Text style={styles.statusTextWarning}>{estadoLabel}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.statusBadgeDefault}>
            <Text style={styles.statusTextDefault}>{estadoLabel}</Text>
          </View>
        );
    }
  };

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
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <Landmark size={20} color="#a61612" />
            </View>
            <View style={styles.loanInfo}>
              <Text style={[styles.tipoLabel, { color: textColor }]}>
                {tipoLabel}
              </Text>
              {loan.numeroOperacion && (
                <Text style={[styles.operacion, { color: secondaryTextColor }]} numberOfLines={1}>
                  Op. {loan.numeroOperacion}
                </Text>
              )}
            </View>
          </View>

          {loan.cuentaIBAN && (
            <View style={styles.ibanRow}>
              <Text style={[styles.ibanLabel, { color: secondaryTextColor }]}>IBAN</Text>
              <Text style={[styles.ibanValue, { color: textColor }]}>{formatIBAN(loan.cuentaIBAN)}</Text>
            </View>
          )}

          <View style={[styles.footerSection, { borderTopColor: borderColor }]}>
            <View style={styles.saldoColumn}>
              <Text style={[styles.saldoLabel, { color: secondaryTextColor }]}>Saldo</Text>
              <Text style={[styles.saldoValue, { color: textColor }]}>
                {formatCurrency(loan.saldo, moneda)}
              </Text>
            </View>
            <View style={styles.cuotaColumn}>
              <Text style={[styles.cuotaLabel, { color: secondaryTextColor }]}>Próx. cuota</Text>
              {renderStatusBadge()}
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
    marginBottom: 0,
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
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a61612',
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    flexShrink: 0,
  },
  loanInfo: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  tipoLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  operacion: {
    fontSize: 13,
    opacity: 0.8,
  },
  ibanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ibanLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  ibanValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saldoColumn: {
    flex: 1,
  },
  saldoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  saldoValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  cuotaColumn: {
    alignItems: 'flex-end',
  },
  cuotaLabel: {
    fontSize: 11,
    marginBottom: 4,
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
  statusBadgeDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  statusTextDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  statusTextWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a16207',
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
