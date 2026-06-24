# PharmaPrice 💊

**Sistema web para comparação de preços de medicamentos com integração de dados regulatórios da CMED/ANVISA**

Trabalho de Conclusão de Curso II (TCC2) — Bacharelado em Sistemas de Informação  
Instituto Federal de Educação, Ciência e Tecnologia do Sudeste de Minas Gerais — Campus Juiz de Fora (IFSEMG)

**Autor:** Bernardo Oliveira Duarte  
**Orientador:** Prof. Emerson Augusto Priamo Moraes  
**Ano:** 2026

---

## Sobre o projeto

O PharmaPrice é um sistema web responsivo que integra dados regulatórios da CMED (Câmara de Regulação do Mercado de Medicamentos/ANVISA) com preços praticados em farmácias brasileiras, permitindo ao consumidor comparar o preço encontrado com o Preço Máximo ao Consumidor (PMC) definido pelo governo.

O principal diferencial do sistema é tornar visível o teto regulatório da CMED no momento da decisão de compra — algo que as plataformas comerciais existentes (Consulta Remédios, CliqueFarma) não fazem explicitamente.

Este repositório contém a **implementação do protótipo funcional** desenvolvida no TCC2. O modelo conceitual completo foi publicado no XII Congresso Internacional em Tecnologia e Organização da Informação (TOI 2026).

---

## Stack tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Python + FastAPI | 3.12 / 0.115+ |
| Banco de dados | PostgreSQL | 16 |
| ORM | SQLAlchemy + Alembic | 2.x |
| Scraping | Playwright (Python) | 1.44+ |
| Frontend | React + Vite + TypeScript | 18 / 5.x |
| Testes | pytest + pytest-cov + MutMut | — |
| Containerização | Docker + Docker Compose | — |

---

## Estrutura do repositório

```
pharmaprice/
├── backend/                  # API FastAPI
│   ├── app/
│   │   ├── api/              # Rotas e endpoints
│   │   ├── core/             # Configurações, variáveis de ambiente
│   │   ├── db/               # Modelos SQLAlchemy e sessão
│   │   ├── scraper/          # Módulos de coleta por farmácia
│   │   ├── cmed/             # Pipeline de integração CMED/PMC
│   │   └── services/         # Lógica de negócio (matching, comparação)
│   ├── tests/                # Testes automatizados (pytest)
│   └── requirements.txt
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/         # Chamadas à API
│   └── package.json
├── docs/                     # Documentação técnica e diagramas
├── docker-compose.yml        # PostgreSQL local para desenvolvimento
├── .env.example              # Variáveis de ambiente (sem valores sensíveis)
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
uvicorn app.main:app --reload
```
API disponível em: http://localhost:8000  
Documentação Swagger: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App disponível em: http://localhost:5173

### 4. Rodar os testes
```bash
cd backend
pytest --cov=app tests/
```

---

## Escopo do protótipo (TCC2)

### Implementado
- [ ] Pipeline de integração com tabela CMED/PMC (download automático + parsing)
- [ ] Busca de medicamento por nome comercial ou princípio ativo
- [ ] Scraping de preços: Drogasil e Ultrafarma
- [ ] Matching medicamento ↔ PMC com normalização de nomes
- [ ] Exibição do resultado com comparação explícita ao PMC da CMED
- [ ] API REST documentada (FastAPI + Swagger automático)
- [ ] Testes automatizados dos módulos de negócio (meta: ≥ 70% de cobertura)

### Fora do escopo (trabalhos futuros)
- Integração com as demais 7 farmácias do modelo conceitual
- Convênios de desconto
- Assistente de IA conversacional
- Geolocalização com raio configurável
- Histórico de buscas e perfil de usuário

---

## Publicações relacionadas

- DUARTE, B. O.; MORAES, E. A. P. PharmaPrice: Sistema Web Inteligente para Comparação de Preços de Medicamentos com Integração de Dados Regulatórios da CMED. In: XII Congresso Internacional em Tecnologia e Organização da Informação (TOI 2026), São Paulo, 2026.

---

## Licença

MIT License — veja [LICENSE](LICENSE) para detalhes.
