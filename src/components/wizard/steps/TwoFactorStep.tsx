import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { KeyRound, Mail, AlertCircle, TimerOff } from 'lucide-react-native';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import MessageCard from '@/components/cards/MessageCard';
import { requiresOtp, requiresEmail, formatTimeRemaining } from '@/lib/states/secondFactor.store';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../../App';
import type { CreateChallengeResponse } from '@/services/api/secondFactor.api';

interface TwoFactorStepProps {
  currentChallenge: CreateChallengeResponse | null;
  isCreatingChallenge: boolean;
  isValidating?: boolean;
  isExecutingOperation?: boolean;
  validationError: string | null;
  operationError: string | null;
  remainingAttempts: number;
  timeRemaining: number;
  otpCode: string;
  emailCode: string;
  onOtpCodeChange: (code: string) => void;
  onEmailCodeChange: (code: string) => void;
  onRetryChallenge?: () => void;
  isRetrying?: boolean;
}

export default function TwoFactorStep({
  currentChallenge,
  isCreatingChallenge,
  isValidating = false,
  isExecutingOperation = false,
  validationError,
  operationError,
  remainingAttempts,
  timeRemaining,
  otpCode,
  emailCode,
  onOtpCodeChange,
  onEmailCodeChange,
  onRetryChallenge,
  isRetrying = false,
}: TwoFactorStepProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  if (isCreatingChallenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a61612" />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Creando desafío de seguridad...
        </Text>
      </View>
    );
  }

  if (operationError) {
    return (
      <MessageCard
        type="error"
        message="Error en la Operación"
        description={operationError}
        style={[styles.expiredCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
      />
    );
  }

  if (currentChallenge && (currentChallenge.retosSolicitados === null || currentChallenge.retosSolicitados.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a61612" />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Procesando operación...
        </Text>
      </View>
    );
  }

  if (!currentChallenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a61612" />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Preparando verificación...
        </Text>
      </View>
    );
  }

  const isExpired = timeRemaining <= 0 && currentChallenge.retosSolicitados !== null && currentChallenge.retosSolicitados.length > 0;
  const isAttemptsExhausted = remainingAttempts <= 0 && currentChallenge.retosSolicitados !== null && currentChallenge.retosSolicitados.length > 0;

  if (isAttemptsExhausted || isExpired) {
    return (
      <View style={styles.container}>
        <MessageCard
          type="error"
          icon={TimerOff}
          message={isAttemptsExhausted ? 'Intentos Agotados' : 'Tiempo Expirado'}
          description={isAttemptsExhausted
            ? 'Has agotado todos los intentos disponibles para validar el código de seguridad.'
            : 'El tiempo para ingresar el código de seguridad ha expirado.'}
          style={[styles.expiredCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
        />
        {onRetryChallenge && (
          <Button
            variant="default"
            size="sm"
            onPress={onRetryChallenge}
            loading={isRetrying}
            style={styles.retryButton}
          >
            Solicitar Nuevo Código
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timer and Attempts */}
      <View style={[styles.statsContainer, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Tiempo</Text>
          <Text style={[styles.statValue, { color: timeRemaining <= 30 ? '#a61612' : textColor }]}>
            {formatTimeRemaining(timeRemaining)}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Intentos</Text>
          <Text style={[styles.statValue, { color: remainingAttempts <= 2 ? '#a61612' : textColor }]}>
            {remainingAttempts === 1 ? 'Último intento' : `${remainingAttempts} restantes`}
          </Text>
        </View>
      </View>

      {validationError && (
        <View style={[styles.alertContainer, { borderColor, backgroundColor: colorScheme === 'dark' ? '#991b1b20' : '#fee2e2' }]}>
          <AlertCircle size={16} color="#991b1b" />
          <Text style={[styles.alertText, { color: '#991b1b' }]}>{validationError}</Text>
        </View>
      )}

      {/* Code Inputs */}
      <View style={styles.codesContainer}>
        {requiresEmail(currentChallenge.retosSolicitados) && (
          <View style={styles.codeInputGroup}>
            <View style={styles.codeLabel}>
              <Mail size={16} color={colorScheme === 'dark' ? '#ffffff' : '#a61612'} />
              <Text style={[styles.codeLabelText, { color: textColor }]}>Código de Email</Text>
            </View>
            <OTPInput
              value={emailCode}
              onChange={onEmailCodeChange}
              disabled={isValidating || isExecutingOperation}
              colorScheme={colorScheme}
              autoFocus={true}
            />
            <Text style={[styles.codeHint, { color: secondaryTextColor }]}>
              Revisa tu bandeja de entrada, el código fue enviado a tu correo electrónico
            </Text>
          </View>
        )}

        {requiresOtp(currentChallenge.retosSolicitados) && (
          <View style={styles.codeInputGroup}>
            <View style={styles.codeLabel}>
              <KeyRound size={16} color={colorScheme === 'dark' ? '#ffffff' : '#a61612'} />
              <Text style={[styles.codeLabelText, { color: textColor }]}>Código OTP</Text>
            </View>
            <OTPInput
              value={otpCode}
              onChange={onOtpCodeChange}
              disabled={isValidating || isExecutingOperation}
              colorScheme={colorScheme}
              autoFocus={!requiresEmail(currentChallenge.retosSolicitados)}
            />
            <Text style={[styles.codeHint, { color: secondaryTextColor }]}>
              Ingresa el código de 6 dígitos de tu aplicación autenticadora
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  alertText: {
    fontSize: 14,
    flex: 1,
  },
  codesContainer: {
    gap: 16,
  },
  codeInputGroup: {
    gap: 8,
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
  expiredCard: {
    borderWidth: 1,
    borderRadius: 12,
    flex: 0,
    minHeight: 0,
  },
  retryButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
});
