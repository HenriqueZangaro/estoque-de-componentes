const API = 'http://localhost:8000';
let editandoId = null;

async function carregarComponentes() {
  const res = await fetch(`${API}/componentes`);
  const data = await res.json();
  const tbody = document.getElementById('tabela-componentes');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--muted);text-align:center">Nenhum componente cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td style="font-family:'Share Tech Mono',monospace;color:var(--muted)">#${c.id}</td>
      <td>${c.nome}</td>
      <td>R$ ${Number(c.valor).toFixed(2)}</td>
      <td style="color:var(--muted)">${c.descricao || '—'}</td>
      <td style="display:flex;gap:8px">
        <button class="btn btn-edit" onclick="abrirEdicao(${c.id}, '${c.nome}', ${c.valor}, '${c.descricao}')">Editar</button>
        <button class="btn btn-danger" onclick="deletar(${c.id})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

function abrirModal() {
  editandoId = null;
  document.getElementById('modal-tag').textContent = '// novo';
  document.getElementById('modal-titulo').textContent = 'Novo Componente';
  document.getElementById('campo-nome').value = '';
  document.getElementById('campo-valor').value = '';
  document.getElementById('campo-descricao').value = '';
  document.getElementById('modal').classList.add('open');
}

function abrirEdicao(id, nome, valor, descricao) {
  editandoId = id;
  document.getElementById('modal-tag').textContent = '// editar';
  document.getElementById('modal-titulo').textContent = 'Editar Componente';
  document.getElementById('campo-nome').value = nome;
  document.getElementById('campo-valor').value = valor;
  document.getElementById('campo-descricao').value = descricao;
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
  };

  const url = editandoId ? `${API}/componentes/${editandoId}` : `${API}/componentes`;
  const method = editandoId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    carregarComponentes();
    mostrarToast(editandoId ? 'Componente atualizado!' : 'Componente criado!');
  } else {
    mostrarToast('Erro ao salvar.', true);
  }
}

async function deletar(id) {
  if (!confirm('Deletar este componente?')) return;
  const res = await fetch(`${API}/componentes/${id}`, { method: 'DELETE' });
  if (res.ok) {
    carregarComponentes();
    mostrarToast('Componente deletado.');
  } else {
    mostrarToast('Erro ao deletar.', true);
  }
}

function mostrarToast(msg, erro = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (erro ? ' error' : '');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

carregarComponentes();