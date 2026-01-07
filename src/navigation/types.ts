import type { NavigatorScreenParams } from '@react-navigation/native';

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
};

export type MainDrawerParamList = {
  Dashboard: undefined;
  Accounts: undefined;
  Movements: { numeroCuenta?: string };
  Transfers: undefined;
  More: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

