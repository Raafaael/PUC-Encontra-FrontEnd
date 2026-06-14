import { ApiClient } from "../api/ApiClient.js";
import { STORAGE_KEYS } from "../config.js";
import { renderLayout } from "../components/layout.js";
import { renderCurrentView } from "../components/views.js";
import { createInitialState } from "../state/createInitialState.js";
import type { AppState, Categoria, Local, NoticeTone, Objeto, Paginated, Usuario, ViewName } from "../types.js";
import { syncIcons } from "../ui/icons.js";
import { formData } from "../utils/forms.js";
import { normalizeApiBase } from "../utils/format.js";
import { unwrapResults } from "../utils/pagination.js";

export class PucEncontraApp {
  private readonly state: AppState;
  private readonly api: ApiClient;
  private noticeTimer?: number;

  constructor(private readonly root: HTMLDivElement) {
    this.state = createInitialState();
    this.api = new ApiClient(
      () => this.state.apiBase,
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
      if (this.state.filters.tipo) params.set("tipo", this.state.filters.tipo);
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
          const meus = await this.api.request<Paginated<Objeto> | Objeto[]>("/objetos/meus/");
          this.state.meusObjetos = unwrapResults(meus);
        } catch {
          this.setToken(null);
          this.state.user = null;
          this.state.meusObjetos = [];
        }
      } else {
        this.state.user = null;
        this.state.meusObjetos = [];
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
        const next = button.dataset.nav as ViewName;
        if ((next === "meus" || next === "perfil") && !this.state.user) return;
        if (next === "admin" && !this.state.user?.is_staff) return;
        this.state.view = next;
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-auth-open]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.authMode = "login";
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-auth-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.authMode = button.dataset.authMode === "register" ? "register" : "login";
        this.render();
      });
    });

    this.bindForm("#apiForm", (event) => this.handleApiForm(event));
    this.bindForm("#loginForm", (event) => this.handleLogin(event));
    this.bindForm("#registerForm", (event) => this.handleRegister(event));
    this.bindForm("#filterForm", (event) => this.handleFilter(event));
    this.bindForm("#objectForm", (event) => this.handleObjectSubmit(event));
    this.bindForm("#profileForm", (event) => this.handleProfileSubmit(event));
    this.bindForm("#passwordForm", (event) => this.handlePasswordSubmit(event));
    this.bindForm("#resetRequestForm", (event) => this.handleResetRequest(event));
    this.bindForm("#resetConfirmForm", (event) => this.handleResetConfirm(event));
    this.bindForm("#categoryForm", (event) => this.handleCategorySubmit(event));
    this.bindForm("#localForm", (event) => this.handleLocalSubmit(event));

    document.querySelector<HTMLButtonElement>("#logoutButton")?.addEventListener("click", () => this.handleLogout());
    document.querySelector<HTMLButtonElement>("#clearFilters")?.addEventListener("click", () => void this.clearFilters());
    document.querySelector<HTMLButtonElement>("#resetObjectForm")?.addEventListener("click", () => this.resetObjectForm());
    document.querySelector<HTMLButtonElement>("#clearAdminForms")?.addEventListener("click", () => {
      this.state.adminEdit = null;
      this.render();
    });

    this.bindObjectActions();
    this.bindAdminActions();
  }

  private bindForm(selector: string, handler: (event: SubmitEvent) => void): void {
    document.querySelector<HTMLFormElement>(selector)?.addEventListener("submit", handler);
  }

  private bindObjectActions(): void {
    document.querySelectorAll<HTMLButtonElement>("[data-edit-object]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.editingObjectId = Number(button.dataset.editObject);
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
    document.querySelectorAll<HTMLButtonElement>("[data-edit-categoria]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminEdit = { kind: "categoria", id: Number(button.dataset.editCategoria) };
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-delete-categoria]").forEach((button) => {
      button.addEventListener("click", () => void this.deleteAdminResource("categoria", Number(button.dataset.deleteCategoria)));
    });

    document.querySelectorAll<HTMLButtonElement>("[data-edit-local]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.adminEdit = { kind: "local", id: Number(button.dataset.editLocal) };
        this.render();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-delete-local]").forEach((button) => {
      button.addEventListener("click", () => void this.deleteAdminResource("local", Number(button.dataset.deleteLocal)));
    });
  }

  private async handleApiForm(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const data = formData(event.currentTarget as HTMLFormElement);
    this.state.apiBase = normalizeApiBase(data.apiBase);
    localStorage.setItem(STORAGE_KEYS.apiBase, this.state.apiBase);
    this.setNotice("API atualizada.", "success");
    await this.refreshData();
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
      this.state.view = "explorar";
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
      this.state.view = "meus";
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
    this.state.view = "explorar";
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

  private async clearFilters(): Promise<void> {
    this.state.filters = { search: "", tipo: "", categoria: "", local: "" };
    await this.refreshData();
  }

  private async handleObjectSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const data = formData(event.currentTarget as HTMLFormElement);
    const id = data.id;
    const payload = {
      tipo: data.tipo,
      status: data.status,
      titulo: data.titulo,
      descricao: data.descricao,
      categoria: data.categoria ? Number(data.categoria) : null,
      local: data.local ? Number(data.local) : null,
      data_ocorrencia: data.data_ocorrencia,
      ponto_referencia: data.ponto_referencia,
      contato: data.contato,
      imagem_url: data.imagem_url,
    };

    try {
      await this.api.request<Objeto>(id ? `/objetos/${id}/` : "/objetos/", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      this.state.editingObjectId = null;
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
      this.setNotice("Registro resolvido.", "success");
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
      await this.api.request<{ detail: string }>("/auth/password/change/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.setToken(null);
      this.state.user = null;
      this.state.view = "explorar";
      this.setNotice("Senha alterada. Entre novamente.", "success");
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
      this.setNotice(response.detail, "success");
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao solicitar recuperacao.", "error");
    }
  }

  private async handleResetConfirm(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget as HTMLFormElement);
      const response = await this.api.request<{ detail: string }>("/auth/password/reset/confirm/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.state.resetDraft = { uid: "", token: "" };
      this.setNotice(response.detail, "success");
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao redefinir senha.", "error");
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
      this.setNotice("Item excluido.", "success");
      await this.refreshData();
    } catch (error) {
      this.setNotice(error instanceof Error ? error.message : "Falha ao excluir item.", "error");
    }
  }
}
