import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEvents } from '../../database';

export function useEventos() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadEvents = async () => {
    try {
      setError(null);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      const message = err?.message || 'No se pudieron cargar los eventos';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadEvents(); }, []));

  return { events, loading, error, refresh: loadEvents };
}