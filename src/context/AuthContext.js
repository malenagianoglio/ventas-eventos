import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const STORAGE_KEY = 'auth:session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión guardada al montar
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSession(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loginClub = async () => {
    const newSession = { type: 'club' };
    setSession(newSession);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const loginEvento = async (eventId) => {
    const newSession = { type: 'evento', eventId };
    setSession(newSession);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const logout = async (navigation) => {
    setSession(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }],
    });
  };

  return (
    <AuthContext.Provider value={{ session, loading, loginClub, loginEvento, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};