import type { AppState, Categoria, Local, Objeto, Usuario } from "../types.js";
import { escapeHtml, formatDate } from "../utils/format.js";
import { renderLocked } from "./shared.js";

export function renderDashboardView(state: AppState): string {
  if (!state.user) return renderLocked();
  return state.user.is_staff ? renderAdminDashboard(state) : renderUserDashboard(state);
}

export function renderAprovacoesView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();

  const pendentes = state.objetos.filter((objeto) => objeto.status === "pendente");
  const perdidos = state.aprovacoesFilter === "encontrados" || state.aprovacoesFilter === "edicoes"
    ? []
    : pendentes.filter((objeto) => objeto.tipo === "perdido");
  const encontrados = state.aprovacoesFilter === "perdidos" || state.aprovacoesFilter === "edicoes"
    ? []
    : pendentes.filter((objeto) => objeto.tipo === "encontrado");
  const visibleCount = perdidos.length + encontrados.length;

  return `
    <div class="page-header">
      <h1>Aprovacoes Pendentes</h1>
    </div>

    <form class="filter-bar" id="approvalFilterForm">
      <select name="filtro">
        <option value="" ${state.aprovacoesFilter === "" ? "selected" : ""}>Todos os tipos</option>
        <option value="perdidos" ${state.aprovacoesFilter === "perdidos" ? "selected" : ""}>Objetos Perdidos</option>
        <option value="encontrados" ${state.aprovacoesFilter === "encontrados" ? "selected" : ""}>Objetos Encontrados</option>
        <option value="edicoes" ${state.aprovacoesFilter === "edicoes" ? "selected" : ""}>Solicitacoes de Edicao</option>
      </select>
      <button type="submit" class="btn btn-secondary">Filtrar</button>
    </form>

    ${renderApprovalSection("Objetos Perdidos Pendentes", perdidos)}
    ${renderApprovalSection("Objetos Encontrados Pendentes", encontrados)}

    ${
      visibleCount
        ? ""
        : `<div class="empty-state-large"><p>Nenhuma aprovacao pendente. Tudo em dia!</p></div>`
    }
  `;
}

export function renderCategoriasView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();

  return `
    <div class="page-header">
      <h1>Categorias</h1>
      <button class="btn btn-primary" type="button" data-create-categoria>Nova Categoria</button>
    </div>

    ${
      state.categorias.length
        ? `
          <table class="table">
            <thead>
              <tr><th>Nome</th><th>Descricao</th><th>Perdidos</th><th>Encontrados</th><th>Acoes</th></tr>
            </thead>
            <tbody>
              ${state.categorias.map((categoria) => renderCategoriaRow(categoria, state.objetos)).join("")}
            </tbody>
          </table>
        `
        : `
          <div class="empty-state-large">
            <p>Nenhuma categoria cadastrada.</p>
            <button class="btn btn-primary" type="button" data-create-categoria>Criar primeira categoria</button>
          </div>
        `
    }
  `;
}

export function renderCategoriaFormView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();

  const categoria =
    state.adminEdit?.kind === "categoria"
      ? state.categorias.find((item) => item.id === state.adminEdit?.id)
      : null;
  const acao = categoria ? "Editar" : "Nova";

  return `
    <div class="breadcrumb">
      <a href="/categorias" data-nav="categorias">Categorias</a> &raquo; ${acao}
    </div>

    <h1>${acao} Categoria</h1>

    <form class="form-card" id="categoryForm">
      <input type="hidden" name="id" value="${categoria?.id ?? ""}" />

      <div class="form-group">
        <label for="categoriaNome">Nome *</label>
        <input id="categoriaNome" type="text" name="nome" required value="${escapeHtml(categoria?.nome)}" placeholder="Ex: Eletronicos" />
      </div>

      <div class="form-group">
        <label for="categoriaDescricao">Descricao</label>
        <textarea id="categoriaDescricao" name="descricao" rows="3" placeholder="Descricao da categoria...">${escapeHtml(categoria?.descricao)}</textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${categoria ? "Salvar" : "Criar"}</button>
        <a href="/categorias" data-nav="categorias" class="btn btn-secondary">Cancelar</a>
      </div>
    </form>
  `;
}

