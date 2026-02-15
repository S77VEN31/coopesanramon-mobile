import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuthStore } from '@/lib/states/auth.store';
import { RootStackParamList, AuthStackParamList, MainStackParamList, MainDrawerParamList } from './types';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { LoginScreen } from '@/screens/LoginScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import AccountsScreen from '@/screens/AccountsScreen';
import AccountDetailScreen from '@/screens/AccountDetailScreen';
import MovementsScreen from '@/screens/MovementsScreen';
import TransfersScreen from '@/screens/TransfersScreen';
import LoansScreen from '@/screens/LoansScreen';
import MyLoansScreen from '@/screens/MyLoansScreen';
import PaymentPlanScreen from '@/screens/PaymentPlanScreen';
import PaymentsScreen from '@/screens/PaymentsScreen';
import TimeDepositsScreen from '@/screens/TimeDepositsScreen';
import MyInvestmentsScreen from '@/screens/MyInvestmentsScreen';
import InvestmentDetailScreen from '@/screens/InvestmentDetailScreen';
import CouponsScreen from '@/screens/CouponsScreen';
import FavoriteAccountsScreen from '@/screens/FavoriteAccountsScreen';
import MyFavoriteAccountsScreen from '@/screens/MyFavoriteAccountsScreen';
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import CustomHeader from '@/components/header/CustomHeader';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen as React.ComponentType<any>} />
    </AuthStack.Navigator>
  );
}

function DrawerNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Drawer.Navigator
      id="MainDrawer"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      backBehavior="none"
      screenOptions={{
        headerShown: true,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff5f5',
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen as React.ComponentType<any>}
        options={{ 
          header: () => <CustomHeader title="Inicio" showDrawerButton={true} />,
          drawerLabel: 'Inicio' 
        }}
      />
      <Drawer.Screen 
        name="Accounts" 
        component={AccountsScreen}
        options={{ 
          header: () => <CustomHeader title="Cuentas" showDrawerButton={true} />,
          drawerLabel: 'Cuentas' 
        }}
      />
      <Drawer.Screen 
        name="Movements" 
        component={MovementsScreen}
        options={{ 
          header: () => <CustomHeader title="Movimientos" showDrawerButton={true} />,
          drawerLabel: 'Movimientos' 
        }}
      />
      <Drawer.Screen 
        name="Transfers" 
        component={TransfersScreen}
        options={{ 
          header: () => <CustomHeader title="Transferencias" showDrawerButton={true} />,
          drawerLabel: 'Transferencias' 
        }}
      />
      <Drawer.Screen
        name="Loans"
        component={LoansScreen}
        options={{
          header: () => <CustomHeader title="Préstamos" showDrawerButton={true} />,
          drawerLabel: 'Préstamos'
        }}
      />
      <Drawer.Screen
        name="TimeDeposits"
        component={TimeDepositsScreen}
        options={{
          header: () => <CustomHeader title="Inversiones" showDrawerButton={true} />,
          drawerLabel: 'Inversiones'
        }}
      />
      <Drawer.Screen
        name="FavoriteAccounts"
        component={FavoriteAccountsScreen}
        options={{
          header: () => <CustomHeader title="Favoritas" showDrawerButton={true} />,
          drawerLabel: 'Favoritas'
        }}
      />
    </Drawer.Navigator>
  );
}

function MainNavigator() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1a1a1a' : '#ffffff';

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
        animation: 'default',
      }}
    >
      <MainStack.Screen name="MainDrawer" component={DrawerNavigator} />
      <MainStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Detalles de Cuenta" showBackButton={true} />,
        }}
      />
      <MainStack.Screen
        name="MyLoans"
        component={MyLoansScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Mis Préstamos" showBackButton={true} />,
        }}
      />
      <MainStack.Screen
        name="PaymentPlan"
        component={PaymentPlanScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Plan de Pagos" showBackButton={true} />,
        }}
      />
      <MainStack.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Pagos Efectuados" showBackButton={true} />,
        }}
      />
      <MainStack.Screen
        name="MyInvestments"
        component={MyInvestmentsScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Mis Inversiones" showBackButton={true} />,
        }}
      />
      <MainStack.Screen
        name="InvestmentDetail"
        component={InvestmentDetailScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Detalle de Inversión" showBackButton={true} />,
        }}
      />
      <MainStack.Screen
        name="Coupons"
        component={CouponsScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Cupones" showBackButton={true} />,
        }}
      />
      <MainStack.Screen
        name="MyFavoriteAccounts"
        component={MyFavoriteAccountsScreen}
        options={{
          headerShown: true,
        }}
      />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a61612" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="MainStack" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
