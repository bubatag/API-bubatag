# 🐃 Bubatag — API, Inteligência Artificial e Relatórios

O **Bubatag** é um sistema de monitoramento de bubalinos que integra uma API REST, um banco de dados MongoDB e um serviço de Inteligência Artificial para processar dados de temperatura corporal e frequência cardíaca, classificar o estado do animal e apoiar o acompanhamento de seu bem-estar.

O projeto é organizado em serviços independentes, executados em containers Docker, facilitando a configuração do ambiente e a comunicação entre os componentes.

---

## 🏗️ Arquitetura do sistema

```text
          [ Sensores / Dispositivos IoT ]
                       |
                       v
              [ API Bubatag ]
             Node.js / Express
                 Porta 3000
                  /       \
                 v         v
       [ Serviço de IA ] [ MongoDB ]
       Python / FastAPI   Banco bubatag
          Porta 8000      Porta interna 27017
                 |
                 v
       [ Modelo de Machine Learning ]
          classificador.joblib
```

Os serviços são executados por meio do Docker Compose:

| Serviço | Tecnologia | Porta no host |
|---|---|---|
| API | Node.js / Express | `3000` |
| IA | Python / FastAPI | `8000` |
| Banco de dados | MongoDB 8 | `27018` |

**Importante:** a API acessa o MongoDB pela rede interna do Docker utilizando `mongo:27017` e acessa o serviço de IA utilizando `http://ml-service:8000`. A porta `27018` é utilizada para acessar o MongoDB pelo Windows.

## 📦 Tecnologias utilizadas

- **Node.js e Express:** implementação da API REST.
- **Python e FastAPI:** disponibilização do serviço de classificação por IA.
- **scikit-learn:** execução do modelo de machine learning.
- **pandas e joblib:** preparação dos dados e carregamento do modelo treinado.
- **MongoDB:** persistência de usuários, coleiras, dados de telemetria e informações relacionadas ao monitoramento.
- **Docker e Docker Compose:** construção e execução dos serviços em containers.

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, instale:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

No Windows, abra o Docker Desktop e aguarde até que o mecanismo Docker esteja em execução.

Não é necessário instalar manualmente Node.js, Python ou MongoDB para executar os serviços dockerizados, pois cada container utiliza sua própria imagem.

---

## 🚀 Como executar o projeto

### 1. Clonar o repositório

Se o projeto ainda não estiver na sua máquina:

```bash
git clone https://github.com/bubatag/API-bubatag.git
cd API-bubatag
```

### 2. Entrar na pasta da API

O arquivo `docker-compose.yml` utilizado para subir os serviços está na pasta `bubatag-api-mongo`.

```bash
cd bubatag-api-mongo
```

### 3. Configurar as variáveis de ambiente

A API utiliza um arquivo `.env` para fornecer configurações sensíveis, como o segredo JWT.

Verifique se existe um arquivo `.env` nessa pasta e se a variável `JWT_SECRET` está configurada. Se necessário, utilize o arquivo de exemplo do projeto como referência.

Exemplo de configuração:

```env
JWT_SECRET=seu_segredo_local
```

Substitua o valor de exemplo por um segredo próprio. Não publique credenciais ou segredos reais no GitHub.

A URL do MongoDB e a URL interna do serviço de IA já são configuradas no Docker Compose:

```text
MONGO_URI=mongodb://mongo:27017/bubatag
ML_SERVICE_URL=http://ml-service:8000
```

Esses endereços são utilizados entre os containers. Não devem ser trocados por `localhost` dentro da configuração de comunicação entre os serviços.

### 4. Construir e iniciar os containers

Execute na pasta `bubatag-api-mongo`:

```bash
docker compose up -d --build
```

O comando constrói as imagens necessárias e inicia os serviços em segundo plano.

### 5. Verificar os containers

```bash
docker compose ps
```

Os serviços esperados são:

- `bubatag-api`
- `bubatag-ml-service`
- `bubatag-mongo`

Verifique se os três apresentam status `Up`.

### 6. Consultar os logs

Para acompanhar os logs de todos os serviços:

```bash
docker compose logs -f
```

Para visualizar somente os logs da API:

```bash
docker compose logs -f api
```

Para visualizar somente os logs da IA:

```bash
docker compose logs -f ml-service
```

Para sair da visualização dos logs, pressione `Ctrl + C`. Isso encerra a visualização, não necessariamente os containers.

---

## 🧠 Serviço de Inteligência Artificial

O serviço de IA está implementado em Python utilizando FastAPI. Ele carrega o modelo treinado armazenado em `modelos/classificador.joblib` e disponibiliza um endpoint para classificação dos dados fisiológicos.

O modelo recebe:

