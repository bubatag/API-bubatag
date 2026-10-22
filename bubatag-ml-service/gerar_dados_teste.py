
import pandas as pd
from pathlib import Path

# Pasta onde este arquivo está localizado
PASTA = Path(__file__).resolve().parent

# Arquivo de saída com os dados simulados
ARQUIVO_SAIDA = PASTA / "dados_simulados.csv"


def gerar_dados():
    exemplos = [
        # Temperatura, batimentos, estado simulado
        (37.5, 55, "Normal"),
        (38.0, 60, "Normal"),
        (38.2, 65, "Normal"),
        (38.5, 70, "Normal"),
        (38.7, 75, "Normal"),
        (38.0, 80, "Normal"),
        (38.4, 62, "Normal"),
        (38.6, 68, "Normal"),

        (39.0, 90, "Estressado"),
        (39.2, 95, "Estressado"),
        (38.8, 100, "Estressado"),
        (39.1, 105, "Estressado"),
        (39.0, 110, "Estressado"),
        (38.9, 85, "Estressado"),
        (39.3, 92, "Estressado"),
        (38.7, 98, "Estressado"),

        (39.6, 120, "Estresse Crítico"),
        (40.0, 130, "Estresse Crítico"),
        (40.2, 140, "Estresse Crítico"),
        (39.8, 125, "Estresse Crítico"),
        (40.5, 150, "Estresse Crítico"),
        (39.7, 115, "Estresse Crítico"),
        (40.1, 135, "Estresse Crítico"),
        (40.3, 145, "Estresse Crítico"),
    ]

    df = pd.DataFrame(
        exemplos,
        columns=[
            "temperatura",
            "batimento_cardiaco",
            "estado",
        ],
    )

    df.to_csv(ARQUIVO_SAIDA, index=False)

    print(f"Arquivo criado: {ARQUIVO_SAIDA}")
    print(f"Total de exemplos: {len(df)}")
    print("\nQuantidade por classe:")
    print(df["estado"].value_counts())
    print("\nPrimeiras linhas:")
    print(df.head())


if __name__ == "__main__":
    gerar_dados()
