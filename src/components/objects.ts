import { FALLBACK_OBJECT_IMAGE } from "../config.js";
import type { AppState, Objeto } from "../types.js";
import { escapeHtml, formatDate } from "../utils/format.js";
import { renderEmptyState } from "./shared.js";

export function renderExplorarView(state: AppState): string {
  return `
    <section class="view-header">
      <div>
        <h1>Explorar</h1>
        <p>${state.objetos.length} objeto${state.objetos.length === 1 ? "" : "s"}</p>
      </div>
      <button class="btn primary" data-nav="meus" ${state.user ? "" : "disabled"} title="Novo registro">
        <i data-icon="plus"></i><span>Novo</span>
      </button>
    </section>
    ${renderFilters(state)}
    ${renderObjectGrid(state.objetos, false)}
  `;
}

export function renderMeusView(state: AppState): string {
  return `
    <section class="view-header">
      <div>
        <h1>Meus registros</h1>
        <p>${state.meusObjetos.length} registro${state.meusObjetos.length === 1 ? "" : "s"}</p>
      </div>
      <button class="btn neutral" id="resetObjectForm" title="Limpar formulario">
        <i data-icon="rotate-ccw"></i><span>Limpar</span>
      </button>
    </section>
    <div class="split">
      ${renderObjectForm(state)}
      ${renderObjectGrid(state.meusObjetos, true)}
    </div>
  `;
}

function renderFilters(state: AppState): string {
  return `
    <form class="filters" id="filterForm">
      <label class="search-field">
        <i data-icon="search"></i>
        <input name="search" value="${escapeHtml(state.filters.search)}" placeholder="Buscar" />
      </label>
      <select name="tipo" aria-label="Tipo">
        <option value="">Tipo</option>
        <option value="perdido" ${state.filters.tipo === "perdido" ? "selected" : ""}>Perdido</option>
        <option value="encontrado" ${state.filters.tipo === "encontrado" ? "selected" : ""}>Encontrado</option>
      </select>
      <select name="categoria" aria-label="Categoria">
        <option value="">Categoria</option>
        ${state.categorias
          .map((categoria) => `<option value="${categoria.id}" ${state.filters.categoria === String(categoria.id) ? "selected" : ""}>${escapeHtml(categoria.nome)}</option>`)
          .join("")}
      </select>
      <select name="local" aria-label="Local">
        <option value="">Local</option>
        ${state.locais
          .map((local) => `<option value="${local.id}" ${state.filters.local === String(local.id) ? "selected" : ""}>${escapeHtml(local.nome)}</option>`)
          .join("")}
      </select>
      <button class="btn neutral" type="submit" title="Filtrar">
        <i data-icon="list-filter"></i><span>Filtrar</span>
      </button>
      <button class="icon-btn" type="button" id="clearFilters" title="Limpar filtros">
        <i data-icon="x"></i>
      </button>
    </form>
  `;
}

