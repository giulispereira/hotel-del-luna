<script>
  import { listarQuartos, criarReserva } from '$lib/api/quartos-api.js';

  // Svelte 5: Pega os parâmetros da URL via $props()
  let { data } = $props();

  // Svelte 5: Variáveis reativas usam $state()
  let quarto = $state(null);
  let carregando = $state(true);
  let erro = $state(null);

  // Estados do formulário
  let nomeHospede = $state('');
  let email = $state('');
  let enviando = $state(false);
  let sucesso = $state(false);
  let errosCampos = $state({});
  let erroGeral = $state(null);

  // Carrega os dados assim que o componente inicia
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
    errosCampos = {};
    erroGeral = null;

    try {
      await criarReserva({ quartoId: data.id, nomeHospede, email });
      sucesso = true;
      nomeHospede = '';
      email = '';
    } catch (err) {
      if (err.campos) {
        errosCampos = err.campos;
      } else {
        erroGeral = err.message;
      }
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

  {#if sucesso}
    <p style="color: green;" role="status">Reserva realizada com sucesso!</p>
  {:else}
    <form onsubmit={handleSubmit} novalidate>
      {#if erroGeral}
        <p style="color: red;" role="alert">{erroGeral}</p>
      {/if}

      <div>
        <label for="nome">Nome Completo</label>
        <input
          id="nome"
          name="nomeHospede"
          type="text"
          autoComplete="name"
          bind:value={nomeHospede}
          aria-invalid={!!errosCampos.nomeHospede}
          aria-describedby={errosCampos.nomeHospede ? "nome-erro" : undefined}
          required
        />
        {#if errosCampos.nomeHospede}
          <span id="nome-erro" role="alert" style="color: red;">{errosCampos.nomeHospede}</span>
        {/if}
      </div>

      <br />

      <div>
        <label for="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          bind:value={email}
          aria-invalid={!!errosCampos.email}
          aria-describedby={errosCampos.email ? "email-erro" : undefined}
          required
        />
        {#if errosCampos.email}
          <span id="email-erro" role="alert" style="color: red;">{errosCampos.email}</span>
        {/if}
      </div>

      <br />

      <button type="submit" disabled={enviando}>
        {enviando ? 'Reservando...' : 'Confirmar Reserva'}
      </button>
    </form>
  {/if}
{/if}