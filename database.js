import * as SQLite from 'expo-sqlite';

let db = null;

// Use the modern expo-sqlite async API. `openDatabaseAsync` is provided by
// the library and returns a database object that already implements
// `runAsync` / `getAllAsync`, so forward to it directly.
const openDatabaseAsync = (name) => {
  return SQLite.openDatabaseAsync(name);
};

export const initDB = async () => {
  if (db) return db;

  try {
    db = await openDatabaseAsync('ventas.db');

    // Crear tabla de eventos
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        access_code TEXT,
        date TEXT
      )
    `);

    // Crear tabla de productos por evento
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS productos_evento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        categoria TEXT,
        presentacion TEXT,
        precio REAL NOT NULL,
        FOREIGN KEY (eventId) REFERENCES events(id)
      )
    `);

    // Crear tabla de ventas
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total REAL NOT NULL
      )
    `);

    console.log('✓ Base de datos inicializada correctamente');
    return db;
  } catch (error) {
    console.error('✗ Error inicializando BD:', error.message);
    throw error;
  }
};

export const insertEvent = async (name, type, date, accessCode) => {
  if (!db) {
    await initDB();
  }

  await db.runAsync(
    'INSERT INTO events (name, type, date, access_code) VALUES (?, ?, ?, ?)',
    [name, type, date, accessCode]
  );
};

export const getEvents = async () => {
  if (!db) {
    await initDB();
  }

  const events = await db.getAllAsync(
    'SELECT * FROM events ORDER BY id DESC'
  );

  return events;
};

// ============================================
// FUNCIONES DE PRODUCTOS
// ============================================

export const getProductosByEvento = async (eventId) => {
  if (!db) {
    await initDB();
  }

  const productos = await db.getAllAsync(
    'SELECT * FROM productos_evento WHERE eventId = ? ORDER BY nombre ASC',
    [eventId]
  );

  return productos;
};

export const insertProductoEvento = async ({ eventId, nombre, categoria, presentacion, precio, esTemporal }) => {
  if (!db) {
    await initDB();
  }

  await db.runAsync(
    'INSERT INTO productos_evento (eventId, nombre, categoria, presentacion, precio) VALUES (?, ?, ?, ?, ?)',
    [eventId, nombre, categoria, presentacion || null, precio]
  );
};

export const updateProductoEvento = async ({ id, categoria, presentacion, precio }) => {
  if (!db) {
    await initDB();
  }

  await db.runAsync(
    'UPDATE productos_evento SET categoria = ?, presentacion = ?, precio = ? WHERE id = ?',
    [categoria, presentacion || null, precio, id]
  );
};

export const deleteProductoEvento = async (id) => {
  if (!db) {
    await initDB();
  }

  await db.runAsync(
    'DELETE FROM productos_evento WHERE id = ?',
    [id]
  );
};

export const getEventByAccessCode = async (accessCode) => {
  if (!db) {
    await initDB();
  }

  const events = await db.getAllAsync(
    'SELECT * FROM events WHERE access_code = ?',
    [accessCode]
  );

  return events.length > 0 ? events[0] : null;
};