function renderObjectForm(state: AppState): string {
  const objeto = state.editingObjectId
    ? state.meusObjetos.find((item) => item.id === state.editingObjectId)
    : null;

  return `
    <form class="tool-panel object-form" id="objectForm">
      <div class="panel-title">
        <i data-icon="${objeto ? "pencil" : "plus-circle"}"></i>
        <h2>${objeto ? "Editar objeto" : "Novo objeto"}</h2>
      </div>
      <input type="hidden" name="id" value="${objeto?.id ?? ""}" />
      <div class="grid-2">
        <label>
          <span>Tipo</span>
          <select name="tipo" required>
            <option value="perdido" ${objeto?.tipo === "perdido" ? "selected" : ""}>Perdido</option>
            <option value="encontrado" ${objeto?.tipo === "encontrado" ? "selected" : ""}>Encontrado</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select name="status" required>
            <option value="ativo" ${objeto?.status === "ativo" ? "selected" : ""}>Ativo</option>
            <option value="pendente" ${objeto?.status === "pendente" ? "selected" : ""}>Pendente</option>
            <option value="resolvido" ${objeto?.status === "resolvido" ? "selected" : ""}>Resolvido</option>
          </select>
        </label>
      </div>
      <label>
        <span>Titulo</span>
        <input name="titulo" value="${escapeHtml(objeto?.titulo)}" maxlength="200" required />
      </label>
      <label>
        <span>Descricao</span>
        <textarea name="descricao" rows="4" required>${escapeHtml(objeto?.descricao)}</textarea>
      </label>
      <div class="grid-2">
        <label>
          <span>Categoria</span>
          <select name="categoria">
            <option value="">Sem categoria</option>
            ${state.categorias
              .map((categoria) => `<option value="${categoria.id}" ${objeto?.categoria === categoria.id ? "selected" : ""}>${escapeHtml(categoria.nome)}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span>Local</span>
          <select name="local">
            <option value="">Sem local</option>
            ${state.locais
              .map((local) => `<option value="${local.id}" ${objeto?.local === local.id ? "selected" : ""}>${escapeHtml(local.nome)}</option>`)
              .join("")}
          </select>
        </label>
      </div>
      <label>
        <span>Data</span>
        <input name="data_ocorrencia" type="date" value="${escapeHtml(objeto?.data_ocorrencia || new Date().toISOString().slice(0, 10))}" required />
      </label>
      <label>
        <span>Ponto de referencia</span>
        <input name="ponto_referencia" value="${escapeHtml(objeto?.ponto_referencia)}" />
      </label>
      <label>
        <span>Contato</span>
        <input name="contato" value="${escapeHtml(objeto?.contato)}" />
      </label>
      <label>
        <span>Imagem URL</span>
        <input name="imagem_url" type="url" value="${escapeHtml(objeto?.imagem_url)}" />
      </label>
      <button class="btn primary" type="submit" title="Salvar objeto">
        <i data-icon="save"></i><span>Salvar</span>
      </button>
    </form>
  `;
}

function renderObjectGrid(objetos: Objeto[], editable: boolean): string {
  if (!objetos.length) return renderEmptyState();

  return `
    <section class="object-grid">
      ${objetos.map((objeto) => renderObjectCard(objeto, editable)).join("")}
    </section>
  `;
}

function renderObjectCard(objeto: Objeto, editable: boolean): string {
  const image = objeto.imagem_url || FALLBACK_OBJECT_IMAGE;

  return `
    <article class="object-card">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(objeto.titulo)}" loading="lazy" />
      <div class="object-body">
        <div class="card-row">
          <span class="badge ${objeto.tipo}">${escapeHtml(objeto.tipo_display || objeto.tipo)}</span>
          <span class="status ${objeto.status}">${escapeHtml(objeto.status_display || objeto.status)}</span>
        </div>
        <h2>${escapeHtml(objeto.titulo)}</h2>
        <p>${escapeHtml(objeto.descricao)}</p>
        <dl>
          <div><dt>Data</dt><dd>${escapeHtml(formatDate(objeto.data_ocorrencia))}</dd></div>
          <div><dt>Local</dt><dd>${escapeHtml(objeto.local_nome || "Nao informado")}</dd></div>
          <div><dt>Categoria</dt><dd>${escapeHtml(objeto.categoria_nome || "Nao informada")}</dd></div>
          <div><dt>Contato</dt><dd>${escapeHtml(objeto.contato || objeto.usuario?.email || "Nao informado")}</dd></div>
        </dl>
      </div>
      ${
        editable
          ? `<footer class="card-actions">
              <button class="icon-btn" data-edit-object="${objeto.id}" title="Editar">
                <i data-icon="pencil"></i>
              </button>
              <button class="icon-btn" data-resolve-object="${objeto.id}" title="Marcar resolvido">
                <i data-icon="check"></i>
              </button>
              <button class="icon-btn danger" data-delete-object="${objeto.id}" title="Excluir">
                <i data-icon="trash-2"></i>
              </button>
            </footer>`
          : ""
      }
    </article>
  `;
}
