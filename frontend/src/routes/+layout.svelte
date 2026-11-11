<script>
  import { sessao, logout } from '$lib/stores/sessao.svelte.js';

  let { children } = $props();
</script>

<div class="app-container">
  <header class="hotel-header">
    <div class="brand-box">
      <span class="subtitle">HOTELEIRO EXCLUSIVO</span>
      <h1>HOTEL DEL LUNA</h1>
    </div>
    
    <nav class="nav-menu">
      <a href="/">Home</a>
      <a href="/quarto">Quartos</a>
      <a href="/reservas">Minhas Reservas</a>
    </nav>

    <div class="auth-area">
      {#if sessao.usuario}
        <span class="user-txt">Olá, <strong>{sessao.usuario.nome}</strong></span>
        <button class="btn-luna" onclick={logout}>Sair</button>
      {:else}
        <a href="/login" class="btn-luna">Entrar</a>
      {/if}
    </div>
  </header>

  <main class="page-content">
    {@render children()}
  </main>

  <footer class="hotel-footer">
    <p>&copy; 2026 Hotel Del Luna. Todos os direitos reservados à Gerência.</p>
  </footer>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  /* RESET E FUNDO GLOBAL */
  :global(*), :global(*::before), :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(html), :global(body) {
    background-color: #0c0513 !important;
    color: #d1c4e9 !important;
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  :global(a) {
    color: #e2c275;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  :global(a:hover) {
    color: #ffd700;
  }

  /* ESTRUTURA GERAL */
  .app-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .hotel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.5rem;
    margin-bottom: 3rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.35);
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .subtitle {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    color: #9575cd;
    display: block;
    margin-bottom: 0.2rem;
  }

  .brand-box h1 {
    font-family: 'Cinzel', serif;
    font-size: 1.6rem;
    color: #e2c275;
    letter-spacing: 0.12em;
    font-weight: 700;
  }

  .nav-menu {
    display: flex;
    gap: 2rem;
  }

  .nav-menu a {
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    color: #bfa8d8;
  }

  .nav-menu a:hover {
    color: #e2c275;
  }

  .auth-area {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-txt {
    font-size: 0.85rem;
    color: #d1c4e9;
  }

  .user-txt strong {
    color: #e2c275;
  }

  .btn-luna {
    background: linear-gradient(135deg, #251038, #150521);
    color: #e2c275 !important;
    border: 1px solid #d4af37;
    padding: 0.5rem 1.25rem;
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 4px;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .btn-luna:hover {
    background: linear-gradient(135deg, #3d1b5e, #251038);
    border-color: #ffd700;
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
    transform: translateY(-1px);
  }

  .page-content {
    flex: 1;
  }

  .hotel-footer {
    text-align: center;
    padding-top: 2rem;
    margin-top: 4rem;
    border-top: 1px solid rgba(212, 175, 55, 0.15);
    font-size: 0.75rem;
    color: #7e57c2;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.08em;
  }

  /* --- ESTILOS GLOBAIS DE CARDS E TÍTULOS (para pegar em todas as páginas) --- */
  :global(h1), :global(h2), :global(h3) {
    font-family: 'Cinzel', serif;
    color: #e2c275;
    letter-spacing: 0.08em;
  }

  :global(.grid-quartos) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  :global(.card-quarto) {
    background: linear-gradient(145deg, #160b22, #10061a);
    border: 1px solid rgba(212, 175, 55, 0.25);
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
  }

  :global(.card-quarto:hover) {
    border-color: #d4af37;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.2);
  }

  :global(.card-conteudo) {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }

  :global(.preco) {
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Cinzel', serif;
  }

  :global(.preco span) {
    font-size: 0.8rem;
    color: #9575cd;
    font-weight: normal;
  }

  :global(.badge-indisponivel) {
    background-color: rgba(220, 53, 69, 0.2);
    color: #ff6b6b;
    border: 1px solid rgba(220, 53, 69, 0.4);
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    font-family: 'Cinzel', serif;
    margin-left: 0.5rem;
  }

  :global(button) {
    background: linear-gradient(135deg, #251038, #150521);
    color: #e2c275;
    border: 1px solid #d4af37;
    padding: 0.6rem;
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  :global(button:hover:not(:disabled)) {
    background: #3d1b5e;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
  }

  :global(button:disabled) {
    background: #110818;
    color: #6e5585;
    border: 1px solid #2a193b;
    cursor: not-allowed;
  }
</style>