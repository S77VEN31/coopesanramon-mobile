import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  User,
  Coins,
  BarChart3,
  Clock,
  Calendar,
  CalendarCheck,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import DetailField from '../components/ui/DetailField';
import { Button } from '../components/ui/Button';
import { getBackgroundColor, getTextColor, getBorderColor } from '../../App';
import { TIPO_INVERSION_LABELS, TIPO_TASA_INTERES_LABELS, INVESTMENT_DETAIL_LABELS } from '../constants/investments.constants';
import { formatCurrency, formatDate } from '../lib/utils/format.utils';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'InvestmentDetail'>;

export default function InvestmentDetailScreen({ route, navigation }: Props) {
  const { investment } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = getTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const backgroundColor = getBackgroundColor(colorScheme);
  const amountColor = isDark ? '#ffffff' : '#a61612';

  const moneda = investment.moneda || 'CRC';
  const tipoLabel = TIPO_INVERSION_LABELS[investment.tipoInversion] || 'No Definido';
  const tasaLabel = TIPO_TASA_INTERES_LABELS[investment.tipoTasaInteres] || 'No Definido';

  const handleViewCoupons = () => {
    if (investment.numeroInversion) {
      navigation.navigate('Coupons', { numeroInversion: investment.numeroInversion });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.section}>
          <Card style={styles.headerCard} colorScheme={colorScheme}>
            <CardHeader style={styles.header}>
              <View style={styles.headerRow}>
                <View style={styles.headerIconContainer}>
                  <TrendingUp size={18} color="#ffffff" />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle} numberOfLines={1}>{tipoLabel}</Text>
                  {investment.numeroInversion && (
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                      {INVESTMENT_DETAIL_LABELS.numeroInversion}: {investment.numeroInversion}
                    </Text>
                  )}
                </View>
              </View>
            </CardHeader>

            <CardContent style={styles.amountSection}>
              <Text style={[styles.amountLabel, { color: textColor }]}>
                {INVESTMENT_DETAIL_LABELS.monto}
              </Text>
              <View style={styles.amountRow}>
                <Text style={[styles.amountValue, { color: amountColor }]}>
                  {formatCurrency(investment.monto, moneda)}
                </Text>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>{moneda}</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Detail Card */}
        <View style={styles.section}>
          <Card style={styles.detailCard} colorScheme={colorScheme}>
            <CardContent style={styles.detailContent}>
              {investment.nombreTitular && (
                <DetailField
                  icon={User}
                  label={INVESTMENT_DETAIL_LABELS.nombreTitular}
                  column
                  value={
                    <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                      {investment.nombreTitular}
                    </Text>
                  }
                />
              )}

              <DetailField
                icon={Coins}
                label={INVESTMENT_DETAIL_LABELS.moneda}
                value={
                  <View style={styles.currencyValueRow}>
                    <Text style={[styles.valueText, { color: textColor }]}>
                      {moneda === 'CRC' ? 'Colones' : moneda === 'USD' ? 'Dólares' : moneda}
                    </Text>
                    <View style={styles.currencyBadge}>
                      <Text style={styles.currencyBadgeText}>{moneda}</Text>
                    </View>
                  </View>
                }
              />

              <DetailField
                icon={BarChart3}
                label={INVESTMENT_DETAIL_LABELS.tipoTasaInteres}
                value={
                  <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                    {tasaLabel}
                  </Text>
                }
              />

              <DetailField
                icon={Clock}
                label={INVESTMENT_DETAIL_LABELS.plazo}
                value={
                  <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                    {investment.plazo} días
                  </Text>
                }
              />

              <DetailField
                icon={Calendar}
                label={INVESTMENT_DETAIL_LABELS.fechaValor}
                value={
                  <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                    {formatDate(investment.fechaValor)}
                  </Text>
                }
              />

              <DetailField
                icon={CalendarCheck}
                label={INVESTMENT_DETAIL_LABELS.fechaVencimiento}
                value={
                  <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                    {formatDate(investment.fechaVencimiento)}
                  </Text>
                }
              />
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      <SafeAreaView
        style={[
          styles.buttonContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderTopColor: borderColor,
          },
        ]}
        edges={['bottom']}
      >
        <View style={styles.buttonWrapper}>
          <Button
            onPress={handleViewCoupons}
            variant="default"
            disabled={!investment.numeroInversion}
            style={styles.button}
          >
            {INVESTMENT_DETAIL_LABELS.viewCoupons}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerCard: {
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#a61612',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  amountSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountValue: {
    fontSize: 24,
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
  detailCard: {
    marginBottom: 0,
  },
  detailContent: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  valueText: {
    fontSize: 14,
  },
  valueBold: {
    fontWeight: '600',
  },
  currencyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  buttonWrapper: {
    padding: 16,
    paddingTop: 12,
  },
  button: {
    width: '100%',
  },
});
