# 📦 Estoque de Componentes Eletrônicos

Sistema de inventário para componentes eletrônicos, desenvolvido com **FastAPI**, **SQLAlchemy** e **MySQL** no backend, e **HTML/CSS/JS** puro no frontend.

---

## 🚀 Tecnologias

- Python 3.14
- FastAPI
- SQLAlchemy (ORM)
- MySQL
- PyMySQL
- Pydantic
- HTML + CSS + JavaScript

---

## ⚙️ Como rodar

### 1. Pré-requisitos

- Python 3.10+
- MySQL rodando localmente
- Git

### 2. Clone o repositório

```bash
git clone git@github.com:seuusuario/estoque-de-componentes.git
cd estoque-de-componentes
```

### 3. Crie e ative o ambiente virtual

```bash
python -m venv .venv
source .venv/bin/activate
```

### 4. Instale as dependências

```bash
cd inventario/backend
pip install -r requirements.txt
```

### 5. Configure o banco de dados

Crie o banco no MySQL:

```sql
CREATE DATABASE inventario;
```

Crie o arquivo `.env` dentro de `inventario/backend/` com base no `.env.example`:

```
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventario
```

### 6. Rode o backend

```bash
cd inventario/backend
python -m uvicorn main:app --reload
```

A API estará disponível em `http://localhost:8000`.

Documentação interativa: `http://localhost:8000/docs`

### 7. Abra o frontend

Abra o arquivo `inventario/frontend/index.html` diretamente no navegador com a API rodando.

---

## 🗂️ Estrutura do projeto

```
estoque-de-componentes/
└── inventario/
    ├── backend/
    │   ├── main.py              # Ponto de entrada da API
    │   ├── database.py          # Configuração do banco de dados
    │   ├── models.py            # Modelos SQLAlchemy (tabelas)
    │   ├── shemas.py            # Schemas Pydantic (validação)
    │   ├── requirements.txt     # Dependências Python
    │   ├── .env.example         # Exemplo de variáveis de ambiente
    │   └── routes/
    │       ├── usuarios.py
    │       ├── componentes.py
    │       ├── fornecedores.py
    │       ├── movimentacoes.py
    │       └── componentes_fornecedores.py
    └── frontend/
        ├── index.html
        ├── usuarios.html
        ├── componentes.html
        ├── fornecedores.html
        ├── movimentacoes.html
        ├── componentes_fornecedores.html
        ├── style.css
        └── js/
            ├── index.js
            ├── usuarios.js
            ├── componentes.js
            ├── fornecedores.js
            ├── movimentacoes.js
            └── componentes_fornecedores.js
```

---

## 📋 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | /usuarios | Lista todos os usuários |
| POST | /usuarios | Cria um usuário |
| PUT | /usuarios/{id} | Atualiza um usuário |
| DELETE | /usuarios/{id} | Deleta um usuário |
| GET | /componentes | Lista todos os componentes |
| POST | /componentes | Cria um componente |
| PUT | /componentes/{id} | Atualiza um componente |
| DELETE | /componentes/{id} | Deleta um componente |
| GET | /fornecedores | Lista todos os fornecedores |
| POST | /fornecedores | Cria um fornecedor |
| PUT | /fornecedores/{id} | Atualiza um fornecedor |
| DELETE | /fornecedores/{id} | Deleta um fornecedor |
| GET | /movimentacoes | Lista todas as movimentações |
| POST | /movimentacoes | Registra uma movimentação |
| GET | /componenteFornecedor | Lista todos os vínculos |
| POST | /componenteFornecedor | Cria um vínculo |