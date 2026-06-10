const API = 'http://localhost:8000';

async function fazerLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const erroElement = document.getElementById('erro-login');

  erroElement.style.display = 'none';

  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      window.location.href = 'index.html';
    } else {
      const errorData = await res.json();
      erroElement.textContent = errorData.detail || 'Erro ao fazer login.';
      erroElement.style.display = 'block';
    }
  } catch (error) {
    console.error('Erro:', error);
    erroElement.textContent = 'Erro de conexão com o servidor.';
    erroElement.style.display = 'block';
  }
}

localStorage.removeItem('token');
