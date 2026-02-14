import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  pagarCuota,
  type PagarCuotaPrestamoRequest,
  type PagarCuotaPrestamoResponse,
} from '../../services/api/loans.api';

interface PaymentResult {
  success: boolean;
  response: PagarCuotaPrestamoResponse | null;
  error: string | null;
}

interface LoanPaymentState {
  paymentResult: PagarCuotaPrestamoResponse | null;
  isProcessingPayment: boolean;
  paymentError: string | null;

  processPayment: (request: PagarCuotaPrestamoRequest) => Promise<PaymentResult>;
  resetPaymentResult: () => void;
  setPaymentError: (error: string | null) => void;
}

export const useLoanPaymentStore = create<LoanPaymentState>()(
  devtools(
    (set) => ({
      paymentResult: null,
      isProcessingPayment: false,
      paymentError: null,

      processPayment: async (request: PagarCuotaPrestamoRequest): Promise<PaymentResult> => {
        set({ isProcessingPayment: true, paymentError: null }, false, 'loanPayment/processStart');

        try {
          const response = await pagarCuota(request);

          set(
            {
              paymentResult: response,
              isProcessingPayment: false,
              paymentError: null,
            },
            false,
            'loanPayment/processSuccess'
          );

          return {
            success: true,
            response,
            error: null,
          };
        } catch (err) {
          const errorMessage = err instanceof Error
            ? err.message
            : 'Error al procesar el pago';

          set(
            {
              paymentResult: null,
              isProcessingPayment: false,
              paymentError: errorMessage,
            },
            false,
            'loanPayment/processError'
          );

          throw new Error(errorMessage);
        }
      },

      resetPaymentResult: () => {
        set(
          {
            paymentResult: null,
            isProcessingPayment: false,
            paymentError: null,
          },
          false,
          'loanPayment/reset'
        );
      },

      setPaymentError: (error: string | null) => {
        set({ paymentError: error }, false, 'loanPayment/setError');
      },
    }),
    {
      name: 'LoanPaymentStore',
      enabled: __DEV__,
    }
  )
);
