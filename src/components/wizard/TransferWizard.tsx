import React, { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '../ui/Button';
import StepIndicator from './StepIndicator';
import { getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';

interface WizardStep {
  id: string;
  title: string;
  component: ReactNode;
  canGoNext?: () => boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  hideNavigation?: () => boolean;
  fallbackButton?: {
    label: string;
    onPress: () => void;
    show: () => boolean;
    style?: any;
  };
}

interface TransferWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  compactFooter?: boolean;
}

export default function TransferWizard({ steps, onComplete, onCancel, compactFooter = false }: TransferWizardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

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
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      steps[nextStep].onEnter?.();
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      steps[currentStep].onLeave?.();
      setCurrentStep(currentStep - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      {/* Step Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: textColor }]}>
          {currentStepData.title}
        </Text>
      </View>

      <StepIndicator
        totalSteps={steps.length}
        currentStep={currentStep}
        stepIds={steps.map(s => s.id)}
      />

      {/* Step Content */}
      <KeyboardAwareScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentContainerContent}
        bottomOffset={20}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {currentStepData.component}
      </KeyboardAwareScrollView>

      {/* Navigation Buttons */}
      {currentStepData.hideNavigation?.() ? null : <View style={[
        compactFooter ? styles.compactNavigationContainer : styles.navigationContainer,
        compactFooter && { borderTopColor: borderColor },
      ]}>
        {currentStep > 0 && !(!canGoNext() && currentStepData.fallbackButton?.show()) && (
          <Button
            variant="outline"
            size={compactFooter ? 'sm' : 'default'}
            onPress={handlePrevious}
            style={styles.navButton}
          >
            Anterior
          </Button>
        )}
        {!canGoNext() && currentStepData.fallbackButton?.show() ? (
          <Button
            variant="outline"
            size={compactFooter ? 'sm' : 'default'}
            onPress={currentStepData.fallbackButton.onPress}
            style={[styles.navButton, currentStepData.fallbackButton.style]}
          >
            {currentStepData.fallbackButton.label}
          </Button>
        ) : (
          <Button
            variant="default"
            size={compactFooter ? 'sm' : 'default'}
            onPress={handleNext}
            disabled={!canGoNext()}
            style={styles.navButton}
          >
            {currentStep === steps.length - 1 ? 'Confirmar' : 'Siguiente'}
          </Button>
        )}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  contentContainerContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  compactNavigationContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    flexShrink: 0,
  },
  navButton: {
    flex: 1,
  },
});

