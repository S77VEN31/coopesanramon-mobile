import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { CustomModal } from '../components/ui/Modal';
import { Logo } from '../components/Logo';
import { LogoBlanco } from '../components/LogoBlanco';
import { login } from '../services/api/shared.api';
import { useAuthStore } from '../lib/states/auth.store';
import { getBackgroundColor, getTextColor, getSecondaryTextColor } from '../../App';
import { useColorScheme } from 'react-native';

export const LoginScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const backgroundColor = getBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const secondaryTextColor = getSecondaryTextColor(colorScheme);
  const { login: loginStore } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      setShowErrorModal(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const tokenResponse = await login(username, password);
      await loginStore(tokenResponse.access_token);
      // Navigation is handled by AppNavigator based on auth state
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff5f5' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={{ flex: 1, flexGrow: 1, justifyContent: 'center', paddingTop: 32, paddingBottom: 32, paddingHorizontal: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card colorScheme={colorScheme}>
            <CardHeader>
              <View style={[styles.logoContainer, colorScheme === 'dark' && styles.logoContainerDark]}>
                {colorScheme === 'dark' ? (
                  <LogoBlanco width={200} height={110} />
                ) : (
                  <Logo width={200} height={110} color="#a61612" />
                )}
              </View>
            </CardHeader>

            <CardContent style={styles.cardContent}>
              {error && !showErrorModal && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Input
                label="Nombre de usuario"
                placeholder="Tu nombre de usuario"
                value={username}
                onChangeText={setUsername}
                leftIcon={<Mail size={16} color={colorScheme === 'dark' ? '#ffffff' : '#a61612'} />}
                autoCapitalize="none"
                editable={!loading}
                colorScheme={colorScheme}
              />

              <Input
                label="Contraseña"
                placeholder="Tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={16} color={colorScheme === 'dark' ? '#ffffff' : '#a61612'} />}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={16} color={colorScheme === 'dark' ? '#ffffff' : '#a61612'} />
                  ) : (
                    <Eye size={16} color={colorScheme === 'dark' ? '#ffffff' : '#a61612'} />
                  )
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!loading}
                colorScheme={colorScheme}
              />

              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                >
                  Iniciar Sesión
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#a3a3a3' : '#737373' }]}>
              © 2025 COOPESANRAMÓN. Todos los derechos reservados.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <CustomModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error de inicio de sesión"
        message={error || 'Por favor verifica tu nombre de usuario y contraseña e intente nuevamente.'}
        type="error"
        colorScheme={colorScheme}
        buttons={[
          {
            text: 'Entendido',
            onPress: () => setShowErrorModal(false),
            variant: 'default',
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainerDark: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(153, 27, 27, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(153, 27, 27, 0.2)',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
  },
  buttonContainer: {
    width: '100%',
    paddingTop: 8,
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

