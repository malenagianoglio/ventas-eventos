import { TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getEventByAccessCode } from '../../database';
import { colors } from '../theme/colors';
import { useAppToast } from '../hooks/useAppToast';

export default function LoginEventoScreen() {
  const navigation = useNavigation();
  const { loginEvento } = useAuth();
  const toast = useAppToast();
  const [accessCode, setAccessCode] = useState('');

  const handleLogin = async () => {
    if (!accessCode.trim()) {
      toast.error('El código de acceso es obligatorio');
      return;
    }
    try {
      const event = await getEventByAccessCode(accessCode.trim());
      if (event) {
        loginEvento(event.id);
        navigation.navigate('EventoHome', { eventId: event.id });
      } else {
        toast.error('Código de acceso incorrecto');
      }
    } catch {
      toast.error('No se pudo verificar el código de acceso');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TextInput style={styles.title} value="Ingreso con PIN" editable={false} />
      <TextInput
        placeholder="Código de acceso"
        style={styles.input}
        value={accessCode}
        onChangeText={setAccessCode}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <TextInput style={styles.buttonText} value="Ingresar" editable={false} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    height: 22,
  },
});