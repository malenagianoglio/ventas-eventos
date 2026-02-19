import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
    <View style={styles.container}> 
      <TextInput value="Ingreso con PIN" editable={false} style={{...styles.title}}/>

      <TextInput
        placeholder="Código de acceso"
        style={styles.input}
        value={accessCode}
        onChangeText={setAccessCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <TextInput value="Ingresar" editable={false} style={{...styles.buttonText, height: 40}} />
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2D3436',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#0F3460',
    padding: 6,
    borderRadius: 8,
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    margin: 0,
    padding: 0,
  },
});

