<script>
  import { sessao } from '$lib/stores/sessao.svelte.js';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    // Se não houver utilizador logado, redireciona para a página de login
    if (!sessao.usuario) {
      goto('/login');
    }
  });
</script>

<h1>Minhas Reservas</h1>
<p>Aqui aparecerão as minhas reservas do Hotel Del Luna.</p>