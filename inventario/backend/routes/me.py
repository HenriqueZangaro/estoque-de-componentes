from fastapi import APIRouter, Depends
import models
import shemas
from auth import obter_usuario_atual

router = APIRouter()

@router.get("/me", response_model=shemas.UsuarioResponse)
async def ler_usuario_atual(usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return usuario_atual