export function renderLocaisView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();

  return `
    <div class="page-header">
      <h1>Locais</h1>
      <button class="btn btn-primary" type="button" data-create-local>Novo Local</button>
    </div>

    ${
      state.locais.length
        ? `
          <table class="table">
            <thead>
              <tr><th>Nome</th><th>Predio</th><th>Andar</th><th>Perdidos</th><th>Encontrados</th><th>Acoes</th></tr>
            </thead>
            <tbody>
              ${state.locais.map((local) => renderLocalRow(local, state.objetos)).join("")}
            </tbody>
          </table>
        `
        : `
          <div class="empty-state-large">
            <p>Nenhum local cadastrado.</p>
            <button class="btn btn-primary" type="button" data-create-local>Criar primeiro local</button>
          </div>
        `
    }
  `;
}

export function renderLocalFormView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();

  const local =
    state.adminEdit?.kind === "local" ? state.locais.find((item) => item.id === state.adminEdit?.id) : null;
  const acao = local ? "Editar" : "Novo";

  return `
    <div class="breadcrumb">
      <a href="/locais" data-nav="locais">Locais</a> &raquo; ${acao}
    </div>

    <h1>${acao} Local</h1>

    <form class="form-card" id="localForm">
      <input type="hidden" name="id" value="${local?.id ?? ""}" />

      <div class="form-row">
        <div class="form-group">
          <label for="localNome">Nome do Local *</label>
          <input id="localNome" type="text" name="nome" required value="${escapeHtml(local?.nome)}" placeholder="Ex: Sala 301" />
        </div>
        <div class="form-group">
          <label for="localPredio">Predio *</label>
          <input id="localPredio" type="text" name="predio" required value="${escapeHtml(local?.predio)}" placeholder="Ex: Predio 30" />
        </div>
      </div>

      <div class="form-group">
        <label for="localAndar">Andar</label>
        <input id="localAndar" type="text" name="andar" value="${escapeHtml(local?.andar)}" placeholder="Ex: 3o andar" />
      </div>

      <div class="form-group">
        <label for="localDescricao">Descricao</label>
        <textarea id="localDescricao" name="descricao" rows="3" placeholder="Detalhes adicionais...">${escapeHtml(local?.descricao)}</textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${local ? "Salvar" : "Criar"}</button>
        <a href="/locais" data-nav="locais" class="btn btn-secondary">Cancelar</a>
      </div>
    </form>
  `;
}

export function renderUsuariosView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();
  const usuarios = filterUsuarios(state);

  return `
    <div class="page-header">
      <h1>Gerenciar Usuarios</h1>
      <button class="btn btn-primary" type="button" data-create-usuario>Novo Administrador</button>
    </div>

    <form class="filter-bar" id="usuariosFilterForm">
      <input type="text" name="search" value="${escapeHtml(state.usuariosFilters.search)}" placeholder="Buscar por nome ou username...">
      <select name="tipo">
        <option value="" ${state.usuariosFilters.tipo === "" ? "selected" : ""}>Todos os tipos</option>
        <option value="usuario" ${state.usuariosFilters.tipo === "usuario" ? "selected" : ""}>Usuario</option>
        <option value="admin" ${state.usuariosFilters.tipo === "admin" ? "selected" : ""}>Administrador</option>
      </select>
      <button type="submit" class="btn btn-secondary">Filtrar</button>
    </form>

    ${
      usuarios.length
        ? `
          <table class="table">
            <thead>
              <tr><th>Nome</th><th>Username</th><th>E-mail</th><th>Tipo</th><th>Ativo</th><th>Acoes</th></tr>
            </thead>
            <tbody>
              ${usuarios.map(renderUsuarioRow).join("")}
            </tbody>
          </table>
        `
        : `<div class="empty-state-large"><p>Nenhum usuario encontrado.</p></div>`
    }
  `;
}

