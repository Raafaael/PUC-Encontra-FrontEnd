import type { AppState } from "../types.js";
import { escapeHtml } from "../utils/format.js";

export function renderLoginView(): string {
  return `
    <section class="auth-container">
      <h1>Entrar no Sistema</h1>
      <p class="auth-subtitle">Acesse sua conta para gerenciar seus achados e perdidos.</p>

      <section class="form-card">
        <form id="loginForm">
          <div class="form-group">
            <label for="id_identificador">Usuario ou E-mail</label>
            <input type="text" name="identificador" id="id_identificador" autocomplete="username" required autofocus />
          </div>

          <div class="form-group">
            <label for="id_password">Senha</label>
            <input type="password" name="password" id="id_password" autocomplete="current-password" required />
          </div>

          <button type="submit" class="btn btn-primary btn-full">Entrar</button>
        </form>
      </section>

      <p class="auth-link">
        <a href="/redefinir-senha" data-nav="password-reset">Esqueceu sua senha?</a>
      </p>
      <p class="auth-link">
        Ainda nao tem conta? <a href="/cadastro" data-nav="cadastro">Cadastre-se aqui</a>
      </p>
    </section>
  `;
}

export function renderCadastroView(): string {
  return `
    <section class="auth-container">
      <h1>Criar Conta</h1>
      <p class="auth-subtitle">Registre-se para publicar objetos perdidos e encontrados.</p>

      <section class="form-card">
        <form id="registerForm">
          <div class="form-row">
            <div class="form-group">
              <label for="id_first_name">Nome</label>
              <input type="text" name="first_name" id="id_first_name" autocomplete="given-name" required />
            </div>
            <div class="form-group">
              <label for="id_last_name">Sobrenome</label>
              <input type="text" name="last_name" id="id_last_name" autocomplete="family-name" required />
            </div>
          </div>

          <div class="form-group">
            <label for="id_username">Usuario</label>
            <input type="text" name="username" id="id_username" autocomplete="username" required />
          </div>

          <div class="form-group">
            <label for="id_email">E-mail</label>
            <input type="email" name="email" id="id_email" autocomplete="email" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="id_matricula">Matricula</label>
              <input type="text" name="matricula" id="id_matricula" />
            </div>
            <div class="form-group">
              <label for="id_telefone">Telefone</label>
              <input type="text" name="telefone" id="id_telefone" autocomplete="tel" required placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div class="form-group">
            <label for="id_password1">Senha</label>
            <input type="password" name="password" id="id_password1" autocomplete="new-password" minlength="8" required />
            <span class="form-help">Minimo 8 caracteres. Nao pode ser somente numeros.</span>
          </div>

          <div class="form-group">
            <label for="id_password2">Confirmar senha</label>
            <input type="password" name="password_confirm" id="id_password2" autocomplete="new-password" minlength="8" required />
          </div>

          <button type="submit" class="btn btn-primary btn-full">Cadastrar</button>
        </form>
      </section>

      <p class="auth-link">
        Ja tem uma conta? <a href="/login" data-nav="login">Faca login aqui</a>
      </p>
    </section>
  `;
}

export function renderPasswordResetView(state: AppState): string {
  const hasDraft = Boolean(state.resetDraft.uid && state.resetDraft.token);

  return `
    <section class="auth-container">
      <h1>${hasDraft ? "Confirmar Redefinicao" : "Redefinir Senha"}</h1>
      <p class="auth-subtitle">
        ${
          hasDraft
            ? "Informe sua nova senha para concluir a redefinicao."
            : "Digite seu e-mail para receber as instrucoes de redefinicao."
        }
      </p>

      <section class="form-card">
        ${
          hasDraft
            ? `
              <form id="resetConfirmForm">
                <input type="hidden" name="uid" value="${escapeHtml(state.resetDraft.uid)}" />
                <input type="hidden" name="token" value="${escapeHtml(state.resetDraft.token)}" />

                <div class="form-group">
                  <label for="id_new_password1">Nova senha</label>
                  <input type="password" name="nova_senha" id="id_new_password1" minlength="8" required />
                </div>

                <div class="form-group">
                  <label for="id_new_password2">Confirmar nova senha</label>
                  <input type="password" name="nova_senha_confirm" id="id_new_password2" minlength="8" required />
                </div>

                <button type="submit" class="btn btn-primary btn-full">Alterar Senha</button>
              </form>
            `
            : `
              <form id="resetRequestForm">
                <div class="form-group">
                  <label for="id_email_reset">E-mail</label>
                  <input type="email" name="email" id="id_email_reset" autocomplete="email" required autofocus />
                </div>

                <button type="submit" class="btn btn-primary btn-full">Enviar Instrucoes</button>
              </form>
            `
        }
      </section>

      <p class="auth-link">
        <a href="/login" data-nav="login">Voltar para login</a>
      </p>
    </section>
  `;
}
