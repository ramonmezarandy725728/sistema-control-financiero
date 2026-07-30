document.addEventListener('DOMContentLoaded', () => {
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
  const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000); // Cantidad proporcional a la pantalla

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6, // Velocidad baja para no distraer
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.8 + 1
    });
  }

  function animateNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Obtener color dinámico según el tema
    const isDark = document.body.classList.contains('dark-theme');
    const rgb = isDark ? '6, 182, 212' : '2, 132, 199';

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Dibujar punto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, 0.5)`;
      ctx.fill();

      // Dibujar conexiones entre puntos cercanos
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
    const ctxChart = document.getElementById('chartBalance').getContext('2d');
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
});