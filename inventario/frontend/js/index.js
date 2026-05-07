const API = 'http://localhost:8000';

async function carregarStats() {
  const endpoints = [
    { id: 'stat-componentes', url: '/componentes' },
    { id: 'stat-fornecedores', url: '/fornecedores' },
    { id: 'stat-usuarios', url: '/usuarios' },
    { id: 'stat-movimentacoes', url: '/movimentacoes' },
  ];

  for (const e of endpoints) {
    try {
      const res = await fetch(API + e.url);
      const data = await res.json();
      document.getElementById(e.id).textContent = data.length;
    } catch {
      document.getElementById(e.id).textContent = '!';
    }
  }
}

carregarStats();