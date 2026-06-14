export function renderLocked(): string {
  return `
    <section class="empty-state">
      <i data-icon="lock"></i>
      <h2>Acesso restrito</h2>
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
