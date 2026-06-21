import type { AppState, Objeto } from "../types.js";
import { escapeHtml, formatDate } from "../utils/format.js";
import { renderLocked } from "./shared.js";

export function renderExplorarView(state: AppState): string {
  const objetos = filterPublicObjects(state);

  return `
    <div class="page-header">
      <h1>Itens Publicos</h1>
      ${state.user ? `<button class="btn btn-primary" type="button" data-create-object>Registrar Solicitacao</button>` : ""}
    </div>

    <div class="filter-tags">
      ${filterTag(state, "", "Todos", "")}
      ${filterTag(state, "perdido", "Perdidos", "tipo-perdido")}
      ${filterTag(state, "encontrado", "Encontrados", "tipo-encontrado")}
      ${filterTag(state, "resolvido", "Devolvidos", "status-devolvido")}
    </div>

    <form class="filter-bar" id="filterForm">
      <input type="hidden" name="tipo" value="${escapeHtml(state.filters.tipo)}" />
      <input type="text" name="search" value="${escapeHtml(state.filters.search)}" placeholder="Buscar por titulo ou descricao..." />
      <select name="categoria">
        <option value="">Todas as categorias</option>
        ${state.categorias
          .map((categoria) => `<option value="${categoria.id}" ${state.filters.categoria === String(categoria.id) ? "selected" : ""}>${escapeHtml(categoria.nome)}</option>`)
          .join("")}
      </select>
      <select name="local">
        <option value="">Todos os locais</option>
        ${state.locais
          .map((local) => `<option value="${local.id}" ${state.filters.local === String(local.id) ? "selected" : ""}>${escapeHtml(formatLocal(local.nome, local.predio, local.andar))}</option>`)
          .join("")}
      </select>
      <button type="submit" class="btn btn-secondary">Filtrar</button>
    </form>

    ${
      objetos.length
        ? `<div class="cards-grid">${objetos.map(renderPublicCard).join("")}</div>`
        : `<div class="empty-state-large"><p>Nenhum item encontrado.</p></div>`
    }
  `;
}

export function renderMeusView(state: AppState): string {
  if (!state.user) return renderLocked();

  const objetos = state.meusObjetos.filter((objeto) => {
    if (state.meusFilters.tipo && objeto.tipo !== state.meusFilters.tipo) return false;
    if (state.meusFilters.status && objeto.status !== state.meusFilters.status) return false;
    return true;
  });

  return `
    <div class="page-header">
      <h1>Meus Registros</h1>
      <button class="btn btn-primary" type="button" data-create-object>Registrar Solicitacao</button>
    </div>

    <form class="filter-bar" id="myFilterForm">
      <select name="tipo">
        <option value="">Todos os tipos</option>
        <option value="perdido" ${state.meusFilters.tipo === "perdido" ? "selected" : ""}>Perdidos</option>
        <option value="encontrado" ${state.meusFilters.tipo === "encontrado" ? "selected" : ""}>Encontrados</option>
      </select>
      <select name="status">
        <option value="">Todos os status</option>
        <option value="pendente" ${state.meusFilters.status === "pendente" ? "selected" : ""}>Pendente</option>
        <option value="ativo" ${state.meusFilters.status === "ativo" ? "selected" : ""}>Ativo</option>
        <option value="resolvido" ${state.meusFilters.status === "resolvido" ? "selected" : ""}>Devolvido</option>
      </select>
      <button type="submit" class="btn btn-secondary">Filtrar</button>
    </form>

    ${
      objetos.length
        ? `
          <section class="dashboard-section">
            <table class="table">
              <thead>
                <tr><th>Titulo</th><th>Tipo</th><th>Categoria</th><th>Data</th><th>Acoes</th></tr>
              </thead>
              <tbody>
                ${objetos.map(renderMyObjectRow).join("")}
              </tbody>
            </table>
          </section>
        `
        : `
          <div class="empty-state-large">
            <p>Nenhum registro encontrado.</p>
            <button class="btn btn-primary" type="button" data-create-object>Registrar meu primeiro item</button>
          </div>
        `
    }
  `;
}

