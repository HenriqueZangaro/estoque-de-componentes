const API = 'http://localhost:8000';

let componentes = [];
let usuarios = [];

async function carregarDados() {
  const [resC, resU] = await Promise.all([
    fetch(`${API}/componentes`),
    fetch(`${API}/usuarios`),
  ]);
  componentes = await resC.json();
  usuarios = await resU.json();

  // Preenche os selects do modal
  const selectC = document.getElementById('campo-componente');
  const selectU = document.getElementById('campo-usuario');

  selectC.innerHTML = componentes.map(c =>
    `<option value="${c.id}" data-valor="${c.valor}">${c.nome}</option>`
  ).join('');

  selectU.innerHTML = usuarios.map(u =>
    `<option value="${u.id}">${u.nome}</option>`
  ).join('');

  carregarMovimentacoes();
}

function calcularValor() {
  const selectC = document.getElementById('campo-componente');
  const quantidade = parseInt(document.getElementById('campo-quantidade').value) || 0;
  const opcaoSelecionada = selectC.options[selectC.selectedIndex];
  const valorUnitario = parseFloat(opcaoSelecionada?.dataset.valor) || 0;
  document.getElementById('campo-valor').value = (valorUnitario * quantidade).toFixed(2);
}

async function carregarMovimentacoes() {
  const res = await fetch(`${API}/movimentacoes`);
  const data = await res.json();
  const tbody = document.getElementById('tabela-movimentacoes');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="color:var(--muted);text-align:center">Nenhuma movimentação registrada.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(m => {
    const componente = componentes.find(c => c.id === m.id_componente);
    const usuario = usuarios.find(u => u.id === m.id_usuario);
    const nomeComponente = componente ? componente.nome : `#${m.id_componente}`;
    const nomeUsuario = usuario ? usuario.nome : `#${m.id_usuario}`;

    const tipoLabel = m.tipo === 1
      ? '<span class="badge green">ENTRADA</span>'
      : '<span class="badge red">SAÍDA</span>';

    return `
      <tr>
        <td style="font-family:'Share Tech Mono',monospace;color:var(--muted)">#${m.id}</td>
        <td>${nomeComponente}</td>
        <td style="color:var(--muted)">${nomeUsuario}</td>
        <td>${tipoLabel}</td>
        <td style="font-family:'Share Tech Mono',monospace">${m.quantidade}</td>
        <td>R$ ${Number(m.valor).toFixed(2)}</td>
        <td style="color:var(--muted);font-family:'Share Tech Mono',monospace">${m.data}</td>
      </tr>
    `;
  }).join('');
}

function abrirModal() {
  document.getElementById('campo-quantidade').value = '';
  document.getElementById('campo-valor').value = '';
  document.getElementById('campo-tipo').value = '1';
  document.getElementById('campo-data').value = new Date().toISOString().split('T')[0];
  calcularValor();
  document.getElementById('modal').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
}

async function salvar() {
  const body = {
    id_componente: parseInt(document.getElementById('campo-componente').value),
    id_usuario: parseInt(document.getElementById('campo-usuario').value),
    tipo: parseInt(document.getElementById('campo-tipo').value),
    quantidade: parseInt(document.getElementById('campo-quantidade').value),
    valor: parseFloat(document.getElementById('campo-valor').value),
    data: document.getElementById('campo-data').value,
  };

  const res = await fetch(`${API}/movimentacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    carregarMovimentacoes();
    mostrarToast('Movimentação registrada!');
  } else {
    mostrarToast('Erro ao registrar.', true);
  }
}

function mostrarToast(msg, erro = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (erro ? ' error' : '');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

carregarDados();