# 🐃 Bubatag — Módulo Analítico e Relatórios com IA

Módulo independente em Python responsável pela ingestão de dados telemétricos de bubalinos diretamente do MongoDB, sumarização de métricas fisiológicas (frequência cardíaca e temperatura corporal) e emissão automatizada de pareceres clínicos e zootécnicos através do Google Gemini (`gemini-3.8-flash`).

---

## 🏗️ Arquitetura do Sistema

```
[ Coleiras IoT (ESP32/Sensores) ]
               │
               ▼
   [ API Node.js / Express ]  ──────►  [ MongoDB: bubatag ]
   (Gateway & Persistência)                    ▲
                                               │ (Consulta direta)
                                               │
                                   [ Python: relatorio.py ]
                                               │
                                               ▼
                                    [ Google Gemini AI ]
                                               │
                                               ▼
                              [ Parecer no Terminal + Arquivo .md ]
```

* **`bubatag-api-mongo/`**: Servidor Node.js que atua como gateway para dispositivos IoT, efetuando validação determinística de limites e gravação em banco.
* **`bubatag-ai-service/`**: Script autônomo em Python que extrai as séries temporais, processa tendências e emprega IA generativa para diagnóstico zootécnico sem sobrecarregar a API principal.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de possuir em seu ambiente:

* **Python 3.10 ou superior** ([Download Python](https://www.python.org/))
* **MongoDB** em execução localmente ou via connection string remota (MongoDB Atlas)
* **Chave de API do Google Gemini** obtida gratuitamente no [Google AI Studio](https://aistudio.google.com/)

---

## ⚙️ Instalação e Configuração

### 1. Acessar o diretório do serviço

Abra o terminal e navegue até a pasta do módulo analítico:

```bash
cd bubatag-ai-service
```

### 2. Criar e ativar o ambiente virtual (`venv`)

* **No Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

* **No Linux / macOS (Bash/Zsh):**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

> *Dica*: Uma vez ativado, o prefixo `(venv)` deverá aparecer no início da linha de comando.

### 3. Instalar as dependências

Instale as bibliotecas necessárias para a conexão com o banco e chamada ao SDK da Google:

```bash
pip install pymongo python-dotenv google-genai
```

*(Se preferir utilizar o arquivo de requisitos já versionado: `pip install -r requirements.txt`)*

### 4. Configurar as Variáveis de Ambiente

Crie um arquivo chamado `.env` dentro da pasta `bubatag-ai-service` (ou na raiz do projeto) com a seguinte configuração:

```env
GEMINI_API_KEY=sua_chave_do_google_ai_studio_aqui
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB=bubatag
```

> **Atenção:** Certifique-se de que o arquivo `.env` conste no seu `.gitignore` para nunca expor credenciais em repositórios remotos.

---

## 🚀 Como Executar

Com o ambiente virtual ativado e a instância do MongoDB acessível, execute o script passando o identificador da coleira como argumento:

```bash
python relatorio.py COL-001
```

Se nenhum argumento for fornecido, a coleira `COL-001` será adotada como padrão:

```bash
python relatorio.py
```

---

## 📊 Fluxo de Execução e Saída

Durante o processamento, o script executa as seguintes ações de ponta a ponta:

1. **Consulta telemétrica:** Acessa a coleção de usuários e localiza o animal vinculado à coleira informada.
2. **Consolidação estatística:**
   * Amostras recentes analisadas (últimas 15 leituras).
   * Média e picos de batimentos cardíacos (BPM).
   * Média e picos de temperatura corporal (°C).
   * Contagem das ocorrências de estresse registradas pelo sensor.
3. **Avaliação inteligente com Gemini:** Envia um prompt contextualizado especializado em bem-estar e termorregulação de búfalos, com tratamento de resiliência e retentativas em caso de alta demanda na API.
4. **Exibição imediata:** Imprime o parecer completo e estruturado no console do terminal.
5. **Exportação em Markdown:** Gera automaticamente um arquivo formatado dentro do diretório `relatorios/` seguindo a nomenclatura:
   ```text
   relatorios/{NOME_ANIMAL}_{ANO-MES-DIA}_{HORA-MINUTO-SEGUNDO}.md
   ```

---

## 📂 Estrutura de Arquivos

```text
bubatag/
├── .gitignore
├── README.md
├── bubatag-api-mongo/         # Gateway IoT e backend Node.js
└── bubatag-ai-service/        # Módulo analítico em Python
    ├── .env                   # Variáveis sensíveis (ignorado pelo Git)
    ├── relatorio.py           # Script principal de extração e geração de laudos
    ├── requirements.txt       # Dependências congeladas
    ├── venv/                  # Ambiente virtual isolado
    └── relatorios/            # Diretório criado em tempo de execução com os laudos .md
```
