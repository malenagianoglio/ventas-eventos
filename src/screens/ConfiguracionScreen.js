import { View, TextInput, Pressable, StyleSheet, Alert, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { usePrinter } from '../context/PrinterContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { IconoBluetooth, IconoImpresora, IconoSalir, IconoEvento } from '../components/Icons';

export default function ConfiguracionScreen({ route }) {
  const navigation = useNavigation();
  const { connectedPrinter, connecting, devices, loadDevices, connect, disconnect } = usePrinter();
  const { logout } = useAuth();
  const eventId = route.params?.eventId;  

  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const handleSelectPrinter = async () => {
    const ok = await loadDevices();
    if (ok) setShowPrinterModal(true);
  };

  const handleConnect = async (device) => {
    await connect(device);
    setShowPrinterModal(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => logout(navigation) },
      ]
    );
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
          <TouchableOpacity onPress={disconnect}>
            <TextInput style={styles.disconnectText} editable={false} value="Desconectar" />
          </TouchableOpacity>
        </View>
      )}

      <Pressable style={styles.button} onPress={handleSelectPrinter}>
        <IconoImpresora />
        <TextInput style={styles.buttonText} editable={false} value="Conectar Impresora" />
      </Pressable>

      <Pressable 
        style={[styles.button, !eventId && styles.buttonDisabled]} 
        disabled={!eventId}
        onPress={() => navigation.navigate('CrearEvento', { eventId })}
      >
        <IconoEvento />
        <TextInput style={styles.buttonText} editable={false} value="Editar Evento" />
      </Pressable>

      <Pressable style={[styles.button, styles.buttonLogout]} onPress={handleLogout}>
        <IconoSalir />
        <TextInput style={styles.buttonText} editable={false} value="Cerrar sesión" />
      </Pressable>

      {/* ── Modal impresoras ── */}
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
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    marginBottom: 20,
    height: 36,
    width: '100%',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  connectedText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
    margin: 0,
    height: 20,
    flex: 1,
  },
  disconnectText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    height: 20,
  },
  button: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  buttonLogout: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 8,
    height: 30,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    padding: 0,
    margin: 0,
    marginBottom: 16,
    height: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.white,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 22,
  },
  deviceAddress: {
    fontSize: 12,
    color: colors.textMuted,
    padding: 0,
    margin: 0,
    height: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    padding: 20,
    height: 60,
  },
  cancelButton: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 15,
    padding: 0,
    margin: 0,
    height: 22,
  },
});