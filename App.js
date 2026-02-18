import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDB } from './database';
import { useEffect } from 'react';  

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

export default function App() {

  useEffect(() => {
    initDB()
      .then(() => console.log('Base de datos inicializada'))
      .catch((error) => console.error('Error al inicializar la base de datos:', error));
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
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
        <Stack.Screen name="Configuración" component={ConfiguracionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
