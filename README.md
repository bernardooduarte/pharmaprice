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
│   │   ├── components/         # MedicamentoInfoCard, PmcPricingCard, HistoricoPrecosTable, etc.
│   │   ├── pages/               # HomePage, ResultadosPage, DetalhesPage
│   │   └── services/            # Chamadas à API (api.ts)
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

### 4. Rodar os testes

```bash
cd backend
pytest --cov=app tests/
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

### Em desenvolvimento

- [ ] Seção de histórico de buscas (Home)
- [ ] Páginas "Como Funciona" e "Sobre"
- [ ] Tela de Configurações (preferências de usuário, raio de busca)
- [ ] Assistente de IA conversacional
- [ ] Scraping real de farmácias (Drogasil, Ultrafarma)
- [ ] Login / cadastro de usuário
- [ ] Geolocalização com raio configurável
- [ ] Convênios de desconto
- [ ] Cobertura de testes ≥ 70%

---

## Publicações relacionadas

- DUARTE, B. O.; MORAES, E. A. P. PharmaPrice: Sistema Web Inteligente para Comparação de Preços de Medicamentos com Integração de Dados Regulatórios da CMED. In: XII Congresso Internacional em Tecnologia e Organização da Informação (TOI 2026), São Paulo, 2026.

---

## Licença

MIT License — veja [LICENSE](./LICENSE) para detalhes.
