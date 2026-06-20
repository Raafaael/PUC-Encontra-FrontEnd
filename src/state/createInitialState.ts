import { STORAGE_KEYS } from "../config.js";
import type { AppState } from "../types.js";

export function createInitialState(): AppState {
  return {
    token: localStorage.getItem(STORAGE_KEYS.token),
    user: null,
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
  };
}
