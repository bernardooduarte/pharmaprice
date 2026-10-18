"""
Pipeline de integração CMED/PMC — PharmaPrice
============================================
Responsabilidades:
  1. Fazer download do arquivo XLS/XLSX da ANVISA
  2. Parsear as colunas relevantes
  3. Inserir/atualizar os registros no banco PostgreSQL

Estrutura da planilha (confirmada em 10/06/2026):
  - Cabeçalho real: linha 43
  - Dados: linhas 44 em diante
  - Total: ~25.435 linhas x 74 colunas
  - PMC 18% (MG padrão): coluna 47 (índice base 0)
"""
import logging
import re
import unicodedata
from datetime import datetime
from decimal import Decimal, InvalidOperation
from io import BytesIO
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import httpx
import openpyxl
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


CMED_URL = (
    "https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos"
)


_LINK_XLSX_PMC = re.compile(
    r'href="([^"]*(?:xls_conformidade_site_|lista_pmc_)[^"]*\.xlsx/@@download/file)"'
)


HEADER_ROW = 43


COLUMN_MAP = {
    0:  "substancia",
    1:  "cnpj",
    2:  "laboratorio",
    3:  "codigo_ggrem",
    4:  "registro",
    5:  "ean1",
    8:  "produto",
    9:  "apresentacao",
    10: "classe_terapeutica",
    11: "tipo_produto",
    12: "regime_preco",
    13: "pf_sem_impostos",
    14: "pf_0",
    39: "pmc_sem_impostos",
    40: "pmc_0",
    41: "pmc_12",
    43: "pmc_17",
    47: "pmc_18",
    49: "pmc_19",
    53: "pmc_20",
    65: "restricao_hospitalar",
    66: "cap",
    67: "confaz_87",
    68: "icms_0",
    71: "comercializacao_2025",
    72: "tarja",
}


def _parse_decimal(value) -> Optional[Decimal]:
    """Converte string ou número para Decimal. Retorna None se inválido."""
    if value is None:
        return None
    try:

        cleaned = str(value).strip().replace(",", ".").replace(" ", "")
        if cleaned in ("", "-", "    -     "):
            return None
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def _parse_bool_flag(value) -> bool:
    """Interpreta flags como 'Sim', 'S', '1', True → True."""
    if value is None:
        return False
    return str(value).strip().upper() in ("SIM", "S", "1", "TRUE", "X")


def _extrair_data_publicacao(ws) -> str:
    """Extrai a data de publicação do cabeçalho da planilha (linha 3)."""
    try:
        valor = ws.cell(row=3, column=1).value or ""

        match = re.search(r"\d{2}/\d{2}/\d{4}.*", str(valor))
        return match.group(0).rstrip(".") if match else str(valor)
    except Exception:
        return ""


def _row_to_dict(row_values: tuple, mapa: dict = COLUMN_MAP) -> dict:
    """Converte uma linha da planilha em dicionário para o modelo."""
    data = {}
    for col_idx, field_name in mapa.items():
        if col_idx >= len(row_values):
            continue
        value = row_values[col_idx]

        if field_name in ("pf_sem_impostos", "pf_0", "pmc_sem_impostos",
                          "pmc_0", "pmc_12", "pmc_17", "pmc_18",
                          "pmc_19", "pmc_20"):
            data[field_name] = _parse_decimal(value)
        elif field_name in ("restricao_hospitalar", "cap", "confaz_87", "icms_0"):
            data[field_name] = _parse_bool_flag(value)
        else:

            cleaned = str(value).strip() if value is not None else None
            if cleaned in ("", "-", "    -     ", "None"):
                cleaned = None
            data[field_name] = cleaned

    return data


def _normalizar_cabecalho(valor) -> str:
    """Remove acentos/espaços extras e põe em maiúsculas para comparar títulos."""
    texto = unicodedata.normalize("NFKD", str(valor or ""))
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", texto).strip().upper()


_COLUNAS_POR_TITULO = {
    "RESTRICAO HOSPITALAR": "restricao_hospitalar",
    "CAP": "cap",
    "CONFAZ 87": "confaz_87",
    "ICMS 0%": "icms_0",
    "TARJA": "tarja",
}


def _montar_mapa_colunas(cabecalho: tuple) -> dict:
    """Parte do COLUMN_MAP e reposiciona as colunas finais conforme o cabeçalho real."""
    mapa = {i: c for i, c in COLUMN_MAP.items() if i < 65}
    for idx, titulo in enumerate(cabecalho):
        titulo = _normalizar_cabecalho(titulo)
        if titulo in _COLUNAS_POR_TITULO:
            mapa[idx] = _COLUNAS_POR_TITULO[titulo]
        elif titulo.startswith("COMERCIALIZACAO"):
            mapa[idx] = "comercializacao_2025"
    return mapa


def _localizar_cabecalho(ws, limite: int = 60) -> tuple[int, tuple] | None:
    """Acha a linha de cabeçalho (a que contém 'CÓDIGO GGREM') nas primeiras linhas."""
    for row_num, row in enumerate(ws.iter_rows(values_only=True, max_row=limite), start=1):
        if len(row) > 3 and "GGREM" in _normalizar_cabecalho(row[3]):
            return row_num, row
    return None


