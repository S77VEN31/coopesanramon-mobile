import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { KeyRound, Mail, TimerOff } from 'lucide-react-native';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import MessageCard from '@/components/cards/MessageCard';
import { requiresOtp, requiresEmail, formatTimeRemaining } from '@/lib/states/secondFactor.store';
import { getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../../App';
import { useSecondFactorStore } from '@/lib/states/secondFactor.store';
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
      <MessageCard
        type="loading"
        message="Creando desafío de seguridad..."
        description="Por favor espera mientras se genera tu código de verificación."
        style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
      />
    );
  }

  if (operationError) {
    return (
      <MessageCard
        type="error"
        message="Error en la Operación"
        description={operationError}
        style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
      />
    );
  }

  if (currentChallenge && (currentChallenge.retosSolicitados === null || currentChallenge.retosSolicitados.length === 0)) {
    return (
      <MessageCard
        type="loading"
        message="Procesando operación..."
        description="Esto puede tomar unos segundos."
        style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
      />
    );
  }

  if (!currentChallenge) {
    return (
      <MessageCard
        type="loading"
        message="Preparando verificación..."
        description="Configurando el proceso de verificación."
        style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
      />
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
          style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
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

  if (validationError) {
    const handleClearValidationError = () => {
      useSecondFactorStore.setState({ validationError: null, validationErrorRaw: null });
      onOtpCodeChange('');
      onEmailCodeChange('');
    };

    return (
      <View style={styles.container}>
        <MessageCard
          type="error"
          message="Error de Validación"
          description={validationError}
          style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
        />
        <Button
          variant="default"
          size="sm"
          onPress={handleClearValidationError}
          style={styles.retryButton}
        >
          Intentar Nuevamente
        </Button>
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
  messageCard: {
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
