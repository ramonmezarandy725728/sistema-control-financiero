const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. GESTIÓN DE CLIENTES: Registrar cliente
app.post('/api/clientes', (req, res) => {
  const { nombre, documento, telefono } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO clientes (nombre, documento, telefono) VALUES (?, ?, ?)');
    const info = stmt.run(nombre, documento, telefono);
    res.json({ id: info.lastInsertRowid, status: 'ok' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. CREAR PRÉSTAMO
app.post('/api/prestamos', (req, res) => {
  const { cliente_id, monto, tasa_interes, plazo_cuotas } = req.body;
  const monto_total = monto + (monto * (tasa_interes / 100));

  try {
    const stmt = db.prepare(`
      INSERT INTO prestamos (cliente_id, monto, tasa_interes, monto_total, plazo_cuotas)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(cliente_id, monto, tasa_interes, monto_total, plazo_cuotas);
    res.json({ id: info.lastInsertRowid, monto_total, status: 'ok' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. INGRESO DE PAGO (Abono)
app.post('/api/pagos', (req, res) => {
  const { prestamo_id, monto_abonado, metodo_pago } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO pagos (prestamo_id, monto_abonado, metodo_pago) VALUES (?, ?, ?)');
    const info = stmt.run(prestamo_id, monto_abonado, metodo_pago);
    res.json({ id: info.lastInsertRowid, status: 'ok' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. CONSULTA FINANCIERO: Resumen global
app.get('/api/resumen', (req, res) => {
  const totalPrestado = db.prepare('SELECT SUM(monto) AS total FROM prestamos').get();
  const totalCobrado = db.prepare('SELECT SUM(monto_abonado) AS total FROM pagos').get();

  res.json({
    prestado: totalPrestado.total || 0,
    cobrado: totalCobrado.total || 0,
    balance: (totalCobrado.total || 0) - (totalPrestado.total || 0)
  });
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});