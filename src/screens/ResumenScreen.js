import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { deleteVenta } from '../../database';
import { printTicket } from '../utils/printer';
import { colors } from '../theme/colors';
import { useVentas } from '../hooks/useVentas';
import { useEventoNombre } from '../hooks/useEventoNombre';
import { useAppToast } from '../hooks/useAppToast';
import LoadingScreen from '../components/LoadingScreen';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';

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

const VentaCard = ({ venta, eventoNombre, onReimprimir, onBorrar }) => {
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
              <TextInput style={styles.btnReimprimirText} editable={false} value="🖨  Reimprimir" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnBorrar}
              onPress={() => onBorrar(venta.id)}
            >
              <TextInput style={styles.btnBorrarText} editable={false} value="🗑  Borrar" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ResumenScreen({ route }) {
  const { eventId } = route.params;
  const { ventas, resumen, productos, loading, refresh } = useVentas(eventId);
  const eventoNombre = useEventoNombre(eventId);
  const toast = useAppToast();

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
          toast.info('Ticket impreso. Presioná para continuar.');
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
      toast.success('Todos los tickets fueron reimpresos.');
    } catch {
      toast.error('¿Está conectada la impresora?');
    }
  };

  const handleExportar = async () => {
    if (!resumen) {
      toast.info('No hay resumen para exportar');
      return;
    }

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        toast.error('No hay una app de correo configurada');
        return;
      }

      const productosHTML = productos.map((p, i) => `
        <tr style="background: ${i % 2 === 0 ? '#f5f5f5' : '#ffffff'}">
          <td>${p.nombre}${p.presentacion ? ` · ${p.presentacion}` : ''}</td>
          <td style="text-align:center">${p.unidades}</td>
          <td style="text-align:right">$${p.subtotal.toFixed(2)}</td>
        </tr>
      `).join('');

      const ventasHTML = ventas.map(v => `
        <tr>
          <td>${formatFecha(v.date)} ${formatHora(v.date)}</td>
          <td>${v.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ')}</td>
          <td style="text-align:right">$${v.total.toFixed(2)}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <meta charset="utf-8"/>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #2D3436; }
              h1 { color: #0F3460; }
              h2 { color: #0F3460; margin-top: 30px; font-size: 16px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background: #0F3460; color: white; padding: 10px; text-align: left; }
              td { padding: 8px 10px; border-bottom: 1px solid #e0e0e0; }
              .metricas { display: flex; gap: 20px; margin: 20px 0; }
              .metrica { background: #f5f5f5; padding: 16px; border-radius: 8px; flex: 1; }
              .metrica-valor { font-size: 24px; font-weight: bold; color: #0F3460; }
              .metrica-label { font-size: 12px; color: #999; margin-top: 4px; }
            </style>
          </head>
          <body>
            <h1>${eventoNombre}</h1>
            <p>Resumen de ventas</p>
            <div class="metricas">
              <div class="metrica">
                <div class="metrica-valor">$${resumen.totalRecaudado.toFixed(2)}</div>
                <div class="metrica-label">Total recaudado</div>
              </div>
              <div class="metrica">
                <div class="metrica-valor">${resumen.cantidadVentas}</div>
                <div class="metrica-label">Ventas realizadas</div>
              </div>
              <div class="metrica">
                <div class="metrica-valor">$${resumen.ticketPromedio.toFixed(2)}</div>
                <div class="metrica-label">Ticket promedio</div>
              </div>
            </div>
            <h2>Desglose por producto</h2>
            <table>
              <tr>
                <th>Producto</th>
                <th style="text-align:center">Unidades</th>
                <th style="text-align:right">Total</th>
              </tr>
              ${productosHTML}
            </table>
            <h2>Historial de ventas</h2>
            <table>
              <tr>
                <th>Fecha y hora</th>
                <th>Productos</th>
                <th style="text-align:right">Total</th>
              </tr>
              ${ventasHTML}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      await MailComposer.composeAsync({
        subject: `Resumen de ventas - ${eventoNombre}`,
        body: `Adjunto encontrás el resumen de ventas del evento ${eventoNombre}.`,
        attachments: [uri],
      });
    } catch {
      toast.error('No se pudo exportar el resumen');
    }
  };

  const handleBorrar = (ventaId) => {
    Alert.alert(
      'Borrar venta',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVenta(ventaId);
              toast.success('Venta eliminada correctamente');
              refresh();
            } catch {
              toast.error('No se pudo borrar la venta');
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

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
            <MetricaCard label="Total recaudado" valor={`$${resumen.totalRecaudado.toFixed(2)}`} accent />
            <MetricaCard label="Ventas realizadas" valor={resumen.cantidadVentas.toString()} />
            <MetricaCard label="Ticket promedio" valor={`$${resumen.ticketPromedio.toFixed(2)}`} />
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
                onBorrar={handleBorrar}
              />
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.btnExportar} onPress={handleExportar}>
        <TextInput style={styles.btnExportarText} editable={false} value="📄  Enviar resumen por mail" />
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 0,
    width: '100%',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  metricaCardAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  metricaValor: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  metricaValorAccent: {
    color: colors.white,
    width: '100%',
    textAlign: 'center',
  },
  metricaLabel: {
    fontSize: 16,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 12,
  },
  tablaProductos: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 28,
  },
  tablaHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tablaHeaderProducto: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
  },
  tablaHeaderUnidades: {
    width: 100,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  tablaHeaderSubtotal: {
    width: 110,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
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
    backgroundColor: colors.background,
  },
  filaProductoInfo: {
    flex: 1,
  },
  filaProductoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  filaProductoPresentacion: {
    fontSize: 13,
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
    marginTop: 2,
  },
  filaProductoUnidades: {
    width: 60,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  filaProductoSubtotal: {
    width: 110,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  listaVentas: {
    gap: 10,
    marginBottom: 20,
  },
  ventaCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  ventaFecha: {
    fontSize: 13,
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
  },
  ventaTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    padding: 0,
    margin: 0,
  },
  ventaExpandir: {
    fontSize: 13,
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
  },
  ventaItems: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.background,
  },
  ventaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ventaItemNombre: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
  },
  ventaItemDetalle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginHorizontal: 12,
    padding: 0,
    margin: 0,
  },
  ventaItemSubtotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    width: 100,
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  ventaAcciones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  btnReimprimir: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnReimprimirText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    padding: 0,
    margin: 0,
    height: 18,
  },
  btnBorrar: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    borderWidth: 1,
    borderColor: '#f5c6c2',
  },
  btnBorrarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
    padding: 0,
    margin: 0,
    height: 18,
  },
  btnExportar: {
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  btnExportarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
    padding: 0,
    margin: 0,
    height: 22,
  },
});