import type { AppState } from "../types.js";
import { escapeHtml } from "../utils/format.js";
import { renderLocked } from "./shared.js";

export function renderPerfilView(state: AppState): string {
  if (!state.user) return renderLocked();
  const tipo = state.user.perfil?.tipo || (state.user.is_staff ? "admin" : "usuario");

  return `
    <h1>Meu Perfil</h1>

    <div class="profile-info">
      <p>
        <strong>Usuario:</strong> ${escapeHtml(state.user.username)}
        &middot;
        <strong>Tipo:</strong>
        <span class="badge badge-${tipo}">${tipo === "admin" ? "Administrador" : "Usuario"}</span>
      </p>
    </div>

    <form class="form-card" id="profileForm">
      <div class="form-row">
        <div class="form-group">
          <label for="id_first_name">Nome</label>
          <input type="text" name="first_name" id="id_first_name" value="${escapeHtml(state.user.first_name)}" required />
        </div>
        <div class="form-group">
          <label for="id_last_name">Sobrenome</label>
          <input type="text" name="last_name" id="id_last_name" value="${escapeHtml(state.user.last_name)}" required />
        </div>
      </div>

      <div class="form-group">
        <label for="id_email">E-mail</label>
        <input type="email" name="email" id="id_email" value="${escapeHtml(state.user.email)}" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="id_matricula">Matricula</label>
          <input type="text" name="matricula" id="id_matricula" value="${escapeHtml(state.user.perfil?.matricula)}" />
        </div>
        <div class="form-group">
          <label for="id_telefone">Telefone *</label>
          <input type="text" name="telefone" id="id_telefone" required placeholder="(11) 99999-9999" value="${escapeHtml(state.user.perfil?.telefone)}" />
        </div>
      </div>

      <button type="submit" class="btn btn-primary">Salvar Alteracoes</button>
    </form>

    <hr class="separator">

    <div class="form-card">
      <h2>Seguranca</h2>
      <p>Altere sua senha de acesso ao sistema.</p>
      <a href="/trocar-senha" data-nav="trocar-senha" class="btn btn-primary">Trocar Senha</a>
    </div>

    <hr class="separator">

    <div class="danger-zone">
      <h2>Zona de Perigo</h2>
      <p>Ao desativar sua conta, voce perdera o acesso ao sistema e suas solicitacoes pendentes serao canceladas. Para reativa-la, entre em contato com o administrador.</p>
      <a href="/desativar-conta" data-nav="desativar-conta" class="btn btn-danger">Desativar Minha Conta</a>
    </div>
  `;
}

export function renderTrocarSenhaView(state: AppState): string {
  if (!state.user) return renderLocked();

  return `
    <h1>Trocar Senha</h1>

    <form class="form-card" id="passwordForm">
      <div class="form-group">
        <label for="id_old_password">Senha atual</label>
        <input type="password" name="senha_atual" id="id_old_password" required autofocus />
      </div>

      <div class="form-group">
        <label for="id_new_password1">Nova senha</label>
        <input type="password" name="nova_senha" id="id_new_password1" required />
        <span class="form-help">Minimo 8 caracteres. Nao pode ser so numeros.</span>
      </div>

      <div class="form-group">
        <label for="id_new_password2">Confirmar nova senha</label>
        <input type="password" name="nova_senha_confirm" id="id_new_password2" required />
      </div>

      <button type="submit" class="btn btn-primary">Alterar Senha</button>
      <a href="/perfil" data-nav="perfil" class="btn">Cancelar</a>
    </form>
  `;
}

export function renderDesativarContaView(state: AppState): string {
  if (!state.user) return renderLocked();

  return `
    <div class="confirm-delete">
      <h1>Desativar Conta</h1>
      <p>Tem certeza que deseja desativar sua conta <strong>${escapeHtml(state.user.username)}</strong>?</p>
      <p class="warning-text">Voce perdera o acesso ao sistema, e suas solicitacoes pendentes serao canceladas. Para reativa-la, entre em contato com o administrador.</p>

      <form id="deactivateForm">
        <div class="form-actions">
          <button type="submit" class="btn btn-danger">Sim, desativar minha conta</button>
          <a href="/perfil" data-nav="perfil" class="btn btn-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `;
}
