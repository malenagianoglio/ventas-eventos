import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { insertProductoEvento, updateProductoEvento, deleteProductoEvento } from '../../database';
import { colors } from '../theme/colors';
import { IconoProducto, IconoEditar, IconoEliminar, IconoAgregar, IconoCerrar } from '../components/Icons';
import { useProductos } from '../hooks/useProductos';
import { useAppToast } from '../hooks/useAppToast';
import LoadingScreen from '../components/LoadingScreen';

const CATEGORIAS = ['bebida', 'comida', 'otro'];

export default function ProductosScreen({ route }) {
  const { eventId } = route.params;

  const { productos, loading, refresh } = useProductos(eventId);
  const toast = useAppToast();
  const [showModal, setShowModal]     = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [nombre, setNombre]           = useState('');
  const [categoria, setCategoria]     = useState('otro');
  const [presentacion, setPresentacion] = useState('');
  const [precio, setPrecio]           = useState('');

  const resetForm = () => {
    setNombre('');
    setPresentacion('');
    setPrecio('');
    setCategoria('otro');
    setEditingId(null);
  };

  const handleAddProduct = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditProduct = (producto) => {
    setNombre(producto.nombre);
    setPresentacion(producto.presentacion || '');
    setPrecio(producto.precio.toString());
    setCategoria(producto.categoria || 'otro');
    setEditingId(producto.id);
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!nombre.trim() || !precio.trim()) {
      toast.error('El nombre y precio son obligatorios');
      return;
    }
    const precioNum = parseFloat(precio.replace(',', '.'));
    if (isNaN(precioNum) || precioNum <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0');
      return;
    }
    try {
      Keyboard.dismiss();
      if (editingId) {
        await updateProductoEvento({ id: editingId, nombre, categoria, presentacion, precio: precioNum });
        toast.success('Producto actualizado correctamente');
      } else {
        await insertProductoEvento({ eventId, nombre, categoria, presentacion, precio: precioNum });
        toast.success('Producto agregado correctamente');
      }
      setShowModal(false);
      resetForm();
      refresh();
    } catch {
      toast.error('No se pudo guardar el producto');
    }
  };

  const handleDeleteProduct = (id) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que querés eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProductoEvento(id);
              toast.success('Producto eliminado correctamente');
              refresh();
            } catch {
              toast.error('No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <IconoProducto categoria={item.categoria} />
      </View>
      <View style={styles.info}>
        <TextInput style={styles.nombre} editable={false} value={item.nombre} />
        {item.presentacion ? (
          <TextInput style={styles.presentacion} editable={false} value={item.presentacion} />
        ) : null}
        <TextInput style={styles.precio} editable={false} value={`$${item.precio.toFixed(2)}`} />
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => handleEditProduct(item)}>
          <IconoEditar />
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteProduct(item.id)}>
          <IconoEliminar />
        </Pressable>
      </View>
    </View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <TextInput style={styles.title} editable={false} value="Productos" />

      {!loading && productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <TextInput style={styles.emptyTitle} editable={false} value="Sin productos" />
          <TextInput style={styles.emptyText} editable={false} value="Aún no hay productos agregados" />
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!showModal && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <IconoAgregar />
          <TextInput style={styles.addButtonText} editable={false} value="Agregar producto" />
        </TouchableOpacity>
      )}

      {/* ── Modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboard}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TextInput
                  style={styles.modalTitle}
                  editable={false}
                  value={editingId ? 'Editar producto' : 'Agregar producto'}
                />
                <Pressable style={styles.closeButton} onPress={() => { setShowModal(false); resetForm(); }}>
                  <IconoCerrar />
                </Pressable>
              </View>

              <TextInput style={styles.label} editable={false} value="Nombre del producto:" />
              <TextInput
                style={styles.input}
                placeholder="Ingresá el nombre"
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor="#999"
                editable={true}
              />

              <TextInput style={styles.label} editable={false} value="Categoría:" />
              <View style={styles.selectorContainer}>
                {CATEGORIAS.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.selectorButton, categoria === cat && styles.selectorButtonActive]}
                    onPress={() => { Keyboard.dismiss(); setCategoria(cat); }}
                  >
                    <TextInput
                      style={[styles.selectorText, categoria === cat && styles.selectorTextActive]}
                      editable={false}
                      value={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    />
                  </Pressable>
                ))}
              </View>

              <TextInput style={styles.label} editable={false} value="Presentación (opcional):" />
              <TextInput
                style={styles.input}
                placeholder="Ej: 500ml, 1kg, Porción"
                value={presentacion}
                onChangeText={setPresentacion}
                placeholderTextColor={colors.textMuted}
              />

              <TextInput style={styles.label} editable={false} value="Precio:" />
              <TextInput
                style={styles.input}
                placeholder="Ingresá el precio"
                value={precio}
                onChangeText={setPrecio}
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => { setShowModal(false); resetForm(); }}
                >
                  <TextInput style={styles.cancelButtonText} editable={false} value="Cancelar" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveProduct}>
                  <TextInput style={styles.saveButtonText} editable={false} value="Guardar" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    padding: 0,
    margin: 0,
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 24,
  },
  presentacion: {
    fontSize: 13,
    color: colors.textMuted,
    padding: 0,
    margin: 0,
    height: 20,
    marginTop: 2,
  },
  precio: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    padding: 0,
    margin: 0,
    height: 24,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },

  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    height: 26,
  },

  modalKeyboard: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 40,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    flex: 1,
  },
  closeButton: {
    padding: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    height: 50,
    backgroundColor: colors.white,
  },

  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  selectorButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    height: 50,
  },
  selectorButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorText: {
    fontSize: 16,
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
  },
  selectorTextActive: {
    color: colors.white,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 22,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    padding: 0,
    margin: 0,
    height: 22,
    textAlign: 'center',
  },
});