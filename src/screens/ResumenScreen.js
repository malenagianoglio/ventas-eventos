import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getResumenEvento, getResumenProductos, getVentasConDetalle, getEventById, initDB } from '../../database';
import { printTicket } from '../utils/printer';

const formatHora = (isoString) => {
  const d = new Date(isoString);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const formatFecha = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


const MetricaCard = ({ label, valor, accent }) => (
  <View style={[styles.metricaCard, accent && styles.metricaCardAccent]}>
    <TextInput
      style={[styles.metricaValor, accent && styles.metricaValorAccent]}
      editable={false}
      value={valor}
    />
    <TextInput
      style={[styles.metricaLabel, accent && styles.metricaLabelAccent]}
      editable={false}
      value={label}
    />
  </View>
);

const FilaProducto = ({ item, index }) => (
  <View style={[styles.filaProducto, index % 2 === 0 && styles.filaProductoPar]}>
    <View style={styles.filaProductoInfo}>
      <TextInput style={styles.filaProductoNombre} editable={false} value={item.nombre} />
      {item.presentacion ? (
        <TextInput style={styles.filaProductoPresentacion} editable={false} value={item.presentacion} />
      ) : null}
    </View>
    <TextInput style={styles.filaProductoUnidades} editable={false} value={`${item.unidades} u.`} />
    <TextInput style={styles.filaProductoSubtotal} editable={false} value={`$${item.subtotal.toFixed(2)}`} />
  </View>
);

const VentaCard = ({ venta, eventoNombre, onReimprimir }) => {
  const [expandida, setExpandida] = useState(false);

  return (
    <TouchableOpacity
      style={styles.ventaCard}
      onPress={() => setExpandida((v) => !v)}
      activeOpacity={0.8}
    >
      <View style={styles.ventaCardHeader}>
        <View style={styles.ventaCardLeft}>
          <TextInput style={styles.ventaHora} editable={false} value={formatHora(venta.date)} />
          <TextInput style={styles.ventaFecha} editable={false} value={formatFecha(venta.date)} />
        </View>
        <View style={styles.ventaCardRight}>
          <TextInput style={styles.ventaTotal} editable={false} value={`$${venta.total.toFixed(2)}`} />
          <TextInput
            style={styles.ventaExpandir}
            editable={false}
            value={expandida ? '▲ ocultar' : '▼ ver items'}
          />
        </View>
      </View>

      {expandida && (
        <View style={styles.ventaItems}>
          {venta.items.map((item, i) => (
            <View key={i} style={styles.ventaItem}>
              <TextInput
                style={styles.ventaItemNombre}
                editable={false}
                value={`${item.nombre}${item.presentacion ? ` · ${item.presentacion}` : ''}`}
              />
              <TextInput style={styles.ventaItemDetalle} editable={false} value={`x${item.cantidad}`} />
              <TextInput style={styles.ventaItemSubtotal} editable={false} value={`$${item.subtotal.toFixed(2)}`} />
            </View>
          ))}

          <View style={styles.ventaAcciones}>
            <TouchableOpacity
              style={styles.btnReimprimir}
              onPress={() => onReimprimir(venta, eventoNombre)}
            >
              <TextInput style={styles.btnReimprimirText} editable={false} value="🖨  Reimprimir tickets" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ResumenScreen({ route }) {
  const { eventId } = route.params;

  const [eventoNombre, setEventoNombre] = useState('');
  const [resumen, setResumen]           = useState(null);
  const [productos, setProductos]       = useState([]);
  const [ventas, setVentas]             = useState([]);
  const [loading, setLoading]           = useState(true);

  const loadData = async () => {
    try {
      await initDB();
      const [evento, resumenData, productosData, ventasData] = await Promise.all([
        getEventById(eventId),
        getResumenEvento(eventId),
        getResumenProductos(eventId),
        getVentasConDetalle(eventId),
      ]);
      setEventoNombre(evento?.name ?? '');
      setResumen(resumenData);
      setProductos(productosData);
      setVentas(ventasData);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el resumen');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [eventId]));

  const handleReimprimir = async (venta, nombreEvento) => {
    try {
      const tickets = venta.items.flatMap((item) =>
        Array.from({ length: item.cantidad }, () => item)
      );

      for (let i = 0; i < tickets.length; i++) {
        const item = tickets[i];
        await printTicket(
          item.nombre,
          item.presentacion ?? '',
          item.precio.toFixed(2),
          nombreEvento || 'Evento'
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

      Alert.alert('Listo', 'Todos los tickets fueron reimpresos.');
    } catch {
      Alert.alert('Error', '¿Está conectada la impresora?');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <TextInput style={styles.loadingText} editable={false} value="Cargando resumen..." />
      </View>
    );
  }

  const sinVentas = !resumen || !resumen.cantidadVentas;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <TextInput style={styles.titulo} editable={false} value="Resumen de ventas" />

      {sinVentas ? (
        <View style={styles.centered}>
            <TextInput style={styles.emptyTitle} editable={false} value="Sin ventas" />
            <TextInput style={styles.emptyText} editable={false} value="Todavía no hay ventas registradas." />
        </View>
      ) : (
        <>
          <View style={styles.metricasRow}>
            <MetricaCard
              label="Total recaudado"
              valor={`$${resumen.totalRecaudado.toFixed(2)}`}
              accent
            />
            <MetricaCard
              label="Ventas realizadas"
              valor={resumen.cantidadVentas.toString()}
            />
            <MetricaCard
              label="Ticket promedio"
              valor={`$${resumen.ticketPromedio.toFixed(2)}`}
            />
          </View>

          <TextInput style={styles.seccionTitulo} editable={false} value="Desglose por producto" />
          <View style={styles.tablaProductos}>
            <View style={styles.tablaHeader}>
              <TextInput style={styles.tablaHeaderProducto} editable={false} value="Producto" />
              <TextInput style={styles.tablaHeaderUnidades} editable={false} value="Unid." />
              <TextInput style={styles.tablaHeaderSubtotal} editable={false} value="Total" />
            </View>
            {productos.map((p, i) => (
              <FilaProducto key={i} item={p} index={i} />
            ))}
          </View>

          <TextInput style={styles.seccionTitulo} editable={false} value="Historial de ventas" />
          <View style={styles.listaVentas}>
            {ventas.map((v) => (
              <VentaCard
                key={v.id}
                venta={v}
                eventoNombre={eventoNombre}
                onReimprimir={handleReimprimir}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 40,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 150,
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
    padding: 0,
    margin: 0,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    padding: 0,
    width: '100%',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
    padding: 0,
    margin: 0,
    marginBottom: 24,
  },
  metricasRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  metricaCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  metricaCardAccent: {
    backgroundColor: '#0F3460',
    borderColor: '#0F3460',
  },
  metricaValor: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    padding: 0,
    margin: 0,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  metricaValorAccent: {
    color: '#fff',
    width: '100%',
    textAlign: 'center',
  },
  metricaLabel: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  metricaLabelAccent: {
    color: 'rgba(255,255,255,0.7)',
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    padding: 0,
    margin: 0,
    marginBottom: 12,
  },
  tablaProductos: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 28,
  },
  tablaHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  tablaHeaderProducto: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    padding: 0,
    margin: 0,
  },
  tablaHeaderUnidades: {
    width: 100,
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  tablaHeaderSubtotal: {
    width: 90,
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  filaProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filaProductoPar: {
    backgroundColor: '#fafafa',
  },
  filaProductoInfo: {
    flex: 1,
  },
  filaProductoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    padding: 0,
    margin: 0,
  },
  filaProductoPresentacion: {
    fontSize: 13,
    color: '#999',
    padding: 0,
    margin: 0,
    marginTop: 2,
  },
  filaProductoUnidades: {
    width: 60,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F3460',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  filaProductoSubtotal: {
    width: 90,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'right',
    padding: 0,
    margin: 0,
    width: 110,
  },
  listaVentas: {
    gap: 10,
  },
  ventaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  ventaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ventaCardLeft: {
    gap: 2,
  },
  ventaCardRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  ventaHora: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
    padding: 0,
    margin: 0,
  },
  ventaFecha: {
    fontSize: 13,
    color: '#999',
    padding: 0,
    margin: 0,
  },
  ventaTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F3460',
    padding: 0,
    margin: 0,
  },
  ventaExpandir: {
    fontSize: 13,
    color: '#aaa',
    padding: 0,
    margin: 0,
  },
  ventaItems: {
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  ventaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ventaItemNombre: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    padding: 0,
    margin: 0,
  },
  ventaItemDetalle: {
    fontSize: 16,
    color: '#999',
    marginHorizontal: 12,
    padding: 0,
    margin: 0,
  },
  ventaItemSubtotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    width: 100,
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  ventaAcciones: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#ebebeb',
  },
  btnReimprimir: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#EAF0FB',
    borderWidth: 1,
    borderColor: '#c5d5f0',
  },
  btnReimprimirText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F3460',
    padding: 0,
    margin: 0,
    height: 18,
  },
});