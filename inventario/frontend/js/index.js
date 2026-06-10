let chartFluxo = null;
let chartPie = null;

async function carregarStats() {
  const endpoints = [
    { id: 'stat-componentes', url: '/componentes' },
    { id: 'stat-fornecedores', url: '/fornecedores' },
    { id: 'stat-usuarios', url: '/usuarios' },
    { id: 'stat-movimentacoes', url: '/movimentacoes' },
  ];

  for (const e of endpoints) {
    try {
      const res = await apiFetch(e.url);
      const data = await res.json();
      document.getElementById(e.id).textContent = data.total !== undefined ? data.total : (data.length || 0);
    } catch (err) {
      document.getElementById(e.id).textContent = '!';
    }
  }
}

async function carregarAlertas() {
    try {
        const res = await apiFetch('/stats/alertas-estoque');
        const alertas = await res.json();
        const container = document.getElementById('lista-alertas');

        if (alertas.length === 0) {
            container.innerHTML = '<div style="color: var(--green); font-size: 13px;">Estoque em dia! ✨</div>';
            return;
        }

        container.innerHTML = alertas.map(a => `
            <div class="alert-item">
                <span>${a.nome}</span>
                <span class="alert-badge">${a.atual} unid.</span>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar alertas:", err);
    }
}

async function carregarGraficoFluxo(dias = 7) {
  try {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - (dias - 1));

    const fmt = (d) => d.toISOString().split('T')[0];
    const res = await apiFetch(`/stats/movimentacoes-fluxo?inicio=${fmt(inicio)}&fim=${fmt(hoje)}`);
    const data = await res.json();

    const ctx = document.getElementById('chart-fluxo').getContext('2d');
    
    if (chartFluxo) chartFluxo.destroy();

    chartFluxo = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Entradas',
            data: data.entradas,
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Saídas',
            data: data.saidas,
            borderColor: '#f87171',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, labels: { color: '#94a3b8', font: { family: 'Share Tech Mono' } } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}

async function carregarGraficoPizza() {
    try {
        const resTop = await apiFetch('/stats/top-componentes');
        const dataTop = await resTop.json();
        const ctxPie = document.getElementById('chart-pie').getContext('2d');
        
        if (chartPie) chartPie.destroy();

        chartPie = new Chart(ctxPie, {
          type: 'doughnut',
          data: {
            labels: dataTop.map(c => c.nome),
            datasets: [{
              data: dataTop.map(c => c.total),
              backgroundColor: ['#38bdf8', '#818cf8', '#fb7185', '#fbbf24', '#34d399'],
              borderWidth: 0,
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } }
            },
            cutout: '70%'
          }
        });
    } catch (err) {
        console.error(err);
    }
}

function mudarPeriodo(dias, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    carregarGraficoFluxo(dias);
}

carregarStats();
carregarAlertas();
carregarGraficoFluxo();
carregarGraficoPizza();
