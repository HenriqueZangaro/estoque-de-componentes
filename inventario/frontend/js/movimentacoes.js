let componentes = [];
let paginaAtual = 1;
const itensPorPagina = 10;
let totalItens = 0;
let buscaAtual = "";

async function carregarDados() {
  console.log("Carregando dados iniciais...");

  try {
    const resC = await apiFetch('/componentes?limit=1000');
    const dataC = await resC.json();
    
    componentes = dataC.items || [];
    console.log("Componentes carregados para o select:", componentes.length);

    const selectC = document.getElementById('campo-componente');
    if (selectC) {
      if (componentes.length === 0) {
        selectC.innerHTML = '<option value="">Nenhum componente cadastrado</option>';
      } else {
        selectC.innerHTML = componentes.map(c =>
          `<option value="${c.id}" data-valor="${c.valor}">${c.nome}</option>`
        ).join('');
      }
      calcularValor();
    }
  } catch (err) {
    console.error("Erro ao carregar componentes para o select:", err);
  }

  carregarMovimentacoes();
}

function calcularValor() {
  const selectC = document.getElementById('campo-componente');
  if (!selectC || selectC.selectedIndex === -1 || !selectC.value) {
    document.getElementById('campo-valor').value = '0.00';
    return;
  }
  
  const quantidade = parseInt(document.getElementById('campo-quantidade').value) || 0;
  const opcaoSelecionada = selectC.options[selectC.selectedIndex];
  const valorUnitario = parseFloat(opcaoSelecionada?.dataset.valor) || 0;
  document.getElementById('campo-valor').value = (valorUnitario * quantidade).toFixed(2);
}

async function carregarMovimentacoes() {
  const skip = (paginaAtual - 1) * itensPorPagina;
  let url = `/movimentacoes?skip=${skip}&limit=${itensPorPagina}`;
  if (buscaAtual) url += `&busca=${encodeURIComponent(buscaAtual)}`;

  const res = await apiFetch(url);
  const data = await res.json();
  
  totalItens = data.total || 0;
  const movimentacoes = data.items || [];

  const tbody = document.getElementById('tabela-movimentacoes');

  if (!movimentacoes || movimentacoes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="color:var(--muted);text-align:center">Nenhuma movimentação encontrada.</td></tr>';
    atualizarControlesPaginacao();
    return;
  }

  tbody.innerHTML = movimentacoes.map(m => {
    const nomeComponente = m.nome_componente || `#${m.id_componente}`;
    const nomeUsuario = m.nome_usuario || `#${m.id_usuario}`;

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

  atualizarControlesPaginacao();
}

function buscar() {
    buscaAtual = document.getElementById('filtro-busca').value;
    paginaAtual = 1;
    carregarMovimentacoes();
}

function atualizarControlesPaginacao() {
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    const info = document.getElementById('info-paginacao');
    const btnAnt = document.getElementById('btn-anterior');
    const btnProx = document.getElementById('btn-proximo');

    if (info) info.textContent = `Página ${paginaAtual} de ${totalPaginas || 1}`;
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
    carregarMovimentacoes();
}

async function exportarCSV() {
    const res = await apiFetch('/movimentacoes?limit=1000');
    const data = await res.json();
    const items = data.items || [];

    if (items.length === 0) return mostrarToast('Nada para exportar.', true);

    const headers = ['ID', 'Componente', 'Usuario', 'Tipo', 'Qtd', 'Valor', 'Data'];
    const rows = items.map(m => [
        m.id,
        m.nome_componente,
        m.nome_usuario,
        m.tipo === 1 ? 'ENTRADA' : 'SAIDA',
        m.quantidade,
        m.valor,
        m.data
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `movimentacoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function abrirModal() {
  document.getElementById('campo-quantidade').value = '';
  document.getElementById('campo-valor').value = '0.00';
  document.getElementById('campo-tipo').value = '1';
  document.getElementById('campo-data').value = new Date().toISOString().split('T')[0];
  calcularValor();
  document.getElementById('modal').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
}

async function salvar() {
  const selectC = document.getElementById('campo-componente');
  if (!selectC || !selectC.value) return mostrarToast('Selecione um componente.', true);

  const body = {
    id_componente: parseInt(selectC.value),
    tipo: parseInt(document.getElementById('campo-tipo').value),
    quantidade: parseInt(document.getElementById('campo-quantidade').value),
    valor: parseFloat(document.getElementById('campo-valor').value),
    data: document.getElementById('campo-data').value,
  };

  const res = await apiFetch('/movimentacoes', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (res.ok) {
    fecharModal();
    paginaAtual = 1;
    carregarMovimentacoes();
    mostrarToast('Movimentação registrada!');
  } else {
    const errorData = await res.json();
    mostrarToast(errorData.detail || 'Erro ao registrar.', true);
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
