import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { FileText } from 'lucide-react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils/format.utils';
import { ESTADO_CUOTA_LABELS, ESTADO_CUOTA_STYLE } from '../../constants/loans.constants';
import { INSTALLMENT_DETAIL_LABELS } from '../../constants/payments.constants';
import type { DtoCuotaPrestamo } from '../../services/api/loans.api';

interface InstallmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  installmentDetail: DtoCuotaPrestamo | null;
  isLoading: boolean;
  error: string | null;
}

export default function InstallmentDetailsModal({
  visible,
  onClose,
  installmentDetail,
  isLoading,
  error,
}: InstallmentDetailsModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const cuota = installmentDetail;
  const moneda = cuota?.moneda || 'CRC';

  const estadoStyle = cuota ? (ESTADO_CUOTA_STYLE[cuota.estado] ?? 'default') : 'default';
  const estadoLabel = cuota ? (ESTADO_CUOTA_LABELS[cuota.estado] ?? 'No Definido') : '';

  const getBadgeStyles = () => {
    switch (estadoStyle) {
      case 'success': return { badge: styles.badgeSuccess, text: styles.badgeTextSuccess };
      case 'danger': return { badge: styles.badgeDanger, text: styles.badgeTextDanger };
      case 'warning': return { badge: styles.badgeWarning, text: styles.badgeTextWarning };
      default: return { badge: styles.badgeDefault, text: styles.badgeTextDefault };
    }
  };

  const badgeStyles = getBadgeStyles();

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#a61612" />
          <Text style={[styles.loadingText, { color: secondaryTextColor }]}>Cargando detalle...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!cuota) return null;

    return (
      <>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <FileText size={40} color="#a61612" />
          </View>
        </View>

        <Text style={[styles.title, { color: textColor }]}>
          {INSTALLMENT_DETAIL_LABELS.title} #{cuota.numeroCuota}
        </Text>

        <View style={[styles.detailsContainer, { borderColor }]}>
          {cuota.numeroOperacion && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INSTALLMENT_DETAIL_LABELS.numeroOperacion}</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{cuota.numeroOperacion}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INSTALLMENT_DETAIL_LABELS.fechaPago}</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>{formatDate(cuota.fechaPago)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INSTALLMENT_DETAIL_LABELS.montoTotal}</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>{formatCurrency(cuota.montoTotal, moneda)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{INSTALLMENT_DETAIL_LABELS.estado}</Text>
            <View style={badgeStyles.badge}>
              <Text style={badgeStyles.text}>{estadoLabel}</Text>
            </View>
          </View>
        </View>

        {cuota.rubros && cuota.rubros.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {INSTALLMENT_DETAIL_LABELS.rubros}
            </Text>
            <View style={[styles.rubrosContainer, { borderColor }]}>
              <View style={[styles.rubrosHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.rubrosHeaderDesc, { color: secondaryTextColor }]} numberOfLines={1}>
                  {INSTALLMENT_DETAIL_LABELS.descripcionRubro}
                </Text>
                <Text style={[styles.rubrosHeaderNum, { color: secondaryTextColor }]}>
                  {INSTALLMENT_DETAIL_LABELS.monto}
                </Text>
                <Text style={[styles.rubrosHeaderNum, { color: secondaryTextColor }]}>
                  {INSTALLMENT_DETAIL_LABELS.montoPagado}
                </Text>
              </View>
              {cuota.rubros.map((rubro, index) => (
                <View key={index} style={[styles.rubrosRow, { borderBottomColor: borderColor }]}>
                  <Text style={[styles.rubrosDesc, { color: textColor }]} numberOfLines={1}>
                    {rubro.descripcionRubro || '—'}
                  </Text>
                  <Text style={[styles.rubrosNum, { color: textColor }]}>{formatCurrency(rubro.monto, moneda)}</Text>
                  <Text style={[styles.rubrosNum, { color: textColor }]}>{formatCurrency(rubro.montoPagado, moneda)}</Text>
                </View>
              ))}
              <View style={styles.rubrosTotal}>
                <Text style={styles.rubrosDescTotal}>Total</Text>
                <Text style={styles.rubrosNumTotal}>{formatCurrency(cuota.montoTotal, moneda)}</Text>
                <Text style={styles.rubrosNumTotal}>{formatCurrency(cuota.montoTotal, moneda)}</Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.buttonsContainer}>
          <Button variant="outline" onPress={onClose} style={styles.button}>
            Cerrar
          </Button>
        </View>
      </>
    );
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
            {renderContent()}
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
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
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
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
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
  rubrosContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  rubrosHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(166, 22, 18, 0.05)',
  },
  rubrosHeaderDesc: {
    flex: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  rubrosHeaderNum: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  rubrosRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rubrosDesc: {
    flex: 2,
    fontSize: 13,
  },
  rubrosNum: {
    flex: 1,
    fontSize: 13,
    textAlign: 'right',
  },
  rubrosTotal: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(166, 22, 18, 0.08)',
    borderTopWidth: 2,
    borderTopColor: '#a61612',
  },
  rubrosDescTotal: {
    flex: 2,
    fontSize: 13,
    fontWeight: '700',
    color: '#a61612',
  },
  rubrosNumTotal: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    color: '#a61612',
  },
  buttonsContainer: {
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
