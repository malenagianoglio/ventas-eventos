import { View, StyleSheet, TouchableOpacity, Pressable, Modal, ScrollView, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const IconoCancelar = () => (
  <Svg height="20px" viewBox="0 -960 960 960" width="20px" fill="#555">
    <Path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </Svg>
);

const IconoConfirmar = () => (
  <Svg height="20px" viewBox="0 -960 960 960" width="20px" fill="#fff">
    <Path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </Svg>
);

const IconoMenos = () => (
  <Svg height="18px" viewBox="0 -960 960 960" width="18px" fill="#E94560">
    <Path d="M200-440v-80h560v80H200Z" />
  </Svg>
);

const IconoMas = () => (
  <Svg height="18px" viewBox="0 -960 960 960" width="18px" fill="#1DD1A1">
    <Path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
  </Svg>
);

export const ProductoCard = ({ item, cantidad, ventaActiva, onAgregar }) => (
  <Pressable
    style={[styles.productCard, !ventaActiva && styles.productCardDisabled]}
    disabled={!ventaActiva}
    onPress={() => onAgregar(item)}
  >
    {cantidad > 0 && (
      <View style={styles.badgeCantidad}>
        <Text style={styles.badgeCantidadText}>x{cantidad}</Text>
      </View>
    )}

    <View style={styles.productCardInfo}>
      <Text style={styles.productName}>{item.nombre}</Text>
      {item.presentacion ? <Text style={styles.productPresentation}>{item.presentacion}</Text> : null}
      <Text style={styles.productPrice}>${item.precio.toFixed(2)}</Text>
    </View>
  </Pressable>
);

export const CartItem = ({ item, onAgregar, onDisminuir }) => (
  <View style={styles.cartItem}>
    <Text style={styles.cartItemName}>{item.nombre}</Text>
    <View style={styles.cartControls}>
      <TouchableOpacity style={styles.controlBtn} onPress={() => onDisminuir(item.id)}>
        <IconoMenos />
      </TouchableOpacity>
      <Text style={styles.cartItemQuantity}>{item.cantidad}</Text>
      <TouchableOpacity style={styles.controlBtn} onPress={() => onAgregar(item)}>
        <IconoMas />
      </TouchableOpacity>
    </View>
    <Text style={styles.cartItemPrice}>${(item.precio * item.cantidad).toFixed(2)}</Text>
  </View>
);

export const EmptyProductosState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>Sin productos</Text>
    <Text style={styles.emptyText}>Aún no hay productos agregados</Text>
  </View>
);

export const ConfirmarVentaModal = ({ showModal, carrito, total, onConfirmar, onVolver }) => (
  <Modal visible={showModal} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Confirmar Venta</Text>
        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          {carrito.map((item) => (
            <View key={item.id} style={styles.modalItem}>
              <Text style={styles.modalItemName}>
                {item.nombre} x{item.cantidad}
              </Text>
              <Text style={styles.modalItemPrice}>${(item.precio * item.cantidad).toFixed(2)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.modalDivider} />

        <View style={styles.modalTotalRow}>
          <Text style={styles.modalTotalLabel}>Total</Text>
          <Text style={styles.modalTotalAmount}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.printButton} onPress={onConfirmar}>
          <Text style={styles.printText}>Confirmar y cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalCancelButton} onPress={onVolver}>
          <Text style={styles.modalCancelText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const AccionesVenta = ({ total, carritoVacio, onCancelar, onConfirmar }) => (
  <>
    <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

    <View style={styles.buttonsRow}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancelar}>
        <IconoCancelar />
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirmar}>
        <IconoConfirmar />
        <Text style={styles.confirmButtonText}>Confirmar</Text>
      </TouchableOpacity>
    </View>

    {carritoVacio ? (
      <View style={styles.carritoVacio}>
        <Text style={styles.carritoVacioText}>Tocá un producto para agregar</Text>
      </View>
    ) : null}
  </>
);

const styles = StyleSheet.create({
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
  productCardDisabled: {
    opacity: 0.5,
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
  },
  productPresentation: {
    fontSize: 18,
    color: '#999',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F3460',
    marginTop: 4,
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
  },
  cartItemPrice: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '700',
    color: '#0F3460',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    paddingBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
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
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F3460',
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
  },
  modalTotalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
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
    textAlign: 'center',
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
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
    overflow: 'visible',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 14,
    minWidth: 70,
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
    overflow: 'visible',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  carritoVacio: {
    padding: 20,
    alignItems: 'center',
  },
  carritoVacioText: {
    color: '#bbb',
    fontSize: 13,
    textAlign: 'center',
  },
});
