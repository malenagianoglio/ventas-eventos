// jest.setup.js - Setup global para tests

// ensure TransformStream exists for expo packages that expect web streams
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class {
    constructor() {}
  };
}

// Mock expo-sqlite so imports in database.js don't break tests
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((cb) => cb({ executeSql: jest.fn() })),
  })),
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Before requiring the real react-native we mock TurboModuleRegistry so
// that when the package tries to access DevMenu (which isn't available in
// the jest environment) it doesn't throw.
// Since we only need a few pieces of react-native in our unit tests we
// provide a lightweight manual mock that avoids pulling in native modules or
// the full React Native implementation (which caused issues in Jest).
// This mock includes the APIs used by our code and by libraries we import
// (e.g. navigation wants `select`).
jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  NativeModules: {},
  Platform: { OS: 'android' },
  PermissionsAndroid: {
    requestMultiple: jest.fn(() => Promise.resolve({})),
    PERMISSIONS: {
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
    },
    RESULTS: { GRANTED: 'granted' },
  },
  select: (obj) => obj['android'] || obj.default || obj,
  StyleSheet: { create: (obj) => obj },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  FlatList: 'FlatList',
  TextInput: 'TextInput',
}));

global.console.warn = jest.fn();
global.console.error = jest.fn();
