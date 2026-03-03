import { TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { useAppToast } from '../hooks/useAppToast';

const CREDENCIALES = { user: 'club123', password: '1234' };

export default function LoginClubScreen({ navigation }) {
  const { loginClub } = useAuth();
  const toast = useAppToast();
  const [user, setUser]         = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (user === CREDENCIALES.user && password === CREDENCIALES.password) {
      loginClub();
      navigation.navigate('ClubPanel');
    } else {
      toast.error('Usuario o contraseña incorrectos');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TextInput style={styles.title} value="Ingreso Club" editable={false} />
      <TextInput
        placeholder="Usuario"
        style={styles.input}
        value={user}
        onChangeText={setUser}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
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