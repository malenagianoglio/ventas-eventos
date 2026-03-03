/**
 * @jest-environment jsdom
 */
// mock modules before importing anything else
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../src/utils/printer');

// we will require these after mocking so the mocks apply correctly
let renderHook, act, waitFor;
let usePrinter, PrinterProvider;
let AsyncStorage;
let printer;

// import after mocks
({ renderHook, act, waitFor } = require('@testing-library/react-native'));
({ usePrinter, PrinterProvider } = require('../src/context/PrinterContext'));
AsyncStorage = require('@react-native-async-storage/async-storage');
printer = require('../src/utils/printer');

describe('PrinterContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    printer.requestBluetoothPermission.mockResolvedValue(true);
    printer.getPairedDevices.mockResolvedValue([]);
    printer.connectPrinter.mockResolvedValue(undefined);
    printer.disconnectPrinter.mockResolvedValue(undefined);
  });

  it('debería inicializar sin impresora conectada', () => {
    const wrapper = ({ children }) => <PrinterProvider>{children}</PrinterProvider>;
    const { result } = renderHook(() => usePrinter(), { wrapper });

    expect(result.current.connectedPrinter).toBe(null);
    expect(result.current.connecting).toBe(false);
    expect(result.current.devices).toEqual([]);
    expect(result.current.reconnectError).toBe(null);
  });

  it('debería cargar dispositivos Bluetooth emparejados', async () => {
    const mockDevices = [
      { address: '00:11:22:33:44:55', name: 'Printer 1' },
      { address: 'AA:BB:CC:DD:EE:FF', name: 'Printer 2' },
    ];
    printer.getPairedDevices.mockResolvedValue(mockDevices);

    const wrapper = ({ children }) => <PrinterProvider>{children}</PrinterProvider>;
    const { result } = renderHook(() => usePrinter(), { wrapper });

    await act(async () => {
      await result.current.loadDevices();
    });

    expect(result.current.devices).toEqual(mockDevices);
  });

  it('debería conectar a una impresora y guardar en AsyncStorage', async () => {
    const mockDevice = { address: '00:11:22:33:44:55', name: 'Printer 1' };

    const wrapper = ({ children }) => <PrinterProvider>{children}</PrinterProvider>;
    const { result } = renderHook(() => usePrinter(), { wrapper });

    await act(async () => {
      await result.current.connect(mockDevice);
    });

    expect(result.current.connectedPrinter).toEqual(mockDevice);
    expect(printer.connectPrinter).toHaveBeenCalledWith(mockDevice.address);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'printer:last_device',
      JSON.stringify(mockDevice)
    );
  });

  it('debería desconectar impresora y limpiar AsyncStorage', async () => {
    const mockDevice = { address: '00:11:22:33:44:55', name: 'Printer 1' };

    const wrapper = ({ children }) => <PrinterProvider>{children}</PrinterProvider>;
    const { result } = renderHook(() => usePrinter(), { wrapper });

    await act(async () => {
      await result.current.connect(mockDevice);
    });

    expect(result.current.connectedPrinter).not.toBe(null);

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.connectedPrinter).toBe(null);
    expect(printer.disconnectPrinter).toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('printer:last_device');
  });

  it('debería intentar reconectar a la última impresora guardada', async () => {
    const savedDevice = { address: '00:11:22:33:44:55', name: 'Printer 1' };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedDevice));

    const wrapper = ({ children }) => <PrinterProvider>{children}</PrinterProvider>;
    const { result } = renderHook(() => usePrinter(), { wrapper });

    await waitFor(() => {
      expect(printer.connectPrinter).toHaveBeenCalledWith(savedDevice.address);
    });

    expect(result.current.connectedPrinter).toEqual(savedDevice);
    expect(result.current.reconnectError).toBe(null);
  });
});
