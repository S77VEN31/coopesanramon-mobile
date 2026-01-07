import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Info, Loader2, Inbox, AlertTriangle } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { getTextColor, getSecondaryTextColor } from '../../../App';

export type MessageType = "error" | "info" | "warning" | "loading";

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
      default:
        return Info;
    }
  };

  const Icon = getIcon();

  // Styles for icon container
  const getIconContainerStyle = () => {
    switch (type) {
      case "error":
      case "info":
        return styles.iconContainerError;
      case "warning":
        return styles.iconContainerWarning;
      case "loading":
        return styles.iconContainerLoading;
      default:
        return styles.iconContainerError;
    }
  };

  // Colors for icon and text
  const iconColors = {
    error: '#a61612',
    info: '#a61612',
    warning: '#ca8a04',
    loading: '#a61612',
  };

  const textColors = {
    error: '#a61612',
    info: '#a61612',
    warning: '#a16207',
    loading: '#a61612',
  };

  const iconColor = iconColors[type] || iconColors.error;
  const messageColor = textColors[type] || textColors.error;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, getIconContainerStyle()]}>
        <Icon size={32} color={iconColor} />
      </View>
      <Text style={[styles.message, { color: messageColor }]}>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerError: {
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
  },
  iconContainerWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  iconContainerLoading: {
    backgroundColor: 'rgba(166, 22, 18, 0.1)',
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

