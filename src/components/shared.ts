export function renderLocked(): string {
  return `
    <section class="empty-state">
      <i data-icon="lock"></i>
      <h2>Acesso restrito</h2>
    </section>
  `;
}

export function renderSessionRestore(hasError = false): string {
  return `
    <section class="empty-state">
      <i data-icon="${hasError ? "wifi-off" : "refresh-cw"}"></i>
      <h2>${hasError ? "Sessao nao validada" : "Restaurando sessao"}</h2>
      ${hasError ? "<p>Nao foi possivel confirmar sua sessao agora. Recarregue a pagina em alguns segundos.</p>" : ""}
    </section>
  `;
}

export function renderEmptyState(): string {
  return `
    <section class="empty-state">
      <i data-icon="inbox"></i>
      <h2>Nenhum registro</h2>
    </section>
  `;
}
