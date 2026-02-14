import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { CheckCircle2, CreditCard, Wallet, Smartphone, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { Card, CardContent } from '../../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../../App';
import { formatCurrency } from '../../../lib/utils/format.utils';
import type { DtoCuenta } from '../../../services/api/accounts.api';
import type { CuentaFavoritaInternaItem } from '../../../hooks/use-local-transfer';
import type { CuentaSinpeFavoritaItem } from '../../../hooks/use-sinpe-transfer';
import type { MonederoFavoritoItem } from '../../../hooks/use-sinpe-movil-transfer';

interface ConfirmationStepProps {
  transferType: 'local' | 'sinpe' | 'sinpe-mobile';
  sourceAccount: DtoCuenta | null;
  // SINPE flow type
  sinpeFlowType?: 'enviar-fondos' | 'recibir-fondos';
  sinpeTransferType?: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null;
  // Local transfer
  localDestinationType?: 'favorites' | 'own' | 'manual';
  selectedFavoriteAccount?: CuentaFavoritaInternaItem | null;
  selectedOwnAccount?: DtoCuenta | null;
  destinationIban?: string;
  // SINPE transfer
  sinpeDestinationType?: 'favorites' | 'manual';
  selectedSinpeFavoriteAccount?: CuentaSinpeFavoritaItem | null;
  sinpeDestinationIban?: string;
  // SINPE Móvil transfer
  sinpeMovilDestinationType?: 'favorites' | 'manual';
  selectedSinpeMovilFavoriteWallet?: MonederoFavoritoItem | null;
  sinpeMovilPhoneNumber?: string;
  // Common
  amount: string;
  description: string;
  email: string;
}

export default function ConfirmationStep({
  transferType,
  sourceAccount,
  sinpeFlowType,
  sinpeTransferType,
  localDestinationType,
  selectedFavoriteAccount,
  selectedOwnAccount,
  destinationIban,
  sinpeDestinationType,
  selectedSinpeFavoriteAccount,
  sinpeDestinationIban,
  sinpeMovilDestinationType,
  selectedSinpeMovilFavoriteWallet,
  sinpeMovilPhoneNumber,
  amount,
  description,
  email,
}: ConfirmationStepProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const getDestinationInfo = () => {
    if (transferType === 'local') {
      if (localDestinationType === 'favorites' && selectedFavoriteAccount) {
        return {
          label: 'Cuenta Favorita',
          account: selectedFavoriteAccount.numeroCuenta || '',
          titular: selectedFavoriteAccount.titular || 'N/A',
        };
      }
      if (localDestinationType === 'own' && selectedOwnAccount) {
        return {
          label: 'Mi Cuenta',
          account:
            selectedOwnAccount.numeroCuentaIban ||
            selectedOwnAccount.numeroCuenta ||
            '',
          titular: selectedOwnAccount.alias || 'N/A',
        };
      }
      if (localDestinationType === 'manual' && destinationIban) {
        return {
          label: 'Cuenta Manual',
          account: destinationIban,
          titular: 'Validado',
        };
      }
    }

    if (transferType === 'sinpe') {
      if (sinpeDestinationType === 'favorites' && selectedSinpeFavoriteAccount) {
        return {
          label: 'Cuenta Favorita SINPE',
          account: selectedSinpeFavoriteAccount.numeroCuentaDestino || '',
          titular: selectedSinpeFavoriteAccount.titularDestino || 'N/A',
        };
      }
      if (sinpeDestinationType === 'manual' && sinpeDestinationIban) {
        return {
          label: 'Cuenta SINPE Manual',
          account: sinpeDestinationIban,
          titular: 'Validado',
        };
      }
    }

    if (transferType === 'sinpe-mobile') {
      if (
        sinpeMovilDestinationType === 'favorites' &&
        selectedSinpeMovilFavoriteWallet
      ) {
        return {
          label: 'Monedero Favorito',
          account: selectedSinpeMovilFavoriteWallet.monedero || '',
          titular: selectedSinpeMovilFavoriteWallet.titular || 'N/A',
        };
      }
      if (sinpeMovilDestinationType === 'manual' && sinpeMovilPhoneNumber) {
        return {
          label: 'Monedero Manual',
          account: sinpeMovilPhoneNumber,
          titular: 'Validado',
        };
      }
    }

    return null;
  };

  const destinationInfo = getDestinationInfo();
  const amountNum = parseFloat(amount) || 0;
  const currency = sourceAccount?.moneda || 'CRC';

  const getTransferTypeLabel = () => {
    if (transferType === 'local') return 'Transferencia Local';
    if (transferType === 'sinpe') return 'Transferencia SINPE';
    return 'Transferencia SINPE Móvil';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <CheckCircle2 size={48} color="#a61612" />
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Revisa los detalles de tu transferencia
        </Text>
        <Text style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
          Verifica que toda la información sea correcta antes de confirmar
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        {/* Transfer Type */}
        <Card style={styles.detailCard} colorScheme={colorScheme}>
          <View style={styles.topBorder} />
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                {transferType === 'local' && <CreditCard size={20} color="#a61612" />}
                {transferType === 'sinpe' && <Wallet size={20} color="#a61612" />}
                {transferType === 'sinpe-mobile' && <Smartphone size={20} color="#a61612" />}
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Tipo de Transferencia
                </Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {getTransferTypeLabel()}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* SINPE Flow Info */}
        {transferType === 'sinpe' && sinpeFlowType && sinpeTransferType && (
          <Card style={styles.detailCard} colorScheme={colorScheme}>
            <View style={styles.topBorder} />
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  {sinpeFlowType === 'enviar-fondos' ? (
                    <ArrowUpRight size={20} color="#a61612" />
                  ) : (
                    <ArrowDownLeft size={20} color="#a61612" />
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Tipo de operación
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {sinpeFlowType === 'enviar-fondos' ? 'Enviar fondos' : 'Traer fondos'}
                  </Text>
                  <View style={[styles.separator, { borderTopColor: borderColor }]} />
                  <Text style={[styles.detailSubtext, { color: secondaryTextColor }]}>
                    Modo:{' '}
                    {sinpeTransferType === 'pagos-inmediatos' && 'Tiempo real'}
                    {sinpeTransferType === 'creditos-directos' && 'Diferido'}
                    {sinpeTransferType === 'debitos-tiempo-real' && 'Débito tiempo real'}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Source Account */}
        {sourceAccount && (
          <Card style={styles.detailCard} colorScheme={colorScheme}>
            <View style={styles.topBorder} />
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <CreditCard size={20} color="#a61612" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Cuenta Origen
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {sourceAccount.numeroCuentaIban || sourceAccount.numeroCuenta || ''}
                  </Text>
                  <View style={[styles.separator, { borderTopColor: borderColor }]} />
                  <Text style={[styles.detailSubtext, { color: secondaryTextColor }]}>
                    Saldo disponible:{' '}
                    {formatCurrency(sourceAccount.saldo, sourceAccount.moneda || 'CRC')}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Destination Account */}
        {destinationInfo && (
          <Card style={styles.detailCard} colorScheme={colorScheme}>
            <View style={styles.topBorder} />
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <CreditCard size={20} color="#a61612" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    {destinationInfo.label}
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {destinationInfo.account}
                  </Text>
                  <View style={[styles.separator, { borderTopColor: borderColor }]} />
                  <Text style={[styles.detailSubtext, { color: secondaryTextColor }]}>
                    Titular: {destinationInfo.titular}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Amount */}
        <Card style={styles.detailCard} colorScheme={colorScheme}>
          <View style={styles.topBorder} />
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.currencyIcon}>₡</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Monto
                </Text>
                <Text style={[styles.detailValue, { color: '#a61612', fontSize: 24 }]}>
                  {formatCurrency(amountNum, currency)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Description */}
        {description && (
          <Card style={styles.detailCard} colorScheme={colorScheme}>
            <View style={styles.topBorder} />
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.textIcon}>📝</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Descripción
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {description}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Email */}
        {email && (
          <Card style={styles.detailCard} colorScheme={colorScheme}>
            <View style={styles.topBorder} />
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.textIcon}>✉️</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>
                    Correo Electrónico
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {email}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 12,
  },
  detailCard: {
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
  cardContent: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailSubtext: {
    fontSize: 14,
    opacity: 0.8,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    marginBottom: 8,
  },
  currencyIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#a61612',
  },
  textIcon: {
    fontSize: 20,
  },
});

