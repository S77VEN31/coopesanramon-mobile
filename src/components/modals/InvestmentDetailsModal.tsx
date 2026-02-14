import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils/format.utils';
import { TIPO_INVERSION_LABELS, TIPO_TASA_INTERES_LABELS, INVESTMENT_DETAIL_LABELS } from '../../constants/investments.constants';
import type { DtoInversion } from '../../services/api/investments.api';

interface InvestmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  investment: DtoInversion | null;
  onViewCoupons?: (numeroInversion: string) => void;
}

export default function InvestmentDetailsModal({ visible, onClose, investment, onViewCoupons }: InvestmentDetailsModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  if (!investment) return null;

  const moneda = investment.moneda || 'CRC';
  const tipoLabel = TIPO_INVERSION_LABELS[investment.tipoInversion] || 'No Definido';
  const tasaLabel = TIPO_TASA_INTERES_LABELS[investment.tipoTasaInteres] || 'No Definido';

  const handleViewCoupons = () => {
    if (onViewCoupons && investment.numeroInversion) {
      onClose();
      onViewCoupons(investment.numeroInversion);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <TrendingUp size={40} color="#a61612" />
              </View>
            </View>

            <Text style={[styles.title, { color: textColor }]}>
              {tipoLabel}
            </Text>

            <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
              {INVESTMENT_DETAIL_LABELS.numeroInversion}: {investment.numeroInversion || '—'}
            </Text>

            <View style={[styles.detailsContainer, { borderColor }]}>
              {investment.nombreTitular && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INVESTMENT_DETAIL_LABELS.nombreTitular}</Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>{investment.nombreTitular}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INVESTMENT_DETAIL_LABELS.monto}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatCurrency(investment.monto, moneda)}</Text>
              </View>
              {investment.moneda && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INVESTMENT_DETAIL_LABELS.moneda}</Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>{investment.moneda}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INVESTMENT_DETAIL_LABELS.tipoTasaInteres}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{tasaLabel}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INVESTMENT_DETAIL_LABELS.plazo}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{investment.plazo} días</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INVESTMENT_DETAIL_LABELS.fechaValor}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(investment.fechaValor)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INVESTMENT_DETAIL_LABELS.fechaVencimiento}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(investment.fechaVencimiento)}</Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                variant="default"
                onPress={handleViewCoupons}
                disabled={!investment.numeroInversion}
                style={styles.button}
              >
                {INVESTMENT_DETAIL_LABELS.viewCoupons}
              </Button>
              <Button
                variant="outline"
                onPress={onClose}
                style={styles.button}
              >
                {INVESTMENT_DETAIL_LABELS.close}
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  buttonsContainer: {
    gap: 10,
    marginTop: 8,
  },
  button: {},
});
