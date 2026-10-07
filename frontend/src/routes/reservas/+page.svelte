<script>
  import { sessao } from '$lib/stores/sessao.svelte.js';

  let reservas = $state([]);
  let carregando = $state(true);
  let erro = $state(null);

  async function carregarReservas() {
    if (!sessao.usuario) {
      carregando = false;
      return;
    }

    try {
      const emailQuery = sessao.usuario.email ? `?email=${encodeURIComponent(sessao.usuario.email)}` : '';
      const res = await fetch(`http://localhost:3001/api/reservas${emailQuery}`);
      
      if (res.ok) {
        reservas = await res.json();
      } else {
        erro = 'Erro ao buscar suas reservas no servidor.';
      }
    } catch (e) {
      erro = 'Erro de conexão com o servidor.';
    } finally {
      carregando = false;
    }
  }

  $effect(() => {
    carregarReservas();
  });
</script>

<h1>Minhas Reservas</h1>

{#if !sessao.usuario}
  <p>Você precisa estar logado para ver suas reservas.</p>
  <a href="/login" style="display: inline-block; margin-top: 1rem; color: #e2c275;">Ir para o Login</a>
{:else if carregando}
  <p>Buscando suas reservas...</p>
{:else if erro}
  <p style="color: #ff6b6b;">{erro}</p>
{:else if reservas.length === 0}
  <p>Você ainda não possui nenhuma reserva registrada.</p>
  <a href="/quarto" style="display: inline-block; margin-top: 1rem; color: #e2c275;">Ver quartos disponíveis</a>
{:else}
  <div class="grid-quartos">
    {#each reservas as r}
      <div class="card-quarto">
        <div class="card-conteudo">
          <h3>{r.quarto ? r.quarto.nome : `Quarto ID: ${r.quartoId}`}</h3>
          <p><strong>Hóspede:</strong> {r.nomeHospede}</p>
          <p><strong>E-mail:</strong> {r.email}</p>
          {#if r.quarto}
            <p class="preco">R$ {r.quarto.preco} <span>/ noite</span></p>
          {/if}
          <p style="font-size: 0.75rem; color: #8f77a8; margin-top: 0.5rem;">
            Reservado em: {new Date(r.criadoEm).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    {/each}
  </div>
{/if}