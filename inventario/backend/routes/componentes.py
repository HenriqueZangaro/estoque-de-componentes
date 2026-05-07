from fastapi import APIRouter
from fastapi import Depends
from database import get_db
from shemas import ComponenteCreate
from models import Componente
from fastapi import HTTPException

router = APIRouter()

@router.get("/componentes")
def buscarComponentes(db = Depends(get_db)):
    return db.query(Componente).all()

@router.get("/componentes/{id}")
def buscarComponentePorId(id: int, db = Depends(get_db)):
    return db.query(Componente).filter(Componente.id == id).first()

@router.post("/componentes")
def criarComponente(componente:ComponenteCreate, db = Depends(get_db)):
    novoComponente = Componente(nome=componente.nome, valor=componente.valor, descricao=componente.descricao)
    db.add(novoComponente)
    db.commit()
    db.refresh(novoComponente)
    return novoComponente

@router.delete("/componentes/{id}")
def deletarComponente(id: int, db = Depends(get_db)):
    componenteDeletar = db.query(Componente).filter(Componente.id == id).first()
    if not componenteDeletar:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    db.delete(componenteDeletar)
    db.commit()
    return {"mensagem": "Componente deletado com sucesso"}

@router.put("/componentes/{id}")
def atualizarComponente(componente:ComponenteCreate, id: int, db = Depends(get_db)):
    componenteAtualizar = db.query(Componente).filter(Componente.id == id).first()
    if not componenteAtualizar:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    componenteAtualizar.nome = componente.nome
    componenteAtualizar.valor = componente.valor
    componenteAtualizar.descricao = componente.descricao
    db.commit()
    return componenteAtualizar