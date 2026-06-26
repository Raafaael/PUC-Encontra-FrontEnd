import { STORAGE_KEYS } from "../config.js";
import type { AppState } from "../types.js";

export function createInitialState(): AppState {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  return {
    token,
    user: token ? readStoredUser() : null,
    view: "inicio",
    objetos: [],
    meusObjetos: [],
    categorias: [],
    locais: [],
    usuarios: [],
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
