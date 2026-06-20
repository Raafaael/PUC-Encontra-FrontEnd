import { ApiClient } from "../api/ApiClient.js";
import { DEFAULT_API_BASE_URL, STORAGE_KEYS } from "../config.js";
import { renderLayout } from "../components/layout.js";
import { renderCurrentView } from "../components/views.js";
import { createInitialState } from "../state/createInitialState.js";
import type { AppState, Categoria, Local, NoticeTone, Objeto, Paginated, Usuario, ViewName } from "../types.js";
import { syncIcons } from "../ui/icons.js";
import { formData } from "../utils/forms.js";
import { unwrapResults } from "../utils/pagination.js";

export class PucEncontraApp {
  private readonly state: AppState;
  private readonly api: ApiClient;
  private noticeTimer?: number;

  constructor(private readonly root: HTMLDivElement) {
    this.state = createInitialState();
    this.api = new ApiClient(
      () => DEFAULT_API_BASE_URL,
      () => this.state.token,
    );
  }

  start(): void {
    this.render();
    void this.refreshData();
  }

  private render(): void {
    this.root.innerHTML = renderLayout(this.state, renderCurrentView(this.state));
    this.bindEvents();
    syncIcons();
  }

  private setToken(token: string | null): void {
    this.state.token = token;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.token);
    }
  }

  private setNotice(message: string, tone: NoticeTone = "info"): void {
    this.state.notice = { message, tone };
    this.render();

    if (this.noticeTimer) {
      window.clearTimeout(this.noticeTimer);
    }

    this.noticeTimer = window.setTimeout(() => {
      this.state.notice = null;
      this.render();
    }, 5000);
  }

  private async refreshData(): Promise<void> {
    this.state.loading = true;
    this.render();

    try {
      const params = new URLSearchParams();
      if (this.state.filters.search) params.set("search", this.state.filters.search);
      if (this.state.filters.tipo && this.state.filters.tipo !== "resolvido") params.set("tipo", this.state.filters.tipo);
      if (this.state.filters.tipo === "resolvido") params.set("status", "resolvido");
      if (this.state.filters.categoria) params.set("categoria", this.state.filters.categoria);
      if (this.state.filters.local) params.set("local", this.state.filters.local);

      const [categorias, locais, objetos] = await Promise.all([
        this.api.request<Paginated<Categoria> | Categoria[]>("/categorias/"),
        this.api.request<Paginated<Local> | Local[]>("/locais/"),
        this.api.request<Paginated<Objeto> | Objeto[]>(`/objetos/${params.toString() ? `?${params}` : ""}`),
      ]);

      this.state.categorias = unwrapResults(categorias);
      this.state.locais = unwrapResults(locais);
      this.state.objetos = unwrapResults(objetos);

      if (this.state.token) {
        try {
          this.state.user = await this.api.request<Usuario>("/auth/me/");
          if (this.state.view === "inicio" || this.state.view === "login" || this.state.view === "cadastro") {
            this.state.view = "dashboard";
          }
          const meus = await this.api.request<Paginated<Objeto> | Objeto[]>("/objetos/meus/");
          this.state.meusObjetos = unwrapResults(meus);
          if (this.state.user.is_staff) {
            try {
              const usuarios = await this.api.request<Paginated<Usuario> | Usuario[]>("/usuarios/");
              this.state.usuarios = unwrapResults(usuarios);
            } catch {
              this.state.usuarios = [];
            }
          } else {
            this.state.usuarios = [];
          }
        } catch {
          this.setToken(null);
          this.state.user = null;
          this.state.meusObjetos = [];
          this.state.usuarios = [];
        }
      } else {
        this.state.user = null;
        this.state.meusObjetos = [];
        this.state.usuarios = [];
      }
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao carregar dados.", "error");
    } finally {
      this.state.loading = false;
      this.render();
    }
  }

  private bindEvents(): void {
    document.querySelectorAll<HTMLElement>("[data-nav]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        this.navigate(button.dataset.nav as ViewName);
      });
    });

    this.bindForm("#loginForm", (event) => this.handleLogin(event));
    this.bindForm("#registerForm", (event) => this.handleRegister(event));
    this.bindForm("#filterForm", (event) => this.handleFilter(event));
    this.bindForm("#myFilterForm", (event) => this.handleMyFilter(event));
    this.bindForm("#objectForm", (event) => this.handleObjectSubmit(event));
    this.bindForm("#profileForm", (event) => this.handleProfileSubmit(event));
    this.bindForm("#passwordForm", (event) => this.handlePasswordSubmit(event));
    this.bindForm("#resetRequestForm", (event) => this.handleResetRequest(event));
    this.bindForm("#resetConfirmForm", (event) => this.handleResetConfirm(event));
    this.bindForm("#deactivateForm", (event) => this.handleDeactivate(event));
    this.bindForm("#approvalFilterForm", (event) => this.handleApprovalFilter(event));
    this.bindForm("#usuariosFilterForm", (event) => this.handleUsuariosFilter(event));
    this.bindForm("#categoryForm", (event) => this.handleCategorySubmit(event));
    this.bindForm("#localForm", (event) => this.handleLocalSubmit(event));
    this.bindForm("#usuarioForm", (event) => this.handleUsuarioSubmit(event));

    document.querySelector<HTMLButtonElement>("#logoutButton")?.addEventListener("click", () => this.handleLogout());
    document.querySelector<HTMLButtonElement>("#clearFilters")?.addEventListener("click", () => void this.clearFilters());
    document.querySelector<HTMLButtonElement>("#resetObjectForm")?.addEventListener("click", () => this.resetObjectForm());
    this.bindObjectActions();
    this.bindAdminActions();
  }

  private isAdminView(view: ViewName): boolean {
    return ["aprovacoes", "categorias", "categoria-form", "locais", "local-form", "usuarios", "usuario-form"].includes(view);
  }

  private isAuthenticatedView(view: ViewName): boolean {
    return ["dashboard", "meus", "objeto-form", "perfil", "trocar-senha", "desativar-conta"].includes(view) || this.isAdminView(view);
  }

  private navigate(next: ViewName): void {
    const hasSession = Boolean(this.state.user || this.state.token);

    if (hasSession && (next === "inicio" || next === "login" || next === "cadastro")) {
      next = "dashboard";
    }

    if (!hasSession && this.isAuthenticatedView(next)) {
      this.state.view = "login";
      this.render();
      return;
    }

    if (this.isAdminView(next) && !this.state.user?.is_staff) {
      this.state.view = "dashboard";
      this.setNotice("Voce nao tem permissao para acessar esta pagina.", "error");
      return;
    }

    if (next === "categorias" || next === "locais" || next === "usuarios") {
      this.state.adminEdit = null;
      this.state.adminUserEditId = null;
    }

    if (next === "explorar" || next === "meus") {
      this.state.editingObjectId = null;
      this.state.selectedObjectId = null;
    }

    this.state.view = next;
    this.render();
  }

  private bindForm(selector: string, handler: (event: SubmitEvent) => void): void {
    document.querySelector<HTMLFormElement>(selector)?.addEventListener("submit", handler);
  }

  private bindObjectActions(): void {
    document.querySelectorAll<HTMLButtonElement>("[data-create-object]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.editingObjectId = null;
        this.state.view = "objeto-form";
        this.render();
      });
    });

    document.querySelectorAll<HTMLElement>("[data-view-object]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.state.selectedObjectId = Number(link.dataset.viewObject);
        this.state.view = "objeto-detail";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-public-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.filters.tipo = button.dataset.publicFilter || "";
        void this.refreshData();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-edit-object]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.editingObjectId = Number(button.dataset.editObject);
        this.state.view = "objeto-form";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-resolve-object]").forEach((button) => {
      button.addEventListener("click", () => void this.resolveObject(Number(button.dataset.resolveObject)));
    });

    document.querySelectorAll<HTMLButtonElement>("[data-delete-object]").forEach((button) => {
      button.addEventListener("click", () => void this.deleteObject(Number(button.dataset.deleteObject)));
    });
  }

  private bindAdminActions(): void {
    document.querySelectorAll<HTMLButtonElement>("[data-create-categoria]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminEdit = null;
        this.state.view = "categoria-form";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-edit-categoria]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminEdit = { kind: "categoria", id: Number(button.dataset.editCategoria) };
        this.state.view = "categoria-form";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-delete-categoria]").forEach((button) => {
      button.addEventListener("click", () => void this.deleteAdminResource("categoria", Number(button.dataset.deleteCategoria)));
    });

    document.querySelectorAll<HTMLButtonElement>("[data-create-local]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminEdit = null;
        this.state.view = "local-form";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-edit-local]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminEdit = { kind: "local", id: Number(button.dataset.editLocal) };
        this.state.view = "local-form";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-delete-local]").forEach((button) => {
      button.addEventListener("click", () => void this.deleteAdminResource("local", Number(button.dataset.deleteLocal)));
    });

    document.querySelectorAll<HTMLButtonElement>("[data-approve-object]").forEach((button) => {
      button.addEventListener("click", () => void this.approveObject(Number(button.dataset.approveObject)));
    });

    document.querySelectorAll<HTMLButtonElement>("[data-reject-object]").forEach((button) => {
      button.addEventListener("click", () => void this.rejectObject(Number(button.dataset.rejectObject)));
    });

    document.querySelectorAll<HTMLButtonElement>("[data-create-usuario]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminUserEditId = null;
        this.state.view = "usuario-form";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-edit-usuario]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminUserEditId = Number(button.dataset.editUsuario);
        this.state.view = "usuario-form";
        this.render();
      });
    });
  }

  private async handleLogin(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget as HTMLFormElement);
      const response = await this.api.request<{ token: string; user: Usuario }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.setToken(response.token);
      this.state.user = response.user;
      this.state.view = "dashboard";
      this.setNotice("Login realizado.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha no login.", "error");
    }
  }

  private async handleRegister(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget as HTMLFormElement);
      const response = await this.api.request<{ token: string; user: Usuario }>("/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.setToken(response.token);
      this.state.user = response.user;
      this.state.view = "dashboard";
      this.setNotice("Cadastro realizado.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha no cadastro.", "error");
    }
  }

  private async handleLogout(): Promise<void> {
    try {
      await this.api.request<void>("/auth/logout/", { method: "POST" });
    } catch {
      // O token local tambem precisa sair quando a sessao do servidor ja expirou.
    }
    this.setToken(null);
    this.state.user = null;
    this.state.meusObjetos = [];
    this.state.view = "inicio";
    this.setNotice("Sessao encerrada.", "success");
  }

  private async handleFilter(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const data = formData(event.currentTarget as HTMLFormElement);
    this.state.filters = {
      search: data.search,
      tipo: data.tipo,
      categoria: data.categoria,
      local: data.local,
    };
    await this.refreshData();
  }

  private handleMyFilter(event: SubmitEvent): void {
    event.preventDefault();
    const data = formData(event.currentTarget as HTMLFormElement);
    this.state.meusFilters = {
      tipo: data.tipo,
      status: data.status,
    };
    this.render();
  }

  private handleApprovalFilter(event: SubmitEvent): void {
    event.preventDefault();
    const data = formData(event.currentTarget as HTMLFormElement);
    this.state.aprovacoesFilter = data.filtro;
    this.render();
  }

  private handleUsuariosFilter(event: SubmitEvent): void {
    event.preventDefault();
    const data = formData(event.currentTarget as HTMLFormElement);
    this.state.usuariosFilters = {
      search: data.search,
      tipo: data.tipo,
    };
    this.render();
  }

  private async clearFilters(): Promise<void> {
    this.state.filters = { search: "", tipo: "", categoria: "", local: "" };
    await this.refreshData();
  }

  private async handleObjectSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const data = formData(event.currentTarget as HTMLFormElement);
    const id = data.id;
    const existing = id
      ? this.state.meusObjetos.find((objeto) => objeto.id === Number(id))
        || this.state.objetos.find((objeto) => objeto.id === Number(id))
      : null;
    const payload = {
      tipo: data.tipo,
      status: existing?.status ?? (this.state.user?.is_staff ? "ativo" : "pendente"),
      titulo: data.titulo,
      descricao: data.descricao,
      categoria: data.categoria ? Number(data.categoria) : null,
      local: data.local ? Number(data.local) : null,
      data_ocorrencia: data.data_ocorrencia,
      ponto_referencia: existing?.ponto_referencia ?? "",
      contato: existing?.contato ?? "",
      imagem_url: data.imagem_url,
    };

    try {
      await this.api.request<Objeto>(id ? `/objetos/${id}/` : "/objetos/", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      this.state.editingObjectId = null;
      this.state.selectedObjectId = null;
      this.state.view = "meus";
      this.setNotice("Registro salvo.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao salvar registro.", "error");
    }
  }

  private resetObjectForm(): void {
    this.state.editingObjectId = null;
    this.render();
  }

  private async resolveObject(id: number): Promise<void> {
    try {
      await this.api.request<Objeto>(`/objetos/${id}/marcar_resolvido/`, { method: "POST" });
      this.setNotice("Registro marcado como devolvido.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao resolver.", "error");
    }
  }

  private async deleteObject(id: number): Promise<void> {
    if (!window.confirm("Excluir registro?")) return;
    try {
      await this.api.request<void>(`/objetos/${id}/`, { method: "DELETE" });
      this.state.editingObjectId = null;
      this.state.selectedObjectId = null;
      this.state.view = "meus";
      this.setNotice("Registro excluido.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao excluir.", "error");
    }
  }

  private async handleProfileSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget as HTMLFormElement);
      this.state.user = await this.api.request<Usuario>("/auth/me/", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      this.setNotice("Perfil atualizado.", "success");
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao atualizar perfil.", "error");
    }
  }

  private async handlePasswordSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget as HTMLFormElement);
      if (payload.nova_senha !== payload.nova_senha_confirm) {
        this.setNotice("As senhas nao conferem.", "error");
        return;
      }
      await this.api.request<{ detail: string }>("/auth/password/change/", {
        method: "POST",
        body: JSON.stringify({
          senha_atual: payload.senha_atual,
          nova_senha: payload.nova_senha,
        }),
      });
      this.state.view = "perfil";
      this.setNotice("Senha alterada com sucesso.", "success");
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao trocar senha.", "error");
    }
  }

  private async handleResetRequest(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget as HTMLFormElement);
      const response = await this.api.request<{ detail: string; reset?: { uid: string; token: string } }>(
        "/auth/password/reset/request/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      if (response.reset) {
        this.state.resetDraft = response.reset;
      }
      this.state.view = "password-reset";
      this.setNotice(response.detail, "success");
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao solicitar recuperacao.", "error");
    }
  }

  private async handleResetConfirm(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget as HTMLFormElement);
      if (payload.nova_senha !== payload.nova_senha_confirm) {
        this.setNotice("As senhas nao conferem.", "error");
        return;
      }
      const response = await this.api.request<{ detail: string }>("/auth/password/reset/confirm/", {
        method: "POST",
        body: JSON.stringify({
          uid: payload.uid,
          token: payload.token,
          nova_senha: payload.nova_senha,
        }),
      });
      this.state.resetDraft = { uid: "", token: "" };
      this.state.view = "login";
      this.setNotice(response.detail, "success");
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao redefinir senha.", "error");
    }
  }

  private async handleDeactivate(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!window.confirm("Desativar sua conta?")) return;

    try {
      await this.api.request<void>("/auth/deactivate/", { method: "POST" });
      this.setToken(null);
      this.state.user = null;
      this.state.meusObjetos = [];
      this.state.view = "inicio";
      this.setNotice("Conta desativada.", "success");
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao desativar conta.", "error");
    }
  }

  private async handleCategorySubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const payload = formData(event.currentTarget as HTMLFormElement);
    const id = payload.id;

    try {
      await this.api.request<Categoria>(id ? `/categorias/${id}/` : "/categorias/", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({ nome: payload.nome, descricao: payload.descricao }),
      });
      this.state.adminEdit = null;
      this.state.view = "categorias";
      this.setNotice("Categoria salva.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao salvar categoria.", "error");
    }
  }

  private async handleLocalSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const payload = formData(event.currentTarget as HTMLFormElement);
    const id = payload.id;

    try {
      await this.api.request<Local>(id ? `/locais/${id}/` : "/locais/", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({
          nome: payload.nome,
          predio: payload.predio,
          andar: payload.andar,
          descricao: payload.descricao,
        }),
      });
      this.state.adminEdit = null;
      this.state.view = "locais";
      this.setNotice("Local salvo.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao salvar local.", "error");
    }
  }

  private async deleteAdminResource(kind: "categoria" | "local", id: number): Promise<void> {
    if (!window.confirm("Excluir item?")) return;
    const endpoint = kind === "categoria" ? "categorias" : "locais";

    try {
      await this.api.request<void>(`/${endpoint}/${id}/`, { method: "DELETE" });
      this.state.adminEdit = null;
      this.state.view = kind === "categoria" ? "categorias" : "locais";
      this.setNotice("Item excluido.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao excluir item.", "error");
    }
  }

  private async handleUsuarioSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const payload = formData(event.currentTarget as HTMLFormElement);
    const id = payload.id;
    const body: Record<string, string | boolean> = {
      username: payload.username,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      matricula: payload.matricula,
      telefone: payload.telefone,
      tipo: payload.tipo,
      is_staff: payload.tipo === "admin",
      is_active: payload.is_active === "1",
    };

    if (payload.password || payload.password_confirm) {
      body.password = payload.password;
      body.password_confirm = payload.password_confirm;
    }

    try {
      await this.api.request<Usuario>(id ? `/usuarios/${id}/` : "/usuarios/", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      this.state.adminUserEditId = null;
      this.state.view = "usuarios";
      this.setNotice("Usuario salvo.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao salvar usuario.", "error");
    }
  }

  private async approveObject(id: number): Promise<void> {
    try {
      await this.api.request<Objeto>(`/objetos/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ativo" }),
      });
      this.setNotice("Item aprovado.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao aprovar item.", "error");
    }
  }

  private async rejectObject(id: number): Promise<void> {
    if (!window.confirm("Rejeitar e excluir este item?")) return;
    try {
      await this.api.request<void>(`/objetos/${id}/`, { method: "DELETE" });
      this.setNotice("Item rejeitado.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao rejeitar item.", "error");
    }
  }
}