export function renderObjectFormView(state: AppState): string {
  if (!state.user) return renderLocked();

  const objeto = state.editingObjectId
    ? state.meusObjetos.find((item) => item.id === state.editingObjectId)
      || state.objetos.find((item) => item.id === state.editingObjectId)
    : null;
  const acao = objeto ? "Editar" : "Registrar";

  return `
    <h1>${acao} Solicitacao</h1>

    <form class="form-card" id="objectForm">
      <input type="hidden" name="id" value="${objeto?.id ?? ""}" />

      ${
        !objeto
          ? `
            <div class="form-group">
              <label>Tipo de solicitacao *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" name="tipo" value="perdido" checked />
                  <span>Objeto Perdido</span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="tipo" value="encontrado" />
                  <span>Objeto Encontrado</span>
                </label>
              </div>
            </div>
          `
          : `<input type="hidden" name="tipo" value="${escapeHtml(objeto.tipo)}" />`
      }

      <div class="form-group">
        <label for="id_titulo">Titulo *</label>
        <input type="text" name="titulo" id="id_titulo" required value="${escapeHtml(objeto?.titulo)}" placeholder="Ex: Carteira preta, Celular Samsung..." />
      </div>

      <div class="form-group">
        <label for="id_descricao">Descricao detalhada *</label>
        <textarea name="descricao" id="id_descricao" rows="4" required placeholder="Descreva o objeto com o maximo de detalhes possivel...">${escapeHtml(objeto?.descricao)}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="id_categoria">Categoria *</label>
          <select name="categoria" id="id_categoria" required>
            <option value="">Selecione</option>
            ${state.categorias
              .map((categoria) => `<option value="${categoria.id}" ${objeto?.categoria === categoria.id ? "selected" : ""}>${escapeHtml(categoria.nome)}</option>`)
              .join("")}
          </select>
        </div>
        <div class="form-group">
          <label for="id_local">Local *</label>
          <select name="local" id="id_local" required>
            <option value="">Selecione</option>
            ${state.locais
              .map((local) => `<option value="${local.id}" ${objeto?.local === local.id ? "selected" : ""}>${escapeHtml(formatLocal(local.nome, local.predio, local.andar))}</option>`)
              .join("")}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="id_data_ocorrencia">Data da ocorrencia *</label>
          <input type="date" name="data_ocorrencia" id="id_data_ocorrencia" required value="${escapeHtml(objeto?.data_ocorrencia || new Date().toISOString().slice(0, 10))}" />
        </div>
        <div class="form-group">
          <label for="id_imagem">Imagem do computador (opcional)</label>
          <input type="file" name="imagem" id="id_imagem" accept="image/*" />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${acao}</button>
        <a href="/meus-registros" data-nav="meus" class="btn btn-secondary">Cancelar</a>
      </div>
    </form>
  `;
}

