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
        setTimeout(() => {
          if (typeof inicializarGraficos === 'function') inicializarGraficos();
        }, 100);
      }
      if (targetId === 'mod-consulta') {
        cargarResumenFinanciero();
      }
    });
  });

 btnThemeToggle?.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      btnThemeToggle.innerHTML = '☀️ <span>MODO OSCURO</span>';
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      btnThemeToggle.innerHTML = '🌙 <span>MODO CLARO</span>';
    }

    // Redibujar gráficos si el módulo está abierto
    const modGraf = document.getElementById('mod-graficos');
    if (modGraf && !modGraf.classList.contains('hidden')) {
      if (typeof inicializarGraficos === 'function') inicializarGraficos();
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

// ==========================================================================
// MÓDULO 6: ALERTAS DE COBRANZA Y VENCIMIENTOS (EVENTO Y FICHA REPARADOS)
// ==========================================================================
let listaCobranzasDB = [];

async function cargarAlertasCobranza() {
  const listaContenedor = document.getElementById('lista-cobranzas');
  const cntRojo = document.getElementById('contador-rojo');
  const cntAmarillo = document.getElementById('contador-amarillo');
  const cntVerde = document.getElementById('contador-verde');

  if (listaContenedor) {
    listaContenedor.innerHTML = '<p style="color: #94a3b8; text-align: center;">Cargando cobros pendientes...</p>';
  }

  // Restablecer panel de detalle al estado inicial
  const vacio = document.getElementById('detalle-info-vacio');
  const contenido = document.getElementById('detalle-info-contenido');
  const acciones = document.getElementById('acciones-cobro');

  if (vacio) {
    vacio.classList.remove('hidden');
    vacio.style.display = 'block';
  }
  if (contenido) {
    contenido.classList.add('hidden');
    contenido.style.display = 'none';
  }
  if (acciones) {
    acciones.classList.add('hidden');
    acciones.style.display = 'none';
  }

  try {
    const res = await fetch('/api/cobranzas');
    const cobros = await res.json();
    listaCobranzasDB = Array.isArray(cobros) ? cobros : [];

    let cRojo = 0;
    let cAmarillo = 0;
    let cVerde = 0;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (listaCobranzasDB.length === 0) {
      if (listaContenedor) {
        listaContenedor.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 2rem;">No hay cuentas pendientes por cobrar 🎉</p>';
      }
      if (cntRojo) cntRojo.textContent = '0';
      if (cntAmarillo) cntAmarillo.textContent = '0';
      if (cntVerde) cntVerde.textContent = '0';
      return;
    }

    let itemsHTML = '';

    listaCobranzasDB.forEach(item => {
      const fVencStr = item.fecha_vencimiento ? item.fecha_vencimiento.split('T')[0] : '';
      const fVenc = fVencStr ? new Date(fVencStr + 'T00:00:00') : new Date();
      
      const diffTiempo = fVenc.getTime() - hoy.getTime();
      const diasRestantes = Math.round(diffTiempo / (1000 * 60 * 60 * 24));

      let badgeColor = '#10b981';
      let badgeTexto = `En plazo (${diasRestantes}d)`;
      let bordeColor = 'rgba(16, 185, 129, 0.4)';

      if (diasRestantes < 0) {
        cRojo++;
        badgeColor = '#ef4444';
        badgeTexto = `Vencido (${Math.abs(diasRestantes)}d)`;
        bordeColor = 'rgba(239, 68, 68, 0.5)';
      } else if (diasRestantes <= 3) {
        cAmarillo++;
        badgeColor = '#f59e0b';
        badgeTexto = diasRestantes === 0 ? '¡VENCE HOY!' : `Vence en ${diasRestantes}d`;
        bordeColor = 'rgba(245, 158, 11, 0.5)';
      } else {
        cVerde++;
      }

      // Se usa data-id en lugar de onclick inline para evitar colisiones
      itemsHTML += `
        <div class="item-cobro-card" data-id="${item.prestamo_id}" style="background: rgba(255,255,255,0.03); border: 1px solid ${bordeColor}; border-left: 5px solid ${badgeColor}; border-radius: 8px; padding: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
            <strong style="color: #fff; font-size: 0.95rem;">${item.nombre}</strong>
            <span style="color: ${badgeColor}; font-weight: bold; font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">${badgeTexto}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.85rem; color: #94a3b8; pointer-events: none;">
            <span>Saldo: <b style="color: #38bdf8;">S/ ${parseFloat(item.saldo_actual || 0).toFixed(2)}</b></span>
            <span>Vence: ${fVencStr}</span>
          </div>
        </div>
      `;
    });

    if (listaContenedor) {
      listaContenedor.innerHTML = itemsHTML;

      // Event listener a prueba de fallos para cada tarjeta generada
      listaContenedor.querySelectorAll('.item-cobro-card').forEach(card => {
        card.addEventListener('click', () => {
          // Destacar visualmente la tarjeta activa
          listaContenedor.querySelectorAll('.item-cobro-card').forEach(c => c.style.background = 'rgba(255,255,255,0.03)');
          card.style.background = 'rgba(56, 189, 248, 0.15)';

          const prestamoId = card.getAttribute('data-id');
          mostrarFichaCobranzaDetallada(prestamoId);
        });
      });
    }

    if (cntRojo) cntRojo.textContent = cRojo;
    if (cntAmarillo) cntAmarillo.textContent = cAmarillo;
    if (cntVerde) cntVerde.textContent = cVerde;

  } catch (err) {
    console.error('Error al cargar cobranzas:', err);
    if (listaContenedor) {
      listaContenedor.innerHTML = '<p style="color: #ef4444; text-align: center;">Error al cargar las alertas.</p>';
    }
  }
}

// Función encargada de poblar la ficha y mostrar botones
function mostrarFichaCobranzaDetallada(prestamoId) {
  // Conversión con Number() para evitar fallas de comparación entre String e Int
  const item = listaCobranzasDB.find(c => Number(c.prestamo_id) === Number(prestamoId));
  if (!item) return;

  const vacio = document.getElementById('detalle-info-vacio');
  const contenido = document.getElementById('detalle-info-contenido');
  const acciones = document.getElementById('acciones-cobro');

  if (vacio) {
    vacio.classList.add('hidden');
    vacio.style.setProperty('display', 'none', 'important');
  }
  if (contenido) {
    contenido.classList.remove('hidden');
    contenido.style.setProperty('display', 'flex', 'important');
  }
  if (acciones) {
    acciones.classList.remove('hidden');
    acciones.style.setProperty('display', 'flex', 'important');
  }

  const fVenc = item.fecha_vencimiento ? item.fecha_vencimiento.split('T')[0] : '-';
  const saldoFmt = `S/ ${parseFloat(item.saldo_actual || 0).toFixed(2)}`;
  const numeroTel = item.telefono ? String(item.telefono).replace(/[^0-9]/g, '') : '';

  // Actualizar datos de texto
  const elCliente = document.getElementById('det-cliente');
  const elTel = document.getElementById('det-telefono');
  const elAval = document.getElementById('det-aval');
  const elFecha = document.getElementById('det-fecha');
  const elSaldo = document.getElementById('det-saldo');

  if (elCliente) elCliente.textContent = item.nombre || 'Sin nombre';
  if (elTel) elTel.textContent = item.telefono || 'Sin teléfono';
  if (elAval) elAval.textContent = item.telefono_ref || 'Sin respaldo';
  if (elFecha) elFecha.textContent = fVenc;
  if (elSaldo) elSaldo.textContent = saldoFmt;

  // Botón WhatsApp directo
  const btnWs = document.getElementById('btn-whatsapp-cobro');
  if (btnWs) {
    if (numeroTel.length >= 9) {
      const mensaje = encodeURIComponent(
        `Estimado(a) *${item.nombre}*,\n` +
        `Le saludamos de *Técnico Rojas* para informarle sobre su crédito:\n\n` +
        `📅 *Vencimiento:* ${fVenc}\n` +
        `💰 *Saldo Pendiente:* ${saldoFmt}\n\n` +
        `Por favor, comuníquese con nosotros para coordinar su pago a la brevedad. ¡Muchas gracias!`
      );
      btnWs.href = `https://wa.me/51${numeroTel}?text=${mensaje}`;
      btnWs.style.pointerEvents = 'auto';
      btnWs.style.opacity = '1';
    } else {
      btnWs.removeAttribute('href');
      btnWs.style.pointerEvents = 'none';
      btnWs.style.opacity = '0.4';
    }
  }

  // Botón Llamar directo
  const btnTel = document.getElementById('btn-llamar-cobro');
  if (btnTel) {
    if (numeroTel) {
      btnTel.href = `tel:${numeroTel}`;
      btnTel.style.pointerEvents = 'auto';
      btnTel.style.opacity = '1';
    } else {
      btnTel.removeAttribute('href');
      btnTel.style.pointerEvents = 'none';
      btnTel.style.opacity = '0.4';
    }
  }

  // Botón Cobrar Directo (Navega al módulo de cobro con cliente preseleccionado)
  const btnCobrar = document.getElementById('btn-cobrar-directo');
  if (btnCobrar) {
    btnCobrar.onclick = () => {
      document.getElementById('mod-cobranza')?.classList.add('hidden');
      const modPagos = document.getElementById('mod-ingreso-pago');
      if (modPagos) {
        modPagos.classList.remove('hidden');
        if (typeof cargarClientesEnPagosDirecto === 'function') cargarClientesEnPagosDirecto();

        setTimeout(() => {
          const selCli = document.getElementById('pago-cliente');
          if (selCli) {
            selCli.value = item.cliente_id;
            selCli.dispatchEvent(new Event('change'));
          }
        }, 150);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
}



// ==========================================================================
// MÓDULO: CONSULTA FINANCIERA (CARGA Y RENDER)
// ==========================================================================
let datosFinancierosDB = [];

async function cargarConsultaFinanciera() {
  try {
    const res = await fetch('/api/reporte-financiero');
    if (!res.ok) throw new Error('Error al consultar endpoint financiero');
    const data = await res.json();

    const r = data.resumen || {};
    const elCap = document.getElementById('cf-capital-prestado');
    const elRec = document.getElementById('cf-total-recaudado');
    const elSal = document.getElementById('cf-saldo-cobrar');
    const elGan = document.getElementById('cf-ganancia-total');

    if (elCap) elCap.textContent = `S/ ${parseFloat(r.capital_prestado || 0).toFixed(2)}`;
    if (elRec) elRec.textContent = `S/ ${parseFloat(r.total_recaudado || 0).toFixed(2)}`;
    if (elSal) elSal.textContent = `S/ ${parseFloat(r.saldo_por_cobrar || 0).toFixed(2)}`;
    if (elGan) elGan.textContent = `S/ ${parseFloat(r.ganancia_proyectada || 0).toFixed(2)}`;

    datosFinancierosDB = Array.isArray(data.prestamos) ? data.prestamos : [];
    renderizarTablaFinanciera(datosFinancierosDB);
  } catch (err) {
    console.error('Error cargando balance financiero:', err);
  }
}

function renderizarTablaFinanciera(prestamos) {
  const tbody = document.getElementById('tabla-financiera-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!prestamos || prestamos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:15px; color:#94a3b8;">No se encontraron préstamos registrados.</td></tr>';
    return;
  }

  prestamos.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

    const estadoColor = p.estado === 'ACTIVO' ? '#10b981' : '#64748b';

    tr.innerHTML = `
      <td style="padding: 10px; color: #94a3b8; font-weight: bold;">#${idx + 1}</td>
      <td style="padding: 10px; font-weight: bold; color: #fff;">${p.cliente_nombre}</td>
      <td style="padding: 10px; color: #cbd5e1;">S/ ${parseFloat(p.monto || 0).toFixed(2)}</td>
      <td style="padding: 10px; color: #cbd5e1;">S/ ${parseFloat(p.monto_total || 0).toFixed(2)}</td>
      <td style="padding: 10px; color: #10b981;">S/ ${parseFloat(p.total_pagado || 0).toFixed(2)}</td>
      <td style="padding: 10px; color: #f59e0b; font-weight: bold;">S/ ${parseFloat(p.saldo_actual || 0).toFixed(2)}</td>
      <td style="padding: 10px; color: #c084fc; font-weight: bold;">+S/ ${parseFloat(p.ganancia_estimada || 0).toFixed(2)}</td>
      <td style="padding: 10px;"><span style="background: rgba(255,255,255,0.05); color:${estadoColor}; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">${p.estado}</span></td>
    `;
    tbody.appendChild(tr);
  });
}


// ==========================================================================
// FILTROS, EXPORTACIÓN Y EVENTOS DE CONSULTA FINANCIERA
// ==========================================================================

// Buscador en tiempo real y filtro por estado
function filtrarTablaFinanciera() {
  const texto = document.getElementById('cf-buscador')?.value.trim().toLowerCase() || '';
  const estado = document.getElementById('cf-filtro-estado')?.value || 'TODOS';

  const filtrados = datosFinancierosDB.filter(p => {
    const coincideTexto = p.cliente_nombre.toLowerCase().includes(texto) || 
                          (p.cliente_dni && p.cliente_dni.includes(texto));
    const coincideEstado = (estado === 'TODOS') || (p.estado === estado);
    return coincideTexto && coincideEstado;
  });

  renderizarTablaFinanciera(filtrados);
}

document.getElementById('cf-buscador')?.addEventListener('input', filtrarTablaFinanciera);
document.getElementById('cf-filtro-estado')?.addEventListener('change', filtrarTablaFinanciera);

// Descargar archivo Excel (CSV)
document.getElementById('btn-exportar-excel')?.addEventListener('click', () => {
  if (datosFinancierosDB.length === 0) {
    alert('No hay información disponible para exportar.');
    return;
  }

  let csv = 'Correlativo,Cliente,DNI,Capital_Entregado,Total_Pactado,Monto_Cobrado,Saldo_Pendiente,Ganancia_Interes,Estado\n';
  datosFinancierosDB.forEach((p, idx) => {
    csv += `${idx + 1},"${p.cliente_nombre}","${p.cliente_dni || ''}",${p.monto},${p.monto_total},${p.total_pagado},${p.saldo_actual},${p.ganancia_estimada},${p.estado}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `Flujo_Financiero_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Botón ATRÁS de Consulta Financiera
document.getElementById('btn-atras-financiero')?.addEventListener('click', () => {
  document.getElementById('mod-consulta-financiero')?.classList.add('hidden');
  document.getElementById('menu-grid')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Abrir el módulo desde el menú principal
document.querySelector('[data-target="mod-consulta-financiero"]')?.addEventListener('click', () => {
  document.getElementById('menu-grid')?.classList.add('hidden');
  document.getElementById('mod-consulta-financiero')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cargarConsultaFinanciera();
});

// ==========================================================================
// CONTROL DE BOTONES: CLIENTES (LIMPIAR Y ATRÁS)
// ==========================================================================
function limpiarFormularioCliente() {
  document.getElementById('form-registro-cliente')?.reset();

  const hiddenId = document.getElementById('cli-edit-id');
  if (hiddenId) hiddenId.value = '';

  const btnGuardar = document.getElementById('btn-guardar-cliente') || 
                     document.querySelector('#form-registro-cliente button[type="submit"]');
  if (btnGuardar) {
    btnGuardar.textContent = 'GUARDAR CLIENTE';
    btnGuardar.style.background = '';
  }
}

// Botón Cancelar / Limpiar
document.getElementById('btn-cancelar-cliente')?.addEventListener('click', (e) => {
  e.preventDefault();
  limpiarFormularioCliente();
});

// Botón ATRÁS
document.getElementById('btn-atras-cliente')?.addEventListener('click', () => {
  limpiarFormularioCliente();
  document.getElementById('mod-buscar-cliente')?.classList.add('hidden');
  document.getElementById('menu-grid')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Botón ATRÁS del módulo de Cobranza
document.getElementById('btn-atras-cobranza')?.addEventListener('click', () => {
  document.getElementById('mod-cobranza')?.classList.add('hidden');
  document.getElementById('menu-grid')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Al hacer clic en la tarjeta del Menú Principal
document.querySelector('[data-target="mod-cobranza"]')?.addEventListener('click', () => {
  cargarAlertasCobranza();
});

// ==========================================================================
// MÓDULO 5: RENDERIZADO DE GRÁFICOS Y ANÁLISIS REALES (CHART.JS + SQL)
// ==========================================================================
let chartCarteraInstancia = null;
let chartClientesInstancia = null;
let chartFlujoInstancia = null;

async function inicializarGraficos() {
  try {
    const res = await fetch('/api/metricas-graficos');
    if (!res.ok) throw new Error('Error al conectar con endpoint de métricas');
    const data = await res.json();

    // 1. Gráfico Circular (Cartera Vigente)
    const canvasCartera = document.getElementById('chart-cartera');
    if (canvasCartera) {
      const ctxCartera = canvasCartera.getContext('2d');
      if (chartCarteraInstancia) chartCarteraInstancia.destroy();

      const saldo = parseFloat(data.cartera.saldo_pendiente || 0);
      const cobrado = parseFloat(data.cartera.capital_recuperado || 0);

      chartCarteraInstancia = new Chart(ctxCartera, {
        type: 'doughnut',
        data: {
          labels: ['Por Cobrar (Saldo)', 'Recuperado (Abonos)'],
          datasets: [{
            data: [saldo, cobrado],
            backgroundColor: ['#f59e0b', '#10b981'],
            borderColor: '#0f172a',
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 } } },
            tooltip: {
              callbacks: { label: (ctx) => ` S/ ${Number(ctx.raw || 0).toFixed(2)}` }
            }
          }
        }
      });
    }

    // 2. Gráfico Horizontal (Top Clientes Cumplidos)
    const canvasClientes = document.getElementById('chart-clientes');
    if (canvasClientes) {
      const ctxClientes = canvasClientes.getContext('2d');
      if (chartClientesInstancia) chartClientesInstancia.destroy();

      const nombres = data.topClientes.map(c => c.nombre);
      const montos = data.topClientes.map(c => parseFloat(c.total_pagado || 0));

      chartClientesInstancia = new Chart(ctxClientes, {
        type: 'bar',
        data: {
          labels: nombres.length ? nombres : ['Sin pagos aún'],
          datasets: [{
            label: 'Total Pagado (S/)',
            data: montos.length ? montos : [0],
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => ` S/ ${Number(ctx.raw || 0).toFixed(2)}` }
            }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { display: false } }
          }
        }
      });
    }

   // 3. Gráfico Comparativo Mensual
    const elFlujo = document.getElementById('chart-flujo-mensual');
    if (elFlujo) {
      if (chartFlujoInstancia) chartFlujoInstancia.destroy();

      const meses = (data.flujo && data.flujo.meses) ? data.flujo.meses : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set'];
      const prestamos = (data.flujo && data.flujo.prestamos) ? data.flujo.prestamos : [0, 0, 0, 0, 0, 0, 0, 0, 1500];
      const recaudado = (data.flujo && data.flujo.recaudado) ? data.flujo.recaudado : [0, 0, 0, 0, 0, 0, 0, 0, 0];

      chartFlujoInstancia = new Chart(elFlujo.getContext('2d'), {
        type: 'bar',
        data: {
          labels: meses,
          datasets: [
            {
              label: 'Préstamos Emitidos',
              data: prestamos,
              backgroundColor: 'rgba(56, 189, 248, 0.75)',
              borderColor: '#38bdf8',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'Ingresos / Recaudado',
              data: recaudado,
              backgroundColor: 'rgba(192, 132, 252, 0.75)',
              borderColor: '#c084fc',
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'top', 
              labels: { color: '#cbd5e1', font: { size: 11 } } 
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: S/ ${Number(ctx.raw || 0).toFixed(2)}`
              }
            }
          },
          scales: {
            x: { 
              ticks: { color: '#94a3b8' }, 
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: { 
              beginAtZero: true, 
              ticks: { color: '#94a3b8' }, 
              grid: { color: 'rgba(255,255,255,0.05)' } 
            }
          }
        }
      });
    }

  } catch (err) {
    console.error('Error inicializando gráficos:', err);
  }
}

// Botón ATRÁS del módulo de Gráficos
document.getElementById('btn-atras-graficos')?.addEventListener('click', () => {
  document.getElementById('mod-graficos')?.classList.add('hidden');
  document.getElementById('menu-grid')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==========================================================================
// CONTROL DE ACCESO Y SEGURIDAD (SESIÓN TEMPORAL POR PESTAÑA/NAVEGADOR)
// ==========================================================================
function verificarAutenticacion() {
  // Ahora usa sessionStorage: se destruye automáticamente al cerrar el navegador
  const sesion = sessionStorage.getItem('sesion_activa_rojas');
  const modalLogin = document.getElementById('modal-login-overlay');

  if (!sesion) {
    if (modalLogin) {
      modalLogin.style.setProperty('display', 'flex', 'important');
      modalLogin.classList.remove('hidden');
    }
  } else {
    if (modalLogin) {
      modalLogin.style.setProperty('display', 'none', 'important');
      modalLogin.classList.add('hidden');
    }
  }
}

verificarAutenticacion();

// Función global de Login
window.ejecutarLogin = async function(e) {
  if (e) e.preventDefault();

  const inputUser = document.getElementById('login-usuario');
  const inputPass = document.getElementById('login-password');
  const errorMsg = document.getElementById('login-error-msg');
  const btnSubmit = document.getElementById('btn-iniciar-sesion');

  const usuario = inputUser ? inputUser.value.trim() : '';
  const password = inputPass ? inputPass.value.trim() : '';

  if (!usuario || !password) {
    if (errorMsg) {
      errorMsg.textContent = 'Por favor escribe usuario y contraseña';
      errorMsg.style.display = 'block';
    }
    return;
  }

  if (errorMsg) errorMsg.style.display = 'none';
  if (btnSubmit) {
    btnSubmit.textContent = 'VERIFICANDO...';
    btnSubmit.disabled = true;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Guardar en sessionStorage (se borra al cerrar ventana/navegador)
      sessionStorage.setItem('sesion_activa_rojas', data.token);

      // Limpiar por si había quedado algo viejo en localStorage
      localStorage.removeItem('sesion_activa_rojas');

      const modal = document.getElementById('modal-login-overlay');
      if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.classList.add('hidden');
      }
      if (inputPass) inputPass.value = '';
    } else {
      if (errorMsg) {
        errorMsg.textContent = data.error || 'Usuario o contraseña incorrectos';
        errorMsg.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Error en login:', err);
    if (errorMsg) {
      errorMsg.textContent = 'Error al conectar con el servidor';
      errorMsg.style.display = 'block';
    }
  } finally {
    if (btnSubmit) {
      btnSubmit.textContent = 'INGRESAR AL SISTEMA';
      btnSubmit.disabled = false;
    }
  }
};

// Eventos de teclado y clic para el login
document.getElementById('form-login')?.addEventListener('submit', window.ejecutarLogin);
document.getElementById('btn-iniciar-sesion')?.addEventListener('click', window.ejecutarLogin);

document.getElementById('login-password')?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') window.ejecutarLogin(e);
});
document.getElementById('login-usuario')?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') window.ejecutarLogin(e);
});

// Botón Salir manual
document.getElementById('btn-logout')?.addEventListener('click', () => {
  if (confirm('¿Deseas cerrar sesión del sistema?')) {
    sessionStorage.removeItem('sesion_activa_rojas');
    localStorage.removeItem('sesion_activa_rojas');
    location.reload();
  }
});
// ==========================================================================
// NAVEGACIÓN GLOBAL: REGRESAR AL MENÚ PRINCIPAL (SIN BLOQUEO DE CLICS)
// ==========================================================================
window.irAlInicio = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 1. Ocultar todos los módulos limpiando estilos inline que bloquean
  const modules = document.querySelectorAll('.glass-module');
  modules.forEach(m => {
    m.classList.add('hidden');
    m.style.removeProperty('display'); // Limpia el display inline para que el CSS vuelva a funcionar
  });

  // 2. Mostrar el menú principal restaurando su flujo normal
  const menuGrid = document.getElementById('menu-grid');
  if (menuGrid) {
    menuGrid.classList.remove('hidden');
    menuGrid.style.removeProperty('display');
  }

  // 3. Asegurar que el modal de login no se interponga de forma invisible
  const modalLogin = document.getElementById('modal-login-overlay');
  if (modalLogin && localStorage.getItem('sesion_activa_rojas')) {
    modalLogin.style.display = 'none';
  }

  // 4. Subir la vista suavemente
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Escuchador directo adicional
document.getElementById('btn-global-home')?.addEventListener('click', window.irAlInicio);