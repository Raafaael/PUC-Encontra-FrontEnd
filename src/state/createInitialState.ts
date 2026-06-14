import { DEFAULT_API_BASE_URL, STORAGE_KEYS } from "../config.js";
import type { AppState } from "../types.js";

export function createInitialState(): AppState {
  return {
    apiBase: localStorage.getItem(STORAGE_KEYS.apiBase) || DEFAULT_API_BASE_URL,
    token: localStorage.getItem(STORAGE_KEYS.token),
    user: null,
    view: "explorar",
    authMode: "login",
    objetos: [],
    meusObjetos: [],
    categorias: [],
    locais: [],
    editingObjectId: null,
    adminEdit: null,
    filters: {
      search: "",
      tipo: "",
      categoria: "",
      local: "",
    },
    resetDraft: {
      uid: "",
      token: "",
    },
    notice: null,
    loading: false,
  };
}
