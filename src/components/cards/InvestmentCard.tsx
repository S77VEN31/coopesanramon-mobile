import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { TrendingUp, Calendar, Clock } from 'lucide-react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import DetailField from '../ui/DetailField';
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
        <CardHeader style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {tipoLabel}
              </Text>
              {investment.numeroInversion && (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  No. {investment.numeroInversion}
                </Text>
              )}
            </View>
          </View>
          {tasaLabel ? (
            <View style={styles.tasaBadge}>
              <Text style={styles.tasaText}>{tasaLabel}</Text>
            </View>
          ) : null}
        </CardHeader>

        <CardContent style={styles.body}>
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Monto</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.amountValue, { color: textColor }]}>
                {formatCurrency(investment.monto, moneda)}
              </Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>{moneda}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.detailsSection, { borderTopColor: borderColor }]}>
            <DetailField
              icon={Clock}
              label="Plazo"
              showDivider={true}
              value={
                <Text style={[styles.detailValue, { color: textColor }]}>{investment.plazo} días</Text>
              }
            />
            <DetailField
              icon={Calendar}
              label="Vencimiento"
              showDivider={false}
              value={
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(investment.fechaVencimiento)}</Text>
              }
            />
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {},
  pressablePressed: {
    transform: [{ scale: 0.98 }],
  },
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
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 1,
  },
  tasaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    marginLeft: 8,
  },
  tasaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  amountSection: {
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
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
});
