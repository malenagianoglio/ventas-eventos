/**
 * @jest-environment jsdom
 */
// mock navigation hooks used by our custom hooks so they work outside a
// navigation container
// `useFocusEffect` normally runs its callback only when the screen is focused;
// our simple mock will execute the callback just once per unique function to
// avoid infinite render loops during tests.
jest.mock('@react-navigation/native', () => {
  const executed = new WeakSet();
  return {
    useNavigation: () => ({}),
    useFocusEffect: (cb) => {
      if (!executed.has(cb)) {
        executed.add(cb);
        cb();
      }
    },
  };
});

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProductos } from '../src/hooks/useProductos';
import { useVentas } from '../src/hooks/useVentas';
import { useEventos } from '../src/hooks/useEventos';
import * as database from '../database';

// Mock de database
jest.mock('../database');

describe('Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProductos', () => {
    it('debería cargar productos correctamente', async () => {
      const mockProducts = [
        { id: 1, nombre: 'Producto 1', precio: 100, categoria: 'bebida' },
        { id: 2, nombre: 'Producto 2', precio: 200, categoria: 'comida' },
      ];

      database.getProductosByEvento.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProductos(1));

      // Inicialmente loading es true
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);

      // Después de cargar
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.productos).toEqual(mockProducts);
      expect(result.current.error).toBe(null);
    });

    it('debería manejar errores de carga', async () => {
      const mockError = new Error('Fallo de conexión');
      database.getProductosByEvento.mockRejectedValue(mockError);

      const { result } = renderHook(() => useProductos(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.productos).toEqual([]);
    });
  });

  describe('useVentas', () => {
    it('debería cargar ventas y resumen correctamente', async () => {
      const mockVentas = [
        { id: 1, eventId: 1, total: 1000, date: '2026-03-02T10:00:00.000Z' },
      ];
      const mockResumen = {
        cantidadVentas: 1,
        totalRecaudado: 1000,
        ticketPromedio: 1000,
      };
      const mockProductos = [];

      database.getVentasConDetalle.mockResolvedValue(mockVentas);
      database.getResumenEvento.mockResolvedValue(mockResumen);
      database.getResumenProductos.mockResolvedValue(mockProductos);

      const { result } = renderHook(() => useVentas(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.ventas).toEqual(mockVentas);
      expect(result.current.resumen).toEqual(mockResumen);
      expect(result.current.error).toBe(null);
    });
  });

  describe('useEventos', () => {
    it('debería cargar eventos correctamente', async () => {
      const mockEventos = [
        { id: 1, name: 'Evento 1', type: 'propio' },
        { id: 2, name: 'Evento 2', type: 'alquilado', access_code: 'ABC123' },
      ];

      database.getEvents.mockResolvedValue(mockEventos);

      const { result } = renderHook(() => useEventos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toEqual(mockEventos);
      expect(result.current.error).toBe(null);
    });
  });
});
