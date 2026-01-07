import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  createdesafio,
  validatedesafio,
  TipoOperacion,
  TipoDesafio,
  EstadoDesafio,
  type CreateChallengeResponse,
  type ValidateChallengeResponse,
} from '@/services/api';

interface SecondFactorState {
  currentChallenge: CreateChallengeResponse | null;
  validationResult: ValidateChallengeResponse | null;
  isCreatingChallenge: boolean;
  isValidating: boolean;
  isExecutingOperation: boolean;
  error: string | null;
  validationError: string | null;
  operationError: string | null;
  validationErrorRaw: unknown | null;
  isModalOpen: boolean;
  operationSuccess: boolean;
  currentOperation: TipoOperacion | null;
  remainingAttempts: number;
  timeRemaining: number;
  timerId: NodeJS.Timeout | null;
  onValidationSuccess: ((idDesafio: string | null) => Promise<void>) | null;

  createdesafio: (tipoOperacion: TipoOperacion, metadatos?: string) => Promise<CreateChallengeResponse | null>;
  validatedesafio: (codigoOtp?: string, codigoEmail?: string) => Promise<boolean>;
  openModal: (tipoOperacion: TipoOperacion, onSuccess: (idDesafio: string | null) => Promise<void>, metadatos?: string) => Promise<void>;
  closeModal: () => void;
  resetState: () => void;
  setError: (error: string | null) => void;
  setOperationError: (error: string | null) => void;
  startCountdown: () => void;
  stopCountdown: () => void;
  decrementTime: () => void;
}

