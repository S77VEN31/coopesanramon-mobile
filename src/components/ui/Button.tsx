import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles.buttonBase];
    const sizeStyle = {
      default: styles.buttonDefault,
      sm: styles.buttonSm,
      lg: styles.buttonLg,
    };
    const variantStyle = {
      default: styles.buttonDefaultVariant,
      outline: styles.buttonOutline,
      ghost: styles.buttonGhost,
      destructive: styles.buttonDestructive,
    };
    
    return [
      ...baseStyle,
      sizeStyle[size],
      variantStyle[variant],
      (disabled || loading) && styles.buttonDisabled,
      style,
    ];
  };

  const getTextStyle = () => {
    const sizeStyle = {
      default: styles.textDefault,
      sm: styles.textSm,
      lg: styles.textLg,
    };
    const variantStyle = {
      default: styles.textDefaultVariant,
      outline: styles.textOutline,
      ghost: styles.textGhost,
      destructive: styles.textDestructive,
    };
    
    return [styles.textBase, sizeStyle[size], variantStyle[variant]];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'default' || variant === 'destructive' ? '#ffffff' : '#a61612'} 
          />
          <Text style={[getTextStyle(), styles.loadingText]}>
            Cargando...
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {typeof children === 'string' ? (
            <Text style={getTextStyle()}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    flexShrink: 0,
  },
  buttonBase: {
    width: '100%',
  },
  buttonDefault: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  buttonLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  buttonDefaultVariant: {
    backgroundColor: '#a61612',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#a61612',
    backgroundColor: 'transparent',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDestructive: {
    backgroundColor: '#dc2626',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBase: {
    fontWeight: '500',
  },
  textDefault: {
    fontSize: 16,
  },
  textSm: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 18,
  },
  textDefaultVariant: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#a61612',
  },
  textGhost: {
    color: '#262626',
  },
  textDestructive: {
    color: '#ffffff',
  },
  loadingText: {
    marginLeft: 8,
  },
});

