import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  sendTransferenciaSinpe,
  sendTransferenciaCreditosDirectos,
  sendTransferenciaDebitosTiempoReal,
  type EnviarTransferenciaSinpeResponse,
  type EnviarTransferenciaCreditosDirectosResponse,
  type EnviarTransferenciaDebitosTiempoRealResponse,
} from '../../services/api/transfers.api';
import { TipoDestinoTransferencia, TipoOperacion } from '../../constants/enums';

interface SinpeTransferResult {
  success: boolean;
  response: EnviarTransferenciaSinpeResponse | EnviarTransferenciaCreditosDirectosResponse | EnviarTransferenciaDebitosTiempoRealResponse | null;
  error: string | null;
}

interface SinpeTransfersState {
  lastTransfer: EnviarTransferenciaSinpeResponse | EnviarTransferenciaCreditosDirectosResponse | EnviarTransferenciaDebitosTiempoRealResponse | null;
  lastTransferEmailDestino: string | null;
  isSending: boolean;
  error: string | null;
  sinpeTransferType: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null;

  sendtransferenciaSinpe: (
    tipoDestino: TipoDestinoTransferencia,
    numeroCuentaOrigen: string,
    monto: number,
    detalle?: string,
    emailDestino?: string,
    idDesafio?: string,
    idCuentaFavorita?: number,
    numeroCuentaDestino?: string
  ) => Promise<SinpeTransferResult>;
  
  sendtransferenciaCreditosDirectos: (
    tipoDestino: TipoDestinoTransferencia,
    numeroCuentaOrigen: string,
    monto: number,
    detalle?: string,
    emailDestino?: string,
    idDesafio?: string,
    idCuentaFavorita?: number,
    numeroCuentaDestino?: string
  ) => Promise<SinpeTransferResult>;
  
  sendtransferenciaDebitosTiempoReal: (
    tipoDestino: TipoDestinoTransferencia,
    numeroCuentaOrigen: string,
    monto: number,
    detalle?: string,
    emailDestino?: string,
    idDesafio?: string,
    idCuentaFavorita?: number,
    numeroCuentaDestino?: string
  ) => Promise<SinpeTransferResult>;
  
  setSinpeTransferType: (type: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null) => void;
  resetState: () => void;
  setError: (error: string | null) => void;
}