export const useSecondFactorStore = create<SecondFactorState>()(
  devtools(
    (set, get) => ({
      currentChallenge: null,
      validationResult: null,
      isCreatingChallenge: false,
      isValidating: false,
      isExecutingOperation: false,
      error: null,
      validationError: null,
      operationError: null,
      validationErrorRaw: null,
      isModalOpen: false,
      operationSuccess: false,
      currentOperation: null,
      remainingAttempts: 0,
      timeRemaining: 0,
      timerId: null,
      onValidationSuccess: null,

      createdesafio: async (tipoOperacion: TipoOperacion, metadatos?: string) => {
        set({ 
          isCreatingChallenge: true, 
          error: null,
          validationError: null, 
        }, false, 'secondFactor/createChallengeStart');

        try {
          const response = await createdesafio({
            tipoOperacion,
            metadatos: metadatos || null,
            codigoCanal: 'Mobile',
            direccionIpCliente: null,
          });
          
          set(
            { 
              currentChallenge: response,
              currentOperation: tipoOperacion,
              remainingAttempts: response.maxIntentos ?? 0,
              timeRemaining: response.tiempoExpiracionSegundos ?? 0,
              isCreatingChallenge: false, 
              error: null,
              validationError: null, 
            },
            false,
            'secondFactor/createChallengeSuccess'
          );
          
          return response;
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error al crear el desafío';
          
          set(
            { 
              currentChallenge: null, 
              isCreatingChallenge: false, 
              error: errorMessage 
            },
            false,
            'secondFactor/createChallengeError'
          );
          
          return null;
        }
      },

      validatedesafio: async (codigoOtp?: string, codigoEmail?: string) => {
        const { currentChallenge, remainingAttempts, onValidationSuccess } = get();
        
        if (!currentChallenge?.idDesafioPublico) {
          set({ validationError: 'No hay desafío activo' }, false, 'secondFactor/noActiveChallenge');
          return false;
        }

        set({ isValidating: true, validationError: null, validationErrorRaw: null }, false, 'secondFactor/validateStart');

        try {
          const response = await validatedesafio({
            idDesafioPublico: currentChallenge.idDesafioPublico,
            codigoOtp: codigoOtp || null,
            codigoEmail: codigoEmail || null,
          });
          
          set(
            { 
              validationResult: response,
              isValidating: false, 
            },
            false,
            'secondFactor/validateResponse'
          );

          if (response.validado) {
            get().stopCountdown();
            
            const challengeId = currentChallenge.idDesafioPublico;
            const callback = onValidationSuccess;
            
            if (callback && challengeId) {
              set({ isExecutingOperation: true, operationError: null }, false, 'secondFactor/executeOperationStart');
              
              try {
                await callback(challengeId);
                
                set(
                  { 
                    isExecutingOperation: false,
                    operationSuccess: true,
                    operationError: null,
                  },
                  false,
                  'secondFactor/executeOperationSuccess'
                );
              } catch (err) {
                const errorMessage = err instanceof Error 
                  ? err.message 
                  : 'Error al procesar la operación';
                
                set(
                  { 
                    isExecutingOperation: false,
                    operationError: errorMessage,
                    operationSuccess: false,
                  },
                  false,
                  'secondFactor/executeOperationError'
                );
              }
            }
            
            return true;
          } else {
            const newAttempts = Math.max(0, remainingAttempts - 1);
            set(
              { 
                remainingAttempts: newAttempts,
                validationError: null, 
              },
              false,
              'secondFactor/validateFailed'
            );
            
            if (newAttempts <= 0) {
              get().stopCountdown();
            }
            
            return false;
          }
        } catch (err) {
          const newAttempts = Math.max(0, remainingAttempts - 1);
          
          set(
            { 
              isValidating: false,
              remainingAttempts: newAttempts,
              validationError: null, 
              validationErrorRaw: err,
            },
            false,
            'secondFactor/validateError'
          );
          
          if (newAttempts <= 0) {
            get().stopCountdown();
          }
          
          return false;
        }
      },

      openModal: async (tipoOperacion: TipoOperacion, onSuccess: (idDesafio: string | null) => Promise<void>, metadatos?: string) => {
        set({ 
          onValidationSuccess: onSuccess,
          operationError: null,
          operationSuccess: false,
        }, false, 'secondFactor/setCallback');
        
        const challenge = await get().createdesafio(tipoOperacion, metadatos);
        
        if (challenge) {
          const hasRequiredChallenges = challenge.retosSolicitados !== null && challenge.retosSolicitados.length > 0;
          
          if (!hasRequiredChallenges) {
            set({ isModalOpen: true, isExecutingOperation: true, operationError: null }, false, 'secondFactor/executeOperationStart');
            
            try {
              await onSuccess(null); 
              
              set(
                { 
                  isExecutingOperation: false,
                  operationSuccess: true,
                  operationError: null,
                },
                false,
                'secondFactor/executeOperationSuccess'
              );
            } catch (err) {
              const errorMessage = err instanceof Error 
                ? err.message 
                : 'Error al procesar la operación';
              
              set(
                { 
                  isExecutingOperation: false,
                  operationError: errorMessage,
                  operationSuccess: false,
                },
                false,
                'secondFactor/executeOperationError'
              );
            }
            return;
          }
          
          set({ isModalOpen: true }, false, 'secondFactor/openModal');
          
          if (challenge.tiempoExpiracionSegundos != null && challenge.tiempoExpiracionSegundos > 0) {
            get().startCountdown();
          }
        }
      },

      closeModal: () => {
        get().stopCountdown();
        set(
          { 
            isModalOpen: false,
            currentChallenge: null,
            validationResult: null,
            currentOperation: null,
            error: null,
            validationError: null,
            operationError: null,
            validationErrorRaw: null,
            remainingAttempts: 0,
            timeRemaining: 0,
            onValidationSuccess: null,
            isExecutingOperation: false,
            operationSuccess: false,
          },
          false,
          'secondFactor/closeModal'
        );
      },

      resetState: () => {
        get().stopCountdown();
        set(
          {
            currentChallenge: null,
            validationResult: null,
            isCreatingChallenge: false,
            isValidating: false,
            isExecutingOperation: false,
            error: null,
            validationError: null,
            operationError: null,
            validationErrorRaw: null,
            isModalOpen: false,
            operationSuccess: false,
            currentOperation: null,
            remainingAttempts: 0,
            timeRemaining: 0,
            onValidationSuccess: null,
          },
          false,
          'secondFactor/resetState'
        );
      },

      setError: (error: string | null) => {
        set({ error }, false, 'secondFactor/setError');
      },

      setOperationError: (error: string | null) => {
        set({ operationError: error }, false, 'secondFactor/setOperationError');
      },

      startCountdown: () => {
        const { timerId } = get();
        
        if (timerId) {
          clearInterval(timerId);
        }

        const newTimerId = setInterval(() => {
          get().decrementTime();
        }, 1000);

        set({ timerId: newTimerId }, false, 'secondFactor/startCountdown');
      },

      stopCountdown: () => {
        const { timerId } = get();
        
        if (timerId) {
          clearInterval(timerId);
          set({ timerId: null }, false, 'secondFactor/stopCountdown');
        }
      },

      decrementTime: () => {
        const { timeRemaining } = get();
        
        if (timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 }, false, 'secondFactor/decrementTime');
        } else {
          get().stopCountdown();
        }
      },
    }),
    {
      name: 'SecondFactorStore',
      enabled: __DEV__,
    }
  )
);

export function requiresOtp(retosSolicitados: TipoDesafio[] | null): boolean {
  if (!retosSolicitados) return false;
  return retosSolicitados.includes(TipoDesafio.OTP) || retosSolicitados.includes(TipoDesafio.Ambos);
}

export function requiresEmail(retosSolicitados: TipoDesafio[] | null): boolean {
  if (!retosSolicitados) return false;
  return retosSolicitados.includes(TipoDesafio.Email) || retosSolicitados.includes(TipoDesafio.Ambos);
}

export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

