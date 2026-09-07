const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// RUTAS DE LA API
// ==========================================

// 1. OBTENER LISTA DE CLIENTES (Para llenar selectores)
app.get('/api/clientes', (req, res) => {
  db.all('SELECT id, nombre, dni, telefono FROM clientes ORDER BY nombre ASC', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener clientes:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// 2. REGISTRAR NUEVO CLIENTE
app.post('/api/clientes', (req, res) => {
  const { tipo_doc, dni, nombre, telefono, telefono_ref, direccion, observaciones } = req.body;

  if (!dni || !nombre || !telefono) {
    return res.status(400).json({ error: 'DNI, Nombre y Teléfono son obligatorios.' });
  }

  const query = `
    INSERT INTO clientes (tipo_doc, dni, nombre, telefono, telefono_ref, direccion, observaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    tipo_doc || 'DNI',
    dni.trim(),
    nombre.trim().toUpperCase(),
    telefono.trim(),
    telefono_ref || '',
    direccion || '',
    observaciones || ''
  ], function (err) {
    if (err) {
      console.error('Error al registrar cliente:', err.message);
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ya existe un cliente con ese número de documento.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, status: 'ok' });
  });
});

// 3. CREAR PRÉSTAMO
app.post('/api/prestamos', (req, res) => {
  const { cliente_id, monto, tasa_interes, fecha_prestamo, modalidad, plazo_cuotas } = req.body;
  const capital = parseFloat(monto) || 0;
  const tasa = parseFloat(tasa_interes) || 0;
  const cuotas = parseInt(plazo_cuotas, 10) || 1;
  const fecha = fecha_prestamo || new Date().toISOString().split('T')[0];
  const mod = modalidad || 'PROGRAMADO';

  const query = `
    INSERT INTO prestamos (cliente_id, monto, saldo_actual, tasa_interes, modalidad, plazo_cuotas, fecha_prestamo, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVO')
  `;

  db.run(query, [cliente_id, capital, capital, tasa, mod, cuotas, fecha], function (err) {
    if (err) {
      console.error('Error al crear préstamo:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID, status: 'ok' });
  });
});

// 4. INGRESO DE PAGO (ABONOS O INGRESOS GENERALES)
app.post('/api/pagos', (req, res) => {
  const { tipo_transaccion, prestamo_id, monto_abonado, interes_cobrado, amortizacion_capital, metodo_pago, concepto, fecha_pago } = req.body;

  const tipo = tipo_transaccion || (prestamo_id ? 'PRESTAMO' : 'GENERAL');
  const monto = parseFloat(monto_abonado) || 0;
  const fecha = fecha_pago || new Date().toISOString().split('T')[0];

  const query = `
    INSERT INTO pagos (tipo_transaccion, prestamo_id, monto_abonado, interes_cobrado, amortizacion_capital, metodo_pago, concepto, fecha_pago)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    tipo,
    prestamo_id || null,
    monto,
    parseFloat(interes_cobrado) || 0,
    parseFloat(amortizacion_capital) || 0,
    metodo_pago || 'EFECTIVO',
    concepto || '',
    fecha
  ], function (err) {
    if (err) {
      console.error('Error al registrar pago:', err.message);
      return res.status(400).json({ error: err.message });
    }

    // Descontar saldo si es abono a préstamo
    if (prestamo_id && parseFloat(amortizacion_capital) > 0) {
      db.run('UPDATE prestamos SET saldo_actual = MAX(0, saldo_actual - ?) WHERE id = ?', [parseFloat(amortizacion_capital), prestamo_id]);
    }

    res.json({ id: this.lastID, status: 'ok' });
  });
});

// 5. RESUMEN FINANCIERO
app.get('/api/resumen', (req, res) => {
  db.get('SELECT SUM(monto) AS prestado FROM prestamos', [], (err1, rowPrestado) => {
    if (err1) return res.status(500).json({ error: err1.message });

    db.get('SELECT SUM(monto_abonado) AS cobrado FROM pagos', [], (err2, rowCobrado) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const prestado = (rowPrestado && rowPrestado.prestado) || 0;
      const cobrado = (rowCobrado && rowCobrado.cobrado) || 0;

      res.json({
        prestado,
        cobrado,
        balance: cobrado - prestado
      });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});