import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  sendTransferenciaInterna,
  type EnviarTransferenciaInternaResponse,
} from '../../services/api/transfers.api';
import { TipoDestinoTransferencia, TipoOperacion } from '../../constants/enums';

interface TransferResult {
  success: boolean;
  response: EnviarTransferenciaInternaResponse | null;
  error: string | null;
}

interface InternalTransfersState {
  lastTransfer: EnviarTransferenciaInternaResponse | null;
  isSending: boolean;
  error: string | null;

  sendTransfer: (
    tipoDestino: TipoDestinoTransferencia,
    numeroCuentaOrigen: string,
    monto: number,
    detalle?: string,
    email?: string,
    idDesafio?: string,
    idCuentaFavorita?: number,
    numeroCuentaDestino?: string
  ) => Promise<TransferResult>;
  resetState: () => void;
  setError: (error: string | null) => void;
}

export const useInternalTransfersStore = create<InternalTransfersState>()(
  devtools(
    (set) => ({
      lastTransfer: null,
      isSending: false,
      error: null,

      sendTransfer: async (
        tipoDestino: TipoDestinoTransferencia,
        numeroCuentaOrigen: string,
        monto: number,
        detalle?: string,
        email?: string,
        idDesafio?: string,
        idCuentaFavorita?: number,
        numeroCuentaDestino?: string
      ): Promise<TransferResult> => {
        set({ isSending: true, error: null }, false, 'internalTransfers/sendStart');

        try {
          const request = {
            tipoDestino,
            numeroCuentaOrigen,
            monto,
            detalle: detalle || null,
            email: email || null,
            idDesafio: idDesafio || null,
            idCuentaFavorita: tipoDestino === TipoDestinoTransferencia.CuentaFavorita ? (idCuentaFavorita || null) : null,
            numeroCuentaDestino: numeroCuentaDestino || '',
          };

          const response = await sendTransferenciaInterna(request);
          
          set(
            { 
              lastTransfer: response,
              isSending: false, 
              error: null,
            },
            false,
            'internalTransfers/sendSuccess'
          );
          
          return {
            success: true,
            response,
            error: null,
          };
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error al enviar la transferencia';
          
          set(
            { 
              lastTransfer: null, 
              isSending: false, 
              error: errorMessage,
            },
            false,
            'internalTransfers/sendError'
          );
          
          throw new Error(errorMessage);
        }
      },

      resetState: () => {
        set(
          {
            lastTransfer: null,
            isSending: false,
            error: null,
          },
          false,
          'internalTransfers/resetState'
        );
      },

      setError: (error: string | null) => {
        set({ error }, false, 'internalTransfers/setError');
      },
    }),
    {
      name: 'InternalTransfersStore',
      enabled: __DEV__,
    }
  )
);

export function transferRequires2FA(tipoDestino: TipoDestinoTransferencia): boolean {
  // All internal transfers require 2FA
  return true;
}

export function getOperationType(tipoDestino: TipoDestinoTransferencia): TipoOperacion {
  switch (tipoDestino) {
    case TipoDestinoTransferencia.CuentaPropia:
      return TipoOperacion.TransferenciaInternaCuentaPropia;
    case TipoDestinoTransferencia.CuentaFavorita:
      return TipoOperacion.TransferenciaInternaCuentaFavorita;
    case TipoDestinoTransferencia.CuentaDigitada:
      return TipoOperacion.TransferenciaInternaCuentaDigitada;
    default:
      return TipoOperacion.TransferenciaInternaCuentaDigitada;
  }
}

