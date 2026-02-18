import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';

export default function LoginClubScreen({ navigation }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (user === 'club123' && password === '1234') {
      navigation.navigate('ClubPanel');
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingreso Club</Text>

      <TextInput
        placeholder="Usuario"
        style={styles.input}
        value={user}
        onChangeText={setUser}
      />

      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    color: '#fff',
  },
  title: {
    fontSize: 26,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});
