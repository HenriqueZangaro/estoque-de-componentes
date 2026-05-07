from fastapi import APIRouter
from fastapi import Depends
from database import get_db
from shemas import FornecedorCreate
from models import Fornecedor
from fastapi import HTTPException

router = APIRouter()

@router.get("/fornecedores")
def buscarFornecedores(db = Depends(get_db)):
    todos = db.query(Fornecedor).all()
    return todos

@router.get("/fornecedores/{id}")
def buscarFornecedorPorId(id: int, db = Depends(get_db)):
    fornecedorEncontrado = db.query(Fornecedor).filter(Fornecedor.id == id).first()
    return fornecedorEncontrado

@router.post("/fornecedores")
def criarFornecedor(fornecedor: FornecedorCreate, db = Depends(get_db)):
    novoFornecedor = Fornecedor(nome=fornecedor.nome, cnpj=fornecedor.cnpj, email=fornecedor.email, telefone=fornecedor.telefone)
    db.add(novoFornecedor)
    db.commit()
    db.refresh(novoFornecedor)
    return novoFornecedor

@router.put("/fornecedores/{id}")
def atualizarFornecedor(fornecedor:FornecedorCreate, id: int, db = Depends(get_db)):
    fornecedorAtualizar = db.query(Fornecedor).filter(Fornecedor.id == id).first()
    if not fornecedorAtualizar:
        raise HTTPException(status_code=404, detail="Fornecedor nao encontrado")
    fornecedorAtualizar.nome = fornecedor.nome
    fornecedorAtualizar.cnpj = fornecedor.cnpj
    fornecedorAtualizar.email = fornecedor.email
    fornecedorAtualizar.telefone = fornecedor.telefone
    db.commit()
    return fornecedorAtualizar

@router.delete("/fornecedores/{id}")
def deletarFornecedor(id: int, db = Depends(get_db)):
    fornecedorDeletar = db.query(Fornecedor).filter(Fornecedor.id == id).first()
    if not fornecedorDeletar:
        raise HTTPException(status_code=404, detail="Fornecedor nao encontrado")
    db.delete(fornecedorDeletar)
    db.commit()
    return {"mensagem": "Fornecedor deletado com sucesso"}

