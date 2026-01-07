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
import type { LucideIcon } from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
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

interface FieldCardProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

function FieldCard({ icon: Icon, label, children }: FieldCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  return (
    <Card style={styles.fieldCard} colorScheme={colorScheme}>
      <CardContent style={styles.fieldContent}>
        <View style={styles.fieldHeader}>
          <View style={[styles.iconContainer, { borderColor }]}>
            <Icon size={18} color="#a61612" />
          </View>
          <Text style={[styles.fieldLabel, { color: secondaryTextColor }]}>
            {label}
          </Text>
        </View>
        <View style={styles.fieldValue}>
          {children}
        </View>
      </CardContent>
    </Card>
  );
}

interface AccountInfoField {
  key: string;
  icon: LucideIcon;
  label: string;
  render: (account: DtoCuenta) => React.ReactNode;
  condition?: (account: DtoCuenta) => boolean;
}

const getAccountInfoFields = (textColor: string): AccountInfoField[] => [
  {
    key: "availableBalance",
    icon: Banknote,
    label: ACCOUNT_DETAIL_FIELD_LABELS.availableBalance,
    render: (account) => (
      <Text style={[styles.valueText, styles.valueBold, { color: '#a61612' }]}>
        {formatAccountCurrency(account.saldo, account.moneda ?? undefined)}
      </Text>
    ),
  },
  {
    key: "accountStatus",
    icon: Lock,
    label: ACCOUNT_DETAIL_FIELD_LABELS.accountStatus,
    render: (account) => {
      const isActive =
        account.estadoCuenta === EstadoCuenta.Activa ||
        account.estadoCuenta === EstadoCuenta.ActivaSoloParaAcreditar ||
        account.estadoCuenta === EstadoCuenta.ActivaSoloParaDebitar;
      const isBlockedOrClosed =
        account.estadoCuenta === EstadoCuenta.Bloqueada ||
        account.estadoCuenta === EstadoCuenta.Cerrada;

      return (
        <View style={styles.statusContainer}>
          {isActive ? (
            <>
              <CheckCircle2 size={16} color="#16a34a" />
              <Text style={styles.statusTextActive}>
                {account.estadoCuenta === EstadoCuenta.ActivaSoloParaAcreditar
                  ? ACCOUNT_DETAIL_STATUS_LABELS.activeCreditOnly
                  : account.estadoCuenta === EstadoCuenta.ActivaSoloParaDebitar
                  ? ACCOUNT_DETAIL_STATUS_LABELS.activeDebitOnly
                  : ACCOUNT_DETAIL_STATUS_LABELS.active}
              </Text>
            </>
          ) : isBlockedOrClosed ? (
            <>
              <Lock size={16} color="#dc2626" />
              <Text style={styles.statusTextBlocked}>
                {account.estadoCuenta === EstadoCuenta.Cerrada
                  ? ACCOUNT_DETAIL_STATUS_LABELS.closed
                  : ACCOUNT_DETAIL_STATUS_LABELS.blocked}
              </Text>
            </>
          ) : (
            <>
              <XCircle size={16} color="#737373" />
              <Text style={styles.statusTextInactive}>
                {account.estadoCuenta === EstadoCuenta.NoExiste
                  ? ACCOUNT_DETAIL_STATUS_LABELS.notExists
                  : ACCOUNT_DETAIL_STATUS_LABELS.inactive}
              </Text>
            </>
          )}
        </View>
      );
    },
  },
  {
    key: "accountIban",
    icon: CreditCard,
    label: ACCOUNT_DETAIL_FIELD_LABELS.accountIban,
    render: (account) => (
      <Text style={[styles.valueText, styles.valueMono, { color: textColor }]}>
        {formatIBAN(account.numeroCuentaIban || account.numeroCuenta || "")}
      </Text>
    ),
  },
  {
    key: "accountNumber",
    icon: Building2,
    label: ACCOUNT_DETAIL_FIELD_LABELS.accountNumber,
    render: (account) => (
      <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
        {account.numeroCuenta || "N/A"}
      </Text>
    ),
  },
  {
    key: "accountType",
    icon: TrendingUp,
    label: ACCOUNT_DETAIL_FIELD_LABELS.accountType,
    render: (account) => (
      <Text style={[styles.valueText, { color: textColor }]}>
        {ACCOUNT_TYPE_LABELS[account.tipoCuenta]}
      </Text>
    ),
  },
  {
    key: "currency",
    icon: Banknote,
    label: ACCOUNT_DETAIL_FIELD_LABELS.currency,
    render: (account) => (
      <Text style={[styles.valueText, { color: textColor }]}>
        {account.moneda && CURRENCY_LABELS[account.moneda]}{" "}
        <Text style={[styles.valueBold, { color: '#a61612' }]}>({account.moneda || "N/A"})</Text>
      </Text>
    ),
  },
  {
    key: "alias",
    icon: CreditCard,
    label: ACCOUNT_DETAIL_FIELD_LABELS.alias,
    render: (account) => (
      <Text style={[styles.valueText, styles.valueBold, { color: textColor }]}>
        {account.alias || "N/A"}
      </Text>
    ),
    condition: (account) => !!account.alias,
  },
  {
    key: "relationshipType",
    icon: Building2,
    label: ACCOUNT_DETAIL_FIELD_LABELS.relationshipType,
    render: (account) => (
      <Text style={[styles.valueText, { color: textColor }]}>
        {account.tipoRelacion !== undefined 
          ? RELATIONSHIP_TYPE_LABELS[account.tipoRelacion]
          : "N/A"}
      </Text>
    ),
    condition: (account) => account.tipoRelacion !== undefined,
  },
];

interface AccountInfoFieldsProps {
  account: DtoCuenta;
}

export default function AccountInfoFields({ account }: AccountInfoFieldsProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const fields = getAccountInfoFields(textColor);

  return (
    <View style={styles.container}>
      {fields.map((field) => {
        if (field.condition && !field.condition(account)) {
          return null;
        }

        return (
          <FieldCard key={field.key} icon={field.icon} label={field.label}>
            {field.render(account)}
          </FieldCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  fieldCard: {
    marginBottom: 0,
  },
  fieldContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(166, 22, 18, 0.05)',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  fieldValue: {
    marginLeft: 42, // Align with icon + gap
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

