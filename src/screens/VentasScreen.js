import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Pressable, Modal, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { getProductosByEvento, initDB } from '../../database';
import { useFocusEffect } from '@react-navigation/native';

export default function VentasScreen({ route }) {
  const { eventId } = route.params;

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaActiva, setVentaActiva] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const loadProductos = async () => {
    try {
      await initDB();
      const data = await getProductosByEvento(eventId);
      setProductos(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProductos();
    }, [eventId])
  );

  const iniciarVenta = () => {
    setCarrito([]);
    setVentaActiva(true);
  };

  const cancelarVenta = () => {
    setCarrito([]);
    setVentaActiva(false);
  };

  const confirmarVenta = () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío');
      return;
    }

    Alert.alert('Venta confirmada');
    setCarrito([]);
    setVentaActiva(false);
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);

      if (existe) {
        return prev.map(p =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }

      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const disminuirCantidad = (id) => {
  setCarrito(prev =>
    prev
      .map(item =>
        item.id === id
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
      .filter(item => item.cantidad > 0)
  );
};

const handleImprimir = () => {
  Alert.alert('Venta confirmada', `Total: $${total.toFixed(2)}`);
  setCarrito([]);
  setVentaActiva(false);
  setShowModal(false);
};

  const renderItem = ({ item }) => (
    <Pressable
      style={[
        styles.productCard,
        { opacity: ventaActiva ? 1 : 0.4 }
      ]}
      disabled={!ventaActiva}
      onPress={() => agregarAlCarrito(item)}
    >
      <Text style={styles.productName}>{item.nombre}</Text>

      {item.presentacion ? (
        <Text style={styles.productPresentation}>{item.presentacion}</Text>
      ) : null}

      <Text style={styles.productPrice}>
        ${item.precio.toFixed(2)}
      </Text>
    </Pressable>
  );

  if (!loading && productos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Sin productos</Text>
        <Text style={styles.emptyText}>
          Aún no hay productos agregados
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* IZQUIERDA - PRODUCTOS */}
      <View style={styles.leftColumn}>
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={3}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 10 }}
        />
      </View>

      {/* DERECHA - PANEL */}
      <View style={styles.rightColumn}>
        <Text style={styles.title}>Panel de ventas</Text>

        {!ventaActiva ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={iniciarVenta}
          >
            <Text style={styles.startButtonText}>Nueva Venta</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.cartTitle}>Carrito</Text>

            <FlatList
              data={carrito}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <Text style={styles.cartItemName}>
                    {item.nombre}
                  </Text>

                  <Text style={styles.cartItemQuantity}>
                    x{item.cantidad}
                  </Text>

                  <View style={styles.cartButtons}>
                    <TouchableOpacity onPress={() => disminuirCantidad(item.id)}>
                      <Text style={styles.minus}>−</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => agregarAlCarrito(item)}>
                      <Text style={styles.plus}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cartItemPrice}>
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </Text>
                </View>
              )}
            />

            <Text style={styles.total}>
              Total: ${total.toFixed(2)}
            </Text>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelarVenta}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {setShowModal(true)}}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>


    <Modal visible={showModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Confirmar Venta</Text>

            {carrito.map(item => (
              <Text key={item.id} style={styles.modalItem}>
                {item.nombre} x{item.cantidad} - ${(item.precio * item.cantidad).toFixed(2)}
              </Text>
            ))}

            <Text style={styles.modalTotal}>
              Total: ${carrito.reduce(
                (acc, item) => acc + item.precio * item.cantidad,
                0
              ).toFixed(2)}
            </Text>

            <TouchableOpacity
              style={styles.printButton}
              onPress={handleImprimir}
            >
              <Text style={styles.printText}>Imprimir Tickets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: '#fff',
  },

  leftColumn: {
    flex: 7,
    backgroundColor: '#f9f9f9',
  },

  rightColumn: {
    flex: 3,
    backgroundColor: '#fff',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 25,
    color: '#111',
    letterSpacing: 0.5,
  },

  productCard: {
    flex: 1,
    margin: 6,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  productName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
    flexWrap: 'wrap',
  },

  productPresentation: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    color: '#111',
  },

  startButton: {
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#111',
    marginTop: 5,
  },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#f9f9f9',
    marginBottom: 3,
    borderRadius: 8,
  },

  cartItemName: {
    flex: 1.2,
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },

  cartItemQuantity: {
    width: 45,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  cartItemPrice: {
    width: 70,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },

  total: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    color: '#111',
    borderWidth: 2,
    borderColor: '#111',
    textAlign: 'center',
  },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  cancelButtonText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },

  cartButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  minus: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d32f2f',
    paddingHorizontal: 6,
  },

  plus: {
    fontSize: 20,
    fontWeight: '700',
    color: '#388e3c',
    paddingHorizontal: 6,
  },

  clearButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    elevation: 2,
  },

  clearButtonText: {
    color: '#111',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    width: '85%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },

  modalItem: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },

  modalTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#111',
  },

  printButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    elevation: 3,
  },

  printText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

});
