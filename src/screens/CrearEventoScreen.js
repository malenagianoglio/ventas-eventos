import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { insertEvent, getEventById, updateEvent } from '../../database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { useAppToast } from '../hooks/useAppToast';

export default function CrearEventoScreen({ navigation, route }) {
  const eventId = route.params?.eventId;
  const toast = useAppToast();
  const [name, setName]                   = useState('');
  const [type, setType]                   = useState('propio');
  const [date, setDate]                   = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    
    (async () => {
      try {
        const evento = await getEventById(eventId);
        if (evento) {
          setName(evento.name);
          setType(evento.type);
          setDate(evento.date ? new Date(evento.date) : null);
        }
      } catch {
        toast.error('No se pudo cargar el evento');
      }
    })();
  }, [eventId]);

  const handleCreateEvent = async () => {
    if (!name.trim()) {
      toast.error('El nombre del evento es obligatorio');
      return;
    }

    const dateString = date ? date.toISOString().split('T')[0] : '';

    try {
      if (eventId) {
        // Editar evento existente
        await updateEvent({
          id: eventId,
          name: name.trim(),
          type,
          date: dateString,
        });
        toast.success('Evento actualizado correctamente');
        navigation.goBack();
      } else {
        // Crear nuevo evento
        if (type === 'alquilado') {
          const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          await insertEvent(name.trim(), type, dateString, accessCode);
          toast.success(`Evento creado. PIN: ${accessCode}`);
        } else {
          await insertEvent(name.trim(), type, dateString);
          toast.success('Evento creado exitosamente');
        }

        setName('');
        setDate(null);
        setType('propio');
        navigation.navigate('ClubPanel');
      }
    } catch {
      toast.error(eventId ? 'No se pudo actualizar el evento' : 'No se pudo crear el evento');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TextInput style={styles.title} editable={false} value="Crear Evento" />

      <TextInput style={styles.label} editable={false} value="Nombre del evento:" />
      <TextInput
        placeholder="Ingresá el nombre"
        style={styles.input}
        value={name}
        onChangeText={setName}
        blurOnSubmit
      />

      <TextInput style={styles.label} editable={false} value="Tipo de evento:" />
      <View style={styles.selectorContainer}>
        <Pressable
          style={[styles.selectorButton, type === 'propio' && styles.selectorButtonActive]}
          onPress={() => { Keyboard.dismiss(); setType('propio'); }}
        >
          <TextInput
            style={[styles.selectorText, type === 'propio' && styles.selectorTextActive]}
            editable={false}
            value="Propio"
          />
        </Pressable>
        <Pressable
          style={[styles.selectorButton, type === 'alquilado' && styles.selectorButtonActive]}
          onPress={() => { Keyboard.dismiss(); setType('alquilado'); }}
        >
          <TextInput
            style={[styles.selectorText, type === 'alquilado' && styles.selectorTextActive]}
            editable={false}
            value="Alquilado"
          />
        </Pressable>
      </View>

      <TextInput style={styles.label} editable={false} value="Fecha (opcional):" />
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.datePickerTrigger}
          onPress={() => setShowDatePicker(true)}
        >
          <TextInput
            style={[styles.datePlaceholder, date && styles.dateValue]}
            editable={false}
            value={date ? date.toLocaleDateString('es-AR') : 'Seleccioná una fecha'}
          />
        </TouchableOpacity>
        {date && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setDate(null)}>
            <TextInput style={styles.clearButtonText} editable={false} value="✕" />
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
        <TextInput style={styles.buttonText} editable={false} value={eventId ? 'Actualizar Evento' : 'Crear Evento'} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    height: 50,
    backgroundColor: colors.white,
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
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    height: 50,
  },
  selectorButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
  },
  selectorTextActive: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
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
  datePlaceholder: {
    fontSize: 16,
    color: colors.textMuted,
    padding: 0,
    margin: 0,
  },
  dateValue: {
    color: colors.textPrimary,
  },
  clearButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textMuted,
    padding: 0,
    margin: 0,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 50,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 0,
    margin: 0,
    height: 22,
  },
});