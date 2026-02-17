import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, Text, TouchableWithoutFeedback, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import TransferWizard from '@/components/wizard/TransferWizard';
import MessageCard from '@/components/cards/MessageCard';
import WalletInfoCard from '@/components/cards/WalletInfoCard';
import { TwoFactorStep, FavoriteDataStep } from '@/components/wizard/steps';
import { useFavoriteWalletsStore } from '@/lib/states/favoriteWallets.store';
import { useSecondFactorStore, requiresOtp, requiresEmail } from '@/lib/states/secondFactor.store';
import { TipoOperacion } from '@/constants/enums';
import { FAVORITE_TEXTS } from '@/constants/favorite-accounts.constants';
import { isEmailValid } from '@/lib/utils/email.utils';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor, getCardBgColor } from '../../../App';

export default function EditWalletFavoriteModal() {
  const colorScheme = useColorScheme();
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  const {
    isEditModalOpen,
    closeEditModal,
    selectedWallet,
    updateFavoriteWallet,
    isUpdating,
  } = useFavoriteWalletsStore();

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

  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [montoMaximo, setMontoMaximo] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [has2FAStepBeenInitialized, setHas2FAStepBeenInitialized] = useState(false);
  const [operationComplete, setOperationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-populate fields when selectedWallet changes
  useEffect(() => {
    if (selectedWallet) {
      setAlias(selectedWallet.alias || '');
      setEmail(selectedWallet.email || '');
      setMontoMaximo(selectedWallet.montoMaximo?.toString() || '');
    }
  }, [selectedWallet]);

  const resetForm = () => {
    setAlias('');
    setEmail('');
    setMontoMaximo('');
    setOtpCode('');
    setEmailCode('');
    setHas2FAStepBeenInitialized(false);
    setOperationComplete(false);
    setIsProcessing(false);
    reset2FAState();
  };

  const handleClose = () => {
    resetForm();
    closeEditModal();
  };

  const handleRetryChallenge = () => {
    setOtpCode('');
    setEmailCode('');
    reset2FAState();
    setHas2FAStepBeenInitialized(false);
  };

  const handleWizardComplete = async () => {
    if (!currentChallenge) return;

    setIsProcessing(true);

    const hasRequiredChallenges = currentChallenge?.retosSolicitados !== null && currentChallenge?.retosSolicitados !== undefined && currentChallenge.retosSolicitados.length > 0;

    if (!hasRequiredChallenges) {
      await handleUpdateWallet(null);
      return;
    }

    const finalOtp = requiresOtp(currentChallenge?.retosSolicitados || null) ? otpCode : undefined;
    const finalEmail = requiresEmail(currentChallenge?.retosSolicitados || null) ? emailCode : undefined;

    const isValid = await validatedesafio(finalOtp, finalEmail);

    if (isValid) {
      await handleUpdateWallet(currentChallenge?.idDesafioPublico || null);
    } else {
      setIsProcessing(false);
    }
  };

  const handleUpdateWallet = async (idDesafio: string | null) => {
    if (!selectedWallet) return;
    try {
      await updateFavoriteWallet({
        id: selectedWallet.id,
        email: email || null,
        alias: alias || null,
        montoMaximo: montoMaximo ? parseFloat(montoMaximo) : null,
        idDesafio: idDesafio,
      });
      setIsProcessing(false);
      setOperationComplete(true);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  // Auto-create 2FA challenge when needed
  useEffect(() => {
    if (isEditModalOpen && !currentChallenge && !isCreatingChallenge && !has2FAStepBeenInitialized && selectedWallet) {
      setHas2FAStepBeenInitialized(true);
      createdesafio(TipoOperacion.EdicionMonederoFavorito).then((challenge) => {
        if (challenge && challenge.tiempoExpiracionSegundos != null && challenge.tiempoExpiracionSegundos > 0) {
          startCountdown();
        }
      });
    }
  }, [isEditModalOpen, currentChallenge, isCreatingChallenge, has2FAStepBeenInitialized, selectedWallet, createdesafio, startCountdown]);

  // Cleanup countdown when modal closes
  useEffect(() => {
    if (!isEditModalOpen) {
      stopCountdown();
    }
  }, [isEditModalOpen, stopCountdown]);


  const wizardSteps = useMemo(() => [
    {
      id: 'data',
      title: FAVORITE_TEXTS.STEP_DATA,
      component: (
        <View style={styles.stepContent}>
          <WalletInfoCard
            titular={selectedWallet?.titular || null}
            monedero={selectedWallet?.monedero || null}
            nombreBanco={selectedWallet?.nombreEntidad || null}
          />

          <FavoriteDataStep
            alias={alias}
            onAliasChange={setAlias}
            email={email}
            onEmailChange={setEmail}
            maxAmount={montoMaximo}
            onMaxAmountChange={setMontoMaximo}
            aliasLabel={FAVORITE_TEXTS.FIELD_ALIAS}
            aliasPlaceholder="Ej: Mi SINPE Movil"
            emailLabel={FAVORITE_TEXTS.FIELD_EMAIL}
            emailPlaceholder="correo@ejemplo.com"
            maxAmountLabel={FAVORITE_TEXTS.FIELD_MAX_AMOUNT}
            maxAmountPlaceholder="0.00"
          />
        </View>
      ),
      canGoNext: () => {
        if (alias.trim().length < 4) return false;
        if (email && !isEmailValid(email)) return false;
        // Require at least one change
        const hasChanges =
          alias !== (selectedWallet?.alias || '') ||
          email !== (selectedWallet?.email || '') ||
          montoMaximo !== (selectedWallet?.montoMaximo?.toString() || '');
        if (!hasChanges) return false;
        return true;
      },
    },
    {
      id: 'verification',
      title: 'Verificación de Seguridad',
      component: (
        <View style={styles.verificationContent}>
          {operationComplete ? (
            <MessageCard
              type="success"
              message={FAVORITE_TEXTS.SUCCESS_UPDATE}
              style={[styles.messageCard, { borderColor, backgroundColor: getCardBgColor(colorScheme) }]}
            />
          ) : isProcessing ? (
            <MessageCard
              type="loading"
              message="Procesando operación..."
              description="Por favor espera mientras se completa la verificación"
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
      hideNavigation: () => isProcessing,
      fallbackButton: {
        label: 'Cerrar',
        onPress: handleClose,
        show: () => operationComplete,
      },
      canGoNext: () => {
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
  ], [alias, email, montoMaximo, selectedWallet, currentChallenge, isCreatingChallenge, isValidating, isExecutingOperation, validationError, operationError, remainingAttempts, timeRemaining, otpCode, emailCode, operationComplete, isProcessing, colorScheme, textColor, secondaryTextColor, borderColor]);

  if (!isEditModalOpen || !selectedWallet) return null;

  return (
    <Modal visible={isEditModalOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalBackdrop}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdropOverlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#a61612' }]}>{FAVORITE_TEXTS.EDIT_WALLET_TITLE}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <TransferWizard
            steps={wizardSteps}
            onComplete={handleWizardComplete}
            onCancel={handleClose}
            compactFooter
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    height: '80%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: 12,
    flex: 0,
    minHeight: 0,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 16,
  },
  verificationContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
});
