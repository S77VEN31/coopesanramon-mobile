import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  TrendingUp,
  XCircle,
} from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import DetailField from '../ui/DetailField';
import { getTextColor } from '../../../App';
import { type DtoCuenta } from '../../services/api/accounts.api';
import { EstadoCuenta } from '../../constants/enums';
import {
  ACCOUNT_DETAIL_FIELD_LABELS,
  ACCOUNT_DETAIL_STATUS_LABELS,
  ACCOUNT_TYPE_LABELS,
  RELATIONSHIP_TYPE_LABELS,
  CURRENCY_LABELS,
} from '../../constants/accounts.constants';
import { formatAccountCurrency } from '../../lib/utils/accounts.utils';
import { formatIBAN } from '../../lib/utils/format.utils';

interface AccountDetailCardProps {
  account: DtoCuenta;
}

export default function AccountDetailCard({ account }: AccountDetailCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);

  // Estado de la cuenta
  const estadoCuenta = account.estadoCuenta ?? EstadoCuenta.Inactiva;
  const isActive =
    estadoCuenta === EstadoCuenta.Activa ||
    estadoCuenta === EstadoCuenta.ActivaSoloParaAcreditar ||
    estadoCuenta === EstadoCuenta.ActivaSoloParaDebitar;
  const isBlockedOrClosed =
    estadoCuenta === EstadoCuenta.Bloqueada ||
    estadoCuenta === EstadoCuenta.Cerrada;

  const renderStatus = () => {
    if (isActive) {
      return (
        <View style={styles.statusContainer}>
          <CheckCircle2 size={16} color="#16a34a" />
          <Text style={styles.statusTextActive}>
            {estadoCuenta === EstadoCuenta.ActivaSoloParaAcreditar
              ? ACCOUNT_DETAIL_STATUS_LABELS.activeCreditOnly
              : estadoCuenta === EstadoCuenta.ActivaSoloParaDebitar
              ? ACCOUNT_DETAIL_STATUS_LABELS.activeDebitOnly
              : ACCOUNT_DETAIL_STATUS_LABELS.active}
          </Text>
        </View>
      );
    } else if (isBlockedOrClosed) {
      return (
        <View style={styles.statusContainer}>
          <Lock size={16} color="#dc2626" />
          <Text style={styles.statusTextBlocked}>
            {estadoCuenta === EstadoCuenta.Cerrada
              ? ACCOUNT_DETAIL_STATUS_LABELS.closed
              : ACCOUNT_DETAIL_STATUS_LABELS.blocked}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.statusContainer}>
          <XCircle size={16} color="#737373" />
          <Text style={styles.statusTextInactive}>
            {estadoCuenta === EstadoCuenta.NoExiste
              ? ACCOUNT_DETAIL_STATUS_LABELS.notExists
              : ACCOUNT_DETAIL_STATUS_LABELS.inactive}
          </Text>
        </View>
      );
    }
  };

  return (
    <Card style={styles.card} colorScheme={colorScheme}>
        <CardContent style={styles.content}>
          <DetailField
            icon={Banknote}
            label={ACCOUNT_DETAIL_FIELD_LABELS.availableBalance}
            value={
              <Text style={[styles.valueText, styles.valueBold, { color: '#a61612' }]}>
                {formatAccountCurrency(account.saldo, account.moneda ?? undefined)}
              </Text>
            }
          />

          <DetailField
            icon={Lock}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountStatus}
            value={renderStatus()}
          />

          <DetailField
            icon={CreditCard}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountIban}
            value={
              <Text style={[styles.valueText, styles.valueMono, { color: textColor }]}>
                {formatIBAN(account.numeroCuentaIban || account.numeroCuenta || "")}
              </Text>
            }
          />

          <DetailField
            icon={Building2}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountNumber}
            value={
              <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                {account.numeroCuenta || "N/A"}
              </Text>
            }
          />

          <DetailField
            icon={TrendingUp}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountType}
            value={
              <Text style={[styles.valueText, { color: textColor }]}>
                {ACCOUNT_TYPE_LABELS[account.tipoCuenta]}
              </Text>
            }
          />

          <DetailField
            icon={Banknote}
            label={ACCOUNT_DETAIL_FIELD_LABELS.currency}
            value={
              <Text style={[styles.valueText, { color: textColor }]}>
                {account.moneda && CURRENCY_LABELS[account.moneda]}{" "}
                <Text style={[styles.valueBold, { color: '#a61612' }]}>({account.moneda || "N/A"})</Text>
              </Text>
            }
          />

          {account.alias && (
            <DetailField
              icon={CreditCard}
              label={ACCOUNT_DETAIL_FIELD_LABELS.alias}
              value={
                <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                  {account.alias}
                </Text>
              }
            />
          )}

          {account.tipoRelacion !== undefined && (
            <DetailField
              icon={Building2}
              label={ACCOUNT_DETAIL_FIELD_LABELS.relationshipType}
              value={
                <Text style={[styles.valueText, { color: textColor }]}>
                  {RELATIONSHIP_TYPE_LABELS[account.tipoRelacion]}
                </Text>
              }
            />
          )}
        </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  valueText: {
    fontSize: 14,
  },
  valueBold: {
    fontWeight: '600',
  },
  valueMono: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  statusTextBlocked: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  statusTextInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#737373',
  },
});
