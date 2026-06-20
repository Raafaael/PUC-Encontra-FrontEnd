import type { AppState, ViewName } from "../types.js";
import { escapeHtml } from "../utils/format.js";

export function renderLayout(state: AppState, currentView: string): string {
  return `
    <header class="header">
      <div class="container header-inner">
        <a href="#" class="logo" data-nav="inicio">
          <span class="logo-icon">&#9782;</span>
          PUC Encontra
        </a>
        <nav class="nav" aria-label="Navegacao principal">
          ${navLink(state, "explorar", "Itens")}
          ${
            state.user
              ? `
                ${navLink(state, "dashboard", "Dashboard")}
                ${navLink(state, "meus", "Meus Registros")}
                ${
                  state.user.is_staff
                    ? `
                      ${navLink(state, "aprovacoes", "Aprovacoes")}
                      ${navLink(state, "categorias", "Categorias")}
                      ${navLink(state, "locais", "Locais")}
                      ${navLink(state, "usuarios", "Usuarios")}
                    `
                    : ""
                }
                <div class="nav-user">
                  <a href="#" class="btn-perfil" data-nav="perfil">${escapeHtml(state.user.first_name || state.user.username)}</a>
                  <a href="#" class="btn-logout" id="logoutButton">Sair</a>
                </div>
              `
              : `
                <a href="#" class="btn-login" data-nav="login">Entrar</a>
                <a href="#" class="btn-register" data-nav="cadastro">Cadastrar</a>
              `
          }
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div id="notice" class="alert ${state.notice ? `alert-${state.notice.tone}` : ""}">${escapeHtml(state.notice?.message)}</div>
        ${state.loading ? `<div class="loading-line"></div>` : ""}
        ${currentView}
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 PUC Encontra &mdash; Sistema de Achados e Perdidos Inteligente</p>
      </div>
    </footer>
  `;
}

function navLink(state: AppState, view: ViewName, label: string): string {
  const active =
    state.view === view ||
    (view === "categorias" && state.view === "categoria-form") ||
    (view === "locais" && state.view === "local-form") ||
    (view === "usuarios" && state.view === "usuario-form");

  return `
    <a href="#" data-nav="${view}" class="${active ? "nav-active" : ""}">
      ${escapeHtml(label)}
    </a>
  `;
}
