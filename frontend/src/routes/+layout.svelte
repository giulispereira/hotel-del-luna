<script>
  // No Svelte 5, o conteúdo das páginas filhas vem na prop children
  let { children } = $props();
</script>

<nav>
  <a href="/">Home</a> |
  <a href="/quarto">Quartos</a> |
  <a href="/reservas">Minhas Reservas</a>
</nav>

<hr />

{@render children()}