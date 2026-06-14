import type { AppState, Categoria, Local } from "../types.js";
import { escapeHtml } from "../utils/format.js";
import { renderLocked } from "./shared.js";

export function renderAdminView(state: AppState): string {
  if (!state.user?.is_staff) return renderLocked();

  const categoriaEdit =
    state.adminEdit?.kind === "categoria"
      ? state.categorias.find((item) => item.id === state.adminEdit?.id)
      : null;
  const localEdit =
    state.adminEdit?.kind === "local" ? state.locais.find((item) => item.id === state.adminEdit?.id) : null;

  return `
    <section class="view-header">
      <div>
        <h1>Admin</h1>
        <p>Categorias e locais</p>
      </div>
      <button class="btn neutral" id="clearAdminForms" title="Limpar">
        <i data-icon="rotate-ccw"></i><span>Limpar</span>
      </button>
    </section>
    <div class="admin-grid">
      <form class="tool-panel" id="categoryForm">
        <div class="panel-title"><i data-icon="${categoriaEdit ? "pencil" : "tags"}"></i><h2>Categoria</h2></div>
        <input type="hidden" name="id" value="${categoriaEdit?.id ?? ""}" />
        <label><span>Nome</span><input name="nome" value="${escapeHtml(categoriaEdit?.nome)}" required /></label>
        <label><span>Descricao</span><textarea name="descricao" rows="3">${escapeHtml(categoriaEdit?.descricao)}</textarea></label>
        <button class="btn primary" type="submit" title="Salvar categoria"><i data-icon="save"></i><span>Salvar</span></button>
      </form>
      <form class="tool-panel" id="localForm">
        <div class="panel-title"><i data-icon="${localEdit ? "pencil" : "map-pin"}"></i><h2>Local</h2></div>
        <input type="hidden" name="id" value="${localEdit?.id ?? ""}" />
        <label><span>Nome</span><input name="nome" value="${escapeHtml(localEdit?.nome)}" required /></label>
        <div class="grid-2">
          <label><span>Predio</span><input name="predio" value="${escapeHtml(localEdit?.predio)}" required /></label>
          <label><span>Andar</span><input name="andar" value="${escapeHtml(localEdit?.andar)}" /></label>
        </div>
        <label><span>Descricao</span><textarea name="descricao" rows="3">${escapeHtml(localEdit?.descricao)}</textarea></label>
        <button class="btn primary" type="submit" title="Salvar local"><i data-icon="save"></i><span>Salvar</span></button>
      </form>
      ${renderAdminList("categoria", state.categorias)}
      ${renderAdminList("local", state.locais)}
    </div>
  `;
}

function renderAdminList(kind: "categoria" | "local", items: Categoria[] | Local[]): string {
  return `
    <section class="data-list">
      <h2>${kind === "categoria" ? "Categorias" : "Locais"}</h2>
      ${items
        .map((item) => {
          const subtitle =
            kind === "local"
              ? `${escapeHtml((item as Local).predio)} ${escapeHtml((item as Local).andar)}`
              : escapeHtml((item as Categoria).descricao);

          return `
            <article>
              <div>
                <strong>${escapeHtml(item.nome)}</strong>
                <span>${subtitle}</span>
              </div>
              <div class="row-actions">
                <button class="icon-btn" data-edit-${kind}="${item.id}" title="Editar">
                  <i data-icon="pencil"></i>
                </button>
                <button class="icon-btn danger" data-delete-${kind}="${item.id}" title="Excluir">
                  <i data-icon="trash-2"></i>
                </button>
              </div>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}
