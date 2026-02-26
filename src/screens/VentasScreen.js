import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Text } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { getProductosByEvento, initDB, getEventById, insertVenta } from '../../database';
import { useFocusEffect } from '@react-navigation/native';
import { printTicket } from '../utils/printer';
import {
  ProductoCard,
  CartItem,
  EmptyProductosState,
  ConfirmarVentaModal,
  AccionesVenta,
} from '../components/ventas/VentasPanels';

const PRIORIDAD_CATEGORIAS = {
  bebida: 1,
  comida: 2,
  otro: 3,
};

export default function VentasScreen({ route }) {
  const { eventId } = route.params;

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaActiva, setVentaActiva] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eventoNombre, setEventoNombre] = useState('');

  const loadProductos = async () => {
    try {
      await initDB();
      const [data, evento] = await Promise.all([getProductosByEvento(eventId), getEventById(eventId)]);

      setEventoNombre(evento?.name ?? '');
      setProductos(
        [...data].sort((a, b) => {
          const diff =
            (PRIORIDAD_CATEGORIAS[a.categoria] ?? 99) - (PRIORIDAD_CATEGORIAS[b.categoria] ?? 99);
          return diff !== 0 ? diff : a.nombre.localeCompare(b.nombre);
        })
      );
    } catch (error) {
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

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) => (p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const disminuirCantidad = (id) => {
    setCarrito((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0)
    );
  };

  const total = useMemo(
    () => carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [carrito]
  );

  const handleConfirmar = () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío');
      return;
    }
    setShowModal(true);
  };

  const handleImprimir = async () => {
    try {
      await insertVenta(eventId, total, carrito);

      const tickets = carrito.flatMap((item) =>
        Array.from({ length: item.cantidad }, (_, i) => ({ item, unidad: i + 1 }))
      );

      for (let i = 0; i < tickets.length; i++) {
        const { item } = tickets[i];
        await printTicket(
          item.nombre,
          item.presentacion ?? '',
          item.precio.toFixed(2),
          eventoNombre || 'Evento'
        );

        const esElUltimo = i === tickets.length - 1;
        if (!esElUltimo) {
          await new Promise((resolve) =>
            Alert.alert(
              'Ticket impreso',
              'Presioná OK para imprimir el siguiente.',
              [{ text: 'OK', onPress: resolve }],
              { cancelable: false }
            )
          );
        }
      }

      Alert.alert('Venta completada', `Total: $${total.toFixed(2)}`);
      setCarrito([]);
      setVentaActiva(false);
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', 'No se pudo imprimir. ¿Está conectada la impresora?');
    }
  };

  const renderProducto = ({ item }) => {
    const enCarrito = carrito.find((p) => p.id === item.id);
    return (
      <ProductoCard
        item={item}
        cantidad={enCarrito?.cantidad ?? 0}
        ventaActiva={ventaActiva}
        onAgregar={agregarAlCarrito}
      />
    );
  };

  if (!loading && productos.length === 0) {
    return <EmptyProductosState />;
  }

  return (
    <View style={styles.container}>
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

      <View style={styles.rightColumn}>
        <Text style={styles.panelTitle}>Panel de ventas</Text>

        {!ventaActiva ? (
          <TouchableOpacity style={styles.startButton} onPress={iniciarVenta}>
            <Text style={styles.startButtonText}>Nueva Venta</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.cartTitle}>Carrito</Text>

            <FlatList
              data={carrito}
              keyExtractor={(item) => item.id.toString()}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <CartItem item={item} onAgregar={agregarAlCarrito} onDisminuir={disminuirCantidad} />
              )}
            />

            <AccionesVenta
              total={total}
              carritoVacio={carrito.length === 0}
              onCancelar={cancelarVenta}
              onConfirmar={handleConfirmar}
            />
          </View>
        )}
      </View>

      <ConfirmarVentaModal
        showModal={showModal}
        carrito={carrito}
        total={total}
        onConfirmar={handleImprimir}
        onVolver={() => setShowModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  leftColumn: {
    flex: 6.2,
    backgroundColor: '#F5F5F5',
  },
  rightColumn: {
    flex: 3,
    backgroundColor: '#fff',
    padding: 10,
    paddingBottom: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    color: '#2D3436',
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
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2D3436',
  },
});
