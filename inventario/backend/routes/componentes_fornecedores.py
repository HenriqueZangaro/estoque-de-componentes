from fastapi import APIRouter
from fastapi import Depends
from database import get_db
from shemas import ComponenteFornecedorCreate
from models import Componente, Fornecedor, ComponenteFornecedor
from fastapi import HTTPException

router = APIRouter()

@router.post("/componenteFornecedor")
def componenteFornecedorCriar(componenteFornecedor:ComponenteFornecedorCreate, db = Depends(get_db)):
    componenteVerificar = db.query(Componente).filter(Componente.id == componenteFornecedor.id_componente).first()
    if not componenteVerificar:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    fornecedorVerificar = db.query(Fornecedor).filter(Fornecedor.id == componenteFornecedor.id_fornecedor).first()
    if not fornecedorVerificar:
        raise HTTPException(status_code=404, detail="Fornecedor nao encontrado")
    componenteFornecedorCriar = ComponenteFornecedor(id_componente=componenteFornecedor.id_componente, id_fornecedor=componenteFornecedor.id_fornecedor)
    db.add(componenteFornecedorCriar)
    db.commit()
    db.refresh(componenteFornecedorCriar)
    return componenteFornecedorCriar

@router.get("/componenteFornecedor")
def buscarComponenteFornecedorTodos(db = Depends(get_db)):
    return db.query(ComponenteFornecedor).all()

@router.get("/componenteFornecedor/{id_componente}")
def buscarFornecedoresCOmponenteEspecifico(id_componente: int, db = Depends(get_db)):
    return db.query(ComponenteFornecedor).filter(ComponenteFornecedor.id_componente == id_componente).all()