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

  // Envío final del formulario y guardado en SQLite
  document.getElementById('form-nuevo-prestamo')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectCpCliente || !selectCpCliente.value) {
      alert('Por favor, selecciona un cliente de la lista.');
      return;
    }

    const modalidadActual = document.querySelector('input[name="modalidad_pago"]:checked')?.value || 'PROGRAMADO';
    const payload = {
      cliente_id: parseInt(selectCpCliente.value, 10),
      monto: parseFloat(inputCpMonto.value),
      tasa_interes: parseFloat(inputCpInteres.value),
      fecha_prestamo: inputCpFecha.value,
      fecha_vencimiento: inputCpVencimiento.value,
      modalidad: modalidadActual,
      frecuencia: selectCpFrecuencia?.value || 'MENSUAL',
      plazo_cuotas: modalidadActual === 'PAGO_UNICO' ? 1 : (parseInt(selectCpCuotas.value, 10) || 1)
    };

    try {
      const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert('¡Préstamo registrado exitosamente en la base de datos!');
        e.target.reset();
        if (inputCpDni) inputCpDni.value = '';
        if (inputCpCelular) inputCpCelular.value = '';
        if (inputCpFecha) inputCpFecha.value = hoyStr;
        if (inputCpTotalDevolver) inputCpTotalDevolver.value = 'S/ 0.00';
        if (inputCpEstimada) inputCpEstimada.value = 'S/ 0.00';
        calcularProximoVencimiento();
      } else {
        alert('Error al registrar préstamo: ' + (data.error || 'Problema en el servidor'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  });

  // --- CONTROL DEL REGISTRO DE CLIENTES ---
  const modalCliente = document.getElementById('modal-nuevo-cliente');
  const btnNuevoCliente = document.getElementById('btn-nuevo-cliente'); // Tu botón "+ Nuevo Cliente"
  const btnCerrarModalCli = document.getElementById('btn-cerrar-modal-cli');
  const formRegistroCliente = document.getElementById('form-registro-cliente');
  const selectTipoDoc = document.getElementById('cli-tipo-doc');
  const inputNumDoc = document.getElementById('cli-num-doc');

  btnNuevoCliente?.addEventListener('click', () => {
    modalCliente?.classList.remove('hidden');
  });

  btnCerrarModalCli?.addEventListener('click', () => {
    modalCliente?.classList.add('hidden');
    formRegistroCliente?.reset();
  });

  // Ajustar límite de dígitos según DNI (8) o RUC (11)
  selectTipoDoc?.addEventListener('change', (e) => {
    if (e.target.value === 'DNI') {
      inputNumDoc.maxLength = 8;
      inputNumDoc.placeholder = '8 dígitos';
    } else {
      inputNumDoc.maxLength = 11;
      inputNumDoc.placeholder = '11 dígitos';
    }
  });

  // Envío del nuevo cliente a la BD
  formRegistroCliente?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      tipo_doc: selectTipoDoc.value,
      dni: inputNumDoc.value,
      nombre: document.getElementById('cli-nombre').value,
      telefono: document.getElementById('cli-telefono').value,
      telefono_ref: document.getElementById('cli-telefono-ref')?.value || '',
      direccion: document.getElementById('cli-direccion')?.value || '',
      observaciones: document.getElementById('cli-observaciones')?.value || ''
    };

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Cliente registrado con éxito!');
        formRegistroCliente.reset();
        modalCliente.classList.add('hidden');
        cargarClientesEnSelector(); // Actualiza en vivo el selector del módulo Préstamos
      } else {
        alert('Error: ' + (data.error || 'No se pudo registrar el cliente'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
    }
  });
  // Botón ATRÁS para volver al menú principal desde Clientes
  document.getElementById('btn-atras-clientes')?.addEventListener('click', () => {
    document.getElementById('mod-buscar-cliente')?.classList.add('hidden');
    document.getElementById('menu-grid')?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
    });

    