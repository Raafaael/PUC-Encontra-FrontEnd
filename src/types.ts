export type Perfil = {
  tipo: string;
  matricula: string;
  telefone: string;
};

export type Usuario = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  nome: string;
  perfil: Perfil | null;
  is_staff: boolean;
};

export type Categoria = {
  id: number;
  nome: string;
  descricao: string;
  objetos_count?: number;
};

export type Local = {
  id: number;
  nome: string;
  predio: string;
  andar: string;
  descricao: string;
  objetos_count?: number;
};

export type ObjetoTipo = "perdido" | "encontrado";
export type ObjetoStatus = "pendente" | "ativo" | "resolvido";

export type Objeto = {
  id: number;
  usuario: Usuario;
  tipo: ObjetoTipo;
  tipo_display: string;
  status: ObjetoStatus;
  status_display: string;
  titulo: string;
  descricao: string;
  categoria: number | null;
  categoria_nome: string;
  local: number | null;
  local_nome: string;
  data_ocorrencia: string;
  ponto_referencia: string;
  contato: string;
  imagem_url: string;
  criado_em: string;
  atualizado_em: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ViewName = "explorar" | "meus" | "perfil" | "admin";
export type AuthMode = "login" | "register";
export type NoticeTone = "success" | "error" | "info";

export type AdminEditTarget = { kind: "categoria" | "local"; id: number } | null;

export type FiltrosObjeto = {
  search: string;
  tipo: string;
  categoria: string;
  local: string;
};

export type ResetDraft = {
  uid: string;
  token: string;
};

export type AppState = {
  apiBase: string;
  token: string | null;
  user: Usuario | null;
  view: ViewName;
  authMode: AuthMode;
  objetos: Objeto[];
  meusObjetos: Objeto[];
  categorias: Categoria[];
  locais: Local[];
  editingObjectId: number | null;
  adminEdit: AdminEditTarget;
  filters: FiltrosObjeto;
  resetDraft: ResetDraft;
  notice: { message: string; tone: NoticeTone } | null;
  loading: boolean;
};
