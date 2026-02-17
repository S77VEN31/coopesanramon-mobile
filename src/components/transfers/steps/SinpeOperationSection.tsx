import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor } from '../../../../App';

interface SinpeOperationSectionProps {
  sinpeFlowType: 'enviar-fondos' | 'recibir-fondos';
  onSinpeFlowTypeChange: (value: 'enviar-fondos' | 'recibir-fondos') => void;
}

export default function SinpeOperationSection({
  sinpeFlowType,
  onSinpeFlowTypeChange,
}: SinpeOperationSectionProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  return (
    <View>
      <Text style={[styles.inputLabel, { color: textColor }]}>
        Tipo de operacion
      </Text>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, sinpeFlowType === 'enviar-fondos' && styles.tabActive]}
          onPress={() => onSinpeFlowTypeChange('enviar-fondos')}
        >
          <ArrowUpRight size={16} color={sinpeFlowType === 'enviar-fondos' ? '#a61612' : secondaryTextColor} />
          <Text style={[styles.tabText, { color: sinpeFlowType === 'enviar-fondos' ? '#a61612' : secondaryTextColor }]}>
            Enviar fondos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, sinpeFlowType === 'recibir-fondos' && styles.tabActive]}
          onPress={() => onSinpeFlowTypeChange('recibir-fondos')}
        >
          <ArrowDownLeft size={16} color={sinpeFlowType === 'recibir-fondos' ? '#a61612' : secondaryTextColor} />
          <Text style={[styles.tabText, { color: sinpeFlowType === 'recibir-fondos' ? '#a61612' : secondaryTextColor }]}>
            Traer fondos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#a61612',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