export function renderUsuarioFormView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();

  const usuario = state.adminUserEditId
    ? state.usuarios.find((item) => item.id === state.adminUserEditId)
    : null;
  const titulo = usuario ? "Editar Usuario" : "Cadastrar Novo Administrador";

  return `
    <div class="breadcrumb">
      <a href="/usuarios" data-nav="usuarios">Usuarios</a> &raquo; ${usuario ? "Editar" : "Novo administrador"}
    </div>

    <h1>${titulo}</h1>

    <form class="form-card" id="usuarioForm">
      <input type="hidden" name="id" value="${usuario?.id ?? ""}" />

      <div class="form-row">
        <div class="form-group">
          <label for="usuarioNome">Nome *</label>
          <input id="usuarioNome" type="text" name="first_name" value="${escapeHtml(usuario?.first_name)}" required />
        </div>
        <div class="form-group">
          <label for="usuarioSobrenome">Sobrenome *</label>
          <input id="usuarioSobrenome" type="text" name="last_name" value="${escapeHtml(usuario?.last_name)}" required />
        </div>
      </div>

      <div class="form-group">
        <label for="usuarioUsername">Nome de usuario *</label>
        <input id="usuarioUsername" type="text" name="username" value="${escapeHtml(usuario?.username)}" required />
      </div>

      <div class="form-group">
        <label for="usuarioEmail">E-mail *</label>
        <input id="usuarioEmail" type="email" name="email" value="${escapeHtml(usuario?.email)}" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="usuarioSenha">Senha ${usuario ? "" : "*"}</label>
          <input id="usuarioSenha" type="password" name="password" ${usuario ? "" : "required"} minlength="8" />
        </div>
        <div class="form-group">
          <label for="usuarioSenhaConfirm">Confirmar senha ${usuario ? "" : "*"}</label>
          <input id="usuarioSenhaConfirm" type="password" name="password_confirm" ${usuario ? "" : "required"} minlength="8" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="usuarioMatricula">Matricula</label>
          <input id="usuarioMatricula" type="text" name="matricula" value="${escapeHtml(usuario?.perfil?.matricula)}" />
        </div>
        <div class="form-group">
          <label for="usuarioTelefone">Telefone *</label>
          <input id="usuarioTelefone" type="text" name="telefone" value="${escapeHtml(usuario?.perfil?.telefone)}" placeholder="(11) 99999-9999" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="usuarioTipo">Tipo *</label>
          <select id="usuarioTipo" name="tipo" required>
            <option value="usuario" ${usuario?.perfil?.tipo === "usuario" ? "selected" : ""}>Usuario</option>
            <option value="admin" ${!usuario || usuario?.perfil?.tipo === "admin" ? "selected" : ""}>Administrador</option>
          </select>
        </div>
        <label class="checkbox-label">
          <input type="checkbox" name="is_active" value="1" ${usuario?.is_active === false ? "" : "checked"} />
          Conta ativa
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${usuario ? "Salvar" : "Criar Administrador"}</button>
        <a href="/usuarios" data-nav="usuarios" class="btn btn-secondary">Cancelar</a>
      </div>
    </form>
  `;
}

