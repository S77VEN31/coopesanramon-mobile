import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { getSecondaryTextColor, getBorderColor } from '../../../App';

interface DetailFieldProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: React.ReactNode;
  showDivider?: boolean;
  column?: boolean;
}

export default function DetailField({ icon: Icon, label, value, showDivider = true, column = false }: DetailFieldProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const iconColor = isDark ? '#ffffff' : '#a61612';
  const iconBg = isDark ? '#a61612' : 'rgba(166, 22, 18, 0.1)';

  return (
    <View style={[styles.field, showDivider && { borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={styles.fieldRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon size={14} color={iconColor} />
        </View>
        <View style={column ? styles.fieldContentColumn : styles.fieldContentRow}>
          <Text style={[styles.fieldLabel, { color: secondaryTextColor }]}>
            {label}
          </Text>
          <View style={column ? styles.fieldValueColumn : styles.fieldValueRow}>
            {value}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  fieldContentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldContentColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  fieldLabel: {
    fontSize: 13,
    flexShrink: 0,
  },
  fieldValueRow: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  fieldValueColumn: {
    marginTop: 4,
  },
});
