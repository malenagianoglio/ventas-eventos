import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EventoHomeScreen({ route }) {
  const navigation = useNavigation();
  const { eventId } = route.params;

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.button} 
        onPress={() => navigation.navigate('Ventas', { eventId })}
      >
        <MaterialIcons style={styles.icon} name="point-of-sale" size={40} color="white" />
        <Text style={styles.text}>Ventas</Text>
      </Pressable>

      <Pressable 
        style={styles.button} 
        onPress={() => navigation.navigate('Productos', { eventId })}
      >
        <MaterialIcons style={styles.icon} name="inventory" size={40} color="white" />
        <Text style={styles.text}>Productos y precios</Text>
      </Pressable>

      <Pressable 
        style={styles.button} 
        onPress={() => navigation.navigate('Resumen', { eventId })}
      >
        <MaterialIcons style={styles.icon} name="bar-chart" size={40} color="white" />
        <Text style={styles.text}>Resumen</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Configuración', { eventId })}
      >
        <MaterialIcons style={styles.icon} name="settings" size={40} color="white" />
        <Text style={styles.text}>Configuración</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    marginBottom: 10,
    color: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
