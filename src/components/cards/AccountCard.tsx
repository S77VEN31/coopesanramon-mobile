import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { CheckCircle2, Lock, XCircle, CreditCard } from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { type DtoCuenta } from '../../services/api/accounts.api';
import { EstadoCuenta } from '../../constants/enums';
import { ESTADO_CUENTA_LABELS, ESTADO_CUENTA_STYLE } from '../../constants/accounts.constants';
import { formatAccountCurrency } from '../../lib/utils/accounts.utils';
import { formatIBAN } from '../../lib/utils/format.utils';

interface AccountCardProps {
  account: DtoCuenta;
  onPress: () => void;
}

export default function AccountCard({ account, onPress }: AccountCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  
  const iban = account.numeroCuentaIban || account.numeroCuenta || "";
  const moneda = account.moneda || "CRC";
  const estadoCuenta = account.estadoCuenta ?? EstadoCuenta.Inactiva;
  const estadoStyle = ESTADO_CUENTA_STYLE[estadoCuenta] ?? "Inactiva";
  
  const renderStatusBadge = () => {
    const estadoLabel = ESTADO_CUENTA_LABELS[estadoCuenta] ?? "Inactiva";
    
    if (estadoStyle === "Activa") {
      return (
        <View style={styles.statusBadgeActive}>
          <CheckCircle2 size={14} color="#16a34a" />
          <Text style={styles.statusTextActive}>
            {estadoLabel}
          </Text>
        </View>
      );
    } else if (estadoStyle === "Bloqueada") {
      return (
        <View style={styles.statusBadgeBlocked}>
          <Lock size={14} color="#dc2626" />
          <Text style={styles.statusTextBlocked}>
            {estadoLabel}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.statusBadgeInactive}>
          <XCircle size={14} color="#737373" />
          <Text style={styles.statusTextInactive}>
            {estadoLabel}
          </Text>
        </View>
      );
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressablePressed
      ]}
    >
      <Card style={styles.card} colorScheme={colorScheme}>
        <View style={styles.topBorder} />
        <CardContent style={styles.content}>
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <CreditCard size={20} color="#a61612" />
            </View>
            <View style={styles.accountInfo}>
              <Text style={[styles.iban, { color: textColor }]}>
                {formatIBAN(iban)}
              </Text>
              {account.alias && (
                <Text style={[styles.alias, { color: secondaryTextColor }]} numberOfLines={1}>
                  {account.alias}
                </Text>
              )}
            </View>
          </View>
          
          <View style={[styles.balanceSection, { borderTopColor: borderColor }]}>
            <Text style={[styles.balance, { color: textColor }]}>
              {formatAccountCurrency(account.saldo, moneda)}
            </Text>
            {renderStatusBadge()}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 12,
  },
  pressablePressed: {
    transform: [{ scale: 0.98 }],
  },
  card: {
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
  content: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  iban: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  alias: {
    fontSize: 13,
    opacity: 0.8,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  currencyBadge: {
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexShrink: 0,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a61612',
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  statusTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  statusBadgeBlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  statusTextBlocked: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  statusBadgeInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(115, 115, 115, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(115, 115, 115, 0.2)',
  },
  statusTextInactive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737373',
  },
});

