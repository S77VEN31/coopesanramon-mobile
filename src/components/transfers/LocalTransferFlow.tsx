import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import TransferWizard from '@/components/wizard/TransferWizard';
import { TransferDetailsStep, ConfirmationStep, TwoFactorStep, TransferSuccessStep } from '@/components/wizard/steps';
import MessageCard from '@/components/cards/MessageCard';
import { AccountSelect } from '@/components/inputs/AccountSelect';
import LocalDestinationSection from './steps/LocalDestinationSection';
import { useLocalTransfer, type CuentaFavoritaInternaItem } from '@/hooks/use-local-transfer';
import { useAccountsStore } from '@/lib/states/accounts.store';
import { useInternalTransfersStore, transferRequires2FA, getOperationType } from '@/lib/states/internalTransfers.store';
import { useSecondFactorStore, requiresOtp, requiresEmail } from '@/lib/states/secondFactor.store';
import { TipoDestinoTransferencia } from '@/constants/enums';
import { formatAmount } from '@/lib/utils/amount.utils';
import { isEmailValid } from '@/lib/utils/email.utils';
import { getAccountIdentifier } from '@/lib/utils/accounts.utils';
import { getBorderColor, getCardBgColor } from '../../../App';
import { api } from '@/services/api';
import type { DtoCuenta } from '@/services/api/accounts.api';
import type { ListInternalFavoriteAccountsResponse } from '@/services/api/favorites.api';
import type { EnviarTransferenciaInternaResponse } from '@/services/api/transfers.api';

interface LocalTransferFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function LocalTransferFlow({ onComplete, onCancel }: LocalTransferFlowProps) {
  const colorScheme = useColorScheme();
  const borderColor = getBorderColor(colorScheme);

  const { accounts: userAccounts, isLoading: isLoadingAccounts, loadAccounts } = useAccountsStore();
  const { sendTransfer, resetState: resetTransferState } = useInternalTransfersStore();
  const {
    currentChallenge,
    isCreatingChallenge,
    isValidating,
    isExecutingOperation,
    validationError,
    operationError,
    remainingAttempts,
    timeRemaining,
    createdesafio,
    validatedesafio,
    resetState: reset2FAState,
    startCountdown,
    stopCountdown,
  } = useSecondFactorStore();

