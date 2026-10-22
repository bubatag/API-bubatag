
import pandas as pd
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix


PASTA = Path(__file__).resolve().parent
ARQUIVO_DADOS = PASTA / "dados_simulados.csv"
PASTA_MODELOS = PASTA / "modelos"
ARQUIVO_MODELO = PASTA_MODELOS / "classificador.joblib"


def treinar():
    if not ARQUIVO_DADOS.exists():
        raise FileNotFoundError(
            "Dados não encontrados. Execute primeiro "
            "gerar_dados_teste.py."
        )

    df = pd.read_csv(ARQUIVO_DADOS)

    colunas_entrada = [
        "temperatura",
        "batimento_cardiaco",
    ]

    X = df[colunas_entrada]
    y = df["estado"]

    # Mantém exemplos de cada classe nos dois conjuntos.
    X_treino, X_teste, y_treino, y_teste = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y,
    )

    modelo = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
    )

    modelo.fit(X_treino, y_treino)

    previsoes = modelo.predict(X_teste)

    print("\n=== Relatório de avaliação ===")
    print(
        classification_report(
            y_teste,
            previsoes,
            zero_division=0,
        )
    )

    print("=== Matriz de confusão ===")
    print(
        confusion_matrix(
            y_teste,
            previsoes,
            labels=modelo.classes_,
        )
    )
    print("Ordem das classes:", list(modelo.classes_))

    PASTA_MODELOS.mkdir(parents=True, exist_ok=True)
    joblib.dump(modelo, ARQUIVO_MODELO)

    print(f"\nModelo salvo em: {ARQUIVO_MODELO}")
    print("Aviso: modelo experimental treinado com dados simulados.")


if __name__ == "__main__":
    treinar()
