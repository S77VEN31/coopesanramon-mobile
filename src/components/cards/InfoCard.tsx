import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';

interface InfoCardItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface InfoCardProps {
  items: InfoCardItem[];
  style?: any;
}

export default function InfoCard({ items, style }: InfoCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBg = getCardBgColor(colorScheme);
  const isDark = colorScheme === 'dark';
  const iconBg = isDark ? '#a61612' : 'rgba(166, 22, 18, 0.1)';
  const iconColor = isDark ? '#ffffff' : '#a61612';

  return (
    <View style={[styles.container, { borderColor, backgroundColor: cardBg }, style]}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
          )}
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
              {React.isValidElement(item.icon)
                ? React.cloneElement(item.icon as React.ReactElement<any>, { size: 14, color: iconColor })
                : item.icon}
            </View>
            <View style={styles.info}>
              <Text style={[styles.label, { color: secondaryTextColor }]}>{item.label}</Text>
              <Text style={[styles.value, { color: textColor }]}>{item.value}</Text>
            </View>
          </View>
        </React.Fragment>
      ))}
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
