<script>
  import { listarQuartos } from '$lib/api/quartos-api.js';


  let quartos = $state([]);
  let carregando = $state(true);
  let erro = $state(null);

  async function carregarDados() {
    carregando = true;
    erro = null;
    try {
      quartos = await listarQuartos();
    } catch (e) {
      erro = e.message;
    } finally {
      carregando = false;
    }
  }


  $effect(() => {
    carregarDados();
  });
</script>

<h1>Quartos do Hotel Del Luna</h1>

{#if carregando}
  <p>Carregando quartos do hotel...</p>
{:else if erro}
  <p style="color: red;">Não conseguimos conectar. {erro}</p>
  <button onclick={carregarDados}>Tentar de novo</button>
{:else if quartos.length === 0}
  <p>Nenhum quarto disponível no momento.</p>
{:else}
  <ul>
    {#each quartos as q}
      <li>
        <a href="/quarto/{q.id}">
          <strong>{q.nome}</strong> - R$ {q.preco}/noite 
          {#if !q.disponivel}(Ocupado){/if}
        </a>
      </li>
    {/each}
  </ul>
{/if}