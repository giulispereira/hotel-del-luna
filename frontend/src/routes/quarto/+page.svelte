<script>
  import { listarQuartos } from '$lib/api/quartos-api.js';
  import { goto } from '$app/navigation';
  import { sessao } from '$lib/stores/sessao.svelte.js';

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

  async function fazerReserva(quarto) {
    if (!sessao.usuario) {
      alert('Você precisa estar logado para fazer uma reserva!');
      goto('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quartoId: quarto.id,
          nomeHospede: sessao.usuario.nome,
          email: sessao.usuario.email
        })
      });

      if (res.ok) {
        alert(`Reserva do ${quarto.nome} confirmada com sucesso!`);
        goto('/reservas');
      } else {
        const dadosErro = await res.json();
        alert(dadosErro.mensagem || 'Erro ao realizar reserva.');
      }
    } catch (e) {
      alert('Não foi possível conectar ao servidor.');
    }
  }
</script>

<h1>Quartos do Hotel Del Luna</h1>

{#if carregando}
  <p>Carregando quartos do hotel...</p>
{:else if erro}
  <p style="color: #ff6b6b; margin-bottom: 1rem;">Não conseguimos conectar: {erro}</p>
  <button onclick={carregarDados} style="width: auto;">Tentar novamente</button>
{:else if quartos.length === 0}
  <p>Nenhum quarto disponível no momento.</p>
{:else}
  <div class="grid-quartos">
    {#each quartos as q}
      <div class="card-quarto">
        <div class="card-conteudo">
          <h3>
            <a href="/quarto/{q.id}">{q.nome}</a>
            {#if !q.disponivel}
              <span class="badge-indisponivel">Esgotado</span>
            {/if}
          </h3>

          <p class="preco">
            R$ {q.preco} <span>/ noite</span>
          </p>

          <button 
            disabled={!q.disponivel} 
            onclick={() => fazerReserva(q)}
          >
            {q.disponivel ? 'Reservar Agora' : 'Indisponível'}
          </button>
        </div>
      </div>
    {/each}
  </div>
{/if}