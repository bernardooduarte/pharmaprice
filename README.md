# PharmaPrice 💊

**Sistema web para comparação de preços de medicamentos com integração de dados regulatórios da CMED/ANVISA**

Trabalho de Conclusão de Curso II (TCC2) — Bacharelado em Sistemas de Informação
Instituto Federal de Educação, Ciência e Tecnologia do Sudeste de Minas Gerais — Campus Juiz de Fora (IFSEMG)

**Autor:** Bernardo Oliveira Duarte
**Orientador:** Prof. Emerson Augusto Priamo Moraes
**Ano:** 2026

---

## Sobre o projeto

O PharmaPrice é um sistema web responsivo que integra dados regulatórios da CMED (Câmara de Regulação do Mercado de Medicamentos/ANVISA) com preços de medicamentos, permitindo ao consumidor comparar o preço encontrado com o Preço Máximo ao Consumidor (PMC) definido pelo governo.

O principal diferencial do sistema é tornar visível o teto regulatório da CMED no momento da decisão de compra — algo que as plataformas comerciais existentes (Consulta Remédios, CliqueFarma) não fazem explicitamente.

Este repositório contém a **implementação do protótipo funcional** desenvolvida no TCC2. O modelo conceitual completo foi publicado no XII Congresso Internacional em Tecnologia e Organização da Informação (TOI 2026).

---

## Stack tecnológica

| Camada          | Tecnologia                   | Versão        |
| --------------- | ----------------------------- | ------------- |
| Backend         | Python + FastAPI             | 3.12 / 0.115+ |
| Banco de dados  | PostgreSQL                   | 16            |
| ORM             | SQLAlchemy + Alembic         | 2.x           |
| Frontend        | React + Vite + TypeScript    | 18 / 5.x      |
| Testes          | pytest + pytest-cov          | —             |
| Containerização | Docker + Docker Compose      | —             |

---

## Estrutura do repositório

```
pharmaprice/
├── backend/
│   ├── app/
│   │   ├── api/               # Rotas e endpoints (medicamentos, histórico, comparação)
│   │   ├── core/               # Configurações, variáveis de ambiente
│   │   ├── db/                 # Modelos SQLAlchemy, sessão, migrations
│   │   ├── cmed/                # Pipeline de importação CMED/PMC
│   │   └── scripts/            # Scripts auxiliares (seed de dados)
│   ├── alembic/                # Migrations
│   ├── tests/                  # Testes automatizados (pytest)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # MedicamentoInfoCard, PmcPricingCard, HistoricoPrecosTable, Assistente, etc.
│   │   ├── pages/               # HomePage, ResultadosPage, DetalhesPage, Configuracoes, ComoFunciona, Sobre
│   │   └── services/            # Chamadas à API, histórico e configurações locais
│   └── package.json
├── docker-compose.yml           # PostgreSQL local para desenvolvimento
├── .env.example
└── README.md
```

---

## Como rodar localmente

### Pré-requisitos

- Python 3.12+
- Node.js 20+
- Docker e Docker Compose

### 1. Subir o banco de dados

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
alembic upgrade head            # Criar tabelas
python -m app.cmed.importar "caminho/para/cmed.xlsx"   # Importar dados CMED (arquivo não versionado)
uvicorn app.main:app --reload
```

API disponível em: <http://localhost:8000>
Documentação Swagger: <http://localhost:8000/docs>

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponível em: <http://localhost:5173>

Variável de ambiente opcional para alterar a API do frontend:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Rodar os testes

```bash
cd backend
python -m pytest --cov=app tests/ --cov-report=term-missing
```

---

## Escopo do protótipo (TCC2)

### Implementado

- [x] Pipeline de integração com tabela CMED/PMC (importação via planilha oficial)
- [x] Busca de medicamento por nome comercial ou princípio ativo (busca fuzzy com pg_trgm)
- [x] PMC dinâmico por UF
- [x] Histórico de preços por medicamento e UF
- [x] Comparação explícita entre preço coletado e PMC da CMED
- [x] API REST documentada (FastAPI + Swagger automático)
- [x] Frontend completo do fluxo principal: Home → Resultados → Detalhes
- [x] Design responsivo baseado em protótipo Figma
- [x] Histórico local de buscas e visitas no navegador, sem envio ao backend
- [x] Chips de buscas recentes na Home
- [x] Cards de resultado com indicação visual de PMC disponível/não publicado
- [x] Gráfico de evolução de preços na tela de detalhes
- [x] Seção de equivalentes na tela de detalhes
- [x] Tela de Configurações com persistência local
- [x] Páginas "Como Funciona" e "Sobre"
- [x] Assistente FAQ local com respostas pré-definidas
- [x] Variável de ambiente para a URL da API no frontend
- [x] Cobertura de testes do backend acima de 70%
- [x] Farmácias monitoradas na busca: Drogasil, Araújo, Pacheco, São Paulo, Ultrafarma, Raia e Indiana

### Em desenvolvimento

- [ ] Scraping real de farmácias com coleta automática de preços
- [ ] Exibição de logos oficiais das farmácias, quando houver autorização de uso
- [ ] Login / cadastro de usuário
- [ ] Geolocalização com raio configurável
- [ ] Convênios de desconto
- [ ] Sincronização opcional de dados de uso com backend após autenticação

---

## Publicações relacionadas

- DUARTE, B. O.; MORAES, E. A. P. PharmaPrice: Sistema Web Inteligente para Comparação de Preços de Medicamentos com Integração de Dados Regulatórios da CMED. In: XII Congresso Internacional em Tecnologia e Organização da Informação (TOI 2026), São Paulo, 2026.

---

## Licença

MIT License — veja [LICENSE](./LICENSE) para detalhes.

---

## Observação de estado atual

O protótipo funcional e o material de apresentação já cobrem o fluxo principal e as telas complementares. As pendências acima são integrações maiores de produto, especialmente autenticação, geolocalização, convênios e scraping automatizado de farmácias.
