from database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100))
    email = Column(String(100))
    senha = Column(String(255))
    ativo = Column(Integer, default=1) # 1 para ativo, 0 para inativo


class Componente(Base):
    __tablename__ = "componente"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100))
    valor = Column(Float)
    descricao = Column(String(200))
    quantidade_atual = Column(Integer, default=0)
    estoque_minimo = Column(Integer, default=0)


class Fornecedor(Base):
    __tablename__ = "fornecedor"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100))
    cnpj = Column(String(14))
    email = Column(String(100))
    telefone = Column(String(11))


class ComponenteFornecedor(Base):
    __tablename__ = "componentefornecedor"
    id_componente = Column(Integer, ForeignKey("componente.id"), primary_key=True)
    id_fornecedor = Column(Integer, ForeignKey("fornecedor.id"), primary_key=True)


class Log(Base):
    __tablename__ = "log"
    id = Column(Integer, primary_key=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id"))
    acao = Column(String(255))
    entidade = Column(String(50))
    id_entidade = Column(Integer)
    data = Column(DateTime, default=datetime.utcnow)


class Movimentacao(Base):
    __tablename__ = "movimentacao"
    id = Column(Integer, primary_key=True)
    id_componente = Column(Integer, ForeignKey("componente.id"))
    id_usuario = Column(Integer, ForeignKey("usuario.id"))
    tipo = Column(Integer) # 1 para entrada e 0 para saída
    quantidade = Column(Integer)
    valor = Column(Float)
    data = Column(Date)
