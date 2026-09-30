<script>
  import { listarQuartos, criarReserva } from '$lib/api/quartos-api.js';
  import { sessao } from '$shared/sessao.svelte.js';

  let { data } = $props();

  let quarto = $state(null);
  let carregando = $state(true);
  let erro = $state(null);
  let enviando = $state(false);
  let sucesso = $state(false);
  let erroGeral = $state(null);

  $effect(() => {
    async function carregar() {
      try {
        const lista = await listarQuartos();
        quarto = lista.find(q => q.id === data.id);
        if (!quarto) erro = 'Quarto não encontrado.';
      } catch (e) {
        erro = e.message;
      } finally {
        carregando = false;
      }
    }
    carregar();
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (enviando) return;

    enviando = true;
    erroGeral = null;

    try {
      // Envia os dados utilizando o token/usuário da store
      await criarReserva({
        quartoId: data.id,
        usuarioId: sessao.usuario?.id
      });
      sucesso = true;
    } catch (err) {
      erroGeral = err.message;
    } finally {
      enviando = false;
    }
  }
</script>

{#if carregando}
  <p>Carregando detalhes do quarto...</p>
{:else if erro}
  <p style="color: red;">{erro}</p>
{:else if quarto}
  <h2>Reserva: {quarto.nome}</h2>
  <p>Preço: R$ {quarto.preco}/noite</p>

  {#if !sessao.usuario}
    <p style="color: orange;">
      Você precisa estar logado para fazer uma reserva. <a href="/login">Clique aqui para entrar</a>.
    </p>
  {:else if sucesso}
    <p style="color: green;" role="status">Reserva realizada com sucesso!</p>
  {:else}
    <form onsubmit={handleSubmit}>
      {#if erroGeral}
        <p style="color: red;" role="alert">{erroGeral}</p>
      {/if}

      <p>Confirmar reserva para o usuário: <strong>{sessao.usuario.nome}</strong> ({sessao.usuario.email})</p>

      <button type="submit" disabled={enviando}>
        {enviando ? 'Reservando...' : 'Confirmar Reserva'}
      </button>
    </form>
  {/if}
{/if}