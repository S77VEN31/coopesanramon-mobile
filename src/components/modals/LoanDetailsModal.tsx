import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { Landmark } from 'lucide-react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { Button } from '../ui/Button';
import { formatCurrency, formatIBAN, formatDate } from '../../lib/utils/format.utils';
import { TIPO_PRESTAMO_LABELS, ESTADO_CUOTA_LABELS, ESTADO_CUOTA_STYLE, LOAN_DETAIL_LABELS } from '../../constants/loans.constants';
import type { DtoPrestamo } from '../../services/api/loans.api';

interface LoanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  loan: DtoPrestamo | null;
}

export default function LoanDetailsModal({ visible, onClose, loan }: LoanDetailsModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  if (!loan) return null;

  const moneda = loan.moneda || 'CRC';
  const tipoLabel = TIPO_PRESTAMO_LABELS[loan.tipoPrestamo] || 'No Definido';
  const cuotaEstadoStyle = ESTADO_CUOTA_STYLE[loan.proxCuota.estado] ?? 'default';
  const cuotaEstadoLabel = ESTADO_CUOTA_LABELS[loan.proxCuota.estado] ?? 'No Definido';

  const getBadgeStyles = () => {
    switch (cuotaEstadoStyle) {
      case 'success':
        return { badge: styles.badgeSuccess, text: styles.badgeTextSuccess };
      case 'danger':
        return { badge: styles.badgeDanger, text: styles.badgeTextDanger };
      case 'warning':
        return { badge: styles.badgeWarning, text: styles.badgeTextWarning };
      default:
        return { badge: styles.badgeDefault, text: styles.badgeTextDefault };
    }
  };

  const badgeStyles = getBadgeStyles();

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
                <Landmark size={40} color="#a61612" />
              </View>
            </View>

            <Text style={[styles.title, { color: textColor }]}>
              {tipoLabel}
            </Text>

            <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
              {LOAN_DETAIL_LABELS.numeroOperacion}: {loan.numeroOperacion || '—'}
            </Text>

            <View style={[styles.detailsContainer, { borderColor }]}>
              {loan.cuentaIBAN && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.cuentaIBAN}</Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>{formatIBAN(loan.cuentaIBAN)}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.monto}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatCurrency(loan.monto, moneda)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.saldo}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatCurrency(loan.saldo, moneda)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.tasaInteres}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {loan.tasaInteres}%{loan.tipoTasaInteres ? ` (${loan.tipoTasaInteres})` : ''}
                </Text>
              </View>
              {loan.moneda && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.moneda}</Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>{loan.moneda}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.fechaApertura}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(loan.fechaApertura)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.fechaVencimiento}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(loan.fechaVencimiento)}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {LOAN_DETAIL_LABELS.proxCuota}
            </Text>

            <View style={[styles.detailsContainer, { borderColor }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Cuota</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>#{loan.proxCuota.numeroCuota}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.proxCuotaFecha}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(loan.proxCuota.fechaPago)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.proxCuotaMonto}</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{formatCurrency(loan.proxCuota.montoTotal, moneda)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{LOAN_DETAIL_LABELS.proxCuotaEstado}</Text>
                <View style={badgeStyles.badge}>
                  <Text style={badgeStyles.text}>{cuotaEstadoLabel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                variant="default"
                disabled={true}
                onPress={() => {}}
                style={styles.button}
              >
                {LOAN_DETAIL_LABELS.pay}
              </Button>
              <Button
                variant="outline"
                onPress={onClose}
                style={styles.button}
              >
                Cerrar
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 4,
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
  badgeSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  badgeTextSuccess: {
    fontSize: 13,
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
    fontSize: 13,
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
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#737373',
  },
});
