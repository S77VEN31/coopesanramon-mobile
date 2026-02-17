import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import TransferWizard from '@/components/wizard/TransferWizard';
import { TransferDetailsStep, ConfirmationStep, TwoFactorStep, TransferSuccessStep } from '@/components/wizard/steps';
import MessageCard from '@/components/cards/MessageCard';
import { AccountSelect } from '@/components/inputs/AccountSelect';
import SinpeOperationSection from './steps/SinpeOperationSection';
import SinpeDestinationSection from './steps/SinpeDestinationSection';
import { useSinpeTransfer, type CuentaSinpeFavoritaItem } from '@/hooks/use-sinpe-transfer';
import { useAccountsStore } from '@/lib/states/accounts.store';
import { useSinpeTransfersStore, sinpeTransferRequires2FA, getSinpeOperationType } from '@/lib/states/sinpeTransfers.store';
import { useSecondFactorStore, requiresOtp, requiresEmail } from '@/lib/states/secondFactor.store';
import { TipoDestinoTransferencia } from '@/constants/enums';
import { formatAmount } from '@/lib/utils/amount.utils';
import { isEmailValid } from '@/lib/utils/email.utils';
import { getAccountIdentifier } from '@/lib/utils/accounts.utils';
import { getBorderColor, getCardBgColor } from '../../../App';
import { api } from '@/services/api';
import type { DtoCuenta } from '@/services/api/accounts.api';
import type { ListSinpeFavoriteAccountsResponse } from '@/services/api/favorites.api';
import type { EnviarTransferenciaSinpeResponse, EnviarTransferenciaCreditosDirectosResponse, EnviarTransferenciaDebitosTiempoRealResponse } from '@/services/api/transfers.api';

type SinpeTransferResponse = EnviarTransferenciaSinpeResponse | EnviarTransferenciaCreditosDirectosResponse | EnviarTransferenciaDebitosTiempoRealResponse;

interface SinpeTransferFlowProps {
  onComplete: (transfer: SinpeTransferResponse, emailDestino: string | null) => void;
  onCancel: () => void;
}

