require('dotenv').config();
const dns = require('dns');
const { Pool } = require('pg');

// Priorizar IPv4 para evitar timeouts de red
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error de conexión Supabase:', err.message);
  } else {
    console.log('✅ ¡CONECTADO CON ÉXITO A SUPABASE POSTGRESQL!');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};