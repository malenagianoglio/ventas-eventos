import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDB } from './database';
import { useEffect } from 'react';  
import { View, ActivityIndicator } from 'react-native';

// Importación de pantallas
import StartScreen from './src/screens/StartScreen';
import LoginClubScreen from './src/screens/LoginClubScreen';
import LoginEventoScreen from './src/screens/LoginEventoScreen';
import ClubPanelScreen from './src/screens/ClubPanelScreen';
import CrearEventoScreen from './src/screens/CrearEventoScreen';
import VerEventosScreen from './src/screens/VerEventosScreen';
import EventoHomeScreen from './src/screens/EventoHomeScreen';
import VentasScreen from './src/screens/VentasScreen';
import ProductosScreen from './src/screens/ProductosScreen';
import ConfiguracionScreen from './src/screens/ConfiguracionScreen';
import ResumenScreen from './src/screens/ResumenScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    // Inicializar DB
    initDB()
      .then(() => console.log('Base de datos inicializada'))
      .catch((error) => console.error('Error al inicializar DB:', error));
  }, []);

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
        <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
        <Stack.Screen name="Resumen" component={ResumenScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}