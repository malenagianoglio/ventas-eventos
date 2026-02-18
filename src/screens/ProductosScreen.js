import { View, Text, StyleSheet, FlatList, Alert, Modal, TextInput, Pressable, ScrollView, TouchableOpacity, Keyboard} from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { initDB, getProductosByEvento, insertProductoEvento, updateProductoEvento, deleteProductoEvento } from '../../database';

export default function ProductosScreen({ route }) {
  const { eventId } = route.params;
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('otro');
  const [presentacion, setPresentacion] = useState('');
  const [precio, setPrecio] = useState('');

  // Cargar productos al enfocar pantalla
  const loadProductos = async () => {
    try {
      await initDB();
      const data = await getProductosByEvento(eventId);
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      loadProductos();
    }, [])
  );

  const resetForm = () => {
    setNombre('');
    setPresentacion('');
    setPrecio('');
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
    setEditingId(producto.id);
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!nombre.trim() || !precio.trim() || !categoria.trim()) {
      Alert.alert('Error', 'El nombre, precio y categoría son obligatorios');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor a 0');
      return;
    }

    try {
      Keyboard.dismiss();
      
      if (editingId) {
        await updateProductoEvento({
          id: editingId,
          nombre,
          categoria,
          presentacion,
          precio: precioNum,
        });
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        await insertProductoEvento({
          eventId,
          nombre,
          categoria,
          presentacion,
          precio: precioNum,
        });
        Alert.alert('Éxito', 'Producto agregado correctamente');
      }
      
      setShowModal(false);
      resetForm();
      loadProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteProductoEvento(id);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
              loadProductos();
            } catch (error) {
              console.error('Error al eliminar producto:', error);
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="shopping-bag" size={32} color="#fff" />
      </View>

      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        
        {item.presentacion && (
          <Text style={styles.presentacion}>{item.presentacion}</Text>
        )}
        
        <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleEditProduct(item)}
        >
          <MaterialIcons name="edit" size={20} color="#222" />
        </Pressable>
        
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <MaterialIcons name="delete-outline" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );

  if (!loading && productos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Productos</Text>
        
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-bag" size={64} color="#ccc" style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>Sin productos</Text>
          <Text style={styles.emptyText}>Aún no hay productos agregados</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <MaterialIcons name="add-circle" size={40} color="white" />
          <Text style={styles.addButtonText}>Agregar producto</Text>
        </TouchableOpacity>

        {/* Modal */}
        <Modal visible={showModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingId ? 'Editar producto' : 'Agregar producto'}
                </Text>
                <Pressable onPress={() => { setShowModal(false); resetForm(); }}>
                  <MaterialIcons name="close" size={24} color="#222" />
                </Pressable>
              </View>

              <Text style={styles.label}>Nombre del producto</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa el nombre"
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor="#999"
                editable={!editingId}
              />

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.selectorContainer}>
                <Pressable 
                  style={[styles.selectorButton, categoria === 'bebida' && styles.selectorButtonActive]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setCategoria('bebida');
                  }}
                >
                  <Text style={[styles.selectorText, categoria === 'bebida' && styles.selectorTextActive]}>Bebida</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.selectorButton, categoria === 'comida' && styles.selectorButtonActive]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setCategoria('comida');
                    }}
                  >
                    <Text style={[styles.selectorText, categoria === 'comida' && styles.selectorTextActive]}>Comida</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.selectorButton, categoria === 'otro' && styles.selectorButtonActive]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setCategoria('otro');
                    }}
                  >
                    <Text style={[styles.selectorText, categoria === 'otro' && styles.selectorTextActive]}>Otro</Text>
                  </Pressable>
              </View>


              <Text style={styles.label}>Presentación (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 500ml, 1kg, Porción"
                value={presentacion}
                onChangeText={setPresentacion}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Precio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa el precio"
                value={precio}
                onChangeText={setPrecio}
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => { setShowModal(false); resetForm(); }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
        <MaterialIcons name="add-circle" size={40} color="white" />
        <Text style={styles.addButtonText}>Agregar producto</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Editar producto' : 'Agregar producto'}
              </Text>
              <Pressable onPress={() => { setShowModal(false); resetForm(); }}>
                <MaterialIcons name="close" size={24} color="#222" />
              </Pressable>
            </View>

            <Text style={styles.label}>Nombre del producto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor="#999"
              editable={!editingId}
            />

            <Text style={styles.label}>Presentación (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 500ml, 1kg, Porción"
              value={presentacion}
              placeholderTextColor="#999"
              onChangeText={setPresentacion}
            />

            <Text style={styles.label}>Precio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el precio"
              value={precio}
              placeholderTextColor="#999"
              onChangeText={setPrecio}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => { setShowModal(false); resetForm(); }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProduct}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#111',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#222',
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
    color: '#111',
    marginBottom: 4,
  },
  presentacion: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  precio: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  tempText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#111',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#222',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  selectorButton: {
    flex: 1,    
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectorButtonActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#666',
  },
  selectorTextActive: {
    color: '#fff',
  },
});
