import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { CheckCircle2, X } from 'lucide-react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { Button } from '../ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/utils/format.utils';
import type {
  EnviarTransferenciaInternaResponse,
  EnviarTransferenciaSinpeResponse,
  EnviarTransferenciaCreditosDirectosResponse,
  EnviarTransferenciaDebitosTiempoRealResponse,
  EnviarSinpeMovilResponse,
} from '../../services/api/transfers.api';

type TransferResponse = 
  | EnviarTransferenciaInternaResponse 
  | EnviarTransferenciaSinpeResponse 
  | EnviarTransferenciaCreditosDirectosResponse 
  | EnviarTransferenciaDebitosTiempoRealResponse
  | EnviarSinpeMovilResponse;

interface TransferSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  transfer: TransferResponse | null;
  emailDestino?: string | null;
}

const isLocalTransfer = (transfer: TransferResponse): transfer is EnviarTransferenciaInternaResponse => {
  return 'origen' in transfer && 'destino' in transfer;
};

const isSinpeMovilTransfer = (transfer: TransferResponse): transfer is EnviarSinpeMovilResponse => {
  return 'monederoDestino' in transfer;
};

export default function TransferSuccessModal({
  visible,
  onClose,
  transfer,
  emailDestino,
}: TransferSuccessModalProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  if (!transfer) return null;

  const isLocal = isLocalTransfer(transfer);
  const isSinpeMovil = isSinpeMovilTransfer(transfer);
  
  const getReferenceNumber = () => {
    if (isLocal) {
      return transfer.numeroDocumentoCore;
    } else {
      return transfer.codigoReferenciaSinpe || transfer.numeroTransCore?.toString() || null;
    }
  };

  const getCurrency = () => {
    if (isLocal) {
      return transfer.codigoMoneda || 'CRC';
    } else {
      return transfer.codigoMonedaOrigen || transfer.codigoMonedaDestino || 'CRC';
    }
  };

  const getCommission = () => {
    if (isLocal) {
      return transfer.montoComision;
    }
    return null;
  };

  const referenceNumber = getReferenceNumber();
  const currency = getCurrency();
  const commission = getCommission();

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
              <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                <CheckCircle2 size={48} color="#16a34a" />
              </View>
            </View>

            <Text style={[styles.title, { color: textColor }]}>
              Transferencia Exitosa
            </Text>

            <Text style={[styles.message, { color: secondaryTextColor }]}>
              Tu transferencia ha sido procesada correctamente
            </Text>

            <View style={[styles.detailsContainer, { borderColor }]}>
              {referenceNumber && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Número de referencia:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {referenceNumber}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Monto:
                </Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {formatCurrency(transfer.monto, currency)}
                </Text>
              </View>

              {commission !== null && commission !== undefined && commission > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Comisión:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {formatCurrency(commission, currency)}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Fecha:
                </Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {formatDateTime(transfer.fechaCreacion)}
                </Text>
              </View>

              {isLocal && transfer.origen && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Cuenta origen:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {transfer.origen.cuentaIBAN}
                  </Text>
                </View>
              )}

              {isLocal && transfer.destino && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Cuenta destino:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {transfer.destino.cuentaIBAN}
                  </Text>
                </View>
              )}

              {!isLocal && transfer.numeroCuentaOrigen && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Cuenta origen:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {transfer.numeroCuentaOrigen}
                  </Text>
                </View>
              )}

              {!isLocal && !isSinpeMovil && transfer.numeroCuentaDestino && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Cuenta destino:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {transfer.numeroCuentaDestino}
                  </Text>
                </View>
              )}

              {isSinpeMovil && transfer.monederoDestino && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Monedero destino:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {transfer.monederoDestino}
                  </Text>
                </View>
              )}

              {transfer.detalle && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Descripción:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {transfer.detalle}
                  </Text>
                </View>
              )}

              {emailDestino && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Email destino:
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {emailDestino}
                  </Text>
                </View>
              )}
            </View>

            <Button onPress={onClose} style={styles.button}>
              Cerrar
            </Button>
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
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  button: {
    marginTop: 8,
  },
});

