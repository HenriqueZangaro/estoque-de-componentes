from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import shemas
from auth import gerar_hash_senha, obter_usuario_atual

router = APIRouter()

@router.get("/usuarios", response_model=list[shemas.UsuarioResponse])
def buscarUsuarios(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    # Retorna apenas usuários ativos para a gestão
    usuarios = db.query(models.Usuario).filter(models.Usuario.ativo == 1).all()
    for u in usuarios:
        u.is_admin = (u.email == "admin@admin.com")
    return usuarios

@router.post("/usuarios", response_model=shemas.UsuarioResponse)
def criarUsuario(usuario: shemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Verifica se o email já existe (mesmo inativos não podem repetir email)
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        if usuario_existente.ativo == 0:
            # Reativa usuário se já existiu
            usuario_existente.nome = usuario.nome
            usuario_existente.senha = gerar_hash_senha(usuario.senha)
            usuario_existente.ativo = 1
            db.commit()
            db.refresh(usuario_existente)
            usuario_existente.is_admin = (usuario_existente.email == "admin@admin.com")
            return usuario_existente
        raise HTTPException(status_code=400, detail="Email já cadastrado")
        
    senha_hash = gerar_hash_senha(usuario.senha)
    novo_usuario = models.Usuario(nome=usuario.nome, email=usuario.email, senha=senha_hash, ativo=1)
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    novo_usuario.is_admin = (novo_usuario.email == "admin@admin.com")
    return novo_usuario

@router.get("/usuarios/{id}", response_model=shemas.UsuarioResponse)
def buscarUsuariosPorId(id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    usuario.is_admin = (usuario.email == "admin@admin.com")
    return usuario

@router.delete("/usuarios/{id}")
def deletar_usuario(id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    # APENAS ADMIN PODE DELETAR
    if usuario_atual.email != "admin@admin.com":
        raise HTTPException(status_code=403, detail="Apenas o administrador pode deletar usuários")
        
    usuario_deletar = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario_deletar:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if usuario_deletar.email == "admin@admin.com":
        raise HTTPException(status_code=400, detail="O administrador principal não pode ser deletado")

    usuario_deletar.ativo = 0
    db.commit()
    return {"mensagem": "Usuário desativado com sucesso (histórico preservado)"}

@router.put("/usuarios/{id}", response_model=shemas.UsuarioResponse)
def atualizar_usuario(usuario: shemas.UsuarioCreate, id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    usuario_atualizar = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario_atualizar:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    usuario_atualizar.nome = usuario.nome
    usuario_atualizar.email = usuario.email
    if usuario.senha:
        usuario_atualizar.senha = gerar_hash_senha(usuario.senha)
        
    db.commit()
    db.refresh(usuario_atualizar)
    usuario_atualizar.is_admin = (usuario_atualizar.email == "admin@admin.com")
    return usuario_atualizar
