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
import CustomDrawerContent from '@/components/drawer/CustomDrawerContent';
import CustomHeader from '@/components/header/CustomHeader';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

function MoreScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* More Screen (Placeholder) */}
    </View>
  );
}

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
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        name="More" 
        component={MoreScreen}
        options={{ 
          header: () => <CustomHeader title="Más" showDrawerButton={true} />,
          drawerLabel: 'Más' 
        }}
      />
    </Drawer.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainDrawer" component={DrawerNavigator} />
      <MainStack.Screen 
        name="AccountDetail" 
        component={AccountDetailScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Detalles de Cuenta" showBackButton={true} />,
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
