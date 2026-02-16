import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Home, Landmark, Smartphone } from 'lucide-react-native';
import { getSecondaryTextColor } from '../../../../App';
import OptionCard from '../../cards/OptionCard';

interface TransferTypeStepProps {
  selectedType: 'local' | 'sinpe' | 'sinpe-mobile' | null;
  onTypeSelect: (type: 'local' | 'sinpe' | 'sinpe-mobile') => void;
}

const transferTypes = [
  {
    id: 'local' as const,
    icon: Home,
    title: 'Transferencia Local',
    description: 'Entre cuentas del mismo banco',
  },
  {
    id: 'sinpe' as const,
    icon: Landmark,
    title: 'Otros Bancos (SINPE)',
    description: 'A cuentas de otros bancos',
  },
  {
    id: 'sinpe-mobile' as const,
    icon: Smartphone,
    title: 'SINPE Móvil',
    description: 'A monederos electrónicos',
  },
];

export default function TransferTypeStep({ selectedType, onTypeSelect }: TransferTypeStepProps) {
  const colorScheme = useColorScheme();
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  return (
    <View style={styles.container}>
      <Text style={[styles.instruction, { color: secondaryTextColor }]}>
        Selecciona el tipo de transferencia que deseas realizar
      </Text>
      <View style={styles.optionsContainer}>
        {transferTypes.map((type) => (
          <OptionCard
            key={type.id}
            title={type.title}
            description={type.description}
            icon={type.icon}
            onPress={() => onTypeSelect(type.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
});
