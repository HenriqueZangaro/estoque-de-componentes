let componentes = [];
let fornecedores = [];

async function carregarDados() {
  try {
    const [resC, resF] = await Promise.all([
      apiFetch('/componentes?limit=1000'),
      apiFetch('/fornecedores?limit=1000'),
    ]);
    const dataC = await resC.json();
    const dataF = await resF.json();
    
    componentes = dataC.items || [];
    fornecedores = dataF.items || [];

    const selectC = document.getElementById('campo-componente');
    const selectF = document.getElementById('campo-fornecedor');

    if (selectC) {
      selectC.innerHTML = componentes.map(c =>
        `<option value="${c.id}">${c.nome}</option>`
      ).join('');
    }

    if (selectF) {
      selectF.innerHTML = fornecedores.map(f =>
        `<option value="${f.id}">${f.nome}</option>`
      ).join('');
    }

    carregarRelacoes();
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

async function carregarRelacoes() {
  const res = await apiFetch('/componenteFornecedor');
  const data = await res.json();
  const tbody = document.getElementById('tabela-relacoes');

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" style="color:var(--muted);text-align:center">Nenhuma relação encontrada.</td></tr>';
    return;
  }

  window.todasRelacoes = data;
  renderizarRelacoes(data);
}

function renderizarRelacoes(lista) {
  const tbody = document.getElementById('tabela-relacoes');
  tbody.innerHTML = lista.map(r => {
    const nomeComponente = r.nome_componente || `#${r.id_componente}`;
    const nomeFornecedor = r.nome_fornecedor || `#${r.id_fornecedor}`;

    return `
      <tr>
        <td><span class="badge">${nomeComponente}</span></td>
        <td><span class="badge orange">${nomeFornecedor}</span></td>
      </tr>
    `;
  }).join('');
}

function buscarLocal() {
  const termo = document.getElementById('filtro-busca').value.toLowerCase();
  if (!window.todasRelacoes) return;

  const filtradas = window.todasRelacoes.filter(r => 
    (r.nome_componente || "").toLowerCase().includes(termo) || 
    (r.nome_fornecedor || "").toLowerCase().includes(termo)
  );

  renderizarRelacoes(filtradas);
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

  const res = await apiFetch('/componenteFornecedor', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    carregarRelacoes();
    mostrarToast('Relação cadastrada!');
  } else {
    const errorData = await res.json();
    mostrarToast(errorData.detail || 'Erro ao vincular.', true);
  }
}

function mostrarToast(msg, erro = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast' + (erro ? ' error' : '');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

carregarDados();
