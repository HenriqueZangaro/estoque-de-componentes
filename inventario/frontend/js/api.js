const API_URL = 'http://localhost:8000';

function getAuthHeaders(forceToken = true) {
    const token = localStorage.getItem('token');
    if (!token && forceToken) {
        window.location.href = 'login.html';
        return {};
    }
    
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function apiFetch(endpoint, options = {}, forceToken = true) {
    const headers = getAuthHeaders(forceToken);
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    });

    if (res.status === 401 && forceToken) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }

    return res;
}

async function carregarUsuarioLogado() {
    const nomeUsuarioElement = document.getElementById('nome-usuario-logado');
    if (!nomeUsuarioElement) return;

    try {
        const res = await apiFetch('/me');
        if (res.ok) {
            const usuario = await res.json();
            nomeUsuarioElement.textContent = usuario.nome;
        }
    } catch (err) {
        console.error("Erro ao carregar usuário:", err);
    }
}


if (localStorage.getItem('token')) {
    carregarUsuarioLogado();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
