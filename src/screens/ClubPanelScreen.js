import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const IconoCrear = () => (
  <Svg height="30px" viewBox="0 -960 960 960" width="30px" fill="#e3e3e3">
    <Path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
  </Svg>
);

const IconoEvento = () => (
  <Svg height="30px" viewBox="0 -960 960 960" width="30px" fill="#e3e3e3">
    <Path d="M438-226 296-368l58-58 84 84 168-168 58 58-226 226ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
  </Svg>
);

const IconoConfiguracion = () => (
  <Svg height="30px" viewBox="0 -960 960 960" width="30px" fill="#e3e3e3">
    <Path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
  </Svg>
);

export default function ClubPanelScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CrearEvento')}>
        <IconoCrear color="#e3e3e3"/>
        <TextInput style={styles.text} editable={false} value="Crear Evento"/>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#113D71' }]} onPress={() => navigation.navigate('VerEventos')}>
        <IconoEvento color="#e3e3e3"/>
        <TextInput style={styles.text} editable={false} value="Ver Eventos"/>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#144783' }]} onPress={() => navigation.navigate('Configuracion')}>
        <IconoConfiguracion color="#e3e3e3"/>
        <TextInput style={styles.text} editable={false} value="Configuración"/>
      </TouchableOpacity>
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
    backgroundColor: '#0F3460',
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