def parsear_xlsx(conteudo: bytes) -> tuple[list[dict], str]:
    """
    Lê o conteúdo binário do XLSX da CMED e retorna:
      - lista de dicionários (um por medicamento)
      - data de publicação extraída do cabeçalho

    Aceita o layout antigo (aba única, cabeçalho na linha 43) e o novo
    (abas "Cabeçalho" e "Lista PMC", cabeçalho na linha 1).
    """
    wb = openpyxl.load_workbook(
        BytesIO(conteudo),
        read_only=True,
        data_only=True
    )
    ws_capa = wb.active
    ws = wb["Lista PMC"] if "Lista PMC" in wb.sheetnames else ws_capa

    data_publicacao = _extrair_data_publicacao(ws_capa)
    medicamentos = []

    achado = _localizar_cabecalho(ws)
    if achado:
        header_row, cabecalho = achado
        mapa = _montar_mapa_colunas(cabecalho)
    else:
        header_row, mapa = HEADER_ROW, COLUMN_MAP

    for row_num, row in enumerate(ws.iter_rows(values_only=True), start=1):

        if row_num <= header_row:
            continue

        if all(v is None for v in row):
            continue

        if row[0] is None and row[8] is None:
            continue

        record = _row_to_dict(row, mapa)

        if not record.get("codigo_ggrem"):
            continue

        medicamentos.append(record)

    wb.close()
    logger.info(
        f"Parsing concluído: {len(medicamentos)} medicamentos extraídos "
        f"(publicação: {data_publicacao})"
    )
    return medicamentos, data_publicacao


async def localizar_url_xlsx_atual(cliente: httpx.AsyncClient) -> str:
    """
    Faz scraping da página da CMED para encontrar o link de download
    do arquivo XLSX (PMC) publicado mais recentemente.
    """
    resposta = await cliente.get(CMED_URL, follow_redirects=True, timeout=30.0)
    resposta.raise_for_status()

    match = _LINK_XLSX_PMC.search(resposta.text)
    if not match:
        raise RuntimeError(
            "Não foi possível localizar o link do arquivo XLSX na página da CMED. "
            "O layout da página pode ter mudado."
        )
    return urljoin(str(resposta.url), match.group(1))


async def baixar_xlsx_remoto(cliente: httpx.AsyncClient, url: str) -> bytes:
    """Baixa o conteúdo binário do arquivo XLSX a partir de uma URL."""
    resposta = await cliente.get(url, follow_redirects=True, timeout=120.0)
    resposta.raise_for_status()
    return resposta.content


async def atualizar_cmed_do_site(session: Session) -> dict:
    """
    Ponta a ponta: localiza o arquivo mais recente no site da CMED, baixa,
    faz o parsing e grava/atualiza os registros no banco.
    """
    async with httpx.AsyncClient() as cliente:
        url_xlsx = await localizar_url_xlsx_atual(cliente)
        conteudo = await baixar_xlsx_remoto(cliente, url_xlsx)

    medicamentos, data_publicacao = parsear_xlsx(conteudo)
    return salvar_no_banco(
        session,
        medicamentos,
        data_publicacao=data_publicacao,
        fonte_url=url_xlsx,
    )


def parsear_arquivo_local(caminho: str) -> tuple[list[dict], str]:
    """
    Variante para desenvolvimento: lê de um arquivo local em vez de baixar.
    Útil para testes sem depender da URL da ANVISA.
    """
    with open(caminho, "rb") as f:
        conteudo = f.read()
    return parsear_xlsx(conteudo)


TAMANHO_LOTE = 1000


_CAMPOS_OBRIGATORIOS = ("codigo_ggrem", "substancia", "produto", "apresentacao")


def salvar_no_banco(
    session: Session,
    medicamentos: list[dict],
    data_publicacao: str,
    fonte_url: str,
) -> dict:
    """
    Insere ou atualiza registros no banco em lotes, via UPSERT
    (INSERT ... ON CONFLICT) por codigo_ggrem (chave única).
    Muito mais rápido que fazer um SELECT + INSERT/UPDATE por linha,
    especialmente contra um banco remoto.
    Retorna estatísticas da operação.
    """

    from sqlalchemy.dialects.postgresql import insert as pg_insert

    from app.db.models import Medicamento

    data_coleta = datetime.utcnow()
    processados = 0
    erros = 0

    for inicio in range(0, len(medicamentos), TAMANHO_LOTE):
        lote = medicamentos[inicio:inicio + TAMANHO_LOTE]
        valores = []
        for record in lote:
            if any(not record.get(campo) for campo in _CAMPOS_OBRIGATORIOS):
                erros += 1
                continue
            valores.append({
                **record,
                "data_coleta": data_coleta,
                "fonte_url": fonte_url,
                "data_publicacao_cmed": data_publicacao,
            })

        if not valores:
            continue

        stmt = pg_insert(Medicamento).values(valores)
        colunas_update = {
            campo: getattr(stmt.excluded, campo)
            for campo in valores[0]
            if campo != "codigo_ggrem"
        }
        stmt = stmt.on_conflict_do_update(
            index_elements=["codigo_ggrem"],
            set_=colunas_update,
        )

        try:
            session.execute(stmt)
            session.commit()
            processados += len(valores)
            logger.debug(f"Progresso: {processados}/{len(medicamentos)} processados")
        except Exception as e:
            session.rollback()
            logger.error(f"Erro no lote {inicio}-{inicio + len(lote)}: {e}")
            erros += len(valores)

    stats = {
        "processados": processados,
        "erros": erros,
        "total": len(medicamentos),
        "data_publicacao": data_publicacao,
    }
    logger.info(f"Banco atualizado: {stats}")
    return stats