export function renderObjectDetailView(state: AppState): string {
  const objeto = state.objetos.find((item) => item.id === state.selectedObjectId)
    || state.meusObjetos.find((item) => item.id === state.selectedObjectId);
  if (!objeto) {
    return `<div class="empty-state-large"><p>Item nao encontrado.</p><a href="/explorar" data-nav="explorar" class="btn btn-primary">Voltar para itens</a></div>`;
  }

  const canManage = Boolean(state.user && (state.user.is_staff || objeto.usuario?.id === state.user.id));
  const canEdit = canManage && objeto.status !== "resolvido";
  const showContact = Boolean(state.user && state.user.id !== objeto.usuario?.id && objeto.status === "ativo");
  const correspondencias = state.objetos
    .filter((item) => item.id !== objeto.id && item.categoria === objeto.categoria && item.status === "ativo" && item.tipo !== objeto.tipo)
    .slice(0, 5);

  return `
    <div class="breadcrumb">
      <a href="/explorar" data-nav="explorar">Itens</a> &raquo; ${escapeHtml(objeto.titulo)}
    </div>

    <div class="detail-card">
      <div class="detail-header">
        <h1>${escapeHtml(objeto.titulo)}</h1>
        <div>
          ${renderTypeOrStatusBadge(objeto)}
          ${objeto.status !== "ativo" ? renderStatusBadge(objeto) : ""}
        </div>
      </div>

      ${objectImage(objeto) ? `<div class="detail-image"><img src="${escapeHtml(objectImage(objeto))}" alt="${escapeHtml(objeto.titulo)}"></div>` : ""}

      <div class="detail-body">
        <div class="detail-info-grid">
          <div class="detail-info"><strong>Categoria:</strong> ${escapeHtml(objeto.categoria_nome || "Nao informada")}</div>
          <div class="detail-info"><strong>Local:</strong> ${escapeHtml(objeto.local_nome || "Nao informado")}</div>
          <div class="detail-info"><strong>Data:</strong> ${escapeHtml(formatDate(objeto.data_ocorrencia))}</div>
          <div class="detail-info"><strong>Registrado em:</strong> ${escapeHtml(formatDate(objeto.criado_em?.slice(0, 10)))}</div>
          <div class="detail-info"><strong>Registrado por:</strong> ${escapeHtml(objeto.usuario?.nome || objeto.usuario?.username || "-")}</div>
        </div>

        <div class="detail-description">
          <h2>Descricao</h2>
          <p>${escapeHtml(objeto.descricao)}</p>
        </div>

        ${
          showContact
            ? `
              <div class="info-box">
                <h3>${objeto.tipo === "perdido" ? "Contato do dono" : "Contato de quem encontrou"}</h3>
                <p><strong>E-mail:</strong> <a href="mailto:${escapeHtml(objeto.usuario?.email)}">${escapeHtml(objeto.usuario?.email || "Nao informado")}</a></p>
                <p><strong>Telefone:</strong> ${escapeHtml(objeto.contato || objeto.usuario?.perfil?.telefone || "Nao informado")}</p>
              </div>
            `
            : ""
        }
      </div>

      <div class="detail-actions">
        ${
          state.user?.is_staff && objeto.status === "ativo"
            ? `<button type="button" class="btn btn-secondary" data-resolve-object="${objeto.id}">Marcar como Devolvido</button>`
            : ""
        }
        ${
          canEdit
            ? `
              <button type="button" class="btn btn-secondary" data-edit-object="${objeto.id}">Editar</button>
              <button type="button" class="btn btn-danger" data-delete-object="${objeto.id}">Excluir</button>
            `
            : ""
        }
      </div>
    </div>

    ${
      correspondencias.length
        ? `
          <section class="section-correspondencias">
            <h2>Possiveis Correspondencias</h2>
            <p>${objeto.tipo === "perdido" ? "Objetos encontrados na mesma categoria que podem ser o seu:" : "Registros de perda na mesma categoria que podem corresponder a este achado:"}</p>
            <div class="cards-grid">${correspondencias.map(renderMatchCard).join("")}</div>
          </section>
        `
        : ""
    }
  `;
}