export const useSinpeTransfersStore = create<SinpeTransfersState>()(
  devtools(
    (set) => ({
      lastTransfer: null,
      lastTransferEmailDestino: null,
      isSending: false,
      error: null,
      sinpeTransferType: null,

      sendtransferenciaSinpe: async (
        tipoDestino: TipoDestinoTransferencia,
        numeroCuentaOrigen: string,
        monto: number,
        detalle?: string,
        emailDestino?: string,
        idDesafio?: string,
        idCuentaFavorita?: number,
        numeroCuentaDestino?: string
      ): Promise<SinpeTransferResult> => {
        set({ isSending: true, error: null }, false, 'sinpeTransfers/sendStart');

        try {
          const request = {
            tipoDestino,
            numeroCuentaOrigen,
            monto,
            detalle: detalle || null,
            emailDestino: emailDestino || null,
            idDesafio: idDesafio || null,
            idCuentaFavorita: tipoDestino === TipoDestinoTransferencia.CuentaFavorita ? (idCuentaFavorita || null) : null,
            numeroCuentaDestino: numeroCuentaDestino || '',
          };

          const response = await sendTransferenciaSinpe(request);
          
          set(
            { 
              lastTransfer: response,
              lastTransferEmailDestino: emailDestino || null,
              isSending: false, 
              error: null,
            },
            false,
            'sinpeTransfers/sendSuccess'
          );
          
          return {
            success: true,
            response,
            error: null,
          };
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error al enviar la transferencia SINPE';
          
          set(
            { 
              lastTransfer: null, 
              isSending: false, 
              error: errorMessage,
            },
            false,
            'sinpeTransfers/sendError'
          );
          
          throw new Error(errorMessage);
        }
      },

      sendtransferenciaCreditosDirectos: async (
        tipoDestino: TipoDestinoTransferencia,
        numeroCuentaOrigen: string,
        monto: number,
        detalle?: string,
        emailDestino?: string,
        idDesafio?: string,
        idCuentaFavorita?: number,
        numeroCuentaDestino?: string
      ): Promise<SinpeTransferResult> => {
        set({ isSending: true, error: null }, false, 'sinpeTransfers/sendCreditosDirectosStart');

        try {
          const request = {
            tipoDestino,
            numeroCuentaOrigen,
            monto,
            detalle: detalle || null,
            emailDestino: emailDestino || null,
            idDesafio: idDesafio || null,
            idCuentaFavorita: tipoDestino === TipoDestinoTransferencia.CuentaFavorita ? (idCuentaFavorita || null) : null,
            numeroCuentaDestino: numeroCuentaDestino || '',
          };

          const response = await sendTransferenciaCreditosDirectos(request);
          
          set(
            { 
              lastTransfer: response,
              lastTransferEmailDestino: emailDestino || null,
              isSending: false, 
              error: null,
            },
            false,
            'sinpeTransfers/sendCreditosDirectosSuccess'
          );
          
          return {
            success: true,
            response,
            error: null,
          };
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error al enviar la transferencia de Créditos Directos';
          
          set(
            { 
              lastTransfer: null, 
              isSending: false, 
              error: errorMessage,
            },
            false,
            'sinpeTransfers/sendCreditosDirectosError'
          );
          
          throw new Error(errorMessage);
        }
      },

      sendtransferenciaDebitosTiempoReal: async (
        tipoDestino: TipoDestinoTransferencia,
        numeroCuentaOrigen: string,
        monto: number,
        detalle?: string,
        emailDestino?: string,
        idDesafio?: string,
        idCuentaFavorita?: number,
        numeroCuentaDestino?: string
      ): Promise<SinpeTransferResult> => {
        set({ isSending: true, error: null }, false, 'sinpeTransfers/sendDebitosTiempoRealStart');

        try {
          const request = {
            tipoDestino,
            numeroCuentaOrigen,
            monto,
            detalle: detalle || null,
            emailDestino: emailDestino || null,
            idDesafio: idDesafio || null,
            idCuentaFavorita: tipoDestino === TipoDestinoTransferencia.CuentaFavorita ? (idCuentaFavorita || null) : null,
            numeroCuentaDestino: numeroCuentaDestino || '',
          };

          const response = await sendTransferenciaDebitosTiempoReal(request);
          
          set(
            { 
              lastTransfer: response,
              lastTransferEmailDestino: emailDestino || null,
              isSending: false, 
              error: null,
            },
            false,
            'sinpeTransfers/sendDebitosTiempoRealSuccess'
          );
          
          return {
            success: true,
            response,
            error: null,
          };
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error al enviar la transferencia de Débitos en Tiempo Real';
          
          set(
            { 
              lastTransfer: null, 
              isSending: false, 
              error: errorMessage,
            },
            false,
            'sinpeTransfers/sendDebitosTiempoRealError'
          );
          
          throw new Error(errorMessage);
        }
      },

      setSinpeTransferType: (type: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' | null) => {
        set({ sinpeTransferType: type }, false, 'sinpeTransfers/setTransferType');
      },

      resetState: () => {
        set(
          {
            lastTransfer: null,
            lastTransferEmailDestino: null,
            isSending: false,
            error: null,
            sinpeTransferType: null,
          },
          false,
          'sinpeTransfers/resetState'
        );
      },

      setError: (error: string | null) => {
        set({ error }, false, 'sinpeTransfers/setError');
      },
    }),
    {
      name: 'SinpeTransfersStore',
      enabled: __DEV__,
    }
  )
);

export function sinpeTransferRequires2FA(): boolean {
  return true;
}

export function getSinpeOperationType(
  tipoDestino: TipoDestinoTransferencia,
  transferType: 'pagos-inmediatos' | 'creditos-directos' | 'debitos-tiempo-real' = 'pagos-inmediatos'
): TipoOperacion {
  if (transferType === 'creditos-directos') {
    switch (tipoDestino) {
      case TipoDestinoTransferencia.CuentaFavorita:
        return TipoOperacion.TransferenciaCreditosDirectosCuentaFavorita;
      case TipoDestinoTransferencia.CuentaDigitada:
        return TipoOperacion.TransferenciaCreditosDirectosCuentaDigitada;
      default:
        return TipoOperacion.TransferenciaCreditosDirectosCuentaDigitada;
    }
  }
  
  if (transferType === 'debitos-tiempo-real') {
    switch (tipoDestino) {
      case TipoDestinoTransferencia.CuentaFavorita:
        return TipoOperacion.TransferenciaDebitoTiempoRealCuentaFavorita;
      case TipoDestinoTransferencia.CuentaDigitada:
        return TipoOperacion.TransferenciaDebitoTiempoRealCuentaDigitada;
      default:
        return TipoOperacion.TransferenciaDebitoTiempoRealCuentaDigitada;
    }
  }
  
  switch (tipoDestino) {
    case TipoDestinoTransferencia.CuentaFavorita:
      return TipoOperacion.TransferenciaPagosInmediatosCuentaFavorita;
    case TipoDestinoTransferencia.CuentaDigitada:
      return TipoOperacion.TransferenciaPagosInmediatosCuentaDigitada;
    default:
      return TipoOperacion.TransferenciaPagosInmediatosCuentaDigitada;
  }
}

