import type { AppState } from "../types.js";
import { escapeHtml } from "../utils/format.js";
import { renderLocked } from "./shared.js";

export function renderPerfilView(state: AppState): string {
  if (!state.user) return renderLocked();

  return `
    <section class="view-header">
      <div>
        <h1>Perfil</h1>
        <p>${escapeHtml(state.user.username)}</p>
      </div>
    </section>
    <div class="profile-grid">
      <form class="tool-panel" id="profileForm">
        <div class="panel-title"><i data-icon="user-cog"></i><h2>Dados</h2></div>
        <div class="grid-2">
          <label><span>Nome</span><input name="first_name" value="${escapeHtml(state.user.first_name)}" /></label>
          <label><span>Sobrenome</span><input name="last_name" value="${escapeHtml(state.user.last_name)}" /></label>
        </div>
        <label><span>E-mail</span><input name="email" type="email" value="${escapeHtml(state.user.email)}" /></label>
        <div class="grid-2">
          <label><span>Matricula</span><input name="matricula" value="${escapeHtml(state.user.perfil?.matricula)}" /></label>
          <label><span>Telefone</span><input name="telefone" value="${escapeHtml(state.user.perfil?.telefone)}" /></label>
        </div>
        <button class="btn primary" type="submit" title="Salvar perfil"><i data-icon="save"></i><span>Salvar</span></button>
      </form>
      <form class="tool-panel" id="passwordForm">
        <div class="panel-title"><i data-icon="key-round"></i><h2>Senha</h2></div>
        <label><span>Senha atual</span><input name="senha_atual" type="password" autocomplete="current-password" required /></label>
        <label><span>Nova senha</span><input name="nova_senha" type="password" autocomplete="new-password" minlength="8" required /></label>
        <button class="btn primary" type="submit" title="Trocar senha"><i data-icon="refresh-cw"></i><span>Trocar</span></button>
      </form>
      <section class="tool-panel">
        <div class="panel-title"><i data-icon="mail-question"></i><h2>Recuperacao</h2></div>
        <form id="resetRequestForm" class="stack">
          <label><span>E-mail</span><input name="email" type="email" value="${escapeHtml(state.user.email)}" required /></label>
          <button class="btn neutral" type="submit" title="Solicitar recuperacao"><i data-icon="send"></i><span>Solicitar</span></button>
        </form>
        <form id="resetConfirmForm" class="stack">
          <div class="grid-2">
            <label><span>UID</span><input name="uid" value="${escapeHtml(state.resetDraft.uid)}" required /></label>
            <label><span>Token</span><input name="token" value="${escapeHtml(state.resetDraft.token)}" required /></label>
          </div>
          <label><span>Nova senha</span><input name="nova_senha" type="password" minlength="8" required /></label>
          <button class="btn neutral" type="submit" title="Confirmar recuperacao"><i data-icon="check-circle-2"></i><span>Confirmar</span></button>
        </form>
      </section>
    </div>
  `;
}
