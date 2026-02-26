import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

export default function EventoHomeScreen({ route }) {
  const navigation = useNavigation();
  const { eventId } = route.params;

  const IconoConfiguracion = () => (
    <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
      <Path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
    </Svg>
  );

  const IconoVentas = () => (
    <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
      <Path d="M280-640q-33 0-56.5-23.5T200-720v-80q0-33 23.5-56.5T280-880h400q33 0 56.5 23.5T760-800v80q0 33-23.5 56.5T680-640H280Zm0-80h400v-80H280v80ZM160-80q-33 0-56.5-23.5T80-160v-40h800v40q0 33-23.5 56.5T800-80H160ZM80-240l139-313q10-22 30-34.5t43-12.5h376q23 0 43 12.5t30 34.5l139 313H80Zm260-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm120 160h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm120 160h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Z"/>
    </Svg>
  );

  const IconoProductos = () => (
    <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
      <Path d="M440-600v-120H320v-80h120v-120h80v120h120v80H520v120h-80ZM223.5-103.5Q200-127 200-160t23.5-56.5Q247-240 280-240t56.5 23.5Q360-193 360-160t-23.5 56.5Q313-80 280-80t-56.5-23.5Zm400 0Q600-127 600-160t23.5-56.5Q647-240 680-240t56.5 23.5Q760-193 760-160t-23.5 56.5Q713-80 680-80t-56.5-23.5ZM40-800v-80h131l170 360h280l156-280h91L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68.5-39t-1.5-79l54-98-144-304H40Z"/>
    </Svg>
  );

  const IconoResumen = () => (
    <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
      <Path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z"/>
    </Svg>
  );

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.button, { backgroundColor: '#0F3460' }]} 
        onPress={() => navigation.navigate('Ventas', { eventId })}
      >
        <IconoVentas style={styles.icon} />
        <TextInput style={styles.text} value="Ventas" editable={false} />
      </Pressable>

      <Pressable 
        style={[styles.button, { backgroundColor: '#113D71' }]} 
        onPress={() => navigation.navigate('Productos', { eventId })}
      >
        <IconoProductos style={styles.icon} />
        <TextInput style={styles.text} value="Productos y precios" editable={false} />
      </Pressable>

      <Pressable 
        style={[styles.button, { backgroundColor: '#144783' }]} 
        onPress={() => navigation.navigate('Resumen', { eventId })}
      >
        <IconoResumen style={styles.icon} />
        <TextInput style={styles.text} value="Resumen" editable={false} />
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: '#175094' }]} 
        onPress={() => navigation.navigate('Configuracion', { eventId })}
      >
        <IconoConfiguracion style={styles.icon} />
        <TextInput style={styles.text} value="Configuración" editable={false} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  button: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
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
