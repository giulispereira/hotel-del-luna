<script>
  import { sessao, logout } from '$lib/stores/sessao.svelte.js';

  let { children } = $props();
</script>

<div class="app-container">
  <header class="saas-header">
    <div class="brand-box">
      <div class="brand-logo">
        <div class="logo-dot"></div>
        <h1>DEL LUNA <span class="badge-saas">PMS</span></h1>
      </div>
      <span class="subtitle">Cloud Hospitality Architecture</span>
    </div>
    
    <nav class="nav-menu">
      <a href="/">Visão Geral</a>
      <a href="/quarto">Inventário & Quartos</a>
      <a href="/reservas">Gestão de Reservas</a>
    </nav>

    <div class="auth-area">
      {#if sessao.usuario}
        <div class="user-badge">
          <span class="user-txt">Operador: <strong>{sessao.usuario.nome}</strong></span>
          <button class="btn-secondary" onclick={logout}>Desconectar</button>
        </div>
      {:else}
        <a href="/login" class="btn-primary">Acessar Sistema</a>
      {/if}
    </div>
  </header>

  <main class="page-content">
    {@render children()}
  </main>

  <footer class="saas-footer">
    <div class="footer-content">
      <p>&copy; 2026 Del Luna Technologies Inc. Todos os direitos reservados.</p>
      <span class="server-status">● NeonDB Cloud Connected</span>
    </div>
  </footer>
</div>

<style>
  /* RESET E FUNDO GLOBAL ESTILO DARK TECH / SAAS */
  :global(*), :global(*::before), :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(html), :global(body) {
    background-color: #050507 !important;
    color: #ededef !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  :global(a) {
    color: #a1a1aa;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  :global(a:hover) {
    color: #ffffff;
  }

  .app-container {
    max-width: 1320px;
    margin: 0 auto;
    padding: 2rem 2.5rem;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* HEADER ESTILO NAVBAR DE SAAS (Stripe/Vercel) */
  .saas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.5rem;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-wrap: wrap;
    gap: 1.5rem;
    background: rgba(5, 5, 7, 0.75);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .logo-dot {
    width: 10px;
    height: 10px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
  }

  .brand-box h1 {
    font-family: 'Inter', sans-serif;
    font-size: 1.15rem;
    color: #ffffff;
    letter-spacing: -0.02em;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .badge-saas {
    font-size: 0.65rem;
    background: rgba(255, 255, 255, 0.1);
    color: #a1a1aa;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-weight: 500;
  }

  .subtitle {
    font-size: 0.75rem;
    color: #71717a;
    letter-spacing: 0.02em;
    display: block;
    margin-top: 0.1rem;
  }

  .nav-menu {
    display: flex;
    gap: 2rem;
  }

  .nav-menu a {
    font-size: 0.85rem;
    color: #a1a1aa;
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  .nav-menu a:hover {
    color: #ffffff;
  }

  .auth-area {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.35rem 0.35rem 0.35rem 1rem;
    border-radius: 6px;
  }

  .user-txt {
    font-size: 0.8rem;
    color: #a1a1aa;
  }

  .user-txt strong {
    color: #ffffff;
  }

  /* BOTÕES PADRÃO SAAS */
  :global(.btn-primary) {
    background: #ffffff;
    color: #000000 !important;
    border: 1px solid #ffffff;
    padding: 0.55rem 1.1rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 6px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(255, 255, 255, 0.1);
  }

  :global(.btn-primary:hover) {
    background: #f4f4f5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: #ededef !important;
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 0.45rem 0.9rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .page-content {
    flex: 1;
  }

  .saas-footer {
    padding-top: 2rem;
    margin-top: 5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.75rem;
    color: #71717a;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .server-status {
    color: #10b981;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  /* REUTILÁVEIS DE TÍTULOS E CARDS */
  :global(h1), :global(h2), :global(h3) {
    font-family: 'Inter', sans-serif;
    color: #ffffff;
    letter-spacing: -0.03em;
  }

  :global(.card-base) {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    transition: all 0.25s ease;
  }

  :global(.card-base:hover) {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.035);
  }
</style>