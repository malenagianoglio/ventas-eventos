import { useNavigation } from '@react-navigation/native';
import { View, Text, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import CustomText from '../../CustomText';
import { useColorScheme } from 'react-native';

export default function StartScreen() {

    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    console.log('COLOR SCHEME:', colorScheme);

  return (
    
    <View style={styles.container}>
     
      <TextInput style={styles.title} value="Control de Ventas" editable={false} />
      <TextInput style={styles.subtitle} value="Sistema de gestión para eventos" editable={false} />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginClub')}>
        <TextInput value="Ingresar como Club" editable={false} style={{color: '#ffffff', fontSize: 20, fontWeight: 'bold', margin: 0, padding: 0, height: 24}} />
        <TextInput value="Administrador del sistema" editable={false} style={{color: '#ffffff', fontSize: 14, margin: 0, marginTop: 5, padding: 0, height: 24}}/>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('LoginEvento')}>
        <TextInput value="Ingresar como Evento" editable={false} style={{color: '#ffffff', fontSize: 20, fontWeight: 'bold', margin: 0, padding: 0, height: 24}} />
        <TextInput value="Acceso con PIN" editable={false} style={{color: '#ffffff', fontSize: 14, margin: 0, marginTop: 5, padding: 0, height: 24}}/>
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
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#2D3436',
    textAlign: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#0F3460',
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonSecondary: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#54A0FF',
    alignItems: 'center',
  },
});
