/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth, AuthProvider } from '../src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('debería inicializar con sesión nula', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBe(null);
  });

  it('debería cargar sesión guardada desde AsyncStorage', async () => {
    const savedSession = { type: 'club' };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedSession));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toEqual(savedSession);
  });

  it('debería hacer loginClub y guardar en AsyncStorage', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loginClub();
    });

    expect(result.current.session).toEqual({ type: 'club' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'auth:session',
      JSON.stringify({ type: 'club' })
    );
  });

  it('debería hacer loginEvento y guardar eventId', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loginEvento(42);
    });

    expect(result.current.session).toEqual({ type: 'evento', eventId: 42 });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'auth:session',
      JSON.stringify({ type: 'evento', eventId: 42 })
    );
  });

  it('debería limpiar sesión al hacer logout', async () => {
    const mockNavigation = {
      reset: jest.fn(),
    };

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loginClub();
    });

    expect(result.current.session).not.toBe(null);

    await act(async () => {
      await result.current.logout(mockNavigation);
    });

    expect(result.current.session).toBe(null);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth:session');
    expect(mockNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Start' }],
    });
  });
});
