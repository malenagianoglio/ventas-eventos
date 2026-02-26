import { View, Text, StyleSheet, FlatList, Alert, Modal, TextInput, Pressable, ScrollView, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { initDB, getProductosByEvento, insertProductoEvento, updateProductoEvento, deleteProductoEvento } from '../../database';

const IconoEditar = () => (
  <Svg height="20px" viewBox="0 -960 960 960" width="20px" fill="#444">
    <Path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
  </Svg>
);

const IconoEliminar = () => (
  <Svg height="20px" viewBox="0 -960 960 960" width="20px" fill="#fff">
    <Path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
  </Svg>
);

const IconoAgregar = () => (
  <Svg height="28px" viewBox="0 -960 960 960" width="28px" fill="#fff">
    <Path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
  </Svg>
);

const IconoCerrar = () => (
  <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#222">
    <Path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
  </Svg>
);

const IconoProducto = ({ categoria }) => {
  if (categoria === 'bebida') return (
    <Svg height="28px" viewBox="0 -960 960 960" width="28px" fill="#e3e3e3">
      <Path d="M340-80q-26 0-43-17t-17-43v-287L200-580q-15-28-17.5-58.5T192-700l60-140q8-19 25.5-29.5T320-880h320q21 0 38.5 10.5T704-840l60 140q11 27 8.5 57.5T755-580L675-427v287q0 26-17 43T615-80H340Zm0-80h275v-240H340v240Zm-8-320h291l75-140H257l75 140Zm8 320v-240 240Z"/>
    </Svg>
  );
  if (categoria === 'comida') return (
    <Svg height="28px" viewBox="0 -960 960 960" width="28px" fill="#e3e3e3">
      <Path d="M280-80v-366q-51-14-85.5-56T160-600v-280h80v280h40v-280h80v280h40v-280h80v280q0 56-34.5 98T360-446v366h-80Zm320 0v-320H480v-280q0-83 58.5-141.5T680-880v800h-80Z"/>
    </Svg>
  );
  return (
    <Svg height="28px" viewBox="0 -960 960 960" width="28px" fill="#e3e3e3">
      <Path d="M280-80q-33 0-56.5-23.5T200-160v-480q0-33 23.5-56.5T280-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T840-640v480q0 33-23.5 56.5T760-80H280Zm0-80h480v-480h-80v80q0 17-11.5 28.5T640-520q-17 0-28.5-11.5T600-560v-80H360v80q0 17-11.5 28.5T320-520q-17 0-28.5-11.5T280-560v-80h-80v480Zm160-560h80q0-33-23.5-56.5T440-800q-33 0-56.5 23.5T360-720h80Z"/>
    </Svg>
  );
};

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
        await updateProductoEvento({ id: editingId, nombre, categoria, presentacion, precio: precioNum });
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        await insertProductoEvento({ eventId, nombre, categoria, presentacion, precio: precioNum });
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
      '¿Estás seguro de que querés eliminar este producto?',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteProductoEvento(id);
              loadProductos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const modalContent = (
    <Modal visible={showModal} animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            
            <View style={styles.modalHeader}>
              <TextInput
                style={styles.modalTitle}
                editable={false}
                value={editingId ? 'Editar producto' : 'Agregar producto'}
              />
              <Pressable onPress={() => { setShowModal(false); resetForm(); }}  style={{ padding:10 }}>
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
              editable={!editingId}
            />

            <TextInput style={styles.label} editable={false} value="Categoría:" />
            <View style={styles.selectorContainer}>
              {['bebida', 'comida', 'otro'].map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.selectorButton, categoria === cat && styles.selectorButtonActive]}
                  onPress={() => { Keyboard.dismiss(); setCategoria(cat); }}
                >
                  <TextInput
                    style={{ fontSize: 16, color: categoria === cat ? '#fff' : '#000000', padding: 0, margin: 0 }}
                    editable={false}
                    value={cat.charAt(0).toUpperCase() + cat.slice(1)}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput style={styles.label} editable={false} value="Presentación (Opcional):" />
            <TextInput
              style={styles.input}
              placeholder="Ej: 500ml, 1kg, Porción"
              value={presentacion}
              onChangeText={setPresentacion}
              placeholderTextColor="#999"
            />

            <TextInput style={styles.label} editable={false} value="Precio:" />
            <TextInput
              style={styles.input}
              placeholder="Ingresá el precio"
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
                <TextInput style={styles.cancelButtonText} editable={false} value="Cancelar" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveProduct}>
                <TextInput style={styles.saveButtonText} editable={false} value="Guardar" />
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

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
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        />
      )}

      {!showModal && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <IconoAgregar />
          <TextInput style={styles.addButtonText} editable={false} value="Agregar producto" />
        </TouchableOpacity>
      )}

      {modalContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2D3436',
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#54A0FF',
    marginBottom: 15,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0F3460',
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
    color: '#2D3436',
    padding: 0,
    margin: 0,
    height: 24,
  },
  presentacion: {
    fontSize: 13,
    color: '#999',
    padding: 0,
    margin: 0,
    height: 20,
    marginTop: 2,
  },
  precio: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F3460',
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#0F3460',
    borderColor: '#0F3460',
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
    color: '#2D3436',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#0F3460',
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
    padding: 0,
    margin: 0,
    height: 26,
    width: 180,
    textAlignt: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
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
    color: '#2D3436',
    padding: 0,
    margin: 0,
    width: 300,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#2D3436',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
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
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    height: 50,
  },
  selectorButtonActive: {
    backgroundColor: '#0F3460',
    borderColor: '#0F3460',
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
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 0,
    margin: 0,
    height: 22,
    width: 100,
    textAlignt: 'center',
  },
  saveButton: {
    backgroundColor: '#0F3460',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    padding: 0,
    margin: 0,
    height: 22,
    width: 100,
    textAlignt: 'center',
  },
});