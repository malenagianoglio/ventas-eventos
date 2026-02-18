import { useNavigation } from '@react-navigation/native';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function StartScreen() {

    const navigation = useNavigation();

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Control de Ventas</Text>
      <Text style={styles.subtitle}>Sistema de gestión para eventos</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('LoginClub')}>
        <Text style={styles.buttonTitle}>Ingresar como Club</Text>
        <Text style={styles.buttonSubtitle}>Administrador del sistema</Text>
      </Pressable>

      <Pressable style={styles.buttonSecondary} onPress={() => navigation.navigate('LoginEvento')}>
        <Text style={styles.buttonTitle}>Ingresar como Evento</Text>
        <Text style={styles.buttonSubtitle}>Acceso con PIN</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
    opacity: 1,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#555',
    textAlign: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#111',
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonSecondary: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#444',
    alignItems: 'center',
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 1,
  },
  buttonSubtitle: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 5,
  },
});
