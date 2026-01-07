import React, { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBackgroundColor } from '../../../App';

interface WizardStep {
  id: string;
  title: string;
  component: ReactNode;
  canGoNext?: () => boolean;
}

interface TransferWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
}

export default function TransferWizard({ steps, onComplete, onCancel }: TransferWizardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);

  const [currentStep, setCurrentStep] = useState(0);

  const canGoNext = () => {
    const step = steps[currentStep];
    if (step.canGoNext) {
      return step.canGoNext();
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.progressStepContainer}>
            <View
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    index <= currentStep ? '#a61612' : cardBackgroundColor,
                  borderColor: index <= currentStep ? '#a61612' : borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.progressStepNumber,
                  {
                    color: index <= currentStep ? '#ffffff' : secondaryTextColor,
                  },
                ]}
              >
                {index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  {
                    backgroundColor: index < currentStep ? '#a61612' : borderColor,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: textColor }]}>
          {currentStepData.title}
        </Text>
      </View>

      {/* Step Content */}
      <View style={styles.contentContainer}>{currentStepData.component}</View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={handlePrevious}
          style={[
            styles.navButton,
            styles.backButton,
            { backgroundColor: cardBackgroundColor, borderColor },
          ]}
        >
          <ChevronLeft size={20} color={textColor} />
          <Text style={[styles.navButtonText, { color: textColor }]}>
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Text>
        </TouchableOpacity>

        <Button
          onPress={handleNext}
          disabled={!canGoNext()}
          style={styles.nextButton}
        >
          <View style={styles.nextButtonContent}>
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Confirmar' : 'Siguiente'}
            </Text>
            {currentStep < steps.length - 1 && (
              <ChevronRight size={20} color="#ffffff" />
            )}
          </View>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButton: {
    maxWidth: 120,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

