import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export default function StartScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TextInput style={styles.title} value="Control de Ventas" editable={false} />
      <TextInput style={styles.subtitle} value="Sistema de gestión para eventos" editable={false} />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginClub')}>
        <TextInput style={styles.buttonTitle} value="Ingresar como Club" editable={false} />
        <TextInput style={styles.buttonSubtitle} value="Administrador del sistema" editable={false} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('LoginEvento')}>
        <TextInput style={styles.buttonTitle} value="Ingresar como Evento" editable={false} />
        <TextInput style={styles.buttonSubtitle} value="Acceso con PIN" editable={false} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    marginBottom: 20,
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
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  buttonTitle: {
    color: colors.textButton,
    fontSize: 20,
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    height: 24,
  },
  buttonSubtitle: {
    color: colors.textButtonSecondary,
    fontSize: 14,
    padding: 0,
    margin: 0,
    marginTop: 5,
    height: 24,
  },
});