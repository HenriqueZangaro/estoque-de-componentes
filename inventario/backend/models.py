from database import Base
from sqlalchemy import Column
from sqlalchemy import Integer, String, Float, ForeignKey, Date

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100))
    email = Column(String(100))
    senha = Column(String(30))


class Componente(Base):
    __tablename__ = "componente"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100))
    valor = Column(Float)
    descricao = Column(String(200))


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


class Movimentacao(Base):
    __tablename__ = "movimentacao"
    id = Column(Integer, primary_key=True)
    id_componente = Column(Integer, ForeignKey("componente.id"))
    id_usuario = Column(Integer, ForeignKey("usuario.id"))
    tipo = Column(Integer) # 1 para entrada e 0 para saída
    quantidade = Column(Integer)
    valor = Column(Float)
    data = Column(Date)

