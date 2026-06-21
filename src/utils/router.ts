import type { AppState, ViewName } from "../types.js";

type Route = {
  view: ViewName;
  selectedObjectId: number | null;
};

const VIEW_PATHS: Record<ViewName, string> = {
  inicio: "/",
  explorar: "/explorar",
  dashboard: "/dashboard",
  meus: "/meus-registros",
  "objeto-form": "/registro",
  "objeto-detail": "/explorar",
  perfil: "/perfil",
  "trocar-senha": "/trocar-senha",
  "desativar-conta": "/desativar-conta",
  "password-reset": "/redefinir-senha",
  aprovacoes: "/aprovacoes",
  categorias: "/categorias",
  "categoria-form": "/categorias/formulario",
  locais: "/locais",
  "local-form": "/locais/formulario",
  usuarios: "/usuarios",
  "usuario-form": "/usuarios/formulario",
  login: "/login",
  cadastro: "/cadastro",
};

export function pathForView(view: ViewName): string {
  return VIEW_PATHS[view] ?? "/";
}

export function pathForState(state: Pick<AppState, "view" | "selectedObjectId">): string {
  // Detalhes de objeto usam URL propria para permitir refresh e compartilhamento do link.
  if (state.view === "objeto-detail" && state.selectedObjectId) {
    return `/objetos/${state.selectedObjectId}`;
  }
  return pathForView(state.view);
}

export function routeFromPath(pathname: string): Route {
  const path = normalizePath(pathname);
  const objectMatch = path.match(/^\/objetos\/(\d+)$/);

  if (objectMatch) {
    return { view: "objeto-detail", selectedObjectId: Number(objectMatch[1]) };
  }
  if (path === "/objetos") {
    // /objetos sem id funciona como entrada publica para a listagem.
    return { view: "explorar", selectedObjectId: null };
  }

  const view = (Object.entries(VIEW_PATHS).find(([, routePath]) => routePath === path)?.[0] as ViewName | undefined) ?? "inicio";
  return { view, selectedObjectId: null };
}

function normalizePath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "");
  return path || "/";
}
