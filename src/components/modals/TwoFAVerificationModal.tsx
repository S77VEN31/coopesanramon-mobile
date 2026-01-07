import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSecondFactorStore, requiresOtp, requiresEmail, formatTimeRemaining } from '@/lib/states/secondFactor.store';
import { TipoDesafio } from '@/services/api';
import { OTPInput } from '../ui/OTPInput';
import { Button } from '../ui/Button';
import { AlertCircle, KeyRound, Mail, TimerOff } from 'lucide-react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';
import { useColorScheme } from 'react-native';

interface TwoFAVerificationModalProps {
  title?: string;
  description?: string;
}

export default function TwoFAVerificationModal({
  title = 'Verificación de Seguridad',
  description,
}: TwoFAVerificationModalProps) {
  const defaultDescription = 'Para continuar, ingresa los códigos de verificación solicitados.';
  const displayDescription = description ?? defaultDescription;
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const {
    isModalOpen,
    currentChallenge,
    isCreatingChallenge,
    isValidating,
    isExecutingOperation,
    validationError,
    operationSuccess,
    operationError,
    remainingAttempts,
    timeRemaining,
    validatedesafio,
    closeModal,
    resetState: reset2FAState,
    startCountdown,
    stopCountdown,
  } = useSecondFactorStore();

  // 2FA codes state
  const [otpCode, setOtpCode] = useState('');
  const [emailCode, setEmailCode] = useState('');

  // Reset codes when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setOtpCode('');
      setEmailCode('');
    }
  }, [isModalOpen]);

  // Start countdown when challenge is created
  useEffect(() => {
    if (currentChallenge && isModalOpen) {
      if (currentChallenge.tiempoExpiracionSegundos != null && currentChallenge.tiempoExpiracionSegundos > 0) {
        startCountdown();
      }
    }
    return () => {
      stopCountdown();
    };
  }, [currentChallenge, isModalOpen, startCountdown, stopCountdown]);

  // Helper to check if challenge has required retos
  const hasRequiredChallenges = (retosSolicitados: TipoDesafio[] | null): boolean => {
    return retosSolicitados !== null && retosSolicitados.length > 0;
  };

  // Check if challenge is expired
  const hasRetos = currentChallenge ? hasRequiredChallenges(currentChallenge.retosSolicitados) : false;
  const isChallengeExpired = hasRetos && timeRemaining <= 0;
  const isAttemptsExhausted = hasRetos && remainingAttempts <= 0;
  const showOperationError = operationError && !isExecutingOperation;

  // Handle retry challenge
  const handleRetryChallenge = async () => {
    setOtpCode('');
    setEmailCode('');
    reset2FAState();
    closeModal();
  };

  // Handle validate
  const handleValidate = async () => {
    if (!currentChallenge) return;

    const hasRetosLocal = hasRequiredChallenges(currentChallenge.retosSolicitados);
    const finalOtp = hasRetosLocal && requiresOtp(currentChallenge.retosSolicitados) ? otpCode : (hasRetosLocal ? undefined : '');
    const finalEmail = hasRetosLocal && requiresEmail(currentChallenge.retosSolicitados) ? emailCode : (hasRetosLocal ? undefined : '');

    await validatedesafio(
      finalOtp || undefined,
      finalEmail || undefined
    );
  };

  // Hide modal when operation succeeds (parent component will show success modal and close this)
  if (!isModalOpen || !currentChallenge || operationSuccess) {
    return null;
  }

  return (
    <Modal
      visible={isModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <Pressable style={styles.overlay} onPress={closeModal}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {showOperationError ? (
                <View style={styles.contentContainer}>
                  <View style={[styles.errorContainer, { borderColor, backgroundColor: colorScheme === 'dark' ? '#991b1b20' : '#fee2e2' }]}>
                    <View style={[styles.iconCircle, { backgroundColor: colorScheme === 'dark' ? '#991b1b40' : '#fee2e2' }]}>
                      <AlertCircle size={32} color="#991b1b" />
                    </View>
                    <Text style={[styles.errorTitle, { color: textColor }]}>Error en la Operación</Text>
                    <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>{operationError}</Text>
                  </View>
                  <View style={styles.buttonRow}>
                    <Button onPress={closeModal} style={styles.fullWidthButton}>
                      Cerrar
                    </Button>
                  </View>
                </View>
              ) : (isChallengeExpired || isAttemptsExhausted) ? (
                <View style={styles.contentContainer}>
                  <View style={[styles.errorContainer, { borderColor, backgroundColor: colorScheme === 'dark' ? '#991b1b20' : '#fee2e2' }]}>
                    <View style={[styles.iconCircle, { backgroundColor: colorScheme === 'dark' ? '#991b1b40' : '#fee2e2' }]}>
                      <TimerOff size={32} color="#991b1b" />
                    </View>
                    <Text style={[styles.errorTitle, { color: textColor }]}>
                      {isChallengeExpired ? 'Tiempo Expirado' : 'Intentos Agotados'}
                    </Text>
                    <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>
                      {isChallengeExpired
                        ? 'El tiempo para completar la verificación ha expirado. Por favor, intenta nuevamente.'
                        : 'Has agotado todos los intentos disponibles. Por favor, intenta nuevamente.'}
                    </Text>
                  </View>
                  <View style={styles.buttonRow}>
                    <Button
                      onPress={handleRetryChallenge}
                      disabled={isCreatingChallenge}
                      loading={isCreatingChallenge}
                      style={styles.fullWidthButton}
                    >
                      Intentar Nuevamente
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.contentContainer}>
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                    {description !== undefined && (
                      <Text style={[styles.description, { color: secondaryTextColor }]}>
                        {displayDescription}
                      </Text>
                    )}
                  </View>

                  {/* Timer and Attempts */}
                  <View style={[styles.statsContainer, { borderColor }]}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Tiempo</Text>
                      <Text style={[styles.statValue, { color: textColor }]}>
                        {formatTimeRemaining(timeRemaining)}
                      </Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Intentos</Text>
                      <Text style={[styles.statValue, { color: textColor }]}>
                        {remainingAttempts === 1 ? 'Último intento' : `${remainingAttempts} restantes`}
                      </Text>
                    </View>
                  </View>

                  {timeRemaining === 0 && (
                    <View style={[styles.alertContainer, { borderColor, backgroundColor: colorScheme === 'dark' ? '#991b1b20' : '#fee2e2' }]}>
                      <AlertCircle size={16} color="#991b1b" />
                      <Text style={[styles.alertText, { color: '#991b1b' }]}>
                        El tiempo para completar la verificación ha expirado.
                      </Text>
                    </View>
                  )}

                  {validationError && (
                    <View style={[styles.alertContainer, { borderColor, backgroundColor: colorScheme === 'dark' ? '#991b1b20' : '#fee2e2' }]}>
                      <AlertCircle size={16} color="#991b1b" />
                      <Text style={[styles.alertText, { color: '#991b1b' }]}>{validationError}</Text>
                    </View>
                  )}

                  {/* Code Inputs */}
                  <View style={styles.codesContainer}>
                    {requiresOtp(currentChallenge.retosSolicitados) && (
                      <View style={styles.codeInputGroup}>
                        <View style={styles.codeLabel}>
                          <KeyRound size={16} color="#a61612" />
                          <Text style={[styles.codeLabelText, { color: textColor }]}>Código OTP</Text>
                        </View>
                        <OTPInput
                          value={otpCode}
                          onChange={setOtpCode}
                          disabled={isValidating}
                          colorScheme={colorScheme}
                        />
                        <Text style={[styles.codeHint, { color: secondaryTextColor }]}>
                          Ingresa el código de 6 dígitos de tu aplicación autenticadora
                        </Text>
                      </View>
                    )}

                    {requiresEmail(currentChallenge.retosSolicitados) && (
                      <View style={styles.codeInputGroup}>
                        <View style={styles.codeLabel}>
                          <Mail size={16} color="#a61612" />
                          <Text style={[styles.codeLabelText, { color: textColor }]}>Código de Email</Text>
                        </View>
                        <OTPInput
                          value={emailCode}
                          onChange={setEmailCode}
                          disabled={isValidating}
                          colorScheme={colorScheme}
                        />
                        <Text style={[styles.codeHint, { color: secondaryTextColor }]}>
                          Revisa tu bandeja de entrada, el código fue enviado a tu correo electrónico
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.buttonRow}>
                    <Button
                      variant="outline"
                      onPress={closeModal}
                      style={styles.halfWidthButton}
                      disabled={isValidating || isExecutingOperation}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onPress={handleValidate}
                      disabled={isValidating || isExecutingOperation || timeRemaining === 0}
                      loading={isValidating || isExecutingOperation}
                      style={styles.halfWidthButton}
                    >
                      Verificar
                    </Button>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 14,
    flex: 1,
  },
  codesContainer: {
    gap: 24,
    marginBottom: 24,
  },
  codeInputGroup: {
    gap: 12,
  },
  codeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  codeLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  codeHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  fullWidthButton: {
    flex: 1,
  },
  halfWidthButton: {
    flex: 1,
  },
  errorContainer: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

