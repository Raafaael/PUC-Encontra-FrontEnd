import type { AppState, ViewName } from "../types.js";
import { escapeHtml } from "../utils/format.js";
import { renderAccountPanel, renderAuthPanel } from "./auth.js";

export function renderLayout(state: AppState, currentView: string): string {
  return `
    <header class="topbar">
      <a class="brand" href="#" data-nav="explorar" aria-label="PUC-Encontra">
        <span class="brand-mark">PE</span>
        <span>
          <strong>PUC-Encontra</strong>
          <small>Achados e perdidos</small>
        </span>
      </a>
      <nav class="tabs" aria-label="Navegacao principal">
        ${navButton(state, "explorar", "search", "Explorar")}
        ${navButton(state, "meus", "archive", "Meus", !state.user)}
        ${navButton(state, "perfil", "user-round", "Perfil", !state.user)}
        ${state.user?.is_staff ? navButton(state, "admin", "settings-2", "Admin") : ""}
      </nav>
      <div class="session">
        ${state.user ? userChip(state) : `<button class="btn primary" data-auth-open="login" title="Entrar"><i data-icon="log-in"></i><span>Entrar</span></button>`}
      </div>
    </header>
    <main class="app-shell">
      <aside class="side-panel">
        ${renderApiPanel(state)}
        ${state.user ? renderAccountPanel(state) : renderAuthPanel(state)}
      </aside>
      <section class="workspace">
        <div id="notice" class="notice ${state.notice?.tone ?? ""}">${escapeHtml(state.notice?.message)}</div>
        ${state.loading ? `<div class="loading-line"></div>` : ""}
        ${currentView}
      </section>
    </main>
  `;
}

function navButton(state: AppState, view: ViewName, icon: string, label: string, disabled = false): string {
  return `
    <button class="tab ${state.view === view ? "active" : ""}" data-nav="${view}" ${disabled ? "disabled" : ""} title="${escapeHtml(label)}">
      <i data-icon="${icon}"></i>
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function userChip(state: AppState): string {
  const initials = (state.user?.nome || state.user?.username || "U")
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return `
    <button class="user-chip" data-nav="perfil" title="Perfil">
      <span>${escapeHtml(initials)}</span>
      <strong>${escapeHtml(state.user?.nome || state.user?.username)}</strong>
    </button>
  `;
}

function renderApiPanel(state: AppState): string {
  return `
    <form class="tool-panel" id="apiForm">
      <div class="panel-title">
        <i data-icon="plug"></i>
        <h2>API</h2>
      </div>
      <label>
        <span>URL</span>
        <input name="apiBase" type="url" value="${escapeHtml(state.apiBase)}" required />
      </label>
      <button class="btn neutral" type="submit" title="Salvar API">
        <i data-icon="save"></i><span>Salvar</span>
      </button>
    </form>
  `;
}
