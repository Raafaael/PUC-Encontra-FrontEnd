import type { AppState } from "../types.js";
import {
  renderAprovacoesView,
  renderCategoriaFormView,
  renderCategoriasView,
  renderDashboardView,
  renderLocalFormView,
  renderLocaisView,
  renderUsuarioFormView,
  renderUsuariosView,
} from "./admin.js";
import { renderCadastroView, renderLoginView, renderPasswordResetView } from "./auth.js";
import { renderInicioView } from "./home.js";
import { renderExplorarView, renderMeusView, renderObjectDetailView, renderObjectFormView } from "./objects.js";
import { renderDesativarContaView, renderPerfilView, renderTrocarSenhaView } from "./profile.js";

export function renderCurrentView(state: AppState): string {
  if (state.view === "inicio") return renderInicioView(state);
  if (state.view === "login") return renderLoginView();
  if (state.view === "cadastro") return renderCadastroView();
  if (state.view === "password-reset") return renderPasswordResetView(state);
  if (state.view === "dashboard") return renderDashboardView(state);
  if (state.view === "aprovacoes") return renderAprovacoesView(state);
  if (state.view === "categorias") return renderCategoriasView(state);
  if (state.view === "categoria-form") return renderCategoriaFormView(state);
  if (state.view === "locais") return renderLocaisView(state);
  if (state.view === "local-form") return renderLocalFormView(state);
  if (state.view === "usuarios") return renderUsuariosView(state);
  if (state.view === "usuario-form") return renderUsuarioFormView(state);
  if (state.view === "meus") return renderMeusView(state);
  if (state.view === "objeto-form") return renderObjectFormView(state);
  if (state.view === "objeto-detail") return renderObjectDetailView(state);
  if (state.view === "perfil") return renderPerfilView(state);
  if (state.view === "trocar-senha") return renderTrocarSenhaView(state);
  if (state.view === "desativar-conta") return renderDesativarContaView(state);
  return renderExplorarView(state);
}
