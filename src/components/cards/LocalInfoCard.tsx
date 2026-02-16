import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { User, CreditCard, Coins } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';

interface LocalInfoCardProps {
  titular: string | null;
  numeroCuenta: string | null;
  moneda?: string | null;
  style?: any;
}

export default function LocalInfoCard({ titular, numeroCuenta, moneda, style }: LocalInfoCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBg = getCardBgColor(colorScheme);
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#a61612';
  const iconBg = isDark ? '#a61612' : 'rgba(166, 22, 18, 0.1)';

  return (
    <View style={[styles.container, { borderColor, backgroundColor: cardBg }, style]}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <User size={14} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: secondaryTextColor }]}>Titular</Text>
          <Text style={[styles.value, { color: textColor }]}>{titular?.toUpperCase() || '-'}</Text>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: borderColor }]} />
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <CreditCard size={14} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: secondaryTextColor }]}>Cuenta</Text>
          <Text style={[styles.value, { color: textColor }]}>{numeroCuenta || '-'}</Text>
        </View>
      </View>
      {moneda != null && (
        <>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
              <Coins size={14} color={iconColor} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.label, { color: secondaryTextColor }]}>Moneda</Text>
              <Text style={[styles.value, { color: textColor }]}>{moneda || '-'}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
