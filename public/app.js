document.addEventListener('DOMContentLoaded', () => {

  // --- CONTROL DEL SELECTOR DE INGRESO DE PAGO (CORREGIDO) ---
  const modIngresoPago = document.getElementById('mod-ingreso-pago');
  const formTransaccion = document.getElementById('form-transaccion-pago');

  if (modIngresoPago && formTransaccion) {
    const columnas = formTransaccion.querySelectorAll('.form-column');
    const colPrestamo = columnas[0]; // Columna izquierda (Préstamo)
    const colGeneral = columnas[1];  // Columna derecha (General)

    // Crear el selector dinámicamente si no existe
    if (!document.getElementById('filtro-tipo-pago')) {
      const selectorWrap = document.createElement('div');
      selectorWrap.className = 'contenedor-tipo-pago';
      selectorWrap.innerHTML = `
        <label for="filtro-tipo-pago">SELECCIONE TIPO DE TRANSACCIÓN:</label>
        <select id="filtro-tipo-pago" class="select-dinamico-tipo">
          <option value="prestamo">💳 PAGO PRÉSTAMO</option>
          <option value="general">📄 PAGO GENERAL</option>
        </select>
      `;

      // Insertar arriba del formulario sin tocar el resto
      formTransaccion.parentNode.insertBefore(selectorWrap, formTransaccion);

      // Estado inicial: mostrar solo Pago Préstamo
      colPrestamo.classList.add('form-column-prestamo-activa');
      colGeneral.classList.add('form-column-oculta');

      // Escuchar cambios para alternar vistas correctamente
      const selectElem = document.getElementById('filtro-tipo-pago');
      selectElem.addEventListener('change', (e) => {
        if (e.target.value === 'prestamo') {
          // Mostrar Préstamo
          colPrestamo.classList.remove('form-column-oculta');
          colPrestamo.classList.add('form-column-prestamo-activa');

          // Ocultar General
          colGeneral.classList.remove('form-column-general-activa');
          colGeneral.classList.add('form-column-oculta');
        } else {
          // Mostrar General centrado y amplio
          colGeneral.classList.remove('form-column-oculta');
          colGeneral.classList.add('form-column-general-activa');

          // Ocultar Préstamo
          colPrestamo.classList.remove('form-column-prestamo-activa');
          colPrestamo.classList.add('form-column-oculta');
        }
      });
    }
  }

  // Evento para el botón ATRAS
  document.getElementById('btn-volver-atras')?.addEventListener('click', () => {
    document.getElementById('mod-ingreso-pago').classList.add('hidden');
    document.getElementById('menu-grid').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  let chartInstancia = null;

  // --- LÓGICA DEL CANVA ANIMADO (PLEXO DE LÍNEAS / NODOS) ---
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const particles = [];
  const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.8 + 1
    });
  }

  function animateNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.body.classList.contains('dark-theme');
    const rgb = isDark ? '6, 182, 212' : '2, 132, 199';

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, 0.5)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${rgb}, ${0.25 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateNetwork);
  }
  animateNetwork();

  // --- LÓGICA DE LA INTERFAZ ---
  const cards = document.querySelectorAll('.grid-card');
  const modules = document.querySelectorAll('.glass-module');
  const menuGrid = document.getElementById('menu-grid');
  
  const btnHome = document.getElementById('btn-global-home');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const body = document.body;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      
      menuGrid.classList.add('hidden');
      modules.forEach(m => m.classList.add('hidden'));
      
      const targetModule = document.getElementById(targetId);
      if (targetModule) {
        targetModule.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (targetId === 'mod-graficos') {
        renderizarGrafico();
      }
      if (targetId === 'mod-consulta') {
        cargarResumenFinanciero();
      }
    });
  });

  btnHome.addEventListener('click', () => {
    modules.forEach(m => m.classList.add('hidden'));
    menuGrid.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnThemeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      btnThemeToggle.innerHTML = '☀️ <span>MODO OSCURO</span>';
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      btnThemeToggle.innerHTML = '🌙 <span>MODO CLARO</span>';
    }

    if (!document.getElementById('mod-graficos').classList.contains('hidden')) {
      renderizarGrafico();
    }
  });

  function renderizarGrafico() {
    const canvasElem = document.getElementById('chartBalance');
    if (!canvasElem) return;
    const ctxChart = canvasElem.getContext('2d');
    const isDark = body.classList.contains('dark-theme');
    const textColor = isDark ? '#ffffff' : '#0f172a';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    if (chartInstancia) {
      chartInstancia.destroy();
    }

    chartInstancia = new Chart(ctxChart, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Ingresos / Pagos ($)',
            data: [1200, 1900, 3000, 2500, 2200, 3100],
            backgroundColor: '#06b6d4'
          },
          {
            label: 'Préstamos Emitidos ($)',
            data: [1000, 1500, 2000, 1800, 1500, 2800],
            backgroundColor: '#2563eb'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: textColor, font: { family: 'Orbitron' } }
          }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
  }

  // ==========================================
  // --- CONEXIÓN CON LA BASE DE DATOS SQL ---
  // ==========================================

  const formCliente = document.getElementById('form-cliente');
  if (formCliente) {
    formCliente.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nombre: document.getElementById('cliente-nombre').value,
        documento: document.getElementById('cliente-documento').value,
        telefono: document.getElementById('cliente-telefono')?.value || ''
      };

      try {
        const res = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Cliente guardado con éxito en la base de datos');
          formCliente.reset();
        } else {
          alert('Error: ' + (data.error || 'No se pudo guardar'));
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  const formPrestamo = document.getElementById('form-prestamo');
  if (formPrestamo) {
    formPrestamo.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        cliente_id: document.getElementById('prestamo-cliente-id').value,
        monto: parseFloat(document.getElementById('prestamo-monto').value),
        tasa_interes: parseFloat(document.getElementById('prestamo-interes').value || 0),
        plazo_cuotas: parseInt(document.getElementById('prestamo-cuotas').value, 10)
      };

      try {
        const res = await fetch('/api/prestamos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Préstamo registrado exitosamente');
          formPrestamo.reset();
        } else {
          alert('Error: ' + (data.error || 'No se pudo registrar'));
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  const formPago = document.getElementById('form-pago');
  if (formPago) {
    formPago.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        prestamo_id: document.getElementById('pago-prestamo-id').value,
        monto_abonado: parseFloat(document.getElementById('pago-monto').value),
        metodo_pago: document.getElementById('pago-metodo')?.value || 'EFECTIVO'
      };

      try {
        const res = await fetch('/api/pagos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Pago guardado en la base de datos');
          formPago.reset();
        } else {
          alert('Error: ' + (data.error || 'No se pudo registrar'));
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  async function cargarResumenFinanciero() {
    try {
      const res = await fetch('/api/resumen');
      if (!res.ok) return;
      const data = await res.json();

      const totalCobradoElem = document.getElementById('resumen-total-cobrado');
      const totalPrestadoElem = document.getElementById('resumen-total-prestado');
      const balanceElem = document.getElementById('resumen-balance');

      if (totalCobradoElem) totalCobradoElem.textContent = `$${data.cobrado.toLocaleString()}`;
      if (totalPrestadoElem) totalPrestadoElem.textContent = `$${data.prestado.toLocaleString()}`;
      if (balanceElem) balanceElem.textContent = `$${data.balance.toLocaleString()}`;
    } catch (err) {
      console.error('Error al cargar balance:', err);
    }
  }

  // --- LÓGICA DE COBRO: CASCADA Y CÁLCULO EN VIVO ---
  const prestamosPorCliente = {
    "1": [
      { id: 101, capital: 5000, saldo: 4200, tasa: 10, cuota: 350, fecha: "15/05/2026" }
    ],
    "2": [
      { id: 102, capital: 1000, saldo: 600, tasa: 10, cuota: 120, fecha: "01/06/2026" },
      { id: 105, capital: 2500, saldo: 2100, tasa: 8, cuota: 250, fecha: "20/07/2026" }
    ],
    "3": [
      { id: 103, capital: 3000, saldo: 3000, tasa: 12, cuota: 280, fecha: "10/08/2026" }
    ]
  };

  // ==========================================================================
  // MÓDULO 1: INGRESO DE PAGO (LÓGICA)
  // ==========================================================================
  const selectCliente = document.getElementById('pago-cliente');
  const selectDeuda = document.getElementById('pago-prestamo-deuda');
  const inputCapitalRef = document.getElementById('pago-capital-ref');
  const inputSaldoActual = document.getElementById('pago-saldo-actual');
  const inputMontoAbono = document.getElementById('pago-monto-abono');
  const inputNuevoSaldo = document.getElementById('pago-nuevo-saldo');
  const inputInteresCobrado = document.getElementById('pago-interes-cobrado');
  const inputAmortizacionReal = document.getElementById('pago-amortizacion-real');
  const inputNuevoInteresFuturo = document.getElementById('pago-nuevo-interes-futuro');
  const selectTipoPago = document.getElementById('pago-tipo-pago');
  const inputFechaPago = document.getElementById('pago-fecha-efectiva');
  const inputGeneralFecha = document.getElementById('general-fecha');

  // Fecha actual por defecto en pagos
  const hoyStr = new Date().toISOString().split('T')[0];
  if (inputFechaPago) inputFechaPago.value = hoyStr;
  if (inputGeneralFecha) inputGeneralFecha.value = hoyStr;

  function recalcularOperacion() {
    const opt = selectDeuda?.selectedOptions[0];
    if (!opt || opt.value === "") {
      if (inputInteresCobrado) inputInteresCobrado.value = "0% - S/ 0.00";
      if (inputAmortizacionReal) inputAmortizacionReal.value = "S/ 0.00";
      if (inputNuevoSaldo) inputNuevoSaldo.value = "S/ 0.00";
      if (inputNuevoInteresFuturo) inputNuevoInteresFuturo.value = "S/ 0.00 (0%)";
      return;
    }

    const saldoActual = parseFloat(opt.getAttribute('data-saldo')) || 0;
    const tasaMensual = parseFloat(opt.getAttribute('data-tasa')) || 0;
    const abonoTotal = parseFloat(inputMontoAbono?.value) || 0;
    const tipoOperacion = selectTipoPago?.value;

    let interesCobradoSoles = 0;
    let amortizacionCapital = 0;

    if (tipoOperacion === 'AMORTIZAR_CAPITAL') {
      interesCobradoSoles = 0;
      amortizacionCapital = Math.min(abonoTotal, saldoActual);
      if (inputInteresCobrado) inputInteresCobrado.value = `0% - S/ 0.00 (Amortización pura)`;
    } else {
      interesCobradoSoles = saldoActual * (tasaMensual / 100);
      amortizacionCapital = Math.max(0, abonoTotal - interesCobradoSoles);
      amortizacionCapital = Math.min(amortizacionCapital, saldoActual);
      if (inputInteresCobrado) inputInteresCobrado.value = `${tasaMensual}% - S/ ${interesCobradoSoles.toFixed(2)}`;
    }

    const nuevoSaldo = Math.max(0, saldoActual - amortizacionCapital);
    const nuevoInteresMensualSoles = nuevoSaldo * (tasaMensual / 100);

    if (inputAmortizacionReal) inputAmortizacionReal.value = `S/ ${amortizacionCapital.toFixed(2)}`;
    if (inputNuevoSaldo) inputNuevoSaldo.value = `S/ ${nuevoSaldo.toFixed(2)}`;
    if (inputNuevoInteresFuturo) inputNuevoInteresFuturo.value = `S/ ${nuevoInteresMensualSoles.toFixed(2)} (${tasaMensual}% mes)`;
  }

  // 1. Al cambiar de cliente en pagos
  selectCliente?.addEventListener('change', (e) => {
    const clienteId = e.target.value;
    if (!selectDeuda) return;
    selectDeuda.innerHTML = '<option value="">Seleccione una deuda...</option>';

    if (inputCapitalRef) inputCapitalRef.value = '';
    if (inputSaldoActual) inputSaldoActual.value = '';
    if (inputMontoAbono) inputMontoAbono.value = '';
    if (inputInteresCobrado) inputInteresCobrado.value = '';
    if (inputAmortizacionReal) inputAmortizacionReal.value = '';
    if (inputNuevoSaldo) inputNuevoSaldo.value = '';
    if (inputNuevoInteresFuturo) inputNuevoInteresFuturo.value = '';

    if (typeof prestamosPorCliente !== 'undefined' && clienteId && prestamosPorCliente[clienteId]) {
      selectDeuda.disabled = false;
      prestamosPorCliente[clienteId].forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `Préstamo #${p.id} | Saldo: S/ ${p.saldo.toFixed(2)} (Tasa: ${p.tasa}%)`;
        opt.setAttribute('data-capital', p.capital);
        opt.setAttribute('data-saldo', p.saldo);
        opt.setAttribute('data-cuota', p.cuota);
        opt.setAttribute('data-tasa', p.tasa);
        selectDeuda.appendChild(opt);
      });
    } else {
      selectDeuda.disabled = true;
      selectDeuda.innerHTML = '<option value="">Primero seleccione un cliente...</option>';
    }
  });

  // 2. Al cambiar de deuda
  selectDeuda?.addEventListener('change', (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt && opt.value !== "") {
      if (inputCapitalRef) inputCapitalRef.value = `S/ ${parseFloat(opt.getAttribute('data-capital')).toFixed(2)}`;
      if (inputSaldoActual) inputSaldoActual.value = `S/ ${parseFloat(opt.getAttribute('data-saldo')).toFixed(2)}`;

      if (selectTipoPago?.value === 'CUOTA_ESTABLECIDA' && inputMontoAbono) {
        inputMontoAbono.value = opt.getAttribute('data-cuota') || '';
      }
      recalcularOperacion();
    }
  });

  // 3. Al cambiar tipo de pago o digitar monto
  selectTipoPago?.addEventListener('change', () => {
    const opt = selectDeuda?.selectedOptions[0];
    if (opt && opt.value !== "") {
      if (selectTipoPago.value === 'CUOTA_ESTABLECIDA' && inputMontoAbono) {
        inputMontoAbono.value = opt.getAttribute('data-cuota') || '';
      } else if (inputMontoAbono) {
        inputMontoAbono.value = '';
      }
      recalcularOperacion();
    }
  });

  inputMontoAbono?.addEventListener('input', recalcularOperacion);

  // ==========================================================================
  // MÓDULO 2: CREAR PRÉSTAMO (LÓGICA LIMPIA)
  // ==========================================================================
  const selectCpCliente = document.getElementById('cp-cliente-select');
  const inputCpDni = document.getElementById('cp-dni');
  const inputCpCelular = document.getElementById('cp-celular');
  const inputCpMonto = document.getElementById('cp-monto');
  const inputCpFecha = document.getElementById('cp-fecha');
  const inputCpInteres = document.getElementById('cp-interes');
  const selectCpFrecuencia = document.getElementById('cp-frecuencia');
  const selectCpCuotas = document.getElementById('cp-cuotas');
  const inputCpVencimiento = document.getElementById('cp-fecha-vencimiento');
  const inputCpTotalDevolver = document.getElementById('cp-total-devolver');
  const inputCpEstimada = document.getElementById('cp-cuota-estimada');

  const radiosModalidad = document.querySelectorAll('input[name="modalidad_pago"]');
  const contenedorCuotas = document.getElementById('contenedor-cuotas');
  const contenedorFrecuencia = document.getElementById('contenedor-frecuencia');
  const contenedorResumenCuota = document.getElementById('contenedor-resumen-cuota');
  const lblFechaVenc = document.getElementById('lbl-fecha-venc');

  let clientesDB = [];

  // Función para obtener clientes de la base de datos
  async function cargarClientesEnSelector() {
    if (!selectCpCliente) return;

    try {
      const res = await fetch('/api/clientes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      clientesDB = await res.json();
      selectCpCliente.innerHTML = '<option value="">-- Seleccione un cliente --</option>';

      if (!Array.isArray(clientesDB) || clientesDB.length === 0) {
        selectCpCliente.innerHTML = '<option value="">No hay clientes registrados</option>';
        return;
      }

      clientesDB.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.nombre} `;
        selectCpCliente.appendChild(opt);
      });
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      selectCpCliente.innerHTML = '<option value="">Error al cargar clientes</option>';
    }
  }

  // Autocompletar DNI y Celular al cambiar de cliente
  selectCpCliente?.addEventListener('change', (e) => {
    const seleccionado = clientesDB.find(c => String(c.id) === String(e.target.value));
    if (seleccionado) {
      if (inputCpDni) inputCpDni.value = seleccionado.dni || '';
      if (inputCpCelular) inputCpCelular.value = seleccionado.telefono || 'Sin celular';
    } else {
      if (inputCpDni) inputCpDni.value = '';
      if (inputCpCelular) inputCpCelular.value = '';
    }
  });

  // Cálculo de fecha de vencimiento
  function calcularProximoVencimiento() {
    const fechaTexto = inputCpFecha?.value;
    const fechaBase = fechaTexto ? new Date(fechaTexto + 'T00:00:00') : new Date();
    const modalidad = document.querySelector('input[name="modalidad_pago"]:checked')?.value || 'PROGRAMADO';
    let diasAgregar = 30;

    if (modalidad === 'PROGRAMADO') {
      const frec = selectCpFrecuencia?.value || 'MENSUAL';
      if (frec === 'SEMANAL') diasAgregar = 7;
      if (frec === 'QUINCENAL') diasAgregar = 15;
    }

    fechaBase.setDate(fechaBase.getDate() + diasAgregar);
    if (inputCpVencimiento) inputCpVencimiento.value = fechaBase.toISOString().split('T')[0];
  }

  // Cálculo de Total a Devolver y Cuota
  function calcularTotalesPrestamo() {
    const capital = parseFloat(inputCpMonto?.value) || 0;
    const tasa = parseFloat(inputCpInteres?.value) || 0;
    const modalidad = document.querySelector('input[name="modalidad_pago"]:checked')?.value || 'PROGRAMADO';
    const cuotas = modalidad === 'PAGO_UNICO' ? 1 : (parseInt(selectCpCuotas?.value, 10) || 1);

    if (capital > 0) {
      const interesTotal = capital * (tasa / 100);
      const totalDevolver = capital + interesTotal;
      const valorCuota = totalDevolver / cuotas;

      if (inputCpTotalDevolver) inputCpTotalDevolver.value = `S/ ${totalDevolver.toFixed(2)}`;
      if (inputCpEstimada) inputCpEstimada.value = `S/ ${valorCuota.toFixed(2)}`;
    } else {
      if (inputCpTotalDevolver) inputCpTotalDevolver.value = 'S/ 0.00';
      if (inputCpEstimada) inputCpEstimada.value = 'S/ 0.00';
    }
  }

// Alternar entre PROGRAMADO y PAGO ÚNICO asegurando simetría total
  radiosModalidad.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const esUnico = e.target.value === 'PAGO_UNICO';
      const modPrestamo = document.getElementById('mod-crear-prestamo');

      const grupoFrecuencia = document.getElementById('contenedor-frecuencia');
      const grupoCuotas = document.getElementById('contenedor-cuotas');
      const grupoValorCuota = document.getElementById('contenedor-resumen-cuota');

      if (esUnico) {
        modPrestamo?.classList.add('modo-pago-unico');

        if (grupoFrecuencia) grupoFrecuencia.classList.add('campo-oculto');
        if (grupoCuotas) grupoCuotas.classList.add('campo-oculto');
        if (grupoValorCuota) grupoValorCuota.classList.add('campo-oculto');

        if (lblFechaVenc) lblFechaVenc.textContent = 'FECHA LÍMITE DE PAGO TOTAL';
        if (selectCpCuotas) selectCpCuotas.value = '1';
      } else {
        modPrestamo?.classList.remove('modo-pago-unico');

        if (grupoFrecuencia) grupoFrecuencia.classList.remove('campo-oculto');
        if (grupoCuotas) grupoCuotas.classList.remove('campo-oculto');
        if (grupoValorCuota) grupoValorCuota.classList.remove('campo-oculto');

        if (lblFechaVenc) lblFechaVenc.textContent = 'FECHA PRIMER COBRO / VENCIMIENTO';
      }

      calcularProximoVencimiento();
      calcularTotalesPrestamo();
    });
  });

  // Inicializaciones al cargar pantalla
  if (inputCpFecha && !inputCpFecha.value) {
    inputCpFecha.value = hoyStr;
  }
  calcularProximoVencimiento();
  cargarClientesEnSelector();

  // Escuchadores de eventos para cálculos
  inputCpMonto?.addEventListener('input', calcularTotalesPrestamo);
  inputCpInteres?.addEventListener('input', calcularTotalesPrestamo);
  selectCpCuotas?.addEventListener('change', calcularTotalesPrestamo);
  selectCpFrecuencia?.addEventListener('change', () => {
    calcularProximoVencimiento();
    calcularTotalesPrestamo();
  });
  inputCpFecha?.addEventListener('change', calcularProximoVencimiento);

  // Botón ATRÁS
  document.getElementById('btn-atras-crear')?.addEventListener('click', () => {
    document.getElementById('mod-crear-prestamo')?.classList.add('hidden');
    document.getElementById('menu-grid')?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

// ==========================================================================
// MÓDULO 4: GESTIÓN DE CLIENTES (CRUD COMPLETO)
// ==========================================================================
async function procesarFormularioCliente(e) {
  if (e) e.preventDefault();

  const editId = document.getElementById('cli-edit-id')?.value;
  const tipo_doc = document.getElementById('cli-tipo-doc')?.value || 'DNI';
  const dni = (document.getElementById('cli-num-doc') || document.getElementById('cli-dni'))?.value?.trim();
  const nombre = (document.getElementById('cli-nombre') || document.getElementById('cli-razon-social'))?.value?.trim().toUpperCase();
  const telefono = (document.getElementById('cli-telefono') || document.getElementById('cli-celular'))?.value?.trim();
  const telefono_ref = (document.getElementById('cli-telefono-ref') || document.getElementById('cli-respaldo'))?.value?.trim() || '';
  const direccion = document.getElementById('cli-direccion')?.value?.trim() || '';
  const observaciones = (document.getElementById('cli-observaciones') || document.getElementById('cli-referencias'))?.value?.trim() || '';

  if (!dni || !nombre || !telefono) {
    alert('Por favor complete los campos obligatorios: Documento, Nombre y Celular.');
    return;
  }

  const payload = { tipo_doc, dni, nombre, telefono, telefono_ref, direccion, observaciones };
  const url = editId ? `/api/clientes/${editId}` : '/api/clientes';
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      alert(editId ? `¡Cliente ${nombre} actualizado correctamente!` : `¡Cliente ${nombre} guardado exitosamente!`);
      limpiarFormularioCliente();
      renderizarTablaClientes();
      if (typeof cargarClientesEnSelector === 'function') cargarClientesEnSelector();
      if (typeof cargarClientesEnPagosDirecto === 'function') cargarClientesEnPagosDirecto();
    } else {
      alert('Aviso: ' + (data.error || 'No se pudo procesar la solicitud'));
    }
  } catch (err) {
    console.error('Error en cliente:', err);
    alert('Error al conectar con el servidor.');
  }
}

async function renderizarTablaClientes() {
  const tbody = document.getElementById('tabla-clientes-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/clientes');
    const clientes = await res.json();
    tbody.innerHTML = '';

    if (!clientes || clientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:15px; color:#94a3b8;">No hay clientes registrados aún.</td></tr>';
      return;
    }

    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      tr.innerHTML = `
        <td style="padding: 10px; color: #cbd5e1;">${c.dni}</td>
        <td style="padding: 10px; font-weight: bold; color: #fff;">${c.nombre}</td>
        <td style="padding: 10px; color: #cbd5e1;">${c.telefono}</td>
        <td style="padding: 10px; color: #cbd5e1;">${c.direccion && c.direccion.trim() !== '' ? c.direccion : '-'}</td>
        <td style="padding: 10px; text-align: center; white-space: nowrap;">
          <button type="button" class="btn-editar-fila" style="background:#f39c12; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:6px; font-weight:bold;">✏️ EDITAR</button>
          <button type="button" class="btn-eliminar-fila" style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">🗑️</button>
        </td>
      `;

      tr.querySelector('.btn-editar-fila').addEventListener('click', () => cargarClienteParaEditar(c));
      tr.querySelector('.btn-eliminar-fila').addEventListener('click', () => eliminarCliente(c.id, c.nombre));

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al listar clientes:', err);
  }
}

function cargarClienteParaEditar(c) {
  const hiddenId = document.getElementById('cli-edit-id');
  if (hiddenId) hiddenId.value = c.id;

  if (document.getElementById('cli-tipo-doc')) document.getElementById('cli-tipo-doc').value = c.tipo_doc || 'DNI';
  if (document.getElementById('cli-num-doc')) document.getElementById('cli-num-doc').value = c.dni || '';
  if (document.getElementById('cli-nombre')) document.getElementById('cli-nombre').value = c.nombre || '';
  if (document.getElementById('cli-telefono')) document.getElementById('cli-telefono').value = c.telefono || '';
  if (document.getElementById('cli-telefono-ref')) document.getElementById('cli-telefono-ref').value = c.telefono_ref || '';
  if (document.getElementById('cli-direccion')) document.getElementById('cli-direccion').value = c.direccion || '';
  if (document.getElementById('cli-observaciones')) document.getElementById('cli-observaciones').value = c.observaciones || '';

  const btnGuardar = document.getElementById('btn-guardar-cliente') || document.querySelector('#form-registro-cliente button[type="submit"]');
  if (btnGuardar) {
    btnGuardar.textContent = 'ACTUALIZAR CLIENTE';
    btnGuardar.style.background = '#f39c12';
  }

  document.getElementById('mod-buscar-cliente')?.scrollIntoView({ behavior: 'smooth' });
}

async function eliminarCliente(id, nombre) {
  if (!confirm(`¿Estás seguro de eliminar a "${nombre}"?`)) return;

  try {
    const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      alert('Cliente eliminado correctamente.');
      renderizarTablaClientes();
      if (typeof cargarClientesEnSelector === 'function') cargarClientesEnSelector();
      if (typeof cargarClientesEnPagosDirecto === 'function') cargarClientesEnPagosDirecto();
    } else {
      alert('Aviso: ' + (data.error || 'No se pudo eliminar'));
    }
  } catch (err) {
    alert('Error al conectar con el servidor.');
  }
}

function limpiarFormularioCliente() {
  document.getElementById('form-registro-cliente')?.reset();
  const hiddenId = document.getElementById('cli-edit-id');
  if (hiddenId) hiddenId.value = '';

  const btnGuardar = document.getElementById('btn-guardar-cliente') || document.querySelector('#form-registro-cliente button[type="submit"]');
  if (btnGuardar) {
    btnGuardar.textContent = 'GUARDAR CLIENTE';
    btnGuardar.style.background = '';
  }
}

document.getElementById('form-registro-cliente')?.addEventListener('submit', procesarFormularioCliente);
document.getElementById('btn-cancelar-cliente')?.addEventListener('click', limpiarFormularioCliente);
document.getElementById('btn-atras-clientes')?.addEventListener('click', () => {
  document.getElementById('mod-buscar-cliente')?.classList.add('hidden');
  document.getElementById('menu-grid')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.querySelector('[data-target="mod-buscar-cliente"]')?.addEventListener('click', () => {
  renderizarTablaClientes();
});

// ==========================================================================
// MÓDULO 2: TABLA Y CRUD DE PRÉSTAMOS (ÚNICO SUBMIT SIN DUPLICAR)
// ==========================================================================
async function renderizarTablaPrestamos() {
  const tbody = document.getElementById('tabla-prestamos-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/prestamos');
    const prestamos = await res.json();
    tbody.innerHTML = '';

    if (!Array.isArray(prestamos) || prestamos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:15px; color:#94a3b8;">No hay préstamos registrados aún.</td></tr>';
      return;
    }

    prestamos.forEach((p, index) => {
      const correlativo = index + 1;
      const fechaVenc = p.fecha_vencimiento ? p.fecha_vencimiento.split('T')[0] : '-';
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      tr.innerHTML = `
        <td style="padding: 10px; color: #94a3b8; font-weight: bold;">#${correlativo}</td>
        <td style="padding: 10px; font-weight: bold; color: #fff;">${p.cliente_nombre || 'Cliente #' + p.cliente_id}</td>
        <td style="padding: 10px; color: #cbd5e1;">S/ ${parseFloat(p.monto || 0).toFixed(2)}</td>
        <td style="padding: 10px; color: #cbd5e1;">S/ ${parseFloat(p.monto_total || 0).toFixed(2)}</td>
        <td style="padding: 10px; color: #38bdf8; font-weight: bold;">S/ ${parseFloat(p.saldo_actual || p.monto_total || 0).toFixed(2)}</td>
        <td style="padding: 10px; color: #f59e0b;">${fechaVenc}</td>
        <td style="padding: 10px;"><span style="background: rgba(16,185,129,0.2); color:#10b981; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">${p.estado || 'ACTIVO'}</span></td>
        <td style="padding: 10px; text-align: center; white-space: nowrap;">
          <button type="button" class="btn-editar-pres" style="background:#f39c12; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:6px; font-weight:bold;">✏️ EDITAR</button>
          <button type="button" class="btn-eliminar-pres" style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">🗑️</button>
        </td>
      `;

      tr.querySelector('.btn-editar-pres').addEventListener('click', () => cargarPrestamoParaEditar(p));
      tr.querySelector('.btn-eliminar-pres').addEventListener('click', () => eliminarPrestamo(p.id));

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al renderizar préstamos:', err);
  }
}

// Cargar tabla al inicio
renderizarTablaPrestamos();

// 1. Guardar (POST) o Actualizar (PUT) - ÚNICO EVENTO
document.getElementById('form-nuevo-prestamo')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const selectCliente = document.getElementById('cp-cliente-select');
  if (!selectCliente || !selectCliente.value) {
    alert('Por favor selecciona un cliente de la lista.');
    return;
  }

  const hiddenId = document.getElementById('prestamo-edit-id');
  const editId = hiddenId && hiddenId.value.trim() !== '' ? hiddenId.value.trim() : null;

  const modalidad = document.querySelector('input[name="modalidad_pago"]:checked')?.value || 'PROGRAMADO';
  const monto = parseFloat(document.getElementById('cp-monto')?.value) || 0;
  const tasa = parseFloat(document.getElementById('cp-interes')?.value) || 0;
  const cuotas = modalidad === 'PAGO_UNICO' ? 1 : (parseInt(document.getElementById('cp-cuotas')?.value, 10) || 1);

  const inputTotal = document.getElementById('cp-total-devolver');
  const montoTotal = inputTotal 
    ? parseFloat(inputTotal.value.replace(/[^0-9.-]+/g, '')) 
    : (monto + (monto * (tasa / 100)));

  const payload = {
    cliente_id: parseInt(selectCliente.value, 10),
    monto: monto,
    tasa_interes: tasa,
    fecha_prestamo: document.getElementById('cp-fecha')?.value,
    fecha_vencimiento: document.getElementById('cp-fecha-vencimiento')?.value,
    modalidad: modalidad,
    frecuencia: document.getElementById('cp-frecuencia')?.value || 'MENSUAL',
    cuotas: cuotas,
    monto_total: montoTotal
  };

  const url = editId ? `/api/prestamos/${editId}` : '/api/prestamos';
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert(editId ? '¡Préstamo actualizado exitosamente!' : '¡Préstamo registrado exitosamente!');
      limpiarFormularioPrestamo();
      renderizarTablaPrestamos();
    } else {
      alert('Error: ' + (data.error || 'No se pudo procesar la solicitud'));
    }
  } catch (err) {
    console.error(err);
    alert('Error al conectar con el servidor.');
  }
});

// 2. Subir datos al formulario para editar
function cargarPrestamoParaEditar(p) {
  let hiddenId = document.getElementById('prestamo-edit-id');
  if (!hiddenId) {
    hiddenId = document.createElement('input');
    hiddenId.type = 'hidden';
    hiddenId.id = 'prestamo-edit-id';
    document.getElementById('form-nuevo-prestamo')?.appendChild(hiddenId);
  }
  hiddenId.value = String(p.id);

  const selectCliente = document.getElementById('cp-cliente-select');
  if (selectCliente) {
    selectCliente.value = p.cliente_id;
    selectCliente.dispatchEvent(new Event('change'));
  }

  if (document.getElementById('cp-monto')) document.getElementById('cp-monto').value = p.monto;
  if (document.getElementById('cp-interes')) document.getElementById('cp-interes').value = p.tasa_interes;
  if (document.getElementById('cp-fecha')) document.getElementById('cp-fecha').value = p.fecha_prestamo ? p.fecha_prestamo.split('T')[0] : '';
  if (document.getElementById('cp-fecha-vencimiento')) document.getElementById('cp-fecha-vencimiento').value = p.fecha_vencimiento ? p.fecha_vencimiento.split('T')[0] : '';
  if (document.getElementById('cp-frecuencia')) document.getElementById('cp-frecuencia').value = p.frecuencia || 'MENSUAL';
  if (document.getElementById('cp-cuotas')) document.getElementById('cp-cuotas').value = p.cuotas || 1;

  const radioMod = document.querySelector(`input[name="modalidad_pago"][value="${p.modalidad}"]`);
  if (radioMod) {
    radioMod.checked = true;
    radioMod.dispatchEvent(new Event('change'));
  }

  const btnGuardar = document.querySelector('#form-nuevo-prestamo button[type="submit"]');
  if (btnGuardar) {
    btnGuardar.textContent = 'ACTUALIZAR PRÉSTAMO';
    btnGuardar.style.background = '#f39c12';
  }

  if (typeof calcularTotalesPrestamo === 'function') calcularTotalesPrestamo();
  document.getElementById('mod-crear-prestamo')?.scrollIntoView({ behavior: 'smooth' });
}

// 3. Eliminar préstamo
async function eliminarPrestamo(id) {
  if (!confirm(`¿Estás seguro de eliminar el préstamo #${id}?`)) return;

  try {
    const res = await fetch(`/api/prestamos/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      alert('Préstamo eliminado exitosamente');
      renderizarTablaPrestamos();
    } else {
      alert('Aviso: ' + (data.error || 'No se pudo eliminar'));
    }
  } catch (err) {
    alert('Error al conectar con el servidor.');
  }
}

// 4. Limpiar Formulario completamente
function limpiarFormularioPrestamo() {
  document.getElementById('form-nuevo-prestamo')?.reset();

  const hiddenId = document.getElementById('prestamo-edit-id');
  if (hiddenId) hiddenId.value = '';

  const btnGuardar = document.querySelector('#form-nuevo-prestamo button[type="submit"]');
  if (btnGuardar) {
    btnGuardar.textContent = 'GUARDAR PRÉSTAMO';
    btnGuardar.style.background = '';
  }

  if (document.getElementById('cp-dni')) document.getElementById('cp-dni').value = '';
  if (document.getElementById('cp-celular')) document.getElementById('cp-celular').value = '';
  if (document.getElementById('cp-total-devolver')) document.getElementById('cp-total-devolver').value = 'S/ 0.00';
  if (document.getElementById('cp-cuota-estimada')) document.getElementById('cp-cuota-estimada').value = 'S/ 0.00';
  if (typeof hoyStr !== 'undefined' && document.getElementById('cp-fecha')) document.getElementById('cp-fecha').value = hoyStr;
  if (typeof calcularProximoVencimiento === 'function') calcularProximoVencimiento();
}

// Botones y aperturas de módulo
document.querySelector('#form-nuevo-prestamo button[type="reset"]')?.addEventListener('click', (e) => {
  e.preventDefault();
  limpiarFormularioPrestamo();
});
document.getElementById('btn-cancelar-prestamo')?.addEventListener('click', limpiarFormularioPrestamo);

document.querySelector('[data-target="mod-crear-prestamo"]')?.addEventListener('click', () => {
  renderizarTablaPrestamos();
});
});

// ==========================================================================
// MÓDULO 1: INGRESO DE PAGO (SELECTOR DE CLIENTES Y DEUDAS)
// ==========================================================================
async function cargarClientesEnPagosDirecto() {
  const selPagoCliente = document.getElementById('pago-cliente');
  if (!selPagoCliente) return;

  try {
    const res = await fetch('/api/clientes');
    if (!res.ok) throw new Error('Error al conectar');
    const clientes = await res.json();

    selPagoCliente.innerHTML = '<option value="">-- Seleccione un cliente --</option>';

    if (!clientes || clientes.length === 0) {
      selPagoCliente.innerHTML = '<option value="">No hay clientes registrados</option>';
      return;
    }

    clientes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      selPagoCliente.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando clientes en pagos:', err);
    selPagoCliente.innerHTML = '<option value="">Error al cargar clientes</option>';
  }
}

// Cargar préstamos activos al elegir un cliente en Pagos
document.getElementById('pago-cliente')?.addEventListener('change', async (e) => {
  const clienteId = e.target.value;
  const selDeuda = document.getElementById('pago-prestamo-deuda');
  if (!selDeuda) return;

  selDeuda.innerHTML = '<option value="">Cargando préstamos...</option>';
  selDeuda.disabled = true;

  if (!clienteId) {
    selDeuda.innerHTML = '<option value="">Primero seleccione un cliente...</option>';
    return;
  }

  try {
    const res = await fetch(`/api/prestamos/cliente/${clienteId}`);
    const prestamos = await res.json();

    selDeuda.innerHTML = '';
    if (!prestamos || prestamos.length === 0) {
      selDeuda.innerHTML = '<option value="">Sin deudas activas</option>';
      return;
    }

    selDeuda.innerHTML = '<option value="">Seleccione un préstamo...</option>';
    prestamos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `Préstamo #${p.id} - Saldo: S/ ${parseFloat(p.saldo_actual || 0).toFixed(2)}`;
      selDeuda.appendChild(opt);
    });
    selDeuda.disabled = false;
  } catch (err) {
    console.error('Error al traer préstamos del cliente:', err);
    selDeuda.innerHTML = '<option value="">Error al cargar deudas</option>';
  }
});

// Disparadores automáticos al abrir el módulo
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-target="mod-ingreso-pago"]') || e.target.closest('#btn-ingreso-pago')) {
    cargarClientesEnPagosDirecto();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  cargarClientesEnPagosDirecto();
});

// Ejecución inmediata
cargarClientesEnPagosDirecto();