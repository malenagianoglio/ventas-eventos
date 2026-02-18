import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Pressable, Keyboard, ScrollView } from 'react-native';
import { useState } from 'react';
import { insertEvent } from '../../database';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function CrearEventoScreen({ navigation }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('propio');
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreateEvent = async () => {
  if (!name || !type) {
    Alert.alert('Error', 'El nombre y tipo de evento son obligatorios');
    return;
  }

  const dateString = date ? date.toISOString().split('T')[0] : '';

  try {
    if (type === 'alquilado') {
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await insertEvent(name, type, dateString, accessCode);
      Alert.alert('Evento creado', `Código de acceso: ${accessCode}`);
    } else {
      await insertEvent(name, type, dateString);
      Alert.alert('Evento creado', 'Tu evento ha sido creado exitosamente');
    }
    
    setName('');
    setDate(null);
    setType('propio');
    navigation.navigate('ClubPanel');

  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'No se pudo crear el evento');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Crear Evento</Text>

      <Text style={styles.label}>Nombre del evento</Text>
      <TextInput
        placeholder="Ingresá el nombre"
        style={styles.input}
        value={name}
        onChangeText={setName}
        blurOnSubmit={true}
      />

      <Text style={styles.label}>Tipo de evento</Text>
      <View style={styles.selectorContainer}>
        <Pressable 
          style={[styles.selectorButton, type === 'propio' && styles.selectorButtonActive]}
          onPress={() => {
            Keyboard.dismiss();
            setType('propio');
          }}
        >
          <Text style={[styles.selectorText, type === 'propio' && styles.selectorTextActive]}>Propio</Text>
        </Pressable>
        <Pressable 
          style={[styles.selectorButton, type === 'alquilado' && styles.selectorButtonActive]}
          onPress={() => {
            Keyboard.dismiss();
            setType('alquilado');
            }}
          >
            <Text style={[styles.selectorText, type === 'alquilado' && styles.selectorTextActive]}>Alquilado</Text>
          </Pressable>
          </View>

<Text style={styles.label}>Fecha (Opcional)</Text>
      <TouchableOpacity 
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ fontSize: 16, color: date ? '#000' : '#999' }}>
          {date ? date.toLocaleDateString('es-AR') : 'Seleccioná una fecha'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
          minimumDate={new Date()}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
        <Text style={styles.buttonText}>Crear Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  selectorButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectorButtonActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectorTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
