from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from typing import Optional
import schemas
import models
from auth import obter_usuario_atual
from utils import adicionar_log

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

@router.get("/componentes")
def buscarComponentes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    busca: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Componente)
    if busca:
        query = query.filter(models.Componente.nome.ilike(f"%{busca}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@router.get("/componentes/{id}", response_model=schemas.ComponenteResponse)
def buscarComponentePorId(id: int, db: Session = Depends(get_db)):
    componente = db.query(models.Componente).filter(models.Componente.id == id).first()
    if not componente:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    return componente

@router.post("/componentes", response_model=schemas.ComponenteResponse)
def criarComponente(
    componente: schemas.ComponenteCreate, 
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    novoComponente = models.Componente(
        nome=componente.nome, 
        valor=componente.valor, 
        descricao=componente.descricao,
        estoque_minimo=componente.estoque_minimo
    )
    db.add(novoComponente)
    db.commit()
    db.refresh(novoComponente)
    
    adicionar_log(db, usuario_atual.id, f"Criou componente {novoComponente.nome}", "Componente", novoComponente.id)
    return novoComponente

@router.delete("/componentes/{id}")
def deletarComponente(
    id: int, 
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    componenteDeletar = db.query(models.Componente).filter(models.Componente.id == id).first()
    if not componenteDeletar:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    

    tem_movs = db.query(models.Movimentacao).filter(models.Movimentacao.id_componente == id).first()
    if tem_movs:
        raise HTTPException(status_code=400, detail="Não é possível deletar componente com movimentações registradas.")

    nome_comp = componenteDeletar.nome
    db.delete(componenteDeletar)
    db.commit()
    
    adicionar_log(db, usuario_atual.id, f"Deletou componente {nome_comp}", "Componente", id)
    return {"mensagem": "Componente deletado com sucesso"}

@router.put("/componentes/{id}", response_model=schemas.ComponenteResponse)
def atualizarComponente(
    componente: schemas.ComponenteCreate, 
    id: int, 
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    componenteAtualizar = db.query(models.Componente).filter(models.Componente.id == id).first()
    if not componenteAtualizar:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    
    componenteAtualizar.nome = componente.nome
    componenteAtualizar.valor = componente.valor
    componenteAtualizar.descricao = componente.descricao
    componenteAtualizar.estoque_minimo = componente.estoque_minimo
    
    db.commit()
    db.refresh(componenteAtualizar)
    
    adicionar_log(db, usuario_atual.id, f"Atualizou componente {componenteAtualizar.nome}", "Componente", id)
    return componenteAtualizar
