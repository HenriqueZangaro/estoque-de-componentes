from fastapi import APIRouter
from fastapi import Depends
from database import get_db
from shemas import MovimentacaoCreate
from models import Movimentacao, Usuario, Componente
from fastapi import HTTPException

router = APIRouter()

@router.post("/movimentacoes")
def criarMovimentacao(movimentacao:MovimentacaoCreate, db = Depends(get_db)):
    componenteVerificar = db.query(Componente).filter(Componente.id == movimentacao.id_componente).first()
    if not componenteVerificar:
        raise HTTPException(status_code=404, detail="Componente nao encontrado")
    usuarioVerificar = db.query(Usuario).filter(Usuario.id == movimentacao.id_usuario).first()
    if not usuarioVerificar:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    movimentacaoCriar = Movimentacao(id_componente=movimentacao.id_componente, id_usuario=movimentacao.id_usuario, tipo=movimentacao.tipo, quantidade=movimentacao.quantidade, valor=movimentacao.valor, data=movimentacao.data)
    db.add(movimentacaoCriar)
    db.commit()
    db.refresh(movimentacaoCriar)
    return movimentacaoCriar

@router.get("/movimentacoes")
def buscarMovimentacoes(db = Depends(get_db)):
    movimentacaoBuscar = db.query(Movimentacao).all()
    return movimentacaoBuscar

@router.get("/movimentacoes/{id}")
def buscarMovimentacoesPorId(id: int, db = Depends(get_db)):
    movimentacaoBuscarPorId = db.query(Movimentacao).filter(Movimentacao.id == id).first()
    return movimentacaoBuscarPorId
