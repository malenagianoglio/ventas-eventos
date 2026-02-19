import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Pressable, Keyboard, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}> 
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput style={styles.title} editable={false} value="Crear Evento"/>

      <TextInput style={styles.label} editable={false} value="Nombre del evento:"/>
      <TextInput
        placeholder="Ingresá el nombre"
        style={styles.input}
        value={name}
        onChangeText={setName}
        blurOnSubmit={true}
      />

      <TextInput style={styles.label} editable={false} value="Tipo de evento:"/>
      <View style={styles.selectorContainer}>
        <Pressable 
          style={[styles.selectorButton, type === 'propio' && styles.selectorButtonActive]}
          onPress={() => {
            Keyboard.dismiss();
            setType('propio');
          }}
        >
          <TextInput style={{fontSize: 16, color: type === 'propio' ? '#fff' : '#000000'}} editable={false} value="Propio"/>
        </Pressable>
        <Pressable 
          style={[styles.selectorButton, type === 'alquilado' && styles.selectorButtonActive]}
          onPress={() => {
            Keyboard.dismiss();
            setType('alquilado');
            }}
          >
            <TextInput style={{fontSize: 16, color: type === 'alquilado' ? '#fff' : '#000000'}} editable={false} value="Alquilado"/>
          </Pressable>
          </View>

<TextInput style={{...styles.label}} editable={false} value="Fecha (Opcional):"/>
    <View style={{...styles.inputContainer}}>
      <TouchableOpacity 
        style={styles.datePickerTrigger}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ fontSize: 16, color: date ? '#000' : '#999' }}>
          {date ? date.toLocaleDateString('es-AR') : 'Seleccioná una fecha'}
        </Text>
      </TouchableOpacity>

      {date && (
        <TouchableOpacity 
          onPress={() => setDate(null)} 
          style={styles.clearButton}
        >
          <Text style={styles.buttonText}>X</Text>
        </TouchableOpacity>
      )}
    </View>

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
        <TextInput value="Crear Evento" editable={false} style={styles.buttonText}/>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 10,
    overflow: 'hidden', 
  },
  datePickerTrigger: {
    flex: 1, 
    justifyContent: 'center',
    height: '100%',
  },
  clearButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '30',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 0,
    margin: 0,
  },
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 26,
    margin: 0,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color:'#2D3436',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    height: 50,
    width: '100%',
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  selectorButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    height: 50,
  },
  selectorButtonActive: {
    backgroundColor: '#0F3460',
    borderColor: '#0F3460',
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
    backgroundColor: '#0F3460',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    height: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
