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