export default function SinpeTransferFlow({ onComplete, onCancel }: SinpeTransferFlowProps) {
  const colorScheme = useColorScheme();
  const borderColor = getBorderColor(colorScheme);

  const { accounts: userAccounts, isLoading: isLoadingAccounts, loadAccounts } = useAccountsStore();
  const {
    sendtransferenciaSinpe,
    sendtransferenciaCreditosDirectos,
    sendtransferenciaDebitosTiempoReal,
    sinpeTransferType,
    setSinpeTransferType,
    resetState: resetSinpeTransferState,
  } = useSinpeTransfersStore();
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
  const [sinpeFavoriteAccounts, setSinpeFavoriteAccounts] = useState<CuentaSinpeFavoritaItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [sinpeFlowType, setSinpeFlowType] = useState<'enviar-fondos' | 'recibir-fondos'>('enviar-fondos');
  const [otpCode, setOtpCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [has2FAStepBeenInitialized, setHas2FAStepBeenInitialized] = useState(false);
  const [operationComplete, setOperationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [completedTransfer, setCompletedTransfer] = useState<SinpeTransferResponse | null>(null);
  const [completedEmailDestino, setCompletedEmailDestino] = useState<string | null>(null);

  const sinpeTransfer = useSinpeTransfer(selectedSourceAccount, 'sinpe', sinpeTransferType ?? undefined);

  useEffect(() => {
    loadAccounts();
    loadSinpeFavorites();
    setSinpeTransferType('pagos-inmediatos');
  }, []);

  useEffect(() => {
    return () => { stopCountdown(); };
  }, [stopCountdown]);

  const loadSinpeFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await api.get<ListSinpeFavoriteAccountsResponse>('/api/CuentasFavoritasSinpe/listar', true);
      setSinpeFavoriteAccounts(response.cuentasFavoritas || []);
    } catch {
      setSinpeFavoriteAccounts([]);
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

    if (sinpeTransfer.selectedSinpeFavoriteAccount) {
      const sinpeCurrency = sinpeTransfer.selectedSinpeFavoriteAccount.codigoMonedaDestino || 'CRC';
      if (sourceCurrency !== sinpeCurrency) {
        sinpeTransfer.setSelectedSinpeFavoriteAccount(null);
        sinpeTransfer.setSinpeDestinationIban('');
      }
    }
  };

  const handleSinpeFlowTypeChange = (value: 'enviar-fondos' | 'recibir-fondos') => {
    setSinpeFlowType(value);
    if (value === 'recibir-fondos') {
      setSinpeTransferType('debitos-tiempo-real');
    } else {
      setSinpeTransferType('pagos-inmediatos');
    }
    sinpeTransfer.setSelectedSinpeFavoriteAccount(null);
    sinpeTransfer.setSinpeDestinationIban('');
  };

  const handleSinpeFavoriteSelect = (account: CuentaSinpeFavoritaItem) => {
    sinpeTransfer.setSelectedSinpeFavoriteAccount(account);
    sinpeTransfer.setSinpeDestinationIban(account.numeroCuentaDestino || '');
  };

  const getFilteredSinpeFavorites = () => {
    if (!selectedSourceAccount) return sinpeFavoriteAccounts;
    const sourceCurrency = selectedSourceAccount.moneda || 'CRC';
    return sinpeFavoriteAccounts.filter(acc => acc.codigoMonedaDestino === sourceCurrency);
  };

  const getTipoDestino = (): TipoDestinoTransferencia => {
    if (sinpeTransfer.sinpeDestinationType === 'favorites') return TipoDestinoTransferencia.CuentaFavorita;
    return TipoDestinoTransferencia.CuentaDigitada;
  };

  const isAccountSelectionValid = () => {
    if (!selectedSourceAccount) return false;
    if (sinpeTransfer.sinpeDestinationType === 'favorites') return !!sinpeTransfer.selectedSinpeFavoriteAccount;
    if (sinpeTransfer.sinpeDestinationType === 'manual') {
      const cleanedIban = sinpeTransfer.sinpeDestinationIban.replace(/\s/g, '');
      return (
        !!sinpeTransfer.sinpeDestinationIban &&
        cleanedIban.startsWith('CR') &&
        cleanedIban.length >= 8 &&
        !sinpeTransfer.sinpeDestinationFormatError &&
        !sinpeTransfer.sinpeAccountValidationError &&
        !!sinpeTransfer.validatedSinpeAccountInfo
      );
    }
    return false;
  };

  const isTransferDetailsValid = () => {
    if (!selectedSourceAccount) return false;
    if (!sinpeTransfer.sinpeAmount || parseFloat(sinpeTransfer.sinpeAmount) <= 0) return false;
    if (sinpeTransfer.sinpeAmountError) return false;
    const descriptionTrimmed = sinpeTransfer.sinpeDescription?.trim() || '';
    if (!descriptionTrimmed || descriptionTrimmed.length < 15 || descriptionTrimmed.length > 255) return false;
    if (sinpeFlowType === 'enviar-fondos' && !sinpeTransferType) return false;
    if (sinpeTransfer.sinpeEmail && !isEmailValid(sinpeTransfer.sinpeEmail)) return false;
    return true;
  };

  // Auto-create 2FA challenge
  useEffect(() => {
    if (!has2FAStepBeenInitialized || currentChallenge || isCreatingChallenge) return;

    const tipoDestino = getTipoDestino();
    const operationType = getSinpeOperationType(tipoDestino, sinpeTransferType ?? undefined);

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
      console.log('[SinpeTransfer] No 2FA required, auto-executing transfer');
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
    if (!selectedSourceAccount || !sinpeTransferType) return;

    const tipoDestino = getTipoDestino();
    const sourceAccountNumber = selectedSourceAccount.numeroCuentaIban || selectedSourceAccount.numeroCuenta || '';
    const parsedAmount = parseFloat(sinpeTransfer.sinpeAmount);

    let destinationAccountNumber: string | undefined;
    if (sinpeTransfer.sinpeDestinationType === 'manual') {
      destinationAccountNumber = sinpeTransfer.sinpeDestinationIban.replace(/\s/g, '');
    } else if (sinpeTransfer.sinpeDestinationType === 'favorites' && sinpeTransfer.selectedSinpeFavoriteAccount) {
      destinationAccountNumber = sinpeTransfer.selectedSinpeFavoriteAccount.numeroCuentaDestino || undefined;
    }

    const args = [
      tipoDestino,
      sourceAccountNumber,
      parsedAmount,
      sinpeTransfer.sinpeDescription || undefined,
      sinpeTransfer.sinpeEmail || undefined,
      idDesafio,
      sinpeTransfer.sinpeDestinationType === 'favorites' && sinpeTransfer.selectedSinpeFavoriteAccount ? sinpeTransfer.selectedSinpeFavoriteAccount.id : undefined,
      destinationAccountNumber,
    ] as const;

    try {
      let result;
      if (sinpeTransferType === 'creditos-directos') {
        result = await sendtransferenciaCreditosDirectos(...args);
      } else if (sinpeTransferType === 'debitos-tiempo-real') {
        result = await sendtransferenciaDebitosTiempoReal(...args);
      } else {
        result = await sendtransferenciaSinpe(...args);
      }

      if (result.success && result.response) {
        setIsProcessing(false);
        setOperationComplete(true);
        setCompletedTransfer(result.response);
        setCompletedEmailDestino(sinpeTransfer.sinpeEmail || null);
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
    sinpeTransfer.resetForm();
    resetSinpeTransferState();
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
          <SinpeOperationSection
            sinpeFlowType={sinpeFlowType}
            onSinpeFlowTypeChange={handleSinpeFlowTypeChange}
          />
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
              <SinpeDestinationSection
                sinpeFlowType={sinpeFlowType}
                sinpeDestinationType={sinpeTransfer.sinpeDestinationType}
                onSinpeDestinationTypeChange={sinpeTransfer.setSinpeDestinationType}
                selectedSinpeFavoriteAccount={sinpeTransfer.selectedSinpeFavoriteAccount}
                sinpeFavoriteAccounts={getFilteredSinpeFavorites()}
                onSinpeFavoriteSelect={handleSinpeFavoriteSelect}
                sinpeDestinationIban={sinpeTransfer.sinpeDestinationIban}
                onSinpeDestinationIbanChange={sinpeTransfer.setSinpeDestinationIban}
                sinpeDestinationFormatError={sinpeTransfer.sinpeDestinationFormatError}
                isValidatingSinpeAccount={sinpeTransfer.isValidatingSinpeAccount}
                sinpeAccountValidationError={sinpeTransfer.sinpeAccountValidationError}
                validatedSinpeAccountInfo={sinpeTransfer.validatedSinpeAccountInfo}
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
          amount={sinpeTransfer.sinpeAmount}
          onAmountChange={(value: string) => sinpeTransfer.setSinpeAmount(formatAmount(value))}
          amountError={sinpeTransfer.sinpeAmountError}
          sourceAccount={selectedSourceAccount}
          transferType="sinpe"
          description={sinpeTransfer.sinpeDescription}
          onDescriptionChange={sinpeTransfer.setSinpeDescription}
          email={sinpeTransfer.sinpeEmail}
          onEmailChange={sinpeTransfer.setSinpeEmail}
          emailError={sinpeTransfer.sinpeEmailError}
          isEmailRequired={false}
          sinpeTransferType={sinpeTransferType}
          onSinpeTransferTypeChange={setSinpeTransferType}
          sinpeFlowType={sinpeFlowType}
        />
      ),
      canGoNext: (): boolean => isTransferDetailsValid(),
    },
    {
      id: 'confirmation',
      title: 'Confirmacion',
      component: (
        <ConfirmationStep
          transferType="sinpe"
          sourceAccount={selectedSourceAccount}
          sinpeFlowType={sinpeFlowType}
          sinpeTransferType={sinpeTransferType}
          sinpeDestinationType={sinpeTransfer.sinpeDestinationType}
          selectedSinpeFavoriteAccount={sinpeTransfer.selectedSinpeFavoriteAccount}
          sinpeDestinationIban={sinpeTransfer.sinpeDestinationIban}
          amount={sinpeTransfer.sinpeAmount}
          description={sinpeTransfer.sinpeDescription}
          email={sinpeTransfer.sinpeEmail}
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
          if (operationComplete && completedTransfer) {
            onComplete(completedTransfer, completedEmailDestino);
          }
          handleCancel();
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
    userAccounts, selectedSourceAccount, isLoadingAccounts, sinpeTransfer,
    sinpeFavoriteAccounts, isLoadingFavorites, sinpeFlowType, sinpeTransferType,
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
    paddingTop: 12,
    gap: 24,
  },
  section: {
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
