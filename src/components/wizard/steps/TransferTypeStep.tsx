import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Home, Landmark, Smartphone } from 'lucide-react-native';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBackgroundColor } from '../../../../App';

interface TransferTypeStepProps {
  selectedType: 'local' | 'sinpe' | 'sinpe-mobile' | null;
  onTypeSelect: (type: 'local' | 'sinpe' | 'sinpe-mobile') => void;
}

export default function TransferTypeStep({ selectedType, onTypeSelect }: TransferTypeStepProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

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

  return (
    <View style={styles.container}>
      <Text style={[styles.instruction, { color: secondaryTextColor }]}>
        Selecciona el tipo de transferencia que deseas realizar
      </Text>
      <View style={styles.optionsContainer}>
        {transferTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                {
                  backgroundColor: isSelected ? '#a61612' : cardBackgroundColor,
                  borderColor: isSelected ? '#a61612' : borderColor,
                },
              ]}
              onPress={() => onTypeSelect(type.id)}
            >
              <View style={styles.optionContent}>
                <Icon size={40} color={isSelected ? '#ffffff' : '#a61612'} />
                <Text
                  style={[
                    styles.optionTitle,
                    { color: isSelected ? '#ffffff' : textColor },
                  ]}
                >
                  {type.title}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    {
                      color: isSelected
                        ? 'rgba(255,255,255,0.8)'
                        : secondaryTextColor,
                    },
                  ]}
                >
                  {type.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  optionCard: {
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 120,
    overflow: 'hidden',
    padding: 20,
  },
  optionCardSelected: {
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});

