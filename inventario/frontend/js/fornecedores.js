const API = 'http://localhost:8000';
let editandoId = null;

async function carregarFornecedores() {
  const res = await fetch(`${API}/fornecedores`);
  const data = await res.json();
  const tbody = document.getElementById('tabela-fornecedores');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--muted);text-align:center">Nenhum fornecedor cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(f => `
    <tr>
      <td style="font-family:'Share Tech Mono',monospace;color:var(--muted)">#${f.id}</td>
      <td>${f.nome}</td>
      <td style="font-family:'Share Tech Mono',monospace">${f.cnpj}</td>
      <td style="color:var(--muted)">${f.email}</td>
      <td style="color:var(--muted)">${f.telefone}</td>
      <td style="display:flex;gap:8px">
        <button class="btn btn-edit" onclick="abrirEdicao(${f.id}, '${f.nome}', '${f.cnpj}', '${f.email}', '${f.telefone}')">Editar</button>
        <button class="btn btn-danger" onclick="deletar(${f.id})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

function abrirModal() {
  editandoId = null;
  document.getElementById('modal-tag').textContent = '// novo';
  document.getElementById('modal-titulo').textContent = 'Novo Fornecedor';
  document.getElementById('campo-nome').value = '';
  document.getElementById('campo-cnpj').value = '';
  document.getElementById('campo-email').value = '';
  document.getElementById('campo-telefone').value = '';
  document.getElementById('modal').classList.add('open');
}

function abrirEdicao(id, nome, cnpj, email, telefone) {
  editandoId = id;
  document.getElementById('modal-tag').textContent = '// editar';
  document.getElementById('modal-titulo').textContent = 'Editar Fornecedor';
  document.getElementById('campo-nome').value = nome;
  document.getElementById('campo-cnpj').value = cnpj;
  document.getElementById('campo-email').value = email;
  document.getElementById('campo-telefone').value = telefone;
  document.getElementById('modal').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
}

async function salvar() {
  const body = {
    nome: document.getElementById('campo-nome').value,
    cnpj: document.getElementById('campo-cnpj').value,
    email: document.getElementById('campo-email').value,
    telefone: document.getElementById('campo-telefone').value,
  };

  const url = editandoId ? `${API}/fornecedores/${editandoId}` : `${API}/fornecedores`;
  const method = editandoId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    carregarFornecedores();
    mostrarToast(editandoId ? 'Fornecedor atualizado!' : 'Fornecedor criado!');
  } else {
    mostrarToast('Erro ao salvar.', true);
  }
}

async function deletar(id) {
  if (!confirm('Deletar este fornecedor?')) return;
  const res = await fetch(`${API}/fornecedores/${id}`, { method: 'DELETE' });
  if (res.ok) {
    carregarFornecedores();
    mostrarToast('Fornecedor deletado.');
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

carregarFornecedores();