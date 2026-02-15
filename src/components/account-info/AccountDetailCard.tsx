import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import {
  Banknote,
  Building2,
  CreditCard,
  Lock,
  TrendingUp,
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
  const isDark = colorScheme === 'dark';
  const textColor = getTextColor(colorScheme);
  const balanceColor = isDark ? '#ffffff' : '#a61612';

  // Estado de la cuenta
  const estadoCuenta = account.estadoCuenta ?? EstadoCuenta.Inactiva;
  const isActive =
    estadoCuenta === EstadoCuenta.Activa ||
    estadoCuenta === EstadoCuenta.ActivaSoloParaAcreditar ||
    estadoCuenta === EstadoCuenta.ActivaSoloParaDebitar;
  const isBlockedOrClosed =
    estadoCuenta === EstadoCuenta.Bloqueada ||
    estadoCuenta === EstadoCuenta.Cerrada;

  const getStatusInfo = () => {
    if (isActive) {
      const label = estadoCuenta === EstadoCuenta.ActivaSoloParaAcreditar
        ? ACCOUNT_DETAIL_STATUS_LABELS.activeCreditOnly
        : estadoCuenta === EstadoCuenta.ActivaSoloParaDebitar
        ? ACCOUNT_DETAIL_STATUS_LABELS.activeDebitOnly
        : ACCOUNT_DETAIL_STATUS_LABELS.active;
      return { label, bg: '#16a34a', text: '#ffffff' };
    } else if (isBlockedOrClosed) {
      const label = estadoCuenta === EstadoCuenta.Cerrada
        ? ACCOUNT_DETAIL_STATUS_LABELS.closed
        : ACCOUNT_DETAIL_STATUS_LABELS.blocked;
      return { label, bg: '#dc2626', text: '#ffffff' };
    } else {
      const label = estadoCuenta === EstadoCuenta.NoExiste
        ? ACCOUNT_DETAIL_STATUS_LABELS.notExists
        : ACCOUNT_DETAIL_STATUS_LABELS.inactive;
      return { label, bg: '#737373', text: '#ffffff' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card style={styles.card} colorScheme={colorScheme}>
        <CardContent style={styles.content}>
          <DetailField
            icon={Banknote}
            label={ACCOUNT_DETAIL_FIELD_LABELS.availableBalance}
            column
            value={
              <Text style={[styles.valueText, styles.valueBold, { color: balanceColor }]}>
                {formatAccountCurrency(account.saldo, account.moneda ?? undefined)}
              </Text>
            }
          />

          <DetailField
            icon={Lock}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountStatus}
            value={
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
                  {statusInfo.label}
                </Text>
              </View>
            }
          />

          <DetailField
            icon={CreditCard}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountIban}
            column
            value={
              <Text style={[styles.valueText, styles.valueMono, { color: textColor }]}>
                {formatIBAN(account.numeroCuentaIban || account.numeroCuenta || "")}
              </Text>
            }
          />

          <DetailField
            icon={Building2}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountNumber}
            column
            value={
              <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
                {account.numeroCuenta || "N/A"}
              </Text>
            }
          />

          <DetailField
            icon={TrendingUp}
            label={ACCOUNT_DETAIL_FIELD_LABELS.accountType}
            column
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
              <View style={styles.currencyValueRow}>
                <Text style={[styles.valueText, { color: textColor }]}>
                  {account.moneda && CURRENCY_LABELS[account.moneda]}
                </Text>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>{account.moneda || "N/A"}</Text>
                </View>
              </View>
            }
          />

          {account.alias && (
            <DetailField
              icon={CreditCard}
              label={ACCOUNT_DETAIL_FIELD_LABELS.alias}
              column
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
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currencyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
