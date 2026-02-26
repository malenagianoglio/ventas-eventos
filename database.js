import * as SQLite from 'expo-sqlite';

// ─── Singleton ────────────────────────────────────────────────────────────────

let _db = null;
let _initPromise = null;

const getDB = async () => {
  if (_db) return _db;
  if (_initPromise) return _initPromise;
  _initPromise = SQLite.openDatabaseAsync('ventas.db').then((db) => {
    _db = db;
    _initPromise = null;
    return db;
  });
  return _initPromise;
};

// ─── Init ─────────────────────────────────────────────────────────────────────

export const initDB = async () => {
  const db = await getDB();

  await db.runAsync(`PRAGMA journal_mode = WAL`);
  await db.runAsync(`PRAGMA foreign_keys = ON`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    access_code TEXT,
    date TEXT
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS productos_evento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT,
    presentacion TEXT,
    precio REAL NOT NULL,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    date TEXT NOT NULL,
    total REAL NOT NULL,
    estado TEXT NOT NULL DEFAULT 'confirmada',
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS productos_venta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ventaId INTEGER NOT NULL,
    productoId INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (ventaId) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (productoId) REFERENCES productos_evento(id)
  )`);

  console.log('Base de datos inicializada');
  return db;
};

// ─── Eventos ──────────────────────────────────────────────────────────────────

export const insertEvent = async (name, type, date, accessCode) => {
  const db = await getDB();
  const result = await db.runAsync(
    'INSERT INTO events (name, type, date, access_code) VALUES (?, ?, ?, ?)',
    [name, type, date, accessCode ?? null]
  );
  return result.lastInsertRowId;
};

export const getEvents = async () => {
  const db = await getDB();
  return db.getAllAsync('SELECT * FROM events ORDER BY id DESC');
};

export const getEventById = async (id) => {
  const db = await getDB();
  return db.getFirstAsync('SELECT * FROM events WHERE id = ?', [id]);
};

export const getEventByAccessCode = async (accessCode) => {
  const db = await getDB();
  return db.getFirstAsync('SELECT * FROM events WHERE access_code = ?', [accessCode]);
};

// ─── Productos ────────────────────────────────────────────────────────────────

export const getProductosByEvento = async (eventId) => {
  const db = await getDB();
  return db.getAllAsync(
    'SELECT * FROM productos_evento WHERE eventId = ? ORDER BY nombre ASC',
    [eventId]
  );
};

export const insertProductoEvento = async ({ eventId, nombre, categoria, presentacion, precio }) => {
  const db = await getDB();
  const result = await db.runAsync(
    'INSERT INTO productos_evento (eventId, nombre, categoria, presentacion, precio) VALUES (?, ?, ?, ?, ?)',
    [eventId, nombre, categoria ?? null, presentacion ?? null, precio]
  );
  return result.lastInsertRowId;
};

export const updateProductoEvento = async ({ id, nombre, categoria, presentacion, precio }) => {
  const db = await getDB();
  await db.runAsync(
    'UPDATE productos_evento SET nombre = ?, categoria = ?, presentacion = ?, precio = ? WHERE id = ?',
    [nombre, categoria ?? null, presentacion ?? null, precio, id]
  );
};

export const deleteProductoEvento = async (id) => {
  const db = await getDB();
  await db.runAsync('DELETE FROM productos_evento WHERE id = ?', [id]);
};

// ─── Ventas ───────────────────────────────────────────────────────────────────

export const insertVenta = async (eventId, total, itemsCarrito) => {
  const db = await getDB();
  const date = new Date().toISOString();

  // Usamos una transacción para garantizar atomicidad:
  // si falla cualquier INSERT de productos_venta, la venta entera se revierte.
  await db.withTransactionAsync(async () => {
    const { lastInsertRowId: ventaId } = await db.runAsync(
      'INSERT INTO ventas (eventId, date, total, estado) VALUES (?, ?, ?, ?)',
      [eventId, date, total, 'confirmada']
    );

    for (const item of itemsCarrito) {
      await db.runAsync(
        'INSERT INTO productos_venta (ventaId, productoId, cantidad, precio, subtotal) VALUES (?, ?, ?, ?, ?)',
        [ventaId, item.id, item.cantidad, item.precio, item.precio * item.cantidad]
      );
    }
  });
};

export const deleteVenta = async (ventaId) => {
  const db = await getDB();
  // productos_venta se borra en cascada por el ON DELETE CASCADE
  await db.runAsync('DELETE FROM ventas WHERE id = ?', [ventaId]);
};

export const getVentasByEvento = async (eventId) => {
  const db = await getDB();
  return db.getAllAsync(
    'SELECT * FROM ventas WHERE eventId = ? ORDER BY date DESC',
    [eventId]
  );
};

// Métricas globales del evento: total recaudado, cantidad de ventas, ticket promedio
export const getResumenEvento = async (eventId) => {
  const db = await getDB();
  return db.getFirstAsync(
    `SELECT
       COUNT(*)        AS cantidadVentas,
       SUM(total)      AS totalRecaudado,
       AVG(total)      AS ticketPromedio
     FROM ventas
     WHERE eventId = ? AND estado = 'confirmada'`,
    [eventId]
  );
};

// Desglose por producto: unidades vendidas y subtotal, ordenado por unidades DESC
export const getResumenProductos = async (eventId) => {
  const db = await getDB();
  return db.getAllAsync(
    `SELECT
       pe.nombre,
       pe.presentacion,
       pe.categoria,
       SUM(pv.cantidad) AS unidades,
       SUM(pv.subtotal) AS subtotal
     FROM productos_venta pv
     JOIN productos_evento pe ON pe.id = pv.productoId
     JOIN ventas v            ON v.id  = pv.ventaId
     WHERE v.eventId = ? AND v.estado = 'confirmada'
     GROUP BY pv.productoId
     ORDER BY unidades DESC`,
    [eventId]
  );
};

// Detalle de cada venta con sus items
export const getVentasConDetalle = async (eventId) => {
  const db = await getDB();
  const ventas = await db.getAllAsync(
    `SELECT * FROM ventas WHERE eventId = ? AND estado = 'confirmada' ORDER BY date DESC`,
    [eventId]
  );

  // Para cada venta traemos sus items
  const ventasConItems = await Promise.all(
    ventas.map(async (venta) => {
      const items = await db.getAllAsync(
        `SELECT pv.cantidad, pv.precio, pv.subtotal, pe.nombre, pe.presentacion
         FROM productos_venta pv
         JOIN productos_evento pe ON pe.id = pv.productoId
         WHERE pv.ventaId = ?`,
        [venta.id]
      );
      return { ...venta, items };
    })
  );

  return ventasConItems;
};