  const [selectedSourceAccount, setSelectedSourceAccount] = useState<DtoCuenta | null>(null);
  const [favoriteAccounts, setFavoriteAccounts] = useState<CuentaFavoritaInternaItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [has2FAStepBeenInitialized, setHas2FAStepBeenInitialized] = useState(false);
  const [operationComplete, setOperationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [completedTransfer, setCompletedTransfer] = useState<EnviarTransferenciaInternaResponse | null>(null);
  const [completedEmailDestino, setCompletedEmailDestino] = useState<string | null>(null);

  const localTransfer = useLocalTransfer(selectedSourceAccount, 'local');

  useEffect(() => {
    loadAccounts();
    loadInternalFavorites();
  }, []);

  useEffect(() => {
    return () => { stopCountdown(); };
  }, [stopCountdown]);

  const loadInternalFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await api.get<ListInternalFavoriteAccountsResponse>('/api/CuentasFavoritasInternas/listar', true);
      setFavoriteAccounts(response.cuentasFavoritas || []);
    } catch {
      setFavoriteAccounts([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleSourceAccountSelect = (accountIdentifier: string) => {
    const account = userAccounts.find(
      (acc) => (acc.numeroCuentaIban || acc.numeroCuenta || '') === accountIdentifier
    );
    if (!account) return;

    setSelectedSourceAccount(account);
    const sourceCurrency = account.moneda || 'CRC';

    if (localTransfer.selectedFavoriteAccount) {
      const favoriteCurrency = localTransfer.selectedFavoriteAccount.codigoMoneda || 'CRC';
      if (sourceCurrency !== favoriteCurrency) {
        localTransfer.setSelectedFavoriteAccount(null);
        localTransfer.setDestinationIban('');
      }
    }

    if (localTransfer.selectedOwnAccount) {
      const ownCurrency = localTransfer.selectedOwnAccount.moneda || 'CRC';
      if (sourceCurrency !== ownCurrency) {
        localTransfer.setSelectedOwnAccount(null);
        localTransfer.setDestinationIban('');
      }
    }
  };

  const handleFavoriteAccountSelect = (account: CuentaFavoritaInternaItem) => {
    localTransfer.setSelectedFavoriteAccount(account);
    localTransfer.setDestinationIban(account.numeroCuenta || '');
  };

  const handleOwnAccountSelect = (accountIdentifier: string) => {
    const account = getFilteredAccounts().find(
      (acc) => (acc.numeroCuentaIban || acc.numeroCuenta || '') === accountIdentifier
    );
    if (!account) return;
    localTransfer.setSelectedOwnAccount(account);
    localTransfer.setDestinationIban(account.numeroCuentaIban || account.numeroCuenta || '');
  };

  const getFilteredAccounts = () => {
    if (!selectedSourceAccount) return userAccounts;
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    const sourceIdentifier = getAccountIdentifier(selectedSourceAccount);
    return userAccounts.filter(acc => acc.moneda === sourceCurrency && getAccountIdentifier(acc) !== sourceIdentifier);
  };

  const getFilteredFavorites = () => {
    if (!selectedSourceAccount) return favoriteAccounts;
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    return favoriteAccounts.filter(acc => acc.codigoMoneda === sourceCurrency);
  };

  const getTipoDestino = (): TipoDestinoTransferencia => {
    if (localTransfer.destinationType === 'own') return TipoDestinoTransferencia.CuentaPropia;
    if (localTransfer.destinationType === 'favorites') return TipoDestinoTransferencia.CuentaFavorita;
    return TipoDestinoTransferencia.CuentaDigitada;
  };

  const isAccountSelectionValid = () => {
    if (!selectedSourceAccount) return false;
    if (localTransfer.destinationType === 'favorites') return !!localTransfer.selectedFavoriteAccount;
    if (localTransfer.destinationType === 'own') return !!localTransfer.selectedOwnAccount;
    if (localTransfer.destinationType === 'manual') {
      const cleanedIban = localTransfer.destinationIban.replace(/\s/g, '');
      return (
        !!localTransfer.destinationIban &&
        cleanedIban.startsWith('CR') &&
        cleanedIban.length >= 8 &&
        !localTransfer.destinationFormatError &&
        !localTransfer.accountValidationError &&
        !!localTransfer.validatedAccountInfo
      );
    }
    return false;
  };

  const isTransferDetailsValid = () => {
    if (!selectedSourceAccount) return false;
    if (!localTransfer.amount || parseFloat(localTransfer.amount) <= 0) return false;
    if (localTransfer.amountError) return false;
    const descriptionTrimmed = localTransfer.description?.trim() || '';
    if (!descriptionTrimmed || descriptionTrimmed.length < 15 || descriptionTrimmed.length > 255) return false;
    if (localTransfer.email && !isEmailValid(localTransfer.email)) return false;
    return true;
  };

  // Auto-create 2FA challenge when entering verification step
  useEffect(() => {
    if (!has2FAStepBeenInitialized || currentChallenge || isCreatingChallenge) return;

    const tipoDestino = getTipoDestino();
    const operationType = getOperationType(tipoDestino);

    createdesafio(operationType).then((challenge) => {
      if (challenge && challenge.tiempoExpiracionSegundos != null && challenge.tiempoExpiracionSegundos > 0) {
        startCountdown();
      }
    });
  }, [has2FAStepBeenInitialized, currentChallenge, isCreatingChallenge]);

  // Auto-execute transfer when no 2FA challenges are required
  const autoExecutedRef = useRef(false);
  useEffect(() => {
    if (!currentChallenge || autoExecutedRef.current || operationComplete) return;

    const hasRequiredChallenges = currentChallenge.retosSolicitados !== null &&
      currentChallenge.retosSolicitados !== undefined &&
      currentChallenge.retosSolicitados.length > 0;

    if (!hasRequiredChallenges) {
      autoExecutedRef.current = true;
      console.log('[LocalTransfer] No 2FA required, auto-executing transfer');
      setIsProcessing(true);
      executeTransfer(undefined);
    }
  }, [currentChallenge, operationComplete]);

  const handleRetryChallenge = () => {
    setOtpCode('');
    setEmailCode('');
    reset2FAState();
    setHas2FAStepBeenInitialized(false);
    // Re-trigger creation
    setTimeout(() => setHas2FAStepBeenInitialized(true), 50);
  };

  const executeTransfer = async (idDesafio?: string) => {
    console.log('[LocalTransfer] executeTransfer called, idDesafio:', idDesafio);
    if (!selectedSourceAccount) {
      console.log('[LocalTransfer] executeTransfer: no selectedSourceAccount, returning');
      return;
    }

    const tipoDestino = getTipoDestino();
    const sourceAccountNumber = selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || '';
    const parsedAmount = parseFloat(localTransfer.amount);

    let destinationAccountNumber: string | undefined;
    if (localTransfer.destinationType === 'manual') {
      destinationAccountNumber = localTransfer.destinationIban.replace(/\s/g, '');
    } else if (localTransfer.destinationType === 'own' && localTransfer.selectedOwnAccount) {
      destinationAccountNumber = localTransfer.selectedOwnAccount.numeroCuentaIban || localTransfer.selectedOwnAccount.numeroCuenta || undefined;
    } else if (localTransfer.destinationType === 'favorites' && localTransfer.selectedFavoriteAccount) {
      destinationAccountNumber = localTransfer.selectedFavoriteAccount.numeroCuenta || undefined;
    }

    console.log('[LocalTransfer] executeTransfer: calling sendTransfer', { tipoDestino, sourceAccountNumber, parsedAmount, destinationAccountNumber });

    try {
      const result = await sendTransfer(
        tipoDestino,
        sourceAccountNumber,
        parsedAmount,
        localTransfer.description || undefined,
        localTransfer.email || undefined,
        idDesafio,
        localTransfer.destinationType === 'favorites' && localTransfer.selectedFavoriteAccount ? localTransfer.selectedFavoriteAccount.id : undefined,
        destinationAccountNumber
      );

      console.log('[LocalTransfer] sendTransfer result:', { success: result.success, hasResponse: !!result.response });

      if (result.success && result.response) {
        setIsProcessing(false);
        setOperationComplete(true);
        setCompletedTransfer(result.response);
        setCompletedEmailDestino(localTransfer.email || null);
        loadAccounts();
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.log('[LocalTransfer] executeTransfer error:', error);
      setTransferError(error instanceof Error ? error.message : 'Error al enviar la transferencia');
      setIsProcessing(false);
    }
  };

  const handleWizardComplete = async () => {
    console.log('[LocalTransfer] handleWizardComplete called');
    console.log('[LocalTransfer] currentChallenge:', JSON.stringify(currentChallenge, null, 2));
    if (!currentChallenge) {
      console.log('[LocalTransfer] handleWizardComplete: no currentChallenge, returning');
      return;
    }

    setIsProcessing(true);

    try {
      const hasRequiredChallenges = currentChallenge?.retosSolicitados !== null && currentChallenge?.retosSolicitados !== undefined && currentChallenge.retosSolicitados.length > 0;
      console.log('[LocalTransfer] hasRequiredChallenges:', hasRequiredChallenges, 'retosSolicitados:', currentChallenge?.retosSolicitados);

      if (!hasRequiredChallenges) {
        console.log('[LocalTransfer] No 2FA required, executing transfer directly');
        await executeTransfer(currentChallenge?.idDesafioPublico || undefined);
        return;
      }

      const finalOtp = requiresOtp(currentChallenge?.retosSolicitados || null) ? otpCode : undefined;
      const finalEmail = requiresEmail(currentChallenge?.retosSolicitados || null) ? emailCode : undefined;
      console.log('[LocalTransfer] Validating 2FA, otpCode length:', otpCode.length, 'emailCode length:', emailCode.length);

      const isValid = await validatedesafio(finalOtp, finalEmail);
      console.log('[LocalTransfer] validatedesafio result:', isValid);

      if (isValid) {
        console.log('[LocalTransfer] 2FA valid, executing transfer');
        await executeTransfer(currentChallenge?.idDesafioPublico || undefined);
      } else {
        console.log('[LocalTransfer] 2FA invalid');
        setIsProcessing(false);
      }
    } catch (error) {
      console.log('[LocalTransfer] handleWizardComplete error:', error);
      setTransferError(error instanceof Error ? error.message : 'Error al procesar la operación');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    autoExecutedRef.current = false;
    setTransferError(null);
    localTransfer.resetForm();
    resetTransferState();
    reset2FAState();
    stopCountdown();
    onCancel();
  };

  const wizardSteps = useMemo(() => [
    {
      id: 'accounts',
      title: 'Cuentas',
      component: (
        <View style={styles.stepContent}>
          <View style={styles.section}>
            <AccountSelect
              accounts={userAccounts}
              value={selectedSourceAccount ? getAccountIdentifier(selectedSourceAccount) : ''}
              onValueChange={handleSourceAccountSelect}
              placeholder="Seleccionar cuenta origen"
              disabled={isLoadingAccounts}
              label="Cuenta Origen"
            />
          </View>
          {selectedSourceAccount && (
            <View style={styles.section}>
              <LocalDestinationSection
                destinationType={localTransfer.destinationType}
                onDestinationTypeChange={localTransfer.setDestinationType}
                selectedFavoriteAccount={localTransfer.selectedFavoriteAccount}
                favoriteAccounts={getFilteredFavorites()}
                onFavoriteSelect={handleFavoriteAccountSelect}
                selectedOwnAccount={localTransfer.selectedOwnAccount}
                ownAccounts={getFilteredAccounts()}
                onOwnAccountSelect={handleOwnAccountSelect}
                destinationIban={localTransfer.destinationIban}
                onDestinationIbanChange={localTransfer.setDestinationIban}
                destinationFormatError={localTransfer.destinationFormatError}
                isValidatingAccount={localTransfer.isValidatingAccount}
                accountValidationError={localTransfer.accountValidationError}
                validatedAccountInfo={localTransfer.validatedAccountInfo}
                isLoadingFavorites={isLoadingFavorites}
              />
            </View>
          )}
        </View>
      ),
      canGoNext: (): boolean => isAccountSelectionValid(),
    },
    {
      id: 'details',
      title: 'Detalles',
      component: (
        <TransferDetailsStep
          amount={localTransfer.amount}
          onAmountChange={(value: string) => localTransfer.setAmount(formatAmount(value))}
          amountError={localTransfer.amountError}
          sourceAccount={selectedSourceAccount}
          transferType="local"
          description={localTransfer.description}
          onDescriptionChange={localTransfer.setDescription}
          email={localTransfer.email}
          onEmailChange={localTransfer.setEmail}
          emailError={localTransfer.emailError}
          isEmailRequired={false}
        />
      ),
      canGoNext: (): boolean => isTransferDetailsValid(),
    },
    {
      id: 'confirmation',
      title: 'Confirmacion',
      component: (
        <ConfirmationStep
          transferType="local"
          sourceAccount={selectedSourceAccount}
          localDestinationType={localTransfer.destinationType}
          selectedFavoriteAccount={localTransfer.selectedFavoriteAccount}
          selectedOwnAccount={localTransfer.selectedOwnAccount}
          destinationIban={localTransfer.destinationIban}
          amount={localTransfer.amount}
          description={localTransfer.description}
          email={localTransfer.email}
        />
      ),
      canGoNext: (): boolean => true,
      onLeave: () => {
        // Reset 2FA state when going back from confirmation
        setOtpCode('');
        setEmailCode('');
        reset2FAState();
        setHas2FAStepBeenInitialized(false);
        setOperationComplete(false);
        setIsProcessing(false);
      },
    },
    {
      id: 'verification',
      title: operationComplete ? 'Transferencia Completada' : 'Verificacion de Seguridad',
      component: (
        <View style={operationComplete ? styles.stepContent : styles.verificationContent}>
          {operationComplete && completedTransfer ? (
            <TransferSuccessStep
              transfer={completedTransfer}
              emailDestino={completedEmailDestino}
            />
          ) : transferError ? (
            <MessageCard
              type="error"
              message="Error en la Transferencia"
              description={transferError}
              style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
            />
          ) : isProcessing ? (
            <MessageCard
              type="loading"
              message="Procesando transferencia..."
              description="Por favor espera mientras se completa la operacion"
              style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
            />
          ) : (
            <TwoFactorStep
              currentChallenge={currentChallenge}
              isCreatingChallenge={isCreatingChallenge}
              isValidating={isValidating}
              isExecutingOperation={isExecutingOperation}
              validationError={validationError}
              operationError={operationError}
              remainingAttempts={remainingAttempts}
              timeRemaining={timeRemaining}
              otpCode={otpCode}
              emailCode={emailCode}
              onOtpCodeChange={setOtpCode}
              onEmailCodeChange={setEmailCode}
              onRetryChallenge={handleRetryChallenge}
              isRetrying={isCreatingChallenge}
            />
          )}
        </View>
      ),
      onEnter: () => {
        if (!has2FAStepBeenInitialized) {
          setHas2FAStepBeenInitialized(true);
        }
      },
      hideNavigation: () => isProcessing,
      fallbackButton: {
        label: 'Cerrar',
        onPress: () => {
          onComplete();
        },
        show: () => operationComplete || !!transferError,
      },
      canGoNext: (): boolean => {
        if (operationComplete) return false;
        if (!currentChallenge) return false;
        if (isValidating || isExecutingOperation) return false;
        if (timeRemaining <= 0) return false;
        if (remainingAttempts <= 0) return false;

        const hasRequiredChallenges = currentChallenge.retosSolicitados !== null && currentChallenge.retosSolicitados.length > 0;
        if (!hasRequiredChallenges) return true;

        if (requiresOtp(currentChallenge.retosSolicitados) && otpCode.length !== 6) return false;
        if (requiresEmail(currentChallenge.retosSolicitados) && emailCode.length !== 6) return false;

        return true;
      },
      onLeave: () => {
        setOtpCode('');
        setEmailCode('');
        reset2FAState();
        setHas2FAStepBeenInitialized(false);
      },
    },
  ], [
    userAccounts, selectedSourceAccount, isLoadingAccounts, localTransfer,
    favoriteAccounts, isLoadingFavorites,
    currentChallenge, isCreatingChallenge, isValidating, isExecutingOperation,
    validationError, operationError, remainingAttempts, timeRemaining,
    otpCode, emailCode, operationComplete, isProcessing, transferError,
    completedTransfer, completedEmailDestino, colorScheme, borderColor,
  ]);

  return (
    <TransferWizard
      steps={wizardSteps}
      onComplete={handleWizardComplete}
      onCancel={handleCancel}
    />
  );
}

const styles = StyleSheet.create({
  stepContent: {
    paddingTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  verificationContent: {
    paddingHorizontal: 4,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: 12,
    flex: 0,
    minHeight: 0,
  },
});