function filterPublicObjects(state: AppState): Objeto[] {
  return state.objetos.filter((objeto) => {
    if (state.filters.tipo === "resolvido" && objeto.status !== "resolvido") return false;
    if (state.filters.tipo && state.filters.tipo !== "resolvido" && objeto.tipo !== state.filters.tipo) return false;
    if (!state.filters.tipo && objeto.status !== "ativo" && objeto.status !== "resolvido") return false;
    if (state.filters.categoria && String(objeto.categoria) !== state.filters.categoria) return false;
    if (state.filters.local && String(objeto.local) !== state.filters.local) return false;
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      if (!`${objeto.titulo} ${objeto.descricao}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function filterTag(state: AppState, tipo: string, label: string, extraClass: string): string {
  return `<button type="button" class="filter-tag ${extraClass} ${state.filters.tipo === tipo ? "filter-tag-active" : ""}" data-public-filter="${tipo}">${escapeHtml(label)}</button>`;
}

function renderPublicCard(objeto: Objeto): string {
  const image = objectImage(objeto);

  return `
    <div class="card">
      ${image ? `<div class="card-image"><img src="${escapeHtml(image)}" alt="${escapeHtml(objeto.titulo)}"></div>` : ""}
      <div class="card-header">
        <span class="badge badge-categoria">${escapeHtml(objeto.categoria_nome || "Sem categoria")}</span>
        ${renderTypeOrStatusBadge(objeto)}
      </div>
      <h3><a href="/objetos/${objeto.id}" data-view-object="${objeto.id}">${escapeHtml(objeto.titulo)}</a></h3>
      <p class="card-desc">${escapeHtml(truncateWords(objeto.descricao, 20))}</p>
      <p class="card-meta">${escapeHtml(objeto.local_nome || "")}${objeto.local_nome ? " &middot; " : ""}${escapeHtml(formatDate(objeto.data_ocorrencia))}</p>
      <p class="card-meta">${escapeHtml(objeto.usuario?.nome || objeto.usuario?.username || "")}</p>
    </div>
  `;
}

function renderMyObjectRow(objeto: Objeto): string {
  return `
    <tr>
      <td><a href="/objetos/${objeto.id}" data-view-object="${objeto.id}">${escapeHtml(objeto.titulo)}</a></td>
      <td>${renderTypeOrStatusBadge(objeto)} ${objeto.status !== "ativo" ? renderStatusBadge(objeto) : ""}</td>
      <td>${escapeHtml(objeto.categoria_nome || "-")}</td>
      <td>${escapeHtml(formatDate(objeto.data_ocorrencia))}</td>
      <td>
        ${
          objeto.status !== "resolvido"
            ? `
              <button class="btn btn-small btn-secondary" type="button" data-edit-object="${objeto.id}">Editar</button>
              <button class="btn btn-small btn-danger" type="button" data-delete-object="${objeto.id}">Excluir</button>
            `
            : `<span class="text-muted">Sem acoes</span>`
        }
      </td>
    </tr>
  `;
}

function renderMatchCard(objeto: Objeto): string {
  return `
    <div class="card card-match">
      <div class="card-header">
        <span class="badge badge-categoria">${escapeHtml(objeto.categoria_nome || "Sem categoria")}</span>
        ${renderTypeOrStatusBadge(objeto)}
      </div>
      <h3><a href="/objetos/${objeto.id}" data-view-object="${objeto.id}">${escapeHtml(objeto.titulo)}</a></h3>
      <p class="card-desc">${escapeHtml(truncateWords(objeto.descricao, 15))}</p>
      <p class="card-meta">${escapeHtml(objeto.local_nome || "")}${objeto.local_nome ? " &middot; " : ""}${escapeHtml(formatDate(objeto.data_ocorrencia))}</p>
    </div>
  `;
}

function renderTypeOrStatusBadge(objeto: Objeto): string {
  if (objeto.status === "resolvido") return `<span class="badge status-devolvido">Devolvido</span>`;
  return `<span class="badge tipo-${objeto.tipo}">${escapeHtml(objeto.tipo_display || objeto.tipo)}</span>`;
}

function renderStatusBadge(objeto: Objeto): string {
  if (objeto.status === "resolvido") return `<span class="card-status status-devolvido">Devolvido</span>`;
  return `<span class="card-status status-${objeto.status}">${escapeHtml(objeto.status_display || objeto.status)}</span>`;
}

function truncateWords(value: string, limit: number): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return value;
  return `${words.slice(0, limit).join(" ")}...`;
}

function formatLocal(nome: string, predio: string, andar: string): string {
  return [nome, predio, andar].filter(Boolean).join(" - ");
}

function objectImage(objeto: Objeto): string {
  return objeto.imagem_exibicao || objeto.imagem_url || "";
}
