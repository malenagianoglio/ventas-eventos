import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { useState } from 'react';
import { getEventByAccessCode } from '../../database';

export default function LoginEventoScreen() {
  const [accessCode, setAccessCode] = useState('');

  const handleLogin = async( ) => {
    if (!accessCode) {
      Alert.alert('Error', 'El código de acceso es obligatorio');
      return;
    }

    try {
      const event = await getEventByAccessCode(accessCode);
      if (event) {
        Alert.alert('Bienvenido', `Has ingresado al evento: ${event.name}`);
      } else {
        Alert.alert('Error', 'Código de acceso incorrecto');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo verificar el código de acceso');
    }
  }

  return (
    <View style={styles.container}> 
      <Text style={styles.title}>Ingreso con PIN</Text>

      <TextInput
        placeholder="Código de acceso"
        style={styles.input}
        value={accessCode}
        onChangeText={setAccessCode}
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

