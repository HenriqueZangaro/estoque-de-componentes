from sqlalchemy.orm import Session
import models

def adicionar_log(db: Session, id_usuario: int, acao: str, entidade: str, id_entidade: int = None):
    novo_log = models.Log(
        id_usuario=id_usuario,
        acao=acao,
        entidade=entidade,
        id_entidade=id_entidade
    )
    db.add(novo_log)
    db.commit()
