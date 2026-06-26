import { STORAGE_KEYS } from "../config.js";
import type { AppState } from "../types.js";

export function createInitialState(): AppState {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const user = token ? readStoredUser() : null;
  const cached = readStoredBootstrap(user);

  return {
    token,
    user,
    view: "inicio",
    objetos: cached.objetos,
    meusObjetos: cached.meusObjetos,
    categorias: cached.categorias,
    locais: cached.locais,
    usuarios: cached.usuarios,
    editingObjectId: null,
    selectedObjectId: null,
    adminEdit: null,
    adminUserEditId: null,
    filters: {
      search: "",
      tipo: "",
      categoria: "",
      local: "",
    },
    meusFilters: {
      tipo: "",
      status: "",
    },
    aprovacoesFilter: "",
    usuariosFilters: {
      search: "",
      tipo: "",
    },
    resetDraft: {
      uid: "",
      token: "",
    },
    notice: null,
    loading: false,
    sessionRestoreFailed: false,
  };
}

function readStoredUser(): AppState["user"] {
  const storedUser = localStorage.getItem(STORAGE_KEYS.user);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AppState["user"];
  } catch {
    localStorage.removeItem(STORAGE_KEYS.user);
    return null;
  }
}

type CachedBootstrap = Pick<AppState, "categorias" | "locais" | "objetos" | "meusObjetos" | "usuarios"> & {
  userId: number | null;
};

function readStoredBootstrap(user: AppState["user"]): Pick<AppState, "categorias" | "locais" | "objetos" | "meusObjetos" | "usuarios"> {
  const fallback = {
    categorias: [],
    locais: [],
    objetos: [],
    meusObjetos: [],
    usuarios: [],
  };
  const storedBootstrap = localStorage.getItem(STORAGE_KEYS.bootstrap);
  if (!storedBootstrap) return fallback;

  try {
    const parsed = JSON.parse(storedBootstrap) as Partial<CachedBootstrap>;
    const sameUser = Boolean(user && parsed.userId === user.id);
    return {
      categorias: readArray(parsed.categorias),
      locais: readArray(parsed.locais),
      objetos: readArray(parsed.objetos),
      meusObjetos: sameUser ? readArray(parsed.meusObjetos) : [],
      usuarios: sameUser && user?.is_staff ? readArray(parsed.usuarios) : [],
    };
  } catch {
    localStorage.removeItem(STORAGE_KEYS.bootstrap);
    return fallback;
  }
}

function readArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
