from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, text
from database import get_db
from models import Movimentacao, Componente
from auth import obter_usuario_atual
from datetime import datetime, timedelta, date
from typing import Optional

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

@router.get("/stats/movimentacoes-fluxo")
def stats_movimentacoes(
    inicio: Optional[date] = Query(None),
    fim: Optional[date] = Query(None),
    db = Depends(get_db)
):
    if not fim:
        fim = datetime.now().date()
    if not inicio:
        inicio = fim - timedelta(days=6)
        
    delta = fim - inicio
    dias = [inicio + timedelta(days=i) for i in range(delta.days + 1)]
    
    labels = [d.strftime("%d/%m") for d in dias]
    entradas = []
    saidas = []
    
    for d in dias:
        e = db.query(func.sum(Movimentacao.quantidade)).filter(Movimentacao.data == d, Movimentacao.tipo == 1).scalar() or 0
        s = db.query(func.sum(Movimentacao.quantidade)).filter(Movimentacao.data == d, Movimentacao.tipo == 0).scalar() or 0
        entradas.append(int(e))
        saidas.append(int(s))
        
    return {"labels": labels, "entradas": entradas, "saidas": saidas}

@router.get("/stats/top-componentes")
def stats_top_componentes(db = Depends(get_db)):
    resultado = db.query(
        Componente.nome, 
        func.count(Movimentacao.id).label("total")
    ).join(Movimentacao).group_by(Componente.id).order_by(text("total DESC")).limit(5).all()
    
    return [{"nome": r[0], "total": r[1]} for r in resultado]

@router.get("/stats/alertas-estoque")
def stats_alertas(db = Depends(get_db)):
    alertas = db.query(Componente).filter(Componente.quantidade_atual <= Componente.estoque_minimo).all()
    return [
        {
            "id": c.id,
            "nome": c.nome,
            "atual": c.quantidade_atual,
            "minimo": c.estoque_minimo
        } for c in alertas
    ]
