from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioResponse(UsuarioBase):
    id: int
    is_admin: bool = False
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ComponenteBase(BaseModel):
    nome: str
    valor: float = Field(gt=0)
    descricao: str
    estoque_minimo: int = Field(default=0, ge=0)

class ComponenteCreate(ComponenteBase):
    pass

class ComponenteResponse(ComponenteBase):
    id: int
    quantidade_atual: int
    class Config:
        from_attributes = True

class FornecedorBase(BaseModel):
    nome: str
    cnpj: str
    email: EmailStr
    telefone: str

class FornecedorCreate(FornecedorBase):
    pass

class FornecedorResponse(FornecedorBase):
    id: int
    class Config:
        from_attributes = True

class MovimentacaoCreate(BaseModel):
    id_componente: int
    tipo: int = Field(ge=0, le=1) # 0 saída, 1 entrada
    quantidade: int = Field(gt=0)
    valor: float = Field(gt=0)
    data: date

class MovimentacaoResponse(MovimentacaoCreate):
    id: int
    id_usuario: int
    nome_usuario: Optional[str] = None
    nome_componente: Optional[str] = None
    class Config:
        from_attributes = True

class ComponenteFornecedorCreate(BaseModel):
    id_componente: int
    id_fornecedor: int

class ComponenteFornecedorResponse(ComponenteFornecedorCreate):
    nome_componente: Optional[str] = None
    nome_fornecedor: Optional[str] = None
    class Config:
        from_attributes = True

class LogResponse(BaseModel):
    id: int
    id_usuario: int
    nome_usuario: Optional[str] = None
    acao: str
    entidade: str
    id_entidade: Optional[int] = None
    data: datetime
    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    total: int
    items: List
