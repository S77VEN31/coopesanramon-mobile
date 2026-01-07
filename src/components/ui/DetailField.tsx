import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { getSecondaryTextColor, getBorderColor } from '../../../App';

interface DetailFieldProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: React.ReactNode;
}

export default function DetailField({ icon: Icon, label, value }: DetailFieldProps) {
  const colorScheme = useColorScheme();
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  return (
    <View style={[styles.field, { borderBottomColor: borderColor }]}>
      <View style={styles.fieldRow}>
        <View style={styles.fieldContent}>
          <Text style={[styles.fieldLabel, { color: secondaryTextColor }]}>
            {label}
          </Text>
          <View style={styles.fieldValue}>
            {value}
          </View>
        </View>
        <View style={styles.iconColumn}>
          <View style={styles.iconContainer}>
            <Icon size={16} color="#a61612" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldContent: {
    flex: 1,
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  fieldValue: {
    marginLeft: 0,
  },
  iconColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a61612',
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
    flexShrink: 0,
  },
});

