import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { IconoCrear, IconoEvento } from '../components/Icons';

export default function ClubPanelScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CrearEvento')}>
        <IconoCrear />
        <TextInput style={styles.buttonText} editable={false} value="Crear Evento" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('VerEventos')}>
        <IconoEvento />
        <TextInput style={styles.buttonText} editable={false} value="Ver Eventos" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  button: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonSecondary: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    marginTop: 8,
  },
});