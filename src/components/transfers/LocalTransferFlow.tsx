import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import TransferWizard from '@/components/wizard/TransferWizard';
import { TransferDetailsStep, ConfirmationStep, TwoFactorStep } from '@/components/wizard/steps';
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
  onComplete: (transfer: EnviarTransferenciaInternaResponse, emailDestino: string | null) => void;
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

  const handleRetryChallenge = () => {
    setOtpCode('');
    setEmailCode('');
    reset2FAState();
    setHas2FAStepBeenInitialized(false);
    // Re-trigger creation
    setTimeout(() => setHas2FAStepBeenInitialized(true), 50);
  };

  const executeTransfer = async (idDesafio?: string) => {
    if (!selectedSourceAccount) return;

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

    if (result.success && result.response) {
      setIsProcessing(false);
      setOperationComplete(true);
      loadAccounts();
      onComplete(result.response, localTransfer.email || null);
    } else {
      setIsProcessing(false);
    }
  };

  const handleWizardComplete = async () => {
    if (!currentChallenge) return;

    setIsProcessing(true);

    const hasRequiredChallenges = currentChallenge?.retosSolicitados !== null && currentChallenge?.retosSolicitados !== undefined && currentChallenge.retosSolicitados.length > 0;

    if (!hasRequiredChallenges) {
      await executeTransfer(currentChallenge?.idDesafioPublico || undefined);
      return;
    }

    const finalOtp = requiresOtp(currentChallenge?.retosSolicitados || null) ? otpCode : undefined;
    const finalEmail = requiresEmail(currentChallenge?.retosSolicitados || null) ? emailCode : undefined;

    const isValid = await validatedesafio(finalOtp, finalEmail);

    if (isValid) {
      await executeTransfer(currentChallenge?.idDesafioPublico || undefined);
    } else {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
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
      title: 'Verificacion de Seguridad',
      component: (
        <View style={styles.verificationContent}>
          {operationComplete ? (
            <MessageCard
              type="success"
              message="Transferencia realizada exitosamente"
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
      hideNavigation: () => isProcessing || operationComplete,
      fallbackButton: {
        label: 'Cerrar',
        onPress: handleCancel,
        show: () => operationComplete,
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
    otpCode, emailCode, operationComplete, isProcessing, colorScheme, borderColor,
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
    marginBottom: 12,
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
