const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'financiero.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar SQLite:', err.message);
  } else {
    console.log('Base de datos conectada.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      dni TEXT UNIQUE NOT NULL,
      telefono TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prestamos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      monto REAL NOT NULL,
      saldo_actual REAL NOT NULL,
      tasa_interes REAL NOT NULL,
      modalidad TEXT DEFAULT 'PROGRAMADO',
      plazo_cuotas INTEGER DEFAULT 1,
      fecha_prestamo DATE NOT NULL,
      estado TEXT DEFAULT 'ACTIVO',
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

  // Insertar datos demo iniciales
  db.get("SELECT COUNT(*) AS total FROM clientes", (err, row) => {
    if (!err && (!row || row.total === 0)) {
      const stmt = db.prepare("INSERT INTO clientes (nombre, dni, telefono) VALUES (?, ?, ?)");
      stmt.run("ROJAS TÉCNICO", "70891234", "987654321");
      stmt.run("CHACON MIGUEL", "45129876", "912345678");
      stmt.run("JOSE RAMIREZ", "10982345", "998877665");
      stmt.finalize();
      console.log("Clientes cargados en SQLite.");
    }
  });
});

module.exports = db;

db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_doc TEXT DEFAULT 'DNI',
      dni TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      telefono TEXT NOT NULL,
      telefono_ref TEXT,
      direccion TEXT,
      observaciones TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);