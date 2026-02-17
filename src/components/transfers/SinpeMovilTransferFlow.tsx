import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import TransferWizard from '@/components/wizard/TransferWizard';
import { TransferDetailsStep, ConfirmationStep, TwoFactorStep, TransferSuccessStep } from '@/components/wizard/steps';
import MessageCard from '@/components/cards/MessageCard';
import { AccountSelect } from '@/components/inputs/AccountSelect';
import SinpeMovilDestinationSection from './steps/SinpeMovilDestinationSection';
import { useSinpeMovilTransfer, type MonederoFavoritoItem } from '@/hooks/use-sinpe-movil-transfer';
import { useAccountsStore } from '@/lib/states/accounts.store';
import { useSinpeMovilTransfersStore, sinpeMovilTransferRequires2FA, getSinpeMovilOperationType } from '@/lib/states/sinpeMovilTransfers.store';
import { useSecondFactorStore, requiresOtp, requiresEmail } from '@/lib/states/secondFactor.store';
import { TipoDestinoTransferencia } from '@/constants/enums';
import { formatAmount } from '@/lib/utils/amount.utils';
import { isEmailValid } from '@/lib/utils/email.utils';
import { getAccountIdentifier } from '@/lib/utils/accounts.utils';
import { getBorderColor, getCardBgColor } from '../../../App';
import { api } from '@/services/api';
import type { DtoCuenta } from '@/services/api/accounts.api';
import type { ListFavoriteWalletsResponse } from '@/services/api/favorites.api';
import type { EnviarSinpeMovilResponse } from '@/services/api/transfers.api';

interface SinpeMovilTransferFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function SinpeMovilTransferFlow({ onComplete, onCancel }: SinpeMovilTransferFlowProps) {
  const colorScheme = useColorScheme();
  const borderColor = getBorderColor(colorScheme);

  const { accounts: userAccounts, isLoading: isLoadingAccounts, loadAccounts } = useAccountsStore();
  const { sendSinpeMovilTransfer, resetState: resetSinpeMovilTransferState } = useSinpeMovilTransfersStore();
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
  const [favoriteWallets, setFavoriteWallets] = useState<MonederoFavoritoItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [has2FAStepBeenInitialized, setHas2FAStepBeenInitialized] = useState(false);
  const [operationComplete, setOperationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [completedTransfer, setCompletedTransfer] = useState<EnviarSinpeMovilResponse | null>(null);
  const [completedEmailDestino, setCompletedEmailDestino] = useState<string | null>(null);

  const sinpeMovilTransfer = useSinpeMovilTransfer();

  useEffect(() => {
    loadAccounts();
    loadFavoriteWallets();
  }, []);

  useEffect(() => {
    return () => { stopCountdown(); };
  }, [stopCountdown]);

  const loadFavoriteWallets = async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await api.get<ListFavoriteWalletsResponse>('/api/MonederosFavoritos/listar', true);
      setFavoriteWallets(response.monederosFavoritos || []);
    } catch {
      setFavoriteWallets([]);
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
  };

  const handleSinpeMovilFavoriteSelect = (wallet: MonederoFavoritoItem) => {
    sinpeMovilTransfer.setSelectedSinpeMovilFavoriteWallet(wallet);
    if (wallet.monedero) {
      sinpeMovilTransfer.setSinpeMovilPhoneNumber(wallet.monedero);
    }
  };

  const getTipoDestino = (): TipoDestinoTransferencia => {
    if (sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites' && sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet) {
      return TipoDestinoTransferencia.CuentaFavorita;
    }
    return TipoDestinoTransferencia.CuentaDigitada;
  };

  const isAccountSelectionValid = () => {
    if (!selectedSourceAccount) return false;
    if (sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites') return !!sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet;
    if (sinpeMovilTransfer.sinpeMovilDestinationType === 'manual') {
      return (
        sinpeMovilTransfer.sinpeMovilPhoneNumber.length === 8 &&
        !!sinpeMovilTransfer.sinpeMovilMonederoInfo &&
        !sinpeMovilTransfer.sinpeMovilMonederoError
      );
    }
    return false;
  };

  const isTransferDetailsValid = () => {
    if (!selectedSourceAccount) return false;
    if (!sinpeMovilTransfer.sinpeMovilAmount || parseFloat(sinpeMovilTransfer.sinpeMovilAmount) <= 0) return false;
    const accountCurrency = selectedSourceAccount.moneda || 'CRC';
    if (accountCurrency !== 'CRC') return false;
    if (sinpeMovilTransfer.sinpeMovilAmountError) return false;
    const descriptionTrimmed = sinpeMovilTransfer.sinpeMovilDescription?.trim() || '';
    if (descriptionTrimmed.length > 20) return false;
    if (sinpeMovilTransfer.sinpeMovilEmail && !isEmailValid(sinpeMovilTransfer.sinpeMovilEmail)) return false;
    if (parseFloat(sinpeMovilTransfer.sinpeMovilAmount) > selectedSourceAccount.saldo) return false;
    return true;
  };

  // Auto-create 2FA challenge
  useEffect(() => {
    if (!has2FAStepBeenInitialized || currentChallenge || isCreatingChallenge) return;

    const tipoDestino = getTipoDestino();
    const operationType = getSinpeMovilOperationType(tipoDestino);

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
      console.log('[SinpeMovilTransfer] No 2FA required, auto-executing transfer');
      setIsProcessing(true);
      executeTransfer(undefined);
    }
  }, [currentChallenge, operationComplete]);

  const handleRetryChallenge = () => {
    setOtpCode('');
    setEmailCode('');
    reset2FAState();
    setHas2FAStepBeenInitialized(false);
    setTimeout(() => setHas2FAStepBeenInitialized(true), 50);
  };

  const executeTransfer = async (idDesafio?: string) => {
    if (!selectedSourceAccount) return;

    const tipoDestino = getTipoDestino();
    const sourceAccountNumber = selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || '';
    const parsedAmount = parseFloat(sinpeMovilTransfer.sinpeMovilAmount);

    let phoneNumberToUse: string;
    if (sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites' && sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet) {
      phoneNumberToUse = sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet.monedero || '';
    } else {
      phoneNumberToUse = sinpeMovilTransfer.sinpeMovilPhoneNumber;
    }

    try {
      const result = await sendSinpeMovilTransfer(
        tipoDestino,
        sourceAccountNumber,
        phoneNumberToUse,
        parsedAmount,
        sinpeMovilTransfer.sinpeMovilDescription || undefined,
        sinpeMovilTransfer.sinpeMovilEmail || undefined,
        idDesafio,
        sinpeMovilTransfer.sinpeMovilDestinationType === 'favorites' && sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet ? sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet.id : undefined
      );

      if (result.success && result.response) {
        setIsProcessing(false);
        setOperationComplete(true);
        setCompletedTransfer(result.response);
        setCompletedEmailDestino(sinpeMovilTransfer.sinpeMovilEmail || null);
        loadAccounts();
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : 'Error al enviar la transferencia');
      setIsProcessing(false);
    }
  };

  const handleWizardComplete = async () => {
    if (!currentChallenge) return;

    setIsProcessing(true);

    try {
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
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : 'Error al procesar la operación');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    autoExecutedRef.current = false;
    setTransferError(null);
    sinpeMovilTransfer.resetForm();
    resetSinpeMovilTransferState();
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
              <SinpeMovilDestinationSection
                sinpeMovilDestinationType={sinpeMovilTransfer.sinpeMovilDestinationType}
                onSinpeMovilDestinationTypeChange={sinpeMovilTransfer.setSinpeMovilDestinationType}
                selectedSinpeMovilFavoriteWallet={sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet}
                sinpeMovilFavoriteWallets={favoriteWallets}
                onSinpeMovilFavoriteSelect={handleSinpeMovilFavoriteSelect}
                sinpeMovilPhoneNumber={sinpeMovilTransfer.sinpeMovilPhoneNumber}
                onSinpeMovilPhoneChange={sinpeMovilTransfer.setSinpeMovilPhoneNumber}
                sinpeMovilMonederoError={sinpeMovilTransfer.sinpeMovilMonederoError}
                sinpeMovilMonederoInfo={sinpeMovilTransfer.sinpeMovilMonederoInfo}
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
          amount={sinpeMovilTransfer.sinpeMovilAmount}
          onAmountChange={(value: string) => sinpeMovilTransfer.setSinpeMovilAmount(formatAmount(value))}
          amountError={sinpeMovilTransfer.sinpeMovilAmountError}
          sourceAccount={selectedSourceAccount}
          transferType="sinpe-mobile"
          description={sinpeMovilTransfer.sinpeMovilDescription}
          onDescriptionChange={sinpeMovilTransfer.setSinpeMovilDescription}
          email={sinpeMovilTransfer.sinpeMovilEmail}
          onEmailChange={sinpeMovilTransfer.setSinpeMovilEmail}
          emailError={sinpeMovilTransfer.sinpeMovilEmailError}
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
          transferType="sinpe-mobile"
          sourceAccount={selectedSourceAccount}
          sinpeMovilDestinationType={sinpeMovilTransfer.sinpeMovilDestinationType}
          selectedSinpeMovilFavoriteWallet={sinpeMovilTransfer.selectedSinpeMovilFavoriteWallet}
          sinpeMovilPhoneNumber={sinpeMovilTransfer.sinpeMovilPhoneNumber}
          amount={sinpeMovilTransfer.sinpeMovilAmount}
          description={sinpeMovilTransfer.sinpeMovilDescription}
          email={sinpeMovilTransfer.sinpeMovilEmail}
        />
      ),
      canGoNext: (): boolean => true,
      onLeave: () => {
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
    userAccounts, selectedSourceAccount, isLoadingAccounts, sinpeMovilTransfer,
    favoriteWallets, isLoadingFavorites,
    currentChallenge, isCreatingChallenge, isValidating, isExecutingOperation,
    validationError, operationError, remainingAttempts, timeRemaining,
    otpCode, emailCode, operationComplete, isProcessing, transferError, colorScheme, borderColor,
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
