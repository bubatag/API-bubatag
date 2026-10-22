
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


PASTA = Path(__file__).resolve().parent
CAMINHO_MODELO = PASTA / "modelos" / "classificador.joblib"

app = FastAPI(
    title="Bubatag - Serviço de IA",
    description="Classificação experimental do estado do animal.",
    version="1.0.0",
)

# O serviço não deve iniciar normalmente se o modelo não existir.
if not CAMINHO_MODELO.exists():
    raise RuntimeError(
        f"Modelo não encontrado: {CAMINHO_MODELO}. "
        "Execute treinar_modelo.py primeiro."
    )

modelo = joblib.load(CAMINHO_MODELO)


class DadosAnimal(BaseModel):
    temperatura: float = Field(
        gt=34,
        le=44,
        description="Temperatura de entrada em graus Celsius",
    )
    batimento_cardiaco: int = Field(
        ge=20,
        le=220,
        description="Batimentos cardíacos por minuto",
    )


@app.get("/health")
def health():
    return {
        "status": "OK",
        "servico": "Bubatag ML",
        "modelo_carregado": True,
        "versao": "1.0.0",
    }


@app.post("/classificar")
def classificar(dados: DadosAnimal):
    try:
        entrada = pd.DataFrame(
            [
                {
                    "temperatura": dados.temperatura,
                    "batimento_cardiaco": dados.batimento_cardiaco,
                }
            ]
        )

        estado = str(modelo.predict(entrada)[0])

        return {
            "sucesso": True,
            "estado": estado,
            "modelo": "bubatag-ml-v1",
            "origem_dados": "modelo experimental treinado com dados simulados",
        }

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível realizar a classificação.",
        ) from erro
