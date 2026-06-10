import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text


current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(env_path)

def sync_db():
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    name = os.getenv("DB_NAME")

    if not all([user, host, port, name]):
        print(f"Erro: Variáveis de ambiente faltando.")
        return

    connection = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
    engine = create_engine(connection)

    with engine.connect() as conn:
        print("Adicionando novas colunas à tabela 'componente'...")
        try:
            conn.execute(text("ALTER TABLE componente ADD COLUMN quantidade_atual INTEGER DEFAULT 0;"))
            print("- Coluna 'quantidade_atual' adicionada.")
        except Exception as e:
            print(f"- quantidade_atual: {e}")

        try:
            conn.execute(text("ALTER TABLE componente ADD COLUMN estoque_minimo INTEGER DEFAULT 0;"))
            print("- Coluna 'estoque_minimo' adicionada.")
        except Exception as e:
            print(f"- estoque_minimo: {e}")

        print("\nCriando tabela de logs...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS log (
                    id INTEGER PRIMARY KEY AUTO_INCREMENT,
                    id_usuario INTEGER,
                    acao VARCHAR(255),
                    entidade VARCHAR(50),
                    id_entidade INTEGER,
                    data DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_usuario) REFERENCES usuario(id)
                );
            """))
            print("- Tabela 'log' criada.")
        except Exception as e:
            print(f"- erro log: {e}")
        
        conn.commit()
    print("\nSincronização concluída!")

if __name__ == "__main__":
    sync_db()
