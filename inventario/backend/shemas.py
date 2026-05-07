from pydantic import BaseModel
from datetime import date

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str


class ComponenteCreate(BaseModel):
    nome: str
    valor: float
    descricao: str

class FornecedorCreate(BaseModel):
    nome: str
    cnpj: str
    email: str
    telefone: str

class MovimentacaoCreate(BaseModel):
    id_componente: int
    id_usuario: int
    tipo: int
    quantidade: int
    valor: float
    data: date

class ComponenteFornecedorCreate(BaseModel):
    id_componente: int
    id_fornecedor: int
