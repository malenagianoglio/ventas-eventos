import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ClubPanelScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => navigation.navigate('CrearEvento')}>
        <MaterialIcons style={styles.icon} name="add-circle-outline" size={40} color="black" />
        <Text style={styles.text}>Crear Evento</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('VerEventos')}>
        <MaterialIcons style={styles.icon} name="event" size={40} color="black" />
        <Text style={styles.text}>Ver Eventos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#111',
    marginBottom: 20,
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
    color: '#fff',
  },
});
