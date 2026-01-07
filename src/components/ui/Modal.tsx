import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { getCardBackgroundColor, getTextColor, getSecondaryTextColor, getBorderColor } from '../../../App';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  colorScheme?: 'light' | 'dark' | null | undefined;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
  /** Optional custom content to render below the message */
  customContent?: React.ReactNode;
}

export const CustomModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  colorScheme = 'light',
  buttons = [{ text: 'Aceptar', onPress: onClose, variant: 'default' }],
  customContent,
}) => {
  const backgroundColor = getCardBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={32} color="#16a34a" />;
      case 'error':
        return <AlertCircle size={32} color="#991b1b" />;
      case 'warning':
        return <AlertCircle size={32} color="#d97706" />;
      default:
        return <AlertCircle size={32} color="#a61612" />;
    }
  };

  const getIconContainerStyle = () => {
    switch (type) {
      case 'success':
        return styles.iconContainerSuccess;
      case 'error':
        return styles.iconContainerError;
      case 'warning':
        return styles.iconContainerWarning;
      default:
        return styles.iconContainerError;
    }
  };

  const getButtonStyle = (variant?: 'default' | 'outline' | 'destructive') => {
    const baseStyle = [styles.button, buttons.length > 1 && styles.buttonFlex];
    switch (variant) {
      case 'outline':
        return [...baseStyle, styles.buttonOutline];
      case 'destructive':
        return [...baseStyle, styles.buttonDestructive];
      default:
        return [...baseStyle, styles.buttonDefault];
    }
  };

  const getButtonTextStyle = (variant?: 'default' | 'outline' | 'destructive') => {
    switch (variant) {
      case 'outline':
        return [styles.buttonText, styles.buttonTextOutline];
      case 'destructive':
        return [styles.buttonText, styles.buttonTextWhite];
      default:
        return [styles.buttonText, styles.buttonTextWhite];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View 
            style={[
              styles.modalContent,
              { backgroundColor }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, getIconContainerStyle()]}>
                {getIcon()}
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: textColor }]}>
              {title}
            </Text>

            {/* Message */}
            <Text style={[styles.message, { color: secondaryTextColor }]}>
              {message}
            </Text>

            {/* Custom Content */}
            {customContent}

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={button.onPress}
                  style={[
                    ...getButtonStyle(button.variant),
                    button.variant === 'outline' && { borderColor }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={getButtonTextStyle(button.variant)}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconContainerSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  iconContainerError: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  iconContainerWarning: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 28,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonDefault: {
    backgroundColor: '#a61612',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonDestructive: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextWhite: {
    color: '#ffffff',
  },
  buttonTextOutline: {
    color: '#a61612',
  },
});

