from fastapi import FastAPI
from database import Base, engine
from routes.usuarios import router as usuario_router
from routes.componentes import router as componente_router
from routes.fornecedores import router as fornecedor_router
from routes.movimentacoes import router as movimentacao_router
from routes.componentes_fornecedores import router as componenteFornecedor_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(usuario_router)
app.include_router(componente_router)
app.include_router(fornecedor_router)
app.include_router(movimentacao_router)
app.include_router(componenteFornecedor_router)
