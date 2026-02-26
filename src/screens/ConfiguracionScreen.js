import { View, TextInput, Pressable, StyleSheet, Alert, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { getPairedDevices, connectPrinter, requestBluetoothPermission } from '../utils/printer';

const IconoImpresora = () => (
  <Svg height="40px" viewBox="0 -960 960 960" width="40px" fill="#fff">
    <Path d="M640-640v-120H320v120h-80v-200h480v200h-80Zm-480 80h560-560Zm480 100q17 0 28.5-11.5T680-500q0-17-11.5-28.5T640-540q-17 0-28.5 11.5T600-500q0 17 11.5 28.5T640-460Zm-80 260v-160H400v160h160Zm80 80H320v-160H160v-280q0-51 35-85.5t85-34.5h480q51 0 85.5 34.5T880-560v280H720v160Zm80-240v-200H240v200h80v-80h320v80h80Z"/>
  </Svg>
);

const IconoBluetooth = () => (
  <Svg height="20px" viewBox="0 -960 960 960" width="20px" fill="#0F3460">
    <Path d="M440-80v-304L256-200l-56-56 224-224-224-224 56-56 184 184v-304h40l216 216-172 172 172 172L480-80h-40Zm80-496 76-76-76-76v152Zm0 342 76-76-76-76v152Z"/>
  </Svg>
);

const IconoEvento = () => (
  <Svg height="40px" viewBox="0 -960 960 960" width="40px" fill="#fff">
    <Path d="M438-226 296-368l58-58 84 84 168-168 58 58-226 226ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
  </Svg>
);


export default function ConfiguracionScreen() {
  const navigation = useNavigation();

  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedPrinter, setConnectedPrinter] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const handleSelectPrinter = async () => {
    try {
        const hasPermission = await requestBluetoothPermission();
        if (!hasPermission) {
        Alert.alert('Permiso denegado', 'Necesitás dar permiso de Bluetooth para conectar la impresora');
        return;
        }
        const paired = await getPairedDevices();
        setDevices(paired);
        setShowPrinterModal(true);
    } catch (e) {
        Alert.alert('Error', 'No se pudieron obtener los dispositivos Bluetooth');
    }
    };

  const handleConnect = async (device) => {
    try {
      setConnecting(true);
      await connectPrinter(device.address);
      setConnectedPrinter(device);
      setShowPrinterModal(false);
      Alert.alert('Conectado', `Impresora ${device.name} conectada correctamente`);
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar a la impresora');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.title} editable={false} value="Configuración" />

      {connectedPrinter && (
        <View style={styles.connectedBadge}>
          <IconoBluetooth />
          <TextInput
            style={styles.connectedText}
            editable={false}
            value={`Impresora: ${connectedPrinter.name}`}
          />
        </View>
      )}

      <Pressable style={[styles.button, styles.buttonPrinter]} onPress={handleSelectPrinter}>
        <IconoImpresora />
        <TextInput style={styles.buttonText} editable={false} value="Conectar Impresora" />
      </Pressable>

      <Pressable style={styles.button}>
        <IconoEvento />
        <TextInput style={styles.buttonText} editable={false} value="Editar Evento" />
      </Pressable>

      <Modal visible={showPrinterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput style={styles.modalTitle} editable={false} value="Seleccionar Impresora" />
            <TextInput style={styles.modalSubtitle} editable={false} value="Dispositivos Bluetooth emparejados:" />
            {devices.length === 0 ? (
              <TextInput style={styles.emptyText} editable={false} value="No hay dispositivos emparejados" />
            ) : (
              <FlatList
                data={devices}
                keyExtractor={(item) => item.address}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.deviceItem}
                    onPress={() => handleConnect(item)}
                    disabled={connecting}
                  >
                    <IconoBluetooth />
                    <View style={styles.deviceInfo}>
                      <TextInput style={styles.deviceName} editable={false} value={item.name} />
                      <TextInput style={styles.deviceAddress} editable={false} value={item.address} />
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPrinterModal(false)}>
              <TextInput style={styles.cancelButtonText} editable={false} value="Cancelar" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2D3436',
    textAlign: 'center',
    padding: 0,
    margin: 0,
    height: 36,
    width: '100%',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0F3460',
    gap: 8,
  },
  connectedText: {
    color: '#0F3460',
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
    margin: 0,
    height: 20,
    width: 150,
    textAlign: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#111',
    marginBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  buttonPrinter: {
    backgroundColor: '#0F3460',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    height: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
    padding: 0,
    margin: 0,
    height: 30,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    padding: 0,
    margin: 0,
    height: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    padding: 0,
    margin: 0,
    height: 22,
  },
  deviceAddress: {
    fontSize: 12,
    color: '#999',
    padding: 0,
    margin: 0,
    height: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    padding: 20,
    height: 60,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 15,
    padding: 0,
    margin: 0,
    height: 22,
  },
});