import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProductosByEvento } from '../../database';

export function useProductos(eventId) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const loadProductos = async () => {
    try {
      setError(null);
      const data = await getProductosByEvento(eventId);
      setProductos(data);
    } catch (err) {
      const message = err?.message || 'No se pudieron cargar los productos';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadProductos(); }, [eventId]));

  return { productos, loading, error, refresh: loadProductos };
}