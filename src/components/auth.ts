import type { AppState } from "../types.js";
import { escapeHtml } from "../utils/format.js";

export function renderAuthPanel(state: AppState): string {
  return `
    <section class="tool-panel">
      <div class="segmented">
        <button class="${state.authMode === "login" ? "active" : ""}" data-auth-mode="login" type="button">Login</button>
        <button class="${state.authMode === "register" ? "active" : ""}" data-auth-mode="register" type="button">Cadastro</button>
      </div>
      ${state.authMode === "login" ? renderLoginForm() : renderRegisterForm()}
    </section>
  `;
}

export function renderAccountPanel(state: AppState): string {
  return `
    <section class="tool-panel compact-account">
      <div class="panel-title">
        <i data-icon="badge-check"></i>
        <h2>${escapeHtml(state.user?.nome || state.user?.username)}</h2>
      </div>
      <p>${escapeHtml(state.user?.email || "")}</p>
      <button class="btn danger ghost" id="logoutButton" title="Sair">
        <i data-icon="log-out"></i><span>Sair</span>
      </button>
    </section>
  `;
}

function renderLoginForm(): string {
  return `
    <form id="loginForm" class="stack">
      <label>
        <span>Usuario ou e-mail</span>
        <input name="identificador" autocomplete="username" required />
      </label>
      <label>
        <span>Senha</span>
        <input name="password" type="password" autocomplete="current-password" required />
      </label>
      <button class="btn primary" type="submit" title="Entrar">
        <i data-icon="log-in"></i><span>Entrar</span>
      </button>
    </form>
  `;
}

function renderRegisterForm(): string {
  return `
    <form id="registerForm" class="stack">
      <div class="grid-2">
        <label>
          <span>Nome</span>
          <input name="first_name" autocomplete="given-name" />
        </label>
        <label>
          <span>Sobrenome</span>
          <input name="last_name" autocomplete="family-name" />
        </label>
      </div>
      <label>
        <span>Usuario</span>
        <input name="username" autocomplete="username" required />
      </label>
      <label>
        <span>E-mail</span>
        <input name="email" type="email" autocomplete="email" required />
      </label>
      <div class="grid-2">
        <label>
          <span>Matricula</span>
          <input name="matricula" />
        </label>
        <label>
          <span>Telefone</span>
          <input name="telefone" autocomplete="tel" />
        </label>
      </div>
      <label>
        <span>Senha</span>
        <input name="password" type="password" autocomplete="new-password" minlength="8" required />
      </label>
      <label>
        <span>Confirmar senha</span>
        <input name="password_confirm" type="password" autocomplete="new-password" minlength="8" required />
      </label>
      <button class="btn primary" type="submit" title="Cadastrar">
        <i data-icon="user-plus"></i><span>Cadastrar</span>
      </button>
    </form>
  `;
}
