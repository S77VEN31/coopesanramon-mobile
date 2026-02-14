import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { AlertCircle, Info, Loader2, Inbox, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor } from '../../../App';

export type MessageType = "error" | "info" | "warning" | "loading" | "success";

interface MessageCardProps {
  message: string;
  type?: MessageType;
  style?: any;
  description?: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}

export default function MessageCard({
  message,
  type = "error",
  style,
  description,
  icon: CustomIcon,
}: MessageCardProps) {
  const colorScheme = useColorScheme();
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);

  // Determine icon based on type
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    switch (type) {
      case "error":
        return AlertCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Inbox;
      case "loading":
        return Loader2;
      case "success":
        return CheckCircle2;
      default:
        return Info;
    }
  };

  const Icon = getIcon();


  // Colors for icon and text
  const iconColors = {
    error: '#a61612',
    info: '#a61612',
    warning: '#ca8a04',
    loading: '#a61612',
    success: '#16a34a',
  };

  const iconFgColors = {
    error: '#ffffff',
    info: '#ffffff',
    warning: '#262626',
    loading: '#ffffff',
    success: '#ffffff',
  };

  const textColors = {
    error: '#a61612',
    info: '#a61612',
    warning: '#a16207',
    loading: '#a61612',
    success: '#16a34a',
  };

  const iconColor = iconColors[type] || iconColors.error;
  const iconFgColor = iconFgColors[type] || iconFgColors.error;
  const messageColor = textColors[type] || textColors.error;


  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'loading') {
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [type, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        {type === 'loading' ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon size={24} color={iconFgColor} />
          </Animated.View>
        ) : (
          <Icon size={24} color={iconFgColor} />
        )}
      </View>
      <Text style={[styles.message, { color: textColor }]}>
        {message}
      </Text>
      {description && (
        <Text style={[styles.description, { color: secondaryTextColor }]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    minHeight: 200,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 4,
  },
});

