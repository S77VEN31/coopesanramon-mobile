import type { NavigatorScreenParams } from '@react-navigation/native';
import type { DtoInversion } from '../services/api/investments.api';

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  MainDrawer: NavigatorScreenParams<MainDrawerParamList>;
  AccountDetail: { numeroCuenta: string };
  MyLoans: undefined;
  PaymentPlan: undefined;
  Payments: undefined;
  MyInvestments: undefined;
  InvestmentDetail: { investment: DtoInversion };
  Coupons: { numeroInversion?: string } | undefined;
  MyFavoriteAccounts: { type: 'local' | 'sinpe' | 'wallets' };
};

export type MainDrawerParamList = {
  Dashboard: undefined;
  Accounts: undefined;
  Movements: { numeroCuenta?: string };
  Transfers: undefined;
  Loans: undefined;
  TimeDeposits: undefined;
  FavoriteAccounts: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