function renderUserDashboard(state: AppState): string {
  const perdidos = state.meusObjetos.filter((objeto) => objeto.tipo === "perdido").slice(0, 5);
  const encontrados = state.meusObjetos.filter((objeto) => objeto.tipo === "encontrado").slice(0, 5);
  const categoriasPerdidas = new Set(perdidos.map((objeto) => objeto.categoria).filter(Boolean));
  const sugestoes = state.objetos
    .filter((objeto) => objeto.tipo === "encontrado" && objeto.categoria && categoriasPerdidas.has(objeto.categoria))
    .slice(0, 6);

  return `
    <h1>Dashboard</h1>
    <p class="dashboard-greeting">
      Ola, <strong>${escapeHtml(state.user?.first_name || state.user?.username)}</strong>!
      <span class="badge badge-usuario">Usuario</span>
    </p>

    <div class="dashboard-actions">
      <button type="button" class="btn btn-primary" data-create-object>Registrar Solicitacao</button>
    </div>

    ${
      sugestoes.length
        ? `
          <section class="dashboard-section">
            <h2>Possiveis correspondencias para seus itens</h2>
            <p class="section-desc">Objetos encontrados na mesma categoria dos seus itens perdidos:</p>
            <div class="cards-grid">
              ${sugestoes
                .map(
                  (objeto) => `
                    <div class="card card-match">
                      <div class="card-header">
                        <span class="badge badge-categoria">${escapeHtml(objeto.categoria_nome || "Sem categoria")}</span>
                        ${renderTipoBadge(objeto)}
                      </div>
                      <h3><a href="/objetos/${objeto.id}" data-view-object="${objeto.id}">${escapeHtml(objeto.titulo)}</a></h3>
                      <p class="card-meta">${escapeHtml(objeto.local_nome || "")}${objeto.local_nome ? " &middot; " : ""}${escapeHtml(formatDate(objeto.data_ocorrencia))}</p>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </section>
        `
        : ""
    }

    <div class="dashboard-grid">
      ${renderDashboardObjectTable("Meus Objetos Perdidos", perdidos, "Nenhum objeto perdido registrado.")}
      ${renderDashboardObjectTable("Meus Objetos Encontrados", encontrados, "Nenhum objeto encontrado registrado.")}
    </div>
  `;
}

function renderAdminDashboard(state: AppState): string {
  const perdidos = state.objetos.filter((objeto) => objeto.tipo === "perdido");
  const encontrados = state.objetos.filter((objeto) => objeto.tipo === "encontrado");
  const resolvidos = state.objetos.filter((objeto) => objeto.status === "resolvido");
  const pendentes = state.objetos.filter((objeto) => objeto.status === "pendente");

  return `
    <h1>Dashboard</h1>
    <p class="dashboard-greeting">
      Ola, <strong>${escapeHtml(state.user?.first_name || state.user?.username)}</strong>!
      <span class="badge badge-admin">Administrador</span>
    </p>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-number">${perdidos.length}</span>
        <span class="stat-label">Objetos perdidos</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${encontrados.length}</span>
        <span class="stat-label">Objetos encontrados</span>
      </div>
      <div class="stat-card stat-card-success">
        <span class="stat-number">${resolvidos.length}</span>
        <span class="stat-label">Devolvidos</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${state.usuarios.length}</span>
        <span class="stat-label">Usuarios</span>
      </div>
    </div>

    ${
      pendentes.length
        ? `<div class="alert alert-warning"><strong>${pendentes.length}</strong> item(ns) aguardando aprovacao. <a href="/aprovacoes" data-nav="aprovacoes">Ver aprovacoes &rarr;</a></div>`
        : ""
    }

    <section class="dashboard-section">
      <h2>Top Categorias</h2>
      ${renderTopCategorias(state)}
    </section>

    <div class="dashboard-grid">
      ${renderAdminRecentTable("Perdidos Recentes", perdidos.slice(0, 5), "Usuario")}
      ${renderAdminRecentTable("Encontrados Recentes", encontrados.slice(0, 5), "Registrado por")}
    </div>
  `;
}

function renderApprovalSection(title: string, objetos: Objeto[]): string {
  if (!objetos.length) return "";

  return `
    <section class="dashboard-section">
      <h2>${escapeHtml(title)}</h2>
      <table class="table">
        <thead><tr><th>Titulo</th><th>Usuario</th><th>Categoria</th><th>Data</th><th>Acao</th></tr></thead>
        <tbody>
          ${objetos
            .map(
              (objeto) => `
                <tr>
                  <td><a href="/objetos/${objeto.id}" data-view-object="${objeto.id}">${escapeHtml(objeto.titulo)}</a></td>
                  <td>${escapeHtml(objeto.usuario?.nome || objeto.usuario?.username || "-")}</td>
                  <td>${escapeHtml(objeto.categoria_nome || "-")}</td>
                  <td>${escapeHtml(formatDate(objeto.criado_em?.slice(0, 10) || objeto.data_ocorrencia))}</td>
                  <td>
                    <button class="btn btn-small btn-primary" type="button" data-approve-object="${objeto.id}">Aprovar</button>
                    <button class="btn btn-small btn-danger" type="button" data-reject-object="${objeto.id}">Rejeitar</button>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderCategoriaRow(categoria: Categoria, objetos: Objeto[]): string {
  const perdidos = objetos.filter((objeto) => objeto.categoria === categoria.id && objeto.tipo === "perdido").length;
  const encontrados = objetos.filter((objeto) => objeto.categoria === categoria.id && objeto.tipo === "encontrado").length;

  return `
    <tr>
      <td><strong>${escapeHtml(categoria.nome)}</strong></td>
      <td>${escapeHtml(shortText(categoria.descricao)) || "-"}</td>
      <td>${perdidos}</td>
      <td>${encontrados}</td>
      <td>
        <button class="btn btn-small btn-secondary" type="button" data-edit-categoria="${categoria.id}">Editar</button>
        <button class="btn btn-small btn-danger" type="button" data-delete-categoria="${categoria.id}">Excluir</button>
      </td>
    </tr>
  `;
}

function renderLocalRow(local: Local, objetos: Objeto[]): string {
  const perdidos = objetos.filter((objeto) => objeto.local === local.id && objeto.tipo === "perdido").length;
  const encontrados = objetos.filter((objeto) => objeto.local === local.id && objeto.tipo === "encontrado").length;

  return `
    <tr>
      <td><strong>${escapeHtml(local.nome)}</strong></td>
      <td>${escapeHtml(local.predio)}</td>
      <td>${escapeHtml(local.andar || "-")}</td>
      <td>${perdidos}</td>
      <td>${encontrados}</td>
      <td>
        <button class="btn btn-small btn-secondary" type="button" data-edit-local="${local.id}">Editar</button>
        <button class="btn btn-small btn-danger" type="button" data-delete-local="${local.id}">Excluir</button>
      </td>
    </tr>
  `;
}

function renderUsuarioRow(usuario: Usuario): string {
  const tipo = usuario.perfil?.tipo || (usuario.is_staff ? "admin" : "usuario");

  return `
    <tr>
      <td>${escapeHtml(usuario.nome || "-")}</td>
      <td>${escapeHtml(usuario.username)}</td>
      <td>${escapeHtml(usuario.email || "-")}</td>
      <td><span class="badge badge-${tipo}">${tipo === "admin" ? "Administrador" : "Usuario"}</span></td>
      <td>${usuario.is_active ? `<span class="status-aprovada">Sim</span>` : `<span class="status-rejeitada">Nao</span>`}</td>
      <td><button class="btn btn-small btn-secondary" type="button" data-edit-usuario="${usuario.id}">Editar</button></td>
    </tr>
  `;
}

function filterUsuarios(state: AppState): Usuario[] {
  const search = state.usuariosFilters.search.trim().toLowerCase();
  const tipoFilter = state.usuariosFilters.tipo;

  return state.usuarios.filter((usuario) => {
    const tipo = usuario.perfil?.tipo || (usuario.is_staff ? "admin" : "usuario");
    if (tipoFilter && tipo !== tipoFilter) return false;
    if (!search) return true;

    const haystack = [
      usuario.nome,
      usuario.username,
      usuario.email,
      usuario.first_name,
      usuario.last_name,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

function renderDashboardObjectTable(title: string, objetos: Objeto[], emptyText: string): string {
  return `
    <section class="dashboard-section">
      <h2>${escapeHtml(title)}</h2>
      ${
        objetos.length
          ? `
            <table class="table">
              <thead><tr><th>Titulo</th><th>Data</th><th>Status</th></tr></thead>
              <tbody>
                ${objetos
                  .map(
                    (objeto) => `
                      <tr>
                        <td><a href="/objetos/${objeto.id}" data-view-object="${objeto.id}">${escapeHtml(objeto.titulo)}</a></td>
                        <td>${escapeHtml(formatDate(objeto.data_ocorrencia))}</td>
                        <td>${renderStatusBadge(objeto)}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
            <a href="/meus-registros" data-nav="meus" class="link-more">Ver todos &rarr;</a>
          `
          : `<p class="empty-state">${escapeHtml(emptyText)}</p>`
      }
    </section>
  `;
}

function renderAdminRecentTable(title: string, objetos: Objeto[], userColumn: string): string {
  return `
    <section class="dashboard-section">
      <h2>${escapeHtml(title)}</h2>
      ${
        objetos.length
          ? `
            <table class="table">
              <thead><tr><th>Titulo</th><th>${escapeHtml(userColumn)}</th><th>Status</th></tr></thead>
              <tbody>
                ${objetos
                  .map(
                    (objeto) => `
                      <tr>
                        <td><a href="/objetos/${objeto.id}" data-view-object="${objeto.id}">${escapeHtml(objeto.titulo)}</a></td>
                        <td>${escapeHtml(objeto.usuario?.nome || objeto.usuario?.username || "-")}</td>
                        <td>${renderStatusBadge(objeto)}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          `
          : `<p class="empty-state">Nenhum registro recente.</p>`
      }
    </section>
  `;
}

function renderTopCategorias(state: AppState): string {
  if (!state.categorias.length) return `<p class="empty-state">Nenhuma categoria cadastrada.</p>`;

  return `
    <table class="table">
      <thead><tr><th>Categoria</th><th>Perdidos</th><th>Encontrados</th></tr></thead>
      <tbody>
        ${state.categorias
          .map((categoria) => {
            const perdidos = state.objetos.filter((objeto) => objeto.categoria === categoria.id && objeto.tipo === "perdido").length;
            const encontrados = state.objetos.filter((objeto) => objeto.categoria === categoria.id && objeto.tipo === "encontrado").length;
            return `<tr><td>${escapeHtml(categoria.nome)}</td><td>${perdidos}</td><td>${encontrados}</td></tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderTipoBadge(objeto: Objeto): string {
  return `<span class="badge tipo-${objeto.tipo}">${escapeHtml(objeto.tipo_display || objeto.tipo)}</span>`;
}

function renderStatusBadge(objeto: Objeto): string {
  if (objeto.status === "resolvido") return `<span class="badge status-devolvido">Devolvido</span>`;
  return `<span class="badge status-${objeto.status}">${escapeHtml(objeto.status_display || objeto.status)}</span>`;
}

function shortText(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 10) return value;
  return `${words.slice(0, 10).join(" ")}...`;
}
