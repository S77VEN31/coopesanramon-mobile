import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Phone, User, Building2 } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';

interface WalletInfoCardProps {
  titular: string | null;
  monedero: string | null;
  nombreBanco: string | null;
  style?: any;
}

export default function WalletInfoCard({ titular, monedero, nombreBanco, style }: WalletInfoCardProps) {
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
          <Phone size={14} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: secondaryTextColor }]}>Teléfono</Text>
          <Text style={[styles.value, { color: textColor }]}>{monedero || '-'}</Text>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: borderColor }]} />
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Building2 size={14} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: secondaryTextColor }]}>Entidad</Text>
          <Text style={[styles.value, { color: textColor }]}>{nombreBanco || '-'}</Text>
        </View>
      </View>
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
