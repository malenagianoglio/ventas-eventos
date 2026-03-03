import { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPairedDevices,
  connectPrinter,
  disconnectPrinter,
  requestBluetoothPermission,
} from '../utils/printer';

const PrinterContext = createContext(null);

const STORAGE_KEY = 'printer:last_device';


export function PrinterProvider({ children }) {
  const [connectedPrinter, setConnectedPrinter] = useState(null);
  const [connecting, setConnecting]             = useState(false);
  const [devices, setDevices]                   = useState([]);
  const [reconnectError, setReconnectError]     = useState(null);

  const loadDevices = async () => {
    try {
      const hasPermission = await requestBluetoothPermission();
      if (!hasPermission) {
        Alert.alert('Permiso denegado', 'Necesitás dar permiso de Bluetooth para conectar la impresora');
        return false;
      }
      const paired = await getPairedDevices();
      setDevices(paired);
      return true;
    } catch {
      Alert.alert('Error', 'No se pudieron obtener los dispositivos Bluetooth');
      return false;
    }
  };

  const connect = async (device) => {
    try {
      setConnecting(true);
      await connectPrinter(device.address);
      setConnectedPrinter(device);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(device));
    } catch {
      Alert.alert('Error', 'No se pudo conectar a la impresora');
    } finally {
      setConnecting(false);
    }
  };

  const reconnectLast = async () => {
    try {
      setReconnectError(null);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setReconnectError('No hay impresora guardada');
        return;
      }
      const device = JSON.parse(saved);
      await connectPrinter(device.address);
      setConnectedPrinter(device);
      setReconnectError(null);
    } catch (err) {
      const message = err?.message || 'No se pudo reconectar la impresora';
      setReconnectError(message);
    }
  };

  const disconnect = async () => {
    try {
      await disconnectPrinter();
      setConnectedPrinter(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      Alert.alert('Error', 'No se pudo desconectar la impresora');
    }
  };

  useEffect(() => {
    reconnectLast().catch(() => {});
  }, []);

  return (
    <PrinterContext.Provider value={{
      connectedPrinter,
      connecting,
      devices,
      loadDevices,
      connect,
      disconnect,
      reconnectLast,
      reconnectError,
    }}>
      {children}
    </PrinterContext.Provider>
  );
}

export const usePrinter = () => {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error('usePrinter debe usarse dentro de PrinterProvider');
  return ctx;
};