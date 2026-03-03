import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Pressable, Modal, ScrollView, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { insertVenta } from '../../database';
import { printTicket } from '../utils/printer';
import { colors } from '../theme/colors';
import { IconoMas, IconoMenos, IconoCancelar, IconoConfirmar } from '../components/Icons';
import { useProductos } from '../hooks/useProductos';
import { useEventoNombre } from '../hooks/useEventoNombre';
import { usePrinter } from '../context/PrinterContext';
import { useAppToast } from '../hooks/useAppToast';

const PRIORIDAD_CATEGORIAS = {
  'bebida': 1,
  'comida': 2,
  'otro': 3
};

const ProductoCard = ({ item, cantidad, ventaActiva, onAgregar }) => (
  <Pressable
    style={[styles.productCard, !ventaActiva && styles.productCardDisabled]}
    disabled={!ventaActiva}
    onPress={() => onAgregar(item)}
  >
    {cantidad > 0 && (
      <View style={styles.badgeCantidad}>
        <TextInput style={styles.badgeCantidadText} editable={false} value={`x${cantidad}`} />
      </View>
    )}
    <View style={styles.productCardInfo}>
      <TextInput style={styles.productName} editable={false} value={item.nombre} />
      {item.presentacion ? (
        <TextInput style={styles.productPresentation} editable={false} value={item.presentacion} />
      ) : null}
      <TextInput style={styles.productPrice} editable={false} value={`$${item.precio.toFixed(2)}`} />
    </View>
  </Pressable>
);

const CartItem = ({ item, onAgregar, onDisminuir }) => (
  <View style={styles.cartItem}>
    <TextInput style={styles.cartItemName} editable={false} value={item.nombre} />
    <View style={styles.cartControls}>
      <TouchableOpacity style={styles.controlBtn} onPress={() => onDisminuir(item.id)}>
        <IconoMenos />
      </TouchableOpacity>
      <TextInput style={styles.cartItemQuantity} editable={false} value={item.cantidad.toString()} />
      <TouchableOpacity style={styles.controlBtn} onPress={() => onAgregar(item)}>
        <IconoMas />
      </TouchableOpacity>
    </View>
    <TextInput style={styles.cartItemPrice} editable={false} value={`$${(item.precio * item.cantidad).toFixed(2)}`} />
  </View>
);

export default function VentasScreen({ route }) {
  const { eventId } = route.params;

  const { productos, loading, refresh } = useProductos(eventId);
  const eventoNombre = useEventoNombre(eventId);
  const { connectedPrinter } = usePrinter();
  const toast = useAppToast();
  const [ventaActiva, setVentaActiva] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const productosordenados = useMemo(() => 
    [...productos].sort((a, b) => {
      const diff = (PRIORIDAD_CATEGORIAS[a.categoria] ?? 99) - (PRIORIDAD_CATEGORIAS[b.categoria] ?? 99);
      return diff !== 0 ? diff : a.nombre.localeCompare(b.nombre);
    }), [productos]
  );

  const iniciarVenta = () => { setCarrito([]); setVentaActiva(true); };
  const cancelarVenta = () => { setCarrito([]); setVentaActiva(false); };

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const disminuirCantidad = (id) => {
    setCarrito(prev =>
      prev
          .map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item)
          .filter(item => item.cantidad > 0)
    );
  };

  const total = useMemo(
    () => carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [carrito]
  );

  const handleConfirmar = () => {
    if (carrito.length === 0) { 
      toast.warning('Carrito vacío');
      return; 
    }
    setShowModal(true);
  };

  const handleImprimir = async () => {
    if (!connectedPrinter) {
      toast.error('Conectá una impresora antes de confirmar la venta');
      return;
    }

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
          toast.info('Ticket impreso. Presioná para continuar.');
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      toast.success(`Venta completada. Total: $${total.toFixed(2)}`);
      setCarrito([]);
      setVentaActiva(false);
      setShowModal(false);
    } catch (e) {
      toast.error('No se pudo imprimir. ¿Está conectada la impresora?');
    }
  };

  const renderProducto = ({ item }) => {
  const enCarrito = carrito.find(p => p.id === item.id);
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
          data={productosordenados}
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
                <CartItem
                  item={item}
                  onAgregar={agregarAlCarrito}
                  onDisminuir={disminuirCantidad}
                />
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
    backgroundColor: colors.background,
  },
  leftColumn: {
    flex: 6.2,
    backgroundColor: colors.background,
  },
  rightColumn: {
    flex: 3,
    backgroundColor: colors.white,
    padding: 10,
    paddingBottom: 20,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    color: colors.textPrimary,
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
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    position: 'relative',
  },
  productCardDisabled: {
    opacity: 0.5,
  },
  badgeCantidad: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.danger,
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
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  productPresentation: {
    fontSize: 18,
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
    padding: 0,
    margin: 0,
  },
  startButton: {
    backgroundColor: colors.button,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
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
    color: colors.textPrimary,
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
    borderColor: colors.border,
  },
  cartItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
},
cartItemPrice: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
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
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
},
  cartItemQuantity: {
    width: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 22,
  },
  carritoVacio: {
    padding: 20,
    alignItems: 'center',
  },
  carritoVacioText: {
    color: colors.textMuted,
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
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    height: 48,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    overflow: 'visible',
},
  cancelButtonText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
    padding: 0,
    margin: 0,
    minWidth: 70,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    overflow: 'visible',
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    padding: 0,
    paddingBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    padding: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    width: '60%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
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
    borderColor: colors.border,
  },
  modalItemName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    padding: 0,
    margin: 0,
    height: 20,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 20,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
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
    color: colors.textMuted,
    padding: 0,
    margin: 0,
    height: 22,
  },
  modalTotalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 36,
  },
  printButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  printText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    height: 24,
    width: 180,
  },
  modalCancelButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 15,
    padding: 0,
    margin: 0,
    height: 20,
  },
});