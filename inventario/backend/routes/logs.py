from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import shemas
from auth import obter_usuario_atual

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

@router.get("/logs")
def buscar_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    total = db.query(models.Log).count()
    resultados = db.query(
        models.Log,
        models.Usuario.nome.label("nome_usuario")
    ).outerjoin(models.Usuario, models.Log.id_usuario == models.Usuario.id)\
     .order_by(models.Log.id.desc())\
     .offset(skip).limit(limit).all()
     
    items = []
    for log, nome_u in resultados:
        log.nome_usuario = nome_u
        items.append(log)
        
    return {"total": total, "items": items}
