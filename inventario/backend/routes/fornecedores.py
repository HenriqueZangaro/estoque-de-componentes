from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import schemas
import models
from auth import obter_usuario_atual
from utils import adicionar_log

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

@router.get("/fornecedores")
def buscarFornecedores(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    total = db.query(models.Fornecedor).count()
    items = db.query(models.Fornecedor).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@router.get("/fornecedores/{id}", response_model=schemas.FornecedorResponse)
def buscarFornecedorPorId(id: int, db: Session = Depends(get_db)):
    fornecedor = db.query(models.Fornecedor).filter(models.Fornecedor.id == id).first()
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor nao encontrado")
    return fornecedor

@router.post("/fornecedores", response_model=schemas.FornecedorResponse)
def criarFornecedor(
    fornecedor: schemas.FornecedorCreate, 
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    novoFornecedor = models.Fornecedor(
        nome=fornecedor.nome, 
        cnpj=fornecedor.cnpj, 
        email=fornecedor.email, 
        telefone=fornecedor.telefone
    )
    db.add(novoFornecedor)
    db.commit()
    db.refresh(novoFornecedor)
    
    adicionar_log(db, usuario_atual.id, f"Criou fornecedor {novoFornecedor.nome}", "Fornecedor", novoFornecedor.id)
    return novoFornecedor

@router.put("/fornecedores/{id}", response_model=schemas.FornecedorResponse)
def atualizarFornecedor(
    fornecedor: schemas.FornecedorCreate, 
    id: int, 
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    fornecedorAtualizar = db.query(models.Fornecedor).filter(models.Fornecedor.id == id).first()
    if not fornecedorAtualizar:
        raise HTTPException(status_code=404, detail="Fornecedor nao encontrado")
    
    fornecedorAtualizar.nome = fornecedor.nome
    fornecedorAtualizar.cnpj = fornecedor.cnpj
    fornecedorAtualizar.email = fornecedor.email
    fornecedorAtualizar.telefone = fornecedor.telefone
    db.commit()
    
    adicionar_log(db, usuario_atual.id, f"Atualizou fornecedor {fornecedorAtualizar.nome}", "Fornecedor", id)
    return fornecedorAtualizar

@router.delete("/fornecedores/{id}")
def deletarFornecedor(
    id: int, 
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    fornecedorDeletar = db.query(models.Fornecedor).filter(models.Fornecedor.id == id).first()
    if not fornecedorDeletar:
        raise HTTPException(status_code=404, detail="Fornecedor nao encontrado")
    
    nome_forn = fornecedorDeletar.nome
    db.delete(fornecedorDeletar)
    db.commit()
    
    adicionar_log(db, usuario_atual.id, f"Deletou fornecedor {nome_forn}", "Fornecedor", id)
    return {"mensagem": "Fornecedor deletado com sucesso"}
