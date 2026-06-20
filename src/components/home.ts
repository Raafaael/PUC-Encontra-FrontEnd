import type { AppState, Objeto } from "../types.js";

export function renderInicioView(state: AppState): string {
  const totalPerdidos = countBy(state.objetos, "perdido");
  const totalEncontrados = countBy(state.objetos, "encontrado");
  const totalResolvidos = state.objetos.filter((objeto) => objeto.status === "resolvido").length;

  return `
    <section class="hero">
      <h1>PUC Encontra</h1>
      <p class="hero-subtitle">Sistema Inteligente de Achados e Perdidos da Universidade</p>
      <p class="hero-desc">
        Perdeu algo no campus? Encontrou um objeto? Nosso sistema conecta
        quem perdeu com quem encontrou, de forma rapida e organizada.
      </p>
      <div class="hero-actions">
        ${
          state.user
            ? `<a href="#" class="btn btn-primary btn-large" data-nav="dashboard">Dashboard</a>
               <a href="#" class="btn btn-secondary btn-large" data-nav="explorar">Ver itens</a>`
            : `<a href="#" class="btn btn-primary btn-large" data-nav="cadastro">Cadastre-se</a>
               <a href="#" class="btn btn-secondary btn-large" data-nav="login">Ja tenho conta</a>`
        }
      </div>
    </section>

    <section class="stats-section">
      <h2>Numeros do Sistema</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">${totalPerdidos}</span>
          <span class="stat-label">Itens perdidos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${totalEncontrados}</span>
          <span class="stat-label">Itens encontrados</span>
        </div>
        <div class="stat-card stat-card-success">
          <span class="stat-number">${totalResolvidos}</span>
          <span class="stat-label">Itens devolvidos</span>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <h2>Como Funciona</h2>
      <div class="steps-grid">
        <div class="step-card">
          <span class="step-number">1</span>
          <h3>Registre</h3>
          <p>Perdeu algo? Cadastre o objeto com detalhes como categoria, local e data.</p>
        </div>
        <div class="step-card">
          <span class="step-number">2</span>
          <h3>Aprovacao</h3>
          <p>Um administrador revisa e aprova o registro antes de ser publicado.</p>
        </div>
        <div class="step-card">
          <span class="step-number">3</span>
          <h3>Busque</h3>
          <p>Use os filtros e veja correspondencias automaticas por categoria para encontrar possiveis combinacoes.</p>
        </div>
        <div class="step-card">
          <span class="step-number">4</span>
          <h3>Entre em Contato</h3>
          <p>Usuarios logados podem visualizar o contato do responsavel e combinar a devolucao.</p>
        </div>
      </div>
    </section>
  `;
}

function countBy(objetos: Objeto[], tipo: Objeto["tipo"]): number {
  return objetos.filter((objeto) => objeto.tipo === tipo).length;
}
