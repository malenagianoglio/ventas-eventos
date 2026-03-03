import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { IconoVentas, IconoProductos, IconoResumen, IconoConfiguracion } from '../components/Icons';

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function EventoHomeScreen({ route }) {
  const navigation = useNavigation();
  const { eventId } = route.params;

  return (
    <View style={styles.container}>
      <Pressable style={styles.btnVentas} onPress={() => navigation.navigate('Ventas', { eventId })}>
        <IconoVentas />
        <TextInput style={styles.buttonText} value="Ventas" editable={false} />
      </Pressable>

      <Pressable style={styles.btnProductos} onPress={() => navigation.navigate('Productos', { eventId })}>
        <IconoProductos />
        <TextInput style={styles.buttonText} value="Productos y precios" editable={false} />
      </Pressable>

      <Pressable style={styles.btnResumen} onPress={() => navigation.navigate('Resumen', { eventId })}>
        <IconoResumen />
        <TextInput style={styles.buttonText} value="Resumen" editable={false} />
      </Pressable>

      <Pressable style={styles.btnConfiguracion} onPress={() => navigation.navigate('Configuracion', { eventId })}>
        <IconoConfiguracion />
        <TextInput style={styles.buttonText} value="Configuración" editable={false} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  btnVentas: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  btnProductos: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: colors.secondary,
  },
  btnResumen: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: colors.tertiary,
  },
  btnConfiguracion: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.quaternary,
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