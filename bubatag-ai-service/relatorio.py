import os
import sys
import time
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from pymongo import MongoClient

# 1. Carregamento flexível do .env (pasta atual ou pasta pai)
env_atual = Path(__file__).resolve().parent / ".env"
env_pai = Path(__file__).resolve().parent.parent / ".env"

if env_atual.exists():
    load_dotenv(dotenv_path=env_atual)
elif env_pai.exists():
    load_dotenv(dotenv_path=env_pai)
else:
    load_dotenv()

# 2. Validação da Chave de API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError(
        "Variável GEMINI_API_KEY não foi encontrada! "
        "Verifique se o arquivo .env existe e contém GEMINI_API_KEY=sua_chave."
    )

# 3. Conexões com o MongoDB e Gemini
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DB = os.getenv("MONGO_DB", "bubatag")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
ai = genai.Client(api_key=api_key)


def salvar_relatorio_md(nome_animal: str, conteudo: str, coleira: str):
    """Cria a pasta 'relatorios' e salva o arquivo em formato Markdown."""
    diretorio_relatorios = Path(__file__).resolve().parent / "relatorios"
    diretorio_relatorios.mkdir(exist_ok=True)

    agora = datetime.now()
    timestamp_arquivo = agora.strftime("%Y-%m-%d_%H-%M-%S")
    timestamp_legivel = agora.strftime("%d/%m/%Y às %H:%M:%S")

    # Nome sanitizado para o arquivo
    nome_sanitizado = "".join(c for c in nome_animal if c.isalnum() or c in ("-", "_")).strip()
    nome_arquivo = f"{nome_sanitizado}_{timestamp_arquivo}.md"
    caminho_completo = diretorio_relatorios / nome_arquivo

    cabecalho = f"""# Relatório Clínico e Zootécnico — Bubatag
**Gerado em:** {timestamp_legivel}  
**Identificação da Coleira:** {coleira}  

---

"""

    with open(caminho_completo, "w", encoding="utf-8") as f:
        f.write(cabecalho + conteudo)

    return caminho_completo


def analisar_animal(n_coleira: str):
    print(f"\n🔍 Buscando dados da coleira '{n_coleira}' no MongoDB...")

    usuario = db.usuarios.find_one({"coleiras.n_coleira": n_coleira})
    if not usuario:
        print(f"❌ Coleira '{n_coleira}' não encontrada no banco.")
        return

    coleira = next(
        (c for c in usuario.get("coleiras", []) if c.get("n_coleira") == n_coleira),
        None,
    )
    bubalino = coleira.get("bubalino") if coleira else None

    if not bubalino or not bubalino.get("dados"):
        print("❌ Nenhum registro de telemetria encontrado para este animal.")
        return

    # Extrai as últimas 15 leituras e histórico de estresse
    ultimas_leituras = bubalino["dados"][-15:]
    historico_estresse = bubalino.get("historico_estresse", [])[-15:]

    total = len(ultimas_leituras)
    media_bpm = round(sum(d["batimento_cardiaco"] for d in ultimas_leituras) / total, 1)
    max_bpm = max(d["batimento_cardiaco"] for d in ultimas_leituras)
    media_temp = round(sum(d["temperatura"] for d in ultimas_leituras) / total, 1)
    max_temp = max(d["temperatura"] for d in ultimas_leituras)

    estados = [h.get("estado_estresse") for h in historico_estresse if h.get("estado_estresse")]
    resumo_estados = {est: estados.count(est) for est in set(estados)}

    print(f"📊 Amostras avaliadas: {total}")
    print(f"   • Frequência Cardíaca: Média de {media_bpm} bpm (Pico: {max_bpm} bpm)")
    print(f"   • Temperatura Corporal: Média de {media_temp} °C (Pico: {max_temp} °C)")
    print(f"   • Ocorrências de estresse: {resumo_estados}")
    print("🤖 Solicitando avaliação clínica e zootécnica ao Gemini...")

    prompt = f"""
Você é um médico-veterinário e zootecnista especialista em saúde e bem-estar de bubalinos (búfalos) do projeto Bubatag.
Analise os dados telemétricos recentes do animal e emita um parecer técnico objetivo para o produtor rural.

Identificação do Animal:
- Nome/Identificador: {bubalino.get('nome', 'Sem nome')} (Etiqueta: {bubalino.get('n_etiqueta', 'N/D')})
- Raça: {bubalino.get('raca', 'N/D')} | Sexo: {bubalino.get('sexo', 'N/D')}
- Localização/Piquete: {coleira.get('coleira_localizacao', 'Não informada')}

Telemetria Consolidada (Últimas {total} leituras):
- Frequência Cardíaca: Média de {media_bpm} bpm (Pico: {max_bpm} bpm | Faixa normal de repouso: <= 80 bpm)
- Temperatura Corporal: Média de {media_temp} °C (Pico: {max_temp} °C | Referência fisiológica: <= 39.2 °C)
- Ocorrências registradas pelo sensor: {resumo_estados}

Estruture seu parecer em Markdown curto com os seguintes tópicos:
1. **Diagnóstico Geral**: Avalie se o animal apresenta conforto térmico ou sinais de esforço/estresse.
2. **Fatores Ambientais/Manejo Prováveis**: Aponte hipóteses práticas (exposição solar direta, falta de sombra, ausência de pontos de imersão/água ou estresse de manejo).
3. **Ações Imediatas de Manejo**: Liste 2 a 3 medidas diretas que o produtor rural deve adotar no campo.
"""

    conteudo_laudo = None
    tentativas_max = 3

    for tentativa in range(1, tentativas_max + 1):
        try:
            response = ai.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
            )
            conteudo_laudo = response.text
            break
        except Exception as e:
            erro_str = str(e)
            if "503" in erro_str or "UNAVAILABLE" in erro_str:
                print(f"⚠️ Servidor ocupado (tentativa {tentativa}/{tentativas_max}). Aguardando 4 segundos...")
                time.sleep(4)
            else:
                print(f"❌ Erro ao comunicar com a API do Gemini: {e}")
                break

    if not conteudo_laudo:
        print("❌ Não foi possível gerar o parecer no momento devido à instabilidade do servidor. Tente novamente em instantes.")
        return

    print("\n" + "=" * 55)
    print("📋 PARECER ZOOTÉCNICO / CLÍNICO - BUBATAG")
    print("=" * 55)
    print(conteudo_laudo)
    print("=" * 55 + "\n")

    # Salva o arquivo em disco
    caminho_arquivo = salvar_relatorio_md(
        nome_animal=bubalino.get("nome", "animal"),
        conteudo=conteudo_laudo,
        coleira=n_coleira,
    )
    print(f"💾 Arquivo exportado com sucesso em:")
    print(f"👉 {caminho_arquivo}\n")


if __name__ == "__main__":
    coleira_alvo = sys.argv[1] if len(sys.argv) > 1 else "COL-001"
    analisar_animal(coleira_alvo)