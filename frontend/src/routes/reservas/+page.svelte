<script>
  import { sessao } from '$lib/stores/sessao.svelte.js';

  let reservas = $state([]);
  let termoBusca = $state('');
  let carregando = $state(true);
  let erro = $state(null);

  async function carregarReservas() {
    if (!sessao.usuario) {
      carregando = false;
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/reservas');
      if (res.ok) {
        reservas = await res.json();
      } else {
        erro = 'Erro ao buscar registros de alocação.';
      }
    } catch (e) {
      erro = 'Falha de conexão com a API.';
    } finally {
      carregando = false;
    }
  }

  async function cancelarAlocacao(id) {
    if (!confirm('Deseja realizar o Check-out e encerrar esta alocação?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/reservas/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        carregarReservas();
      } else {
        alert('Erro ao realizar check-out.');
      }
    } catch (e) {
      alert('Erro de conexão com o servidor.');
    }
  }

  // 4. Filtro em tempo real por hóspede ou documento
  let reservasFiltradas = $derived(
    reservas.filter(r => 
      r.nomeHospede.toLowerCase().includes(termoBusca.toLowerCase()) ||
      r.documentoHospede.toLowerCase().includes(termoBusca.toLowerCase())
    )
  );

  $effect(() => {
    carregarReservas();
  });
</script>

<div class="reservas-page">
  <div class="page-header-flex">
    <div>
      <h2>Gestão de Alocações & Hóspedes</h2>
      <p class="subtitle-desc">Monitoramento de estadias ativas, check-in e check-out</p>
    </div>
    <a href="/quarto" class="btn-primary" style="text-decoration: none;">+ Nova Alocação</a>
  </div>

  {#if !sessao.usuario}
    <div class="auth-required-card">
      <h3>Acesso Restrito ao Sistema</h3>
      <p>Você precisa estar autenticado como operador para visualizar o painel de alocações.</p>
      <a href="/login" class="btn-primary" style="margin-top: 1rem; text-decoration: none;">Fazer Login</a>
    </div>
  {:else if carregando}
    <div class="status-mensagem">Sincronizando registros do NeonDB...</div>
  {:else if erro}
    <div class="status-mensagem erro">{erro}</div>
  {:else}
    <!-- BARRA DE PESQUISA INTELIGENTE -->
    <div class="search-bar-container">
      <input 
        type="text" 
        bind:value={termoBusca} 
        placeholder="Pesquisar hóspede por nome ou documento..." 
        class="search-input"
      />
    </div>

    {#if reservasFiltradas.length === 0}
      <div class="auth-required-card">
        <h3>Nenhuma Alocação Encontrada</h3>
        <p>Não há registros correspondentes à sua busca.</p>
      </div>
    {:else}
      <div class="grid-quartos">
        {#each reservasFiltradas as r}
          <div class="card-quarto">
            {#if r.quarto && r.quarto.imagem}
              <div class="card-img-container">
                <img src={r.quarto.imagem} alt={r.quarto.nome} />
              </div>
            {/if}
            <div class="card-conteudo">
              <div class="card-top">
                <h3>{r.quarto ? r.quarto.nome : `Unidade #${r.quartoId}`}</h3>
                <span class="badge-status confirmado">Hospedado</span>
              </div>

              <div class="reserva-detalhes">
                <p><strong>Hóspede:</strong> {r.nomeHospede}</p>
                <p><strong>Documento:</strong> {r.documentoHospede}</p>
                {#if r.email}
                  <p><strong>E-mail:</strong> {r.email}</p>
                {/if}
                <p><strong>Período:</strong> {r.dataCheckIn} até {r.dataCheckOut} ({r.dias} dias)</p>
              </div>

              {#if r.quarto}
                <div class="preco-box">
                  <span class="valor">R$ {Number(r.valorTotal).toFixed(2)}</span>
                  <span class="periodo">total estadia</span>
                </div>
              {/if}

              <button class="btn-checkout" onclick={() => cancelarAlocacao(r.id)}>
                Realizar Check-out / Encerrar
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .reservas-page { display: flex; flex-direction: column; gap: 2rem; }
  .page-header-flex { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; }
  .page-header-flex h2 { font-size: 1.75rem; font-weight: 700; }
  .subtitle-desc { color: #a1a1aa; font-size: 0.85rem; margin-top: 0.2rem; }
  .status-mensagem { text-align: center; color: #71717a; padding: 4rem; font-size: 0.9rem; }
  .status-mensagem.erro { color: #f87171; }
  
  .search-bar-container { width: 100%; max-width: 400px; }
  .search-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.7rem 1rem; color: #fff; font-size: 0.9rem; outline: none; }
  .search-input:focus { border-color: rgba(255,255,255,0.3); }

  .auth-required-card { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 3rem 2rem; max-width: 440px; margin: 4rem auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .auth-required-card h3 { font-size: 1.15rem; font-weight: 600; color: #fff; }
  .auth-required-card p { color: #a1a1aa; font-size: 0.9rem; }
  .grid-quartos { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
  .card-quarto { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
  .card-img-container { width: 100%; height: 160px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .card-img-container img { width: 100%; height: 100%; object-fit: cover; }
  .card-conteudo { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }
  .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .card-top h3 { font-size: 1rem; font-weight: 600; color: #fff; }
  .badge-status { font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 500; }
  .badge-status.confirmado { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
  .reserva-detalhes { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem; color: #a1a1aa; }
  .reserva-detalhes strong { color: #e4e4e7; }
  .preco-box { display: flex; align-items: baseline; gap: 0.3rem; }
  .valor { font-size: 1.2rem; font-weight: 700; color: #fff; }
  .periodo { font-size: 0.75rem; color: #71717a; }
  .btn-checkout { margin-top: auto; width: 100%; background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.25); padding: 0.65rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
  .btn-checkout:hover { background: rgba(239,68,68,0.2); }
</style>