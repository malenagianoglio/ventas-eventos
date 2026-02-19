import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Pressable, Modal, ScrollView, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { getProductosByEvento, initDB } from '../../database';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import EscPosPrinter from 'react-native-esc-pos-printer';

const IconoCancelar = () => (
  <Svg height="20px" viewBox="0 -960 960 960" width="20px" fill="#555">
    <Path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
  </Svg>
);

const IconoConfirmar = () => (
  <Svg height="20px" viewBox="0 -960 960 960" width="20px" fill="#fff">
    <Path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
  </Svg>
);

const IconoMenos = () => (
  <Svg height="18px" viewBox="0 -960 960 960" width="18px" fill="#E94560">
    <Path d="M200-440v-80h560v80H200Z"/>
  </Svg>
);

const IconoMas = () => (
  <Svg height="18px" viewBox="0 -960 960 960" width="18px" fill="#1DD1A1">
    <Path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
  </Svg>
);

export default function VentasScreen({ route }) {
  const { eventId } = route.params;
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaActiva, setVentaActiva] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const PRIORIDAD_CATEGORIAS = {
    'bebida': 1,
    'comida': 2,
    'otro': 3
  };

  const loadProductos = async () => {
    try {
      await initDB();
      const data = await getProductosByEvento(eventId);

      const productosOrdenados = data.sort((a, b) => {
      
      const ordenA = PRIORIDAD_CATEGORIAS[a.categoria] || 99;
      const ordenB = PRIORIDAD_CATEGORIAS[b.categoria] || 99;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }
      
      return a.nombre.localeCompare(b.nombre);
    });

    setProductos(productosOrdenados);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadProductos(); }, [eventId]));

  const iniciarVenta = () => { setCarrito([]); setVentaActiva(true); };
  const cancelarVenta = () => { setCarrito([]); setVentaActiva(false); };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const disminuirCantidad = (id) => {
    setCarrito(prev =>
      prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item)
          .filter(item => item.cantidad > 0)
    );
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleConfirmar = () => {
    if (carrito.length === 0) { Alert.alert('Carrito vacío'); return; }
    setShowModal(true);
  };

  const handleImprimir = async () => {
  try {
    // Obtener dispositivos Bluetooth emparejados
    const devices = await EscPosPrinter.getBluetoothDeviceList();

    if (!devices || devices.length === 0) {
      Alert.alert('Error', 'No hay impresoras Bluetooth emparejadas');
      return;
    }

    // Usamos la primera impresora encontrada
    const printer = devices[0];

    await EscPosPrinter.connect(printer.address);

    // 🔥 Imprimir un ticket por cada producto y cantidad
    for (const item of carrito) {
      for (let i = 0; i < item.cantidad; i++) {
        await EscPosPrinter.printText("************************\n", {});
        await EscPosPrinter.printText("      VENTA EVENTO\n", {});
        await EscPosPrinter.printText("************************\n\n", {});

        await EscPosPrinter.printText(`Producto: ${item.nombre}\n`, {});
        await EscPosPrinter.printText(`Precio: $${item.precio.toFixed(2)}\n\n`, {});

        await EscPosPrinter.printText("Gracias por su compra\n\n\n\n", {});
      }
    }

    await EscPosPrinter.disconnect();

    Alert.alert('Venta confirmada e impresa');
    setCarrito([]);
    setVentaActiva(false);
    setShowModal(false);

  } catch (error) {
    console.log(error);
    Alert.alert('Error al imprimir', error.message);
  }
};

  const renderProducto = ({ item }) => {
  const enCarrito = carrito.find(p => p.id === item.id);
  return (
    <Pressable
      style={[styles.productCard, { opacity: ventaActiva ? 1 : 0.5 }]}
      disabled={!ventaActiva}
      onPress={() => agregarAlCarrito(item)}
    >
      {enCarrito ? (
        <View style={styles.badgeCantidad}>
          <TextInput style={styles.badgeCantidadText} editable={false} value={`x${enCarrito.cantidad}`} />
        </View>
      ) : null}
      <View style={styles.productCardInfo}>
        <TextInput style={styles.productName} editable={false} value={item.nombre} />
        {item.presentacion ? <TextInput style={styles.productPresentation} editable={false} value={item.presentacion} /> : null}
        <TextInput style={styles.productPrice} editable={false} value={`$${item.precio.toFixed(2)}`} />
      </View>
    </Pressable>
  );
};

  if (!loading && productos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TextInput style={styles.emptyTitle} editable={false} value="Sin productos" />
        <TextInput style={styles.emptyText} editable={false} value="Aún no hay productos agregados" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* IZQUIERDA */}
      <View style={styles.leftColumn}>
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProducto}
          numColumns={3}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        />
      </View>

      {/* DERECHA */}
      <View style={styles.rightColumn}>
        <TextInput style={styles.panelTitle} editable={false} value="Panel de ventas" />

        {!ventaActiva ? (
          <TouchableOpacity style={styles.startButton} onPress={iniciarVenta}>
            <TextInput style={styles.startButtonText} editable={false} value="Nueva Venta" />
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }}>
            <TextInput style={styles.cartTitle} editable={false} value="Carrito" />

            <FlatList
              data={carrito}
              keyExtractor={(item) => item.id.toString()}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <TextInput style={styles.cartItemName} editable={false} value={item.nombre} />
                  <View style={styles.cartControls}>
                    <TouchableOpacity style={styles.controlBtn} onPress={() => disminuirCantidad(item.id)}>
                      <IconoMenos style={styles.iconoMenos} />
                    </TouchableOpacity>
                    <TextInput style={styles.cartItemQuantity} editable={false} value={item.cantidad.toString()} />
                    <TouchableOpacity style={styles.controlBtn} onPress={() => agregarAlCarrito(item)}>
                      <IconoMas style={styles.iconoMas} />
                    </TouchableOpacity>
                  </View>
                  <TextInput style={styles.cartItemPrice} editable={false} value={`$${(item.precio * item.cantidad).toFixed(2)}`} />
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.carritoVacio}>
                  <TextInput style={styles.carritoVacioText} editable={false} value="Tocá un producto para agregar" />
                </View>
              }
            />

            <TextInput style={styles.total} editable={false} value={`Total: $${total.toFixed(2)}`} />

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelarVenta}>
                <IconoCancelar />
                <TextInput style={styles.cancelButtonText} editable={false} value="Cancelar" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmar}>
                <IconoConfirmar />
                <TextInput style={styles.confirmButtonText} editable={false} value="Confirmar" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput style={styles.modalTitle} editable={false} value="Confirmar Venta" />
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {carrito.map(item => (
                <View key={item.id} style={styles.modalItem}>
                  <TextInput style={styles.modalItemName} editable={false} value={`${item.nombre} x${item.cantidad}`} />
                  <TextInput style={styles.modalItemPrice} editable={false} value={`$${(item.precio * item.cantidad).toFixed(2)}`} />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalDivider} />
            <View style={styles.modalTotalRow}>
              <TextInput style={styles.modalTotalLabel} editable={false} value="Total" />
              <TextInput style={styles.modalTotalAmount} editable={false} value={`$${total.toFixed(2)}`} />
            </View>
            <TouchableOpacity style={styles.printButton} onPress={handleImprimir}>
              <TextInput style={styles.printText} editable={false} value="Confirmar y cerrar" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowModal(false)}>
              <TextInput style={styles.modalCancelText} editable={false} value="Volver" />
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
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingTop: 20,
  },
  leftColumn: {
    flex: 6.5,
    backgroundColor: '#F5F5F5',
  },
  rightColumn: {
    flex: 3,
    backgroundColor: '#fff',
    padding: 15,
    paddingBottom: 70,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    color: '#2D3436',
    padding: 0,
    margin: 0,
    height: 30,
  },
  productCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 10,
    position: 'relative',
  },
  badgeCantidad: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#E94560',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  badgeCantidadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    height: 16,
  },
  productCardInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    padding: 0,
    margin: 0,
  },
  productPresentation: {
    fontSize: 18,
    color: '#999',
    padding: 0,
    margin: 0,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F3460',
    marginTop: 4,
    padding: 0,
    margin: 0,
  },
  startButton: {
    backgroundColor: '#222',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    height: 22,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2D3436',
    padding: 0,
    marginTop: 0,
    height: 26,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  cartItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    padding: 0,
    margin: 0,
},
cartItemPrice: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '700',
    color: '#0F3460',
    padding: 0,
    margin: 0,
},
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 12,
  },
  controlBtn: {
    width: 35,
    height: 35,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
},
  cartItemQuantity: {
    width: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    padding: 0,
    margin: 0,
    height: 22,
  },
  carritoVacio: {
    padding: 20,
    alignItems: 'center',
  },
  carritoVacioText: {
    color: '#bbb',
    fontSize: 13,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    height: 20,
  },
  total: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    height: 48,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 14,
    padding: 0,
    margin: 0,
    height: 20,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0F3460',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    padding: 0,
    margin: 0,
    height: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    padding: 0,
    height: 30,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    padding: 0,
    height: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '60%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 20,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    height: 30,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  modalItemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    padding: 0,
    margin: 0,
    height: 20,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F3460',
    padding: 0,
    margin: 0,
    height: 20,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
    padding: 0,
    margin: 0,
    height: 22,
  },
  modalTotalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    padding: 0,
    margin: 0,
    height: 36,
  },
  printButton: {
    backgroundColor: '#0F3460',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  printText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    padding: 0,
    margin: 0,
    height: 22,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCancelText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 15,
    padding: 0,
    margin: 0,
    height: 20,
  },
});