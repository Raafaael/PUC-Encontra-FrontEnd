import type { AppState } from "../types.js";
import { renderAdminView } from "./admin.js";
import { renderExplorarView, renderMeusView } from "./objects.js";
import { renderPerfilView } from "./profile.js";

export function renderCurrentView(state: AppState): string {
  if (state.view === "meus") return renderMeusView(state);
  if (state.view === "perfil") return renderPerfilView(state);
  if (state.view === "admin") return renderAdminView(state);
  return renderExplorarView(state);
}
