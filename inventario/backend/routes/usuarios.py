from fastapi import APIRouter
from fastapi import Depends
from database import get_db
from models import Usuario
from shemas import UsuarioCreate
from fastapi import HTTPException

router = APIRouter()

@router.get("/usuarios")
def buscarUsuarios(db = Depends(get_db)):
    return db.query(Usuario).all()

@router.post("/usuarios")
def criarUsuario(usuario: UsuarioCreate, db = Depends(get_db)):
    novo_usuario = Usuario(nome=usuario.nome, email=usuario.email, senha=usuario.senha)
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@router.get("/usuarios/{id}")
def buscarUsuariosPorId(id: int, db = Depends(get_db)):
    return db.query(Usuario).filter(Usuario.id == id).first()

@router.delete("/usuarios/{id}")
def deletar_usuario(id: int, db = Depends(get_db)):
    usuario_deletar = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario_deletar:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    db.delete(usuario_deletar)
    db.commit()
    return {"mensagem": "Usuario deletado com sucesso"}

@router.put("/usuarios/{id}")
def atualizar_usuario(usuario:UsuarioCreate, id: int, db = Depends(get_db)):
    usuario_atualizar = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario_atualizar:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    usuario_atualizar.nome = usuario.nome
    usuario_atualizar.email = usuario.email
    usuario_atualizar.senha = usuario.senha
    db.commit()
    return usuario_atualizar
