import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Home, CreditCard, ArrowLeftRight, MoreHorizontal, LogOut, History, User } from 'lucide-react-native';
import LogoBlancoLargo from '../../../assets/logo-blanco-largo.svg';
import { useAuthStore } from '@/lib/states/auth.store';
import { getBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor, getCardBackgroundColor } from '../../../App';
import { MainDrawerParamList, MainStackParamList } from '@/navigation/types';
import { Card, CardContent } from '../ui/Card';

type DrawerScreen = {
  name: keyof MainDrawerParamList;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const drawerScreens: DrawerScreen[] = [
  { name: 'Dashboard', label: 'Inicio', icon: Home },
  { name: 'Accounts', label: 'Cuentas', icon: CreditCard },
  { name: 'Movements', label: 'Movimientos', icon: History },
  { name: 'Transfers', label: 'Transferencias', icon: ArrowLeftRight },
  { name: 'More', label: 'Más', icon: MoreHorizontal },
];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const backgroundColor = getBackgroundColor(colorScheme);
  const cardBackgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const { logout, user } = useAuthStore();
  const { navigation, state } = props;

  const handleNavigate = (screenName: keyof MainDrawerParamList) => {
    navigation.navigate(screenName);
    navigation.closeDrawer();
  };

  const handleLogout = () => {
    logout();
    navigation.closeDrawer();
  };

  const activeRouteIndex = state.index;
  const activeRouteName = state.routes[activeRouteIndex]?.name;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style="light" />
      {Platform.OS === 'android' && (
        <RNStatusBar
          barStyle="light-content"
          backgroundColor="#a61612"
          translucent={false}
        />
      )}
      <DrawerContentScrollView 
        {...props} 
        style={{ 
          padding: 0, 
          paddingHorizontal: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingStart: 0,
          paddingEnd: 0,
          margin: 0,
          marginHorizontal: 0,
          marginLeft: 0,
          marginRight: 0,
        }}
        contentContainerStyle={[styles.scrollContent, { 
          padding: 0, 
          paddingHorizontal: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingStart: 0,
          paddingEnd: 0,
          paddingVertical: 0,
          margin: 0,
          marginHorizontal: 0,
          marginLeft: 0,
          marginRight: 0,
        }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={[
          styles.headerContainer, 
          { 
            backgroundColor: '#a61612',
            paddingTop: Platform.OS === 'ios' ? insets.top + 16 : (insets.top > 0 ? insets.top + 16 : 16),
          }
        ]}>
          <View style={styles.logoContainer}>
            <LogoBlancoLargo 
              width={300} 
              height={60} 
            />
          </View>
        </View>

        {/* User Info */}
        {user?.name && (
          <View style={styles.userContainer}>
            <Card style={styles.userCard} colorScheme={colorScheme}>
              <CardContent style={styles.userContent}>
                <View style={[styles.avatarContainer, { backgroundColor: colorScheme === 'dark' ? 'rgba(166, 22, 18, 0.15)' : 'rgba(166, 22, 18, 0.08)' }]}>
                  <User size={20} color="#a61612" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
                    {user.name}
                  </Text>
                  {user.email && (
                    <Text style={[styles.userEmail, { color: secondaryTextColor }]} numberOfLines={1}>
                      {user.email}
                    </Text>
                  )}
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {drawerScreens.map((screen) => {
            const Icon = screen.icon;
            const isActive = activeRouteName === screen.name;

            return (
              <TouchableOpacity
                key={screen.name}
                style={[
                  styles.menuItem,
                  { 
                    backgroundColor: isActive 
                      ? (colorScheme === 'dark' ? 'rgba(166, 22, 18, 0.15)' : 'rgba(166, 22, 18, 0.08)')
                      : 'transparent',
                  },
                ]}
                onPress={() => handleNavigate(screen.name)}
                activeOpacity={0.7}
              >
                <Icon
                  size={18}
                  color={isActive ? '#a61612' : textColor}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { 
                      color: isActive ? '#a61612' : textColor,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                >
                  {screen.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
        <TouchableOpacity
          style={[styles.logoutButton, { 
            borderColor: colorScheme === 'dark' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)',
          }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    paddingHorizontal: 0,
    paddingStart: 0,
    paddingEnd: 0,
    margin: 0,
    marginHorizontal: 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingStart: 0,
    paddingEnd: 0,
    margin: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 0,
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 56,
  },
  userContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  userCard: {
    margin: 0,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  menuContainer: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 6,
    gap: 12,
  },
  menuIcon: {
    width: 18,
    height: 18,
  },
  menuItemText: {
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
    gap: 8,
    minHeight: 44,
  },
  logoutText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '500',
  },
});
