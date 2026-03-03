import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getVentasConDetalle, getResumenEvento, getResumenProductos } from '../../database';

export function useVentas(eventId) {
  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVentas = async () => {
    try {
      setError(null);
      const [ventasData, resumenData, productosData] = await Promise.all([
        getVentasConDetalle(eventId),
        getResumenEvento(eventId),
        getResumenProductos(eventId),
      ]);
      setVentas(ventasData);
      setResumen(resumenData);
      setProductos(productosData);
    } catch (err) {
      const message = err?.message || 'No se pudo cargar el resumen';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadVentas(); }, [eventId]));

  return { ventas, resumen, productos, loading, error, refresh: loadVentas };
}