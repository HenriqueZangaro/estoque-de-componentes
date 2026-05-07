const API = 'http://localhost:8000';

let componentes = [];
let fornecedores = [];

async function carregarDados() {
  const [resC, resF] = await Promise.all([
    fetch(`${API}/componentes`),
    fetch(`${API}/fornecedores`),
  ]);
  componentes = await resC.json();
  fornecedores = await resF.json();

  const selectC = document.getElementById('campo-componente');
  const selectF = document.getElementById('campo-fornecedor');

  selectC.innerHTML = componentes.map(c =>
    `<option value="${c.id}">${c.nome}</option>`
  ).join('');

  selectF.innerHTML = fornecedores.map(f =>
    `<option value="${f.id}">${f.nome}</option>`
  ).join('');

  carregarRelacoes();
}

async function carregarRelacoes() {
  const res = await fetch(`${API}/componenteFornecedor`);
  const data = await res.json();
  const tbody = document.getElementById('tabela-relacoes');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" style="color:var(--muted);text-align:center">Nenhuma relação cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => {
    const componente = componentes.find(c => c.id === r.id_componente);
    const fornecedor = fornecedores.find(f => f.id === r.id_fornecedor);
    const nomeComponente = componente ? componente.nome : `#${r.id_componente}`;
    const nomeFornecedor = fornecedor ? fornecedor.nome : `#${r.id_fornecedor}`;

    return `
      <tr>
        <td><span class="badge">${nomeComponente}</span></td>
        <td><span class="badge orange">${nomeFornecedor}</span></td>
      </tr>
    `;
  }).join('');
}

function abrirModal() {
  document.getElementById('modal').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
}

async function salvar() {
  const body = {
    id_componente: parseInt(document.getElementById('campo-componente').value),
    id_fornecedor: parseInt(document.getElementById('campo-fornecedor').value),
  };

  const res = await fetch(`${API}/componenteFornecedor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    carregarRelacoes();
    mostrarToast('Relação cadastrada!');
  } else {
    mostrarToast('Erro ao vincular.', true);
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