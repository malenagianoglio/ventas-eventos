import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

// Obtener el módulo nativo de impresora - puede ser PrinterModule o RNEscPosPrinter
const PrinterModule = NativeModules.PrinterModule || NativeModules.RNEscPosPrinter || NativeModules.RnEscPosPrinter;

const validateModuleAvailable = () => {
  if (!PrinterModule || !PrinterModule.getPairedDevices) {
    throw new Error('PrinterModule no está disponible en la plataforma nativa. Asegúrate de que el módulo nativo está correctamente vinculado.');
  }
};

export const requestBluetoothPermission = async () => {
  if (Platform.OS !== 'android') return true;
  
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  ]);
  
  return (
    granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
    granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
  );
};

export const getPairedDevices = async () => {
  validateModuleAvailable();
  return await PrinterModule.getPairedDevices();
};

export const connectPrinter = async (address) => {
  validateModuleAvailable();
  return await PrinterModule.connect(address);
};

export const printTicket = async (productName, presentation, price, eventName) => {
  validateModuleAvailable();
  return await PrinterModule.printTicket(productName, presentation, price, eventName);
};

export const disconnectPrinter = async () => {
  validateModuleAvailable();
  return await PrinterModule.disconnect();
};