import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { type DtoInversion } from '../../services/api/investments.api';
import { TIPO_INVERSION_LABELS, TIPO_TASA_INTERES_LABELS } from '../../constants/investments.constants';
import { formatCurrency, formatDate } from '../../lib/utils/format.utils';

interface InvestmentCardProps {
  investment: DtoInversion;
  onPress: () => void;
}

export default function InvestmentCard({ investment, onPress }: InvestmentCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const moneda = investment.moneda || 'CRC';
  const tipoLabel = TIPO_INVERSION_LABELS[investment.tipoInversion] || 'No Definido';
  const tasaLabel = TIPO_TASA_INTERES_LABELS[investment.tipoTasaInteres] || '';

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
              <TrendingUp size={20} color="#a61612" />
            </View>
            <View style={styles.investmentInfo}>
              <Text style={[styles.tipoLabel, { color: textColor }]}>
                {tipoLabel}
              </Text>
              {investment.numeroInversion && (
                <Text style={[styles.operacion, { color: secondaryTextColor }]} numberOfLines={1}>
                  No. {investment.numeroInversion}
                </Text>
              )}
            </View>
            {tasaLabel ? (
              <View style={styles.tasaBadge}>
                <Text style={styles.tasaText}>{tasaLabel}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Plazo</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>{investment.plazo} días</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Vencimiento</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(investment.fechaVencimiento)}</Text>
          </View>

          <View style={[styles.footerSection, { borderTopColor: borderColor }]}>
            <View style={styles.montoColumn}>
              <Text style={[styles.montoLabel, { color: secondaryTextColor }]}>Monto</Text>
              <Text style={[styles.montoValue, { color: textColor }]}>
                {formatCurrency(investment.monto, moneda)}
              </Text>
            </View>
            <View style={styles.monedaColumn}>
              <Text style={[styles.monedaLabel, { color: secondaryTextColor }]}>Moneda</Text>
              <Text style={[styles.monedaValue, { color: textColor }]}>{moneda}</Text>
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
  investmentInfo: {
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
  tasaBadge: {
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(166, 22, 18, 0.2)',
    flexShrink: 0,
  },
  tasaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a61612',
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
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  montoColumn: {
    flex: 1,
  },
  montoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  montoValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  monedaColumn: {
    alignItems: 'flex-end',
  },
  monedaLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  monedaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
