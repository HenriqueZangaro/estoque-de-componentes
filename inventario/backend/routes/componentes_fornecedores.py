from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import shemas
import models
from auth import obter_usuario_atual
from typing import List

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

@router.post("/componenteFornecedor", response_model=shemas.ComponenteFornecedorResponse)
def componenteFornecedorCriar(componenteFornecedor: shemas.ComponenteFornecedorCreate, db: Session = Depends(get_db)):
    componenteVerificar = db.query(models.Componente).filter(models.Componente.id == componenteFornecedor.id_componente).first()
    if not componenteVerificar:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    fornecedorVerificar = db.query(models.Fornecedor).filter(models.Fornecedor.id == componenteFornecedor.id_fornecedor).first()
    if not fornecedorVerificar:
        raise HTTPException(status_code=404, detail="Fornecedor nao encontrado")
    
    nova_relacao = models.ComponenteFornecedor(id_componente=componenteFornecedor.id_componente, id_fornecedor=componenteFornecedor.id_fornecedor)
    db.add(nova_relacao)
    db.commit()
    db.refresh(nova_relacao)
    

    nova_relacao.nome_componente = componenteVerificar.nome
    nova_relacao.nome_fornecedor = fornecedorVerificar.nome
    
    return nova_relacao

@router.get("/componenteFornecedor", response_model=List[shemas.ComponenteFornecedorResponse])
def buscarComponenteFornecedorTodos(db: Session = Depends(get_db)):
    resultados = db.query(
        models.ComponenteFornecedor,
        models.Componente.nome.label("nome_componente"),
        models.Fornecedor.nome.label("nome_fornecedor")
    ).join(models.Componente, models.ComponenteFornecedor.id_componente == models.Componente.id)\
     .join(models.Fornecedor, models.ComponenteFornecedor.id_fornecedor == models.Fornecedor.id)\
     .all()
    
    items = []
    for rel, nome_c, nome_f in resultados:
        rel.nome_componente = nome_c
        rel.nome_fornecedor = nome_f
        items.append(rel)
        
    return items

@router.get("/componenteFornecedor/{id_componente}", response_model=List[shemas.ComponenteFornecedorResponse])
def buscarFornecedoresCOmponenteEspecifico(id_componente: int, db: Session = Depends(get_db)):
    resultados = db.query(
        models.ComponenteFornecedor,
        models.Componente.nome.label("nome_componente"),
        models.Fornecedor.nome.label("nome_fornecedor")
    ).join(models.Componente, models.ComponenteFornecedor.id_componente == models.Componente.id)\
     .join(models.Fornecedor, models.ComponenteFornecedor.id_fornecedor == models.Fornecedor.id)\
     .filter(models.ComponenteFornecedor.id_componente == id_componente)\
     .all()
    
    items = []
    for rel, nome_c, nome_f in resultados:
        rel.nome_componente = nome_c
        rel.nome_fornecedor = nome_f
        items.append(rel)
        
    return items
