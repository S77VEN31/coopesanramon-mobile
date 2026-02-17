import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  sendSinpeMovilTransfer,
  validateSinpeMovilMonedero,
  type EnviarSinpeMovilResponse,
  type ObtenerMonederoSinpeResponse,
} from '../../services/api/transfers.api';
import { TipoDestinoTransferencia, TipoOperacion } from '../../constants/enums';

interface SinpeMovilTransferResult {
  success: boolean;
  response: EnviarSinpeMovilResponse | null;
  error: string | null;
}

interface ValidatedMonedero {
  monedero: string;
  titular: string | null;
  codigoBanco: string | null;
  identificacion: string | null;
}

interface SinpeMovilTransfersState {
  lastTransfer: EnviarSinpeMovilResponse | null;
  lastTransferEmailDestino: string | null;
  isSending: boolean;
  isValidatingMonedero: boolean;
  validatedMonedero: ValidatedMonedero | null;
  error: string | null;
  monederoValidationError: string | null;

  sendSinpeMovilTransfer: (
    tipoDestino: TipoDestinoTransferencia,
    numeroCuentaOrigen: string,
    monederoDestino: string,
    monto: number,
    detalle?: string,
    emailDestino?: string,
    idDesafio?: string,
    idMonederoFavorito?: number
  ) => Promise<SinpeMovilTransferResult>;
  validateMonedero: (monedero: string) => Promise<ObtenerMonederoSinpeResponse | null>;
  resetState: () => void;
  resetMonederoValidation: () => void;
  setError: (error: string | null) => void;
}

export const useSinpeMovilTransfersStore = create<SinpeMovilTransfersState>()(
  devtools(
    (set) => ({
      lastTransfer: null,
      lastTransferEmailDestino: null,
      isSending: false,
      isValidatingMonedero: false,
      validatedMonedero: null,
      error: null,
      monederoValidationError: null,

      sendSinpeMovilTransfer: async (
        tipoDestino: TipoDestinoTransferencia,
        numeroCuentaOrigen: string,
        monederoDestino: string,
        monto: number,
        detalle?: string,
        emailDestino?: string,
        idDesafio?: string,
        idMonederoFavorito?: number
      ): Promise<SinpeMovilTransferResult> => {
        set({ isSending: true, error: null }, false, 'sinpeMovilTransfers/sendStart');

        try {
          const request = {
            tipoDestino,
            numeroCuentaOrigen,
            monederoDestino,
            monto,
            detalle: detalle || null,
            emailDestino: emailDestino || null,
            idDesafio: idDesafio || null,
            idMonederoFavorito: tipoDestino === TipoDestinoTransferencia.CuentaFavorita ? (idMonederoFavorito || null) : null,
          };

          const response = await sendSinpeMovilTransfer(request);
          
          set(
            { 
              lastTransfer: response,
              lastTransferEmailDestino: emailDestino || null,
              isSending: false, 
              error: null,
            },
            false,
            'sinpeMovilTransfers/sendSuccess'
          );
          
          return {
            success: true,
            response,
            error: null,
          };
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error al enviar la transferencia SINPE Móvil';
          
          set(
            { 
              lastTransfer: null, 
              isSending: false, 
              error: errorMessage,
            },
            false,
            'sinpeMovilTransfers/sendError'
          );
          
          throw new Error(errorMessage);
        }
      },

      validateMonedero: async (monedero: string): Promise<ObtenerMonederoSinpeResponse | null> => {
        set({ 
          isValidatingMonedero: true, 
          monederoValidationError: null,
          validatedMonedero: null 
        }, false, 'sinpeMovilTransfers/validateMonederoStart');

        try {
          const response = await validateSinpeMovilMonedero(monedero);
          
          set(
            { 
              isValidatingMonedero: false,
              monederoValidationError: null,
              validatedMonedero: {
                monedero,
                titular: response.titular,
                codigoBanco: response.codigoBanco,
                identificacion: response.identificacion,
              },
            },
            false,
            'sinpeMovilTransfers/validateMonederoSuccess'
          );
          
          return response;
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error al validar el monedero';
          
          set(
            { 
              isValidatingMonedero: false,
              monederoValidationError: errorMessage,
              validatedMonedero: null,
            },
            false,
            'sinpeMovilTransfers/validateMonederoError'
          );
          
          return null;
        }
      },

      resetState: () => {
        set(
          {
            lastTransfer: null,
            lastTransferEmailDestino: null,
            isSending: false,
            isValidatingMonedero: false,
            validatedMonedero: null,
            error: null,
            monederoValidationError: null,
          },
          false,
          'sinpeMovilTransfers/resetState'
        );
      },

      resetMonederoValidation: () => {
        set(
          {
            isValidatingMonedero: false,
            validatedMonedero: null,
            monederoValidationError: null,
          },
          false,
          'sinpeMovilTransfers/resetMonederoValidation'
        );
      },

      setError: (error: string | null) => {
        set({ error }, false, 'sinpeMovilTransfers/setError');
      },
    }),
    {
      name: 'SinpeMovilTransfersStore',
      enabled: __DEV__,
    }
  )
);

export function sinpeMovilTransferRequires2FA(): boolean {
  return true;
}

export function getSinpeMovilOperationType(tipoDestino: TipoDestinoTransferencia): TipoOperacion {
  switch (tipoDestino) {
    case TipoDestinoTransferencia.CuentaFavorita:
      return TipoOperacion.TransferenciaSinpeMovilMonederoFavorito;
    case TipoDestinoTransferencia.CuentaDigitada:
      return TipoOperacion.TransferenciaSinpeMovilMonederoDigitado;
    default:
      return TipoOperacion.TransferenciaSinpeMovilMonederoDigitado;
  }
}

