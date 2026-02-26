import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { PrinterModule } = NativeModules;

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

export const getPairedDevices = () => PrinterModule.getPairedDevices();
export const connectPrinter = (address) => PrinterModule.connect(address);
export const printTicket = (productName, presentation, price, eventName) => PrinterModule.printTicket(productName, presentation, price, eventName);
export const disconnectPrinter = () => PrinterModule.disconnect();