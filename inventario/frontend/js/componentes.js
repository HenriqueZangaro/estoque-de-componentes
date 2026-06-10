let editandoId = null;
let paginaAtual = 1;
const itensPorPagina = 10;
let totalItens = 0;
let buscaAtual = "";

async function carregarComponentes() {
  const skip = (paginaAtual - 1) * itensPorPagina;
  let url = `/componentes?skip=${skip}&limit=${itensPorPagina}`;
  if (buscaAtual) url += `&busca=${encodeURIComponent(buscaAtual)}`;

  const res = await apiFetch(url);
  const data = await res.json();
  
  totalItens = data.total || 0;
  const componentes = data.items || [];
  
  const tbody = document.getElementById('tabela-componentes');

  if (!componentes || componentes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--muted);text-align:center">Nenhum componente encontrado.</td></tr>';
    atualizarControlesPaginacao();
    return;
  }

  tbody.innerHTML = componentes.map(c => {
    const min = c.estoque_minimo;
    const atual = c.quantidade_atual;
    const isBaixo = atual <= min;
    const isAtencao = !isBaixo && atual <= (min * 1.3);

    let qtdStyle = 'color: var(--green); font-weight: bold;';
    if (isBaixo) {
        qtdStyle = 'color: var(--red); font-weight: bold;';
    } else if (isAtencao) {
        qtdStyle = 'color: var(--accent2); font-weight: bold;';
    }

    const alerta = isBaixo ? ' <span title="Estoque Baixo">⚠️</span>' : '';

    return `
      <tr>
        <td style="font-family:'Share Tech Mono',monospace;color:var(--muted)">#${c.id}</td>
        <td>${c.nome}${alerta}</td>
        <td style="${qtdStyle}">${c.quantidade_atual} unid.</td>
        <td>R$ ${Number(c.valor).toFixed(2)}</td>
        <td style="color:var(--muted)">${c.descricao || '—'}</td>
        <td style="display:flex;gap:8px">
          <button class="btn btn-edit" onclick="abrirEdicao(${c.id}, '${c.nome.replace(/'/g, "\\'")}', ${c.valor}, '${(c.descricao || "").replace(/'/g, "\\'")}', ${c.estoque_minimo})">Editar</button>
          <button class="btn btn-danger" onclick="deletar(${c.id})">Deletar</button>
        </td>
      </tr>
    `;
  }).join('');
  
  atualizarControlesPaginacao();
}

function buscar() {
    buscaAtual = document.getElementById('filtro-busca').value;
    paginaAtual = 1;
    carregarComponentes();
}

function atualizarControlesPaginacao() {
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    const info = document.getElementById('info-paginacao');
    if (info) info.textContent = `Página ${paginaAtual} de ${totalPaginas || 1}`;
    
    const btnAnt = document.getElementById('btn-anterior');
    const btnProx = document.getElementById('btn-proximo');

    if (btnAnt) {
        btnAnt.disabled = paginaAtual === 1;
        btnAnt.style.opacity = paginaAtual === 1 ? 0.5 : 1;
    }
    if (btnProx) {
        btnProx.disabled = paginaAtual >= totalPaginas || totalPaginas === 0;
        btnProx.style.opacity = (paginaAtual >= totalPaginas || totalPaginas === 0) ? 0.5 : 1;
    }
}

function paginar(direcao) {
    paginaAtual += direcao;
    carregarComponentes();
}

function abrirModal() {
  editandoId = null;
  document.getElementById('modal-tag').textContent = '// novo';
  document.getElementById('modal-titulo').textContent = 'Novo Componente';
  document.getElementById('campo-nome').value = '';
  document.getElementById('campo-valor').value = '';
  document.getElementById('campo-descricao').value = '';
  document.getElementById('campo-minimo').value = '0';
  document.getElementById('modal').classList.add('open');
}

function abrirEdicao(id, nome, valor, descricao, minimo) {
  editandoId = id;
  document.getElementById('modal-tag').textContent = '// editar';
  document.getElementById('modal-titulo').textContent = 'Editar Componente';
  document.getElementById('campo-nome').value = nome;
  document.getElementById('campo-valor').value = valor;
  document.getElementById('campo-descricao').value = descricao;
  document.getElementById('campo-minimo').value = minimo;
  document.getElementById('modal').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
}

async function salvar() {
  const body = {
    nome: document.getElementById('campo-nome').value,
    valor: parseFloat(document.getElementById('campo-valor').value),
    descricao: document.getElementById('campo-descricao').value,
    estoque_minimo: parseInt(document.getElementById('campo-minimo').value) || 0
  };

  const endpoint = editandoId ? `/componentes/${editandoId}` : `/componentes`;
  const method = editandoId ? 'PUT' : 'POST';

  const res = await apiFetch(endpoint, {
    method,
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    carregarComponentes();
    mostrarToast(editandoId ? 'Componente atualizado!' : 'Componente criado!');
  } else {
    const errorData = await res.json();
    mostrarToast(errorData.detail || 'Erro ao salvar.', true);
  }
}

async function deletar(id) {
  if (!confirm('Deletar este componente?')) return;
  const res = await apiFetch(`/componentes/${id}`, { method: 'DELETE' });
  if (res.ok) {
    carregarComponentes();
    mostrarToast('Componente deletado.');
  } else {
    const errorData = await res.json();
    mostrarToast(errorData.detail || 'Erro ao deletar.', true);
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

carregarComponentes();
