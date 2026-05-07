const API = 'http://localhost:8000';
let editandoId = null;

async function carregarUsuarios() {
  const res = await fetch(`${API}/usuarios`);
  const data = await res.json();
  const tbody = document.getElementById('tabela-usuarios');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="color:var(--muted);text-align:center">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(u => `
    <tr>
      <td style="font-family:'Share Tech Mono',monospace;color:var(--muted)">#${u.id}</td>
      <td>${u.nome}</td>
      <td style="color:var(--muted)">${u.email}</td>
      <td style="display:flex;gap:8px">
        <button class="btn btn-edit" onclick="abrirEdicao(${u.id}, '${u.nome}', '${u.email}')">Editar</button>
        <button class="btn btn-danger" onclick="deletar(${u.id})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

function abrirModal() {
  editandoId = null;
  document.getElementById('modal-tag').textContent = '// novo';
  document.getElementById('modal-titulo').textContent = 'Novo Usuário';
  document.getElementById('campo-nome').value = '';
  document.getElementById('campo-email').value = '';
  document.getElementById('campo-senha').value = '';
  document.getElementById('modal').classList.add('open');
}

function abrirEdicao(id, nome, email) {
  editandoId = id;
  document.getElementById('modal-tag').textContent = '// editar';
  document.getElementById('modal-titulo').textContent = 'Editar Usuário';
  document.getElementById('campo-nome').value = nome;
  document.getElementById('campo-email').value = email;
  document.getElementById('campo-senha').value = '';
  document.getElementById('modal').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
}

async function salvar() {
  const body = {
    nome: document.getElementById('campo-nome').value,
    email: document.getElementById('campo-email').value,
    senha: document.getElementById('campo-senha').value,
  };

  const url = editandoId ? `${API}/usuarios/${editandoId}` : `${API}/usuarios`;
  const method = editandoId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    carregarUsuarios();
    mostrarToast(editandoId ? 'Usuário atualizado!' : 'Usuário criado!');
  } else {
    mostrarToast('Erro ao salvar.', true);
  }
}

async function deletar(id) {
  if (!confirm('Deletar este usuário?')) return;
  const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
  if (res.ok) {
    carregarUsuarios();
    mostrarToast('Usuário deletado.');
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

carregarUsuarios();