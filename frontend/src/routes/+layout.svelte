<script>
  import { sessao, logout } from '$lib/stores/sessao.svelte.js';

  let { children } = $props();
</script>

<nav>
  <a href="/">Home</a> |
  <a href="/quarto">Quartos</a> |
  <a href="/reservas">Minhas Reservas</a> |
  
  {#if sessao.usuario}
    <span>Olá, <strong>{sessao.usuario.nome}</strong>!</span>
    <button onclick={logout}>Sair</button>
  {:else}
    <a href="/login">Entrar</a>
  {/if}
</nav>

<hr />

{@render children()}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');

  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #120919; /* Roxo escuro profundo/quase preto */
    color: #bfa8d8;
    line-height: 1.5;
    padding: 1.5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Header com linha dourada e roxo sutil */
  :global(nav) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.25rem;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid #d4af37; /* Linha dourada bem visível */
  }

  :global(h1), :global(h2), :global(h3) {
    font-family: 'Cinzel', serif;
    color: #e2c275; /* Dourado */
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Links e botões estilo caixa dourada/roxa */
  :global(a) {
    color: #e2c275;
    text-decoration: none;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
  }

  :global(button) {
    background: #1e0d2b;
    color: #e2c275;
    border: 1px solid #d4af37;
    padding: 0.5rem 1.2rem;
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    cursor: pointer;
    border-radius: 2px;
  }

  :global(button:hover) {
    background: #34124a;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  }

  /* Grid para os Cards dos Quartos (igual ao print) */
  :global(.grid-quartos) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  /* Card do Quarto (fundo roxo escuro com borda dourada fina) */
  :global(.card-quarto) {
    background-color: #1a0f24;
    border: 1px solid #3d2354;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :global(.card-quarto:hover) {
    border-color: #d4af37;
  }

  :global(.card-quarto img) {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  :global(.card-conteudo) {
    padding: 1.25rem;
  }

  :global(.badge-destaque) {
    background-color: #e2c275;
    color: #120919;
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.4rem;
    border-radius: 2px;
    margin-left: 0.5rem;
  }
</style>