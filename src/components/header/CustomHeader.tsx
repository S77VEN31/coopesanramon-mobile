import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu, ArrowLeft } from 'lucide-react-native';

interface CustomHeaderProps {
  title: string;
  showDrawerButton?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  titleComponent?: React.ReactNode;
}

export default function CustomHeader({
  title,
  showDrawerButton = false,
  showBackButton = false,
  onBackPress,
  rightComponent,
  titleComponent,
}: CustomHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleDrawerPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {Platform.OS === 'android' && (
        <RNStatusBar
          barStyle="light-content"
          backgroundColor="#a61612"
          translucent={false}
        />
      )}
      <View style={[styles.header, { 
        paddingTop: Platform.OS === 'ios' ? insets.top + 8 : (insets.top > 0 ? insets.top + 8 : 8),
        paddingBottom: 12,
      }]}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showDrawerButton && (
          <TouchableOpacity
            onPress={handleDrawerPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Menu size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section - Title */}
      <View style={styles.centerSection}>
        {titleComponent ? (
          titleComponent
        ) : (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.OS === 'ios' ? 56 : 64,
    paddingHorizontal: Platform.OS === 'android' ? 16 : 12,
    backgroundColor: '#a61612',
    zIndex: 1000,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
  },
  iconButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

