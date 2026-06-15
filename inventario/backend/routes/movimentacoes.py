from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
import schemas
import models
from auth import obter_usuario_atual
from utils import adicionar_log

router = APIRouter()

@router.post("/movimentacoes", response_model=schemas.MovimentacaoResponse)
def criarMovimentacao(
    movimentacao: schemas.MovimentacaoCreate, 
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    componente = db.query(models.Componente).filter(models.Componente.id == movimentacao.id_componente).first()
    if not componente:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    

    if movimentacao.tipo == 1:
        componente.quantidade_atual += movimentacao.quantidade
    else:
        if componente.quantidade_atual < movimentacao.quantidade:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente. Disponível: {componente.quantidade_atual}")
        componente.quantidade_atual -= movimentacao.quantidade
    
    movimentacaoCriar = models.Movimentacao(
        id_componente=movimentacao.id_componente, 
        id_usuario=usuario_atual.id, 
        tipo=movimentacao.tipo, 
        quantidade=movimentacao.quantidade, 
        valor=movimentacao.valor, 
        data=movimentacao.data
    )
    db.add(movimentacaoCriar)
    db.commit()
    db.refresh(movimentacaoCriar)
    

    tipo_str = "Entrada" if movimentacao.tipo == 1 else "Saída"
    adicionar_log(db, usuario_atual.id, f"Registrou {tipo_str} de {movimentacao.quantidade} unidades", "Movimentacao", movimentacaoCriar.id)
    
    return movimentacaoCriar

@router.get("/movimentacoes")
def buscarMovimentacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    busca: Optional[str] = Query(None),
    db: Session = Depends(get_db), 
    usuario_atual: models.Usuario = Depends(obter_usuario_atual)
):
    query = db.query(
        models.Movimentacao,
        models.Usuario.nome.label("nome_usuario"),
        models.Componente.nome.label("nome_componente")
    ).join(models.Usuario, models.Movimentacao.id_usuario == models.Usuario.id)\
     .join(models.Componente, models.Movimentacao.id_componente == models.Componente.id)

    if busca:
        query = query.filter(models.Componente.nome.ilike(f"%{busca}%"))

    total = query.count()
    resultados = query.order_by(models.Movimentacao.id.desc())\
     .offset(skip).limit(limit)\
     .all()
    
    items = []
    for mov, nome_u, nome_c in resultados:
        mov.nome_usuario = nome_u
        mov.nome_componente = nome_c
        items.append(mov)
        
    return {"total": total, "items": items}

