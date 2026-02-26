import * as SQLite from 'expo-sqlite';

let db = null;

const openDatabaseAsync = (name) => {
  return SQLite.openDatabaseAsync(name);
};

export const initDB = async () => {
  if (db) return db;

  try {
    db = await openDatabaseAsync('ventas.db');

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        access_code TEXT,
        date TEXT
      )
    `);

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

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        date TEXT NOT NULL,
        total REAL NOT NULL,
        estado TEXT NOT NULL DEFAULT 'confirmada',
        FOREIGN KEY (eventId) REFERENCES events(id)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS productos_venta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ventaId INTEGER NOT NULL,
        productoId INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (ventaId) REFERENCES ventas(id),
        FOREIGN KEY (productoId) REFERENCES productos_evento(id)
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

export const getEventById = async (id) => {
  if (!db) {
    await initDB();
  }
  const events = await db.getAllAsync(
    'SELECT * FROM events WHERE id = ?',
    [id]
  );
  return events.length > 0 ? events[0] : null;
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

export const updateProductoEvento = async ({ id, nombre, categoria, presentacion, precio }) => {
  if (!db) {
    await initDB();
  }

  await db.runAsync(
    'UPDATE productos_evento SET nombre = ?, categoria = ?, presentacion = ?, precio = ? WHERE id = ?',
    [nombre, categoria, presentacion || null, precio, id]
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

export const insertVenta = async (eventId, date, total, estado) => {
  if (!db) {
    await initDB();
  }

  const result = await db.runAsync(
    'INSERT INTO ventas (eventId, date, total, estado) VALUES (?, ?, ?)',
    [eventId, date, total]
  );

  return result.insertId;
};



