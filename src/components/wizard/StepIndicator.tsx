import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  stepIds: string[];
}

export default function StepIndicator({ totalSteps, currentStep, stepIds }: StepIndicatorProps) {
  const colorScheme = useColorScheme();
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const inactiveBg = getCardBgColor(colorScheme);

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View key={stepIds[index]} style={styles.stepContainer}>
          <View
            style={[
              styles.step,
              {
                backgroundColor: index <= currentStep ? '#a61612' : inactiveBg,
                borderColor: index <= currentStep ? '#a61612' : borderColor,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                {
                  color: index <= currentStep ? '#ffffff' : secondaryTextColor,
                },
              ]}
            >
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.line,
                {
                  backgroundColor: index < currentStep ? '#a61612' : borderColor,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  line: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
});
