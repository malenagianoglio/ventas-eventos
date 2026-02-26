import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDB } from './database';
import { useEffect } from 'react';  
import { Text, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Importación de pantallas
import StartScreen from './src/screens/StartScreen';
import LoginClubScreen from './src/screens/LoginClubScreen';
import LoginEventoScreen from './src/screens/LoginEventoScreen';
import ClubPanelScreen from './src/screens/ClubPanelScreen';
import CrearEventoScreen from './src/screens/CrearEventoScreen';
import VerEventosScreen from './src/screens/VerEventosScreen';
import EventoHomeScreen from './src/screens/EventoHomeScreen';
import EventoHomeAlquiladoScreen from './src/screens/EventoHomeAlquilerScreen';
import VentasScreen from './src/screens/VentasScreen';
import ProductosScreen from './src/screens/ProductosScreen';
import ConfiguracionScreen from './src/screens/ConfiguracionScreen';

const Stack = createNativeStackNavigator();

// PARCHE GLOBAL: Esto obliga a que cualquier <Text> que no tenga color 
// use negro sólido, ignorando el gris de la tablet.
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.style = { color: 'rgba(0, 0, 0, 0.99)' };

export default function App() {
  const [fontsLoaded] = useFonts({
    ...MaterialIcons.font,
    ...Ionicons.font,
  });

  useEffect(() => {
    // Inicializar DB
    initDB()
      .then(() => console.log('Base de datos inicializada'))
      .catch((error) => console.error('Error al inicializar DB:', error));
    
    console.log('¿Fuentes de iconos listas?:', fontsLoaded);
  }, [fontsLoaded]);

  // Si las fuentes no cargan, mostramos un cargando en lugar de pantalla negra
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Start" 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' } // Fuerza fondo blanco en todas las pantallas
        }}
      >
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="LoginClub" component={LoginClubScreen} />
        <Stack.Screen name="LoginEvento" component={LoginEventoScreen} />
        <Stack.Screen name="ClubPanel" component={ClubPanelScreen} />
        <Stack.Screen name="CrearEvento" component={CrearEventoScreen} />
        <Stack.Screen name="VerEventos" component={VerEventosScreen} />
        <Stack.Screen name="EventoHome" component={EventoHomeScreen} />
        <Stack.Screen name="Ventas" component={VentasScreen} />
        <Stack.Screen name="Productos" component={ProductosScreen} />
        <Stack.Screen name="EventoHomeAlquilado" component={EventoHomeAlquiladoScreen} />
        <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}