- `temperatura`: temperatura corporal em graus Celsius.
- `batimento_cardiaco`: frequência cardíaca em batimentos por minuto.

O serviço retorna o resultado da classificação, o identificador do modelo e a indicação de que a classificação foi realizada com dados simulados no treinamento experimental.

### Verificar a saúde do serviço

Endpoint:

```http
GET http://localhost:8000/health
```

Exemplo de resposta:

```json
{
  "status": "OK",
  "servico": "Bubatag ML",
  "modelo_carregado": true,
  "versao": "1.0.0"
}
```

### Classificar dados fisiológicos

Endpoint:

```http
POST http://localhost:8000/classificar
Content-Type: application/json
```

Exemplo de requisição:

```json
{
  "temperatura": 39.0,
  "batimento_cardiaco": 90
}
```

Exemplo ilustrativo de resposta:

```json
{
  "sucesso": true,
  "estado": "Estressado",
  "modelo": "bubatag-ml-v1",
  "origem_dados": "modelo experimental treinado com dados simulados"
}
```

O resultado depende do modelo carregado e dos dados enviados. O exemplo não representa uma validação clínica.

---

## 🔌 API Bubatag

A API REST, implementada com Node.js e Express, funciona como ponto de entrada para as operações do sistema.

Entre suas responsabilidades estão:

- Receber e validar os dados de telemetria.
- Identificar a coleira e o animal associados.
- Encaminhar os dados para análise quando necessário.
- Persistir as informações no MongoDB.
- Disponibilizar informações para consulta e geração de relatórios.

### Verificar a saúde da API

```http
GET http://localhost:3000/health
```

### Registrar telemetria

Endpoint:

```http
POST http://localhost:3000/api/telemetria/registro
Content-Type: application/json
```

Exemplo de requisição:

```json
{
  "n_coleira": "COL-TESTE-001",
  "temperatura": 39.0,
  "batimento_cardiaco": 90
}
```

Exemplo ilustrativo de resposta:

```json
{
  "sucesso": true,
  "n_coleira": "COL-TESTE-001",
  "n_etiqueta": "ETQ-TESTE-001",
  "status_estresse": "Estressado",
  "nivel_alerta": "MEDIO",
  "classificacao_disponivel": true,
  "mensagem": "Telemetria salva com sucesso."
}
```

A resposta real também pode incluir o horário do registro. Os valores apresentados são exemplos baseados nos testes realizados.

### Relatórios

A API também disponibiliza uma rota para consultar o relatório de uma coleira:

```http
GET http://localhost:3000/api/relatorios/coleira/COL-TESTE-001
```

O resultado depende dos registros disponíveis no banco e das regras implementadas no serviço de relatórios.

---

## 🔄 Fluxo de processamento

1. A API recebe os dados de temperatura e frequência cardíaca.
2. Os dados passam pelas validações da API.
3. A API identifica a coleira e o animal associado.
4. O serviço de classificação é utilizado quando a classificação não é fornecida manualmente.
5. O resultado da análise é associado à telemetria.
6. A API persiste os registros no MongoDB e retorna uma resposta ao cliente.

---

## 🗄️ Persistência de dados

O MongoDB é executado em um container próprio e utiliza um volume Docker para manter os dados entre reinicializações dos containers.

Para listar os bancos disponíveis:

```bash
docker exec bubatag-mongo mongosh --eval "show dbs"
```

Para acessar o banco `bubatag`:

```bash
docker exec -it bubatag-mongo mongosh bubatag
```

Dentro do shell do MongoDB, podem ser executadas consultas para inspecionar as coleções e os registros. Para sair:

```javascript
exit
```

**Atenção:** evite executar `docker compose down -v` em um ambiente com dados que precisam ser preservados, pois a opção `-v` remove os volumes associados ao projeto.

---

## 🛑 Como parar e iniciar novamente

Parar os containers sem remover o volume do banco:

```bash
docker compose down
```

Iniciar novamente os serviços já construídos:

```bash
docker compose up -d
```

Reconstruir as imagens após alterações no código:

```bash
docker compose up -d --build
```

Os dados do MongoDB são mantidos no volume nomeado enquanto esse volume não for removido.

---

## 🧪 Testes realizados

Durante a configuração do ambiente, foram realizados os seguintes testes:

- Inicialização dos três containers.
- Verificação do endpoint `/health` da API.
- Verificação do endpoint `/health` do serviço de IA.
- Classificação de dados fisiológicos no endpoint `/classificar`.
- Comunicação entre a API e o serviço de IA pela rede Docker.
- Registro de telemetria pela API.
- Confirmação da resposta de sucesso e da persistência dos dados.

Os testes demonstram o funcionamento técnico da integração. A validação da precisão do modelo com medições reais, critérios zootécnicos e amostras representativas ainda é uma etapa necessária.

---

