require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================================
// RUTAS DE LA API (SUPABASE POSTGRESQL)
// ==========================================================================

// ==========================================
// 1. CLIENTES (CRUD COMPLETO)
// ==========================================

// OBTENER TODOS LOS CLIENTES
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: err.message });
  }
});

// CREAR NUEVO CLIENTE
app.post('/api/clientes', async (req, res) => {
  const { tipo_doc, dni, nombre, telefono, telefono_ref, direccion, observaciones } = req.body;

  if (!dni || !nombre || !telefono) {
    return res.status(400).json({ error: 'DNI, Nombre y Teléfono son obligatorios.' });
  }

  const query = `
    INSERT INTO clientes (tipo_doc, dni, nombre, telefono, telefono_ref, direccion, observaciones)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  try {
    const result = await db.query(query, [
      tipo_doc || 'DNI',
      dni.trim(),
      nombre.trim().toUpperCase(),
      telefono.trim(),
      telefono_ref || '',
      direccion || '',
      observaciones || ''
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al registrar cliente:', err.message);
    if (err.message.includes('unique') || err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Ya existe un cliente con ese número de documento.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ACTUALIZAR CLIENTE
app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { tipo_doc, dni, nombre, telefono, telefono_ref, direccion, observaciones } = req.body;
  try {
    const result = await db.query(
      `UPDATE clientes 
       SET tipo_doc = $1, dni = $2, nombre = $3, telefono = $4, telefono_ref = $5, direccion = $6, observaciones = $7 
       WHERE id = $8 RETURNING *`,
      [tipo_doc, dni, nombre, telefono, telefono_ref, direccion, observaciones, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado correctamente', cliente: result.rows[0] });
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).json({ error: err.message });
  }
});

// ELIMINAR CLIENTE
app.delete('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const prestamos = await db.query('SELECT id FROM prestamos WHERE cliente_id = $1', [id]);
    if (prestamos.rows.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: el cliente tiene préstamos asociados.' });
    }

    await db.query('DELETE FROM clientes WHERE id = $1', [id]);
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. PRÉSTAMOS (CRUD COMPLETO)
// ==========================================

// OBTENER TODOS LOS PRÉSTAMOS (CON DATOS DE CLIENTE)
app.get('/api/prestamos', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.*,
        COALESCE(c.nombre, 'Sin asignar') AS cliente_nombre,
        c.dni AS cliente_dni,
        c.telefono AS cliente_telefono
      FROM prestamos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener préstamos:', err);
    res.status(500).json({ error: err.message });
  }
});

// CREAR PRÉSTAMO
app.post('/api/prestamos', async (req, res) => {
  const { cliente_id, monto, tasa_interes, modalidad, frecuencia, cuotas, monto_total, fecha_prestamo, fecha_vencimiento } = req.body;
  try {
    const saldoInicial = monto_total || monto;
    const result = await db.query(`
      INSERT INTO prestamos (
        cliente_id, monto, tasa_interes, modalidad, frecuencia, cuotas,
        monto_total, saldo_actual, fecha_prestamo, fecha_vencimiento, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVO')
      RETURNING *
    `, [cliente_id, monto, tasa_interes, modalidad, frecuencia, cuotas, monto_total, saldoInicial, fecha_prestamo, fecha_vencimiento]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al registrar préstamo:', err);
    res.status(500).json({ error: err.message });
  }
});

// ACTUALIZAR PRÉSTAMO
app.put('/api/prestamos/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente_id, monto, tasa_interes, modalidad, frecuencia, cuotas, monto_total, fecha_prestamo, fecha_vencimiento } = req.body;
  try {
    const result = await db.query(`
      UPDATE prestamos
      SET cliente_id = $1, monto = $2, tasa_interes = $3, modalidad = $4, frecuencia = $5, cuotas = $6, monto_total = $7, saldo_actual = $7, fecha_prestamo = $8, fecha_vencimiento = $9
      WHERE id = $10
      RETURNING *
    `, [cliente_id, monto, tasa_interes, modalidad, frecuencia, cuotas, monto_total, fecha_prestamo, fecha_vencimiento, id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Préstamo no encontrado' });
    res.json({ message: 'Préstamo actualizado correctamente', prestamo: result.rows[0] });
  } catch (err) {
    console.error('Error al actualizar préstamo:', err);
    res.status(500).json({ error: err.message });
  }
});

// ELIMINAR PRÉSTAMO
app.delete('/api/prestamos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM pagos WHERE prestamo_id = $1', [id]);
    await db.query('DELETE FROM prestamos WHERE id = $1', [id]);
    res.json({ message: 'Préstamo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar préstamo:', err);
    res.status(500).json({ error: err.message });
  }
});

// PRÉSTAMOS ACTIVOS DE UN CLIENTE (PARA CASCADA DE PAGOS)
app.get('/api/prestamos/cliente/:clienteId', async (req, res) => {
  const { clienteId } = req.params;
  const sql = `
    SELECT id, monto, saldo_actual, tasa_interes, fecha_prestamo 
    FROM prestamos 
    WHERE cliente_id = $1 AND saldo_actual > 0 AND estado = 'ACTIVO'
    ORDER BY id DESC
  `;
  try {
    const { rows } = await db.query(sql, [clienteId]);
    res.json(rows || []);
  } catch (err) {
    console.error('Error al consultar préstamos del cliente:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PAGOS Y COBRANZAS
// ==========================================

// REGISTRAR PAGO Y ACTUALIZAR SALDO
app.post('/api/pagos', async (req, res) => {
  const { tipo_transaccion, prestamo_id, monto_abonado, amortizacion_capital, metodo_pago, concepto, fecha_pago } = req.body;

  const tipo = tipo_transaccion || (prestamo_id ? 'PRESTAMO' : 'GENERAL');
  const monto = parseFloat(monto_abonado) || 0;
  const fecha = fecha_pago || new Date().toISOString().split('T')[0];
  const amortizacion = parseFloat(amortizacion_capital) || 0;

  const queryInsert = `
    INSERT INTO pagos (tipo_operacion, prestamo_id, monto, metodo_pago, descripcion, fecha_pago)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;

  try {
    const result = await db.query(queryInsert, [
      tipo,
      prestamo_id || null,
      monto,
      metodo_pago || 'EFECTIVO',
      concepto || '',
      fecha
    ]);

    if (prestamo_id && amortizacion > 0) {
      await db.query(`
        UPDATE prestamos 
        SET saldo_actual = GREATEST(0, saldo_actual - $1),
            estado = CASE WHEN (saldo_actual - $1) <= 0 THEN 'CANCELADO' ELSE estado END
        WHERE id = $2
      `, [amortizacion, prestamo_id]);
    }

    res.json({ id: result.rows[0].id, status: 'ok' });
  } catch (err) {
    console.error('Error al registrar pago:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ALERTAS DE COBRANZA
app.get('/api/cobranzas', async (req, res) => {
  const query = `
    SELECT 
      p.id AS prestamo_id,
      p.monto,
      COALESCE(p.saldo_actual, p.monto_total, p.monto) AS saldo_actual,
      p.fecha_prestamo,
      p.fecha_vencimiento,
      c.id AS cliente_id,
      c.nombre,
      c.telefono,
      c.telefono_ref
    FROM prestamos p
    INNER JOIN clientes c ON p.cliente_id = c.id
    WHERE p.estado = 'ACTIVO' AND p.saldo_actual > 0
    ORDER BY p.id DESC
  `;

  try {
    const { rows } = await db.query(query);
    res.json(rows || []);
  } catch (err) {
    console.error('Error SQL cobranzas:', err.message);
    res.json([]);
  }
});

// ==========================================
// INICIAR SERVIDOR (UNA SOLA VEZ AL FINAL)
// ==========================================
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});