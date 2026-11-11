<script>
  import { listarQuartos } from '$lib/api/quartos-api.js';
  import { goto } from '$app/navigation';
  import { sessao } from '$lib/stores/sessao.svelte.js';

  let quartos = $state([]);
  let carregando = $state(true);
  let erro = $state(null);

  // Estado para controlar o modal customizado
  let modalMensagem = $state('');
  let modalAberto = $state(false);
  let acaoAposFechar = $state(null);

  function mostrarModal(mensagem, acao = null) {
    modalMensagem = mensagem;
    acaoAposFechar = acao;
    modalAberto = true;
  }

  function fecharModal() {
    modalAberto = false;
    if (acaoAposFechar) {
      acaoAposFechar();
      acaoAposFechar = null;
    }
  }

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
      mostrarModal('Você precisa estar logado para fazer uma reserva!', () => goto('/login'));
      return;
    }

    try {
      const res = await fetch('http://localhost:3002/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quartoId: quarto.id,
          nomeHospede: sessao.usuario.nome,
          email: sessao.usuario.email
        })
      });

      if (res.ok) {
        mostrarModal(`Reserva do ${quarto.nome} confirmada com sucesso!`, () => goto('/reservas'));
      } else {
        const dadosErro = await res.json();
        mostrarModal(dadosErro.mensagem || 'Erro ao realizar reserva.');
      }
    } catch (e) {
      mostrarModal('Não foi possível conectar ao servidor.');
    }
  }
</script>

<div class="quartos-page">
  <div class="page-header">
    <h2>Acomodações Exclusivas</h2>
    <p class="subtitle-desc">Escolha sua suíte no Hotel Del Luna</p>
  </div>

  {#if carregando}
    <div class="status-mensagem">Carregando quartos do hotel...</div>
  {:else if erro}
    <div class="status-mensagem erro">
      <p>Não conseguimos conectar: {erro}</p>
      <button class="btn-luna" onclick={carregarDados}>Tentar novamente</button>
    </div>
  {:else if quartos.length === 0}
    <div class="status-mensagem">Nenhum quarto disponível no momento.</div>
  {:else}
    <div class="grid-quartos">
      {#each quartos as q}
        <div class="card-quarto">
          <div class="card-img-container">
            <img src={q.imagem || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'} alt={q.nome} />
          </div>

          <div class="card-conteudo">
            <div class="card-top">
              <h3>
                <a href="/quarto/{q.id}" class="quarto-link">{q.nome}</a>
              </h3>
              {#if !q.disponivel}
                <span class="badge-esgotado">Esgotado</span>
              {:else}
                <span class="badge-disponivel">Disponível</span>
              {/if}
            </div>

            <div class="preco-box">
              <span class="valor">R$ {q.preco}</span>
              <span class="periodo">/ noite</span>
            </div>

            <button 
              class="btn-reservar" 
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
</div>

<!-- MODAL CUSTOMIZADO ESTILO HOTEL DEL LUNA -->
{#if modalAberto}
  <div class="modal-overlay">
    <div class="modal-card">
      <span class="modal-subtitle">Aviso da Gerência</span>
      <p class="modal-texto">{modalMensagem}</p>
      <button class="btn-luna-modal" onclick={fecharModal}>OK</button>
    </div>
  </div>
{/if}

<style>
  .quartos-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .page-header h2 {
    font-family: 'Cinzel', serif;
    color: #e2c275;
    font-size: 2rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  .subtitle-desc {
    color: #bfa8d8;
    font-size: 0.9rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .status-mensagem {
    text-align: center;
    color: #bfa8d8;
    padding: 3rem;
    font-family: 'Cinzel', serif;
  }

  .status-mensagem.erro {
    color: #ff6b6b;
  }

  .grid-quartos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-top: 1rem;
  }

  .card-quarto {
    background: linear-gradient(145deg, #180a24, #10051a);
    border: 1px solid rgba(212, 175, 55, 0.25);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
  }

  .card-quarto:hover {
    border-color: #d4af37;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(212, 175, 55, 0.25);
  }

  .card-img-container {
    width: 100%;
    height: 190px;
    overflow: hidden;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  }

  .card-img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .card-quarto:hover .card-img-container img {
    transform: scale(1.05);
  }

  .card-conteudo {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    flex: 1;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .quarto-link {
    font-family: 'Cinzel', serif;
    color: #e2c275 !important;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }

  .quarto-link:hover {
    color: #ffd700 !important;
    text-shadow: 0 0 8px rgba(226, 194, 117, 0.4);
  }

  .badge-esgotado {
    background-color: rgba(220, 53, 69, 0.15);
    color: #ff6b6b;
    border: 1px solid rgba(220, 53, 69, 0.4);
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .badge-disponivel {
    background-color: rgba(40, 167, 69, 0.15);
    color: #75b798;
    border: 1px solid rgba(40, 167, 69, 0.4);
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .preco-box {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    margin-top: -0.25rem;
  }

  .valor {
    font-size: 1.35rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Cinzel', serif;
  }

  .periodo {
    font-size: 0.8rem;
    color: #9575cd;
    font-family: 'Cinzel', serif;
  }

  .btn-reservar {
    margin-top: auto;
    width: 100%;
    background: linear-gradient(135deg, #2a1240, #180824);
    color: #e2c275;
    border: 1px solid #d4af37;
    padding: 0.75rem;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .btn-reservar:hover:not(:disabled) {
    background: linear-gradient(135deg, #3d1b5e, #2a1240);
    border-color: #ffd700;
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
    transform: translateY(-1px);
  }

  .btn-reservar:disabled {
    background: #110818;
    color: #6e5585;
    border: 1px solid #2a193b;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* ESTILOS DO MODAL CUSTOMIZADO */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(12, 5, 19, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-card {
    background: linear-gradient(145deg, #180a24, #10051a);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 10px;
    padding: 2rem;
    width: 100%;
    max-width: 380px;
    text-align: center;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8),
                0 0 20px rgba(212, 175, 55, 0.2);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .modal-subtitle {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    color: #bfa8d8;
    text-transform: uppercase;
  }

  .modal-texto {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #d1c4e9;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .btn-luna-modal {
    background: linear-gradient(135deg, #2a1240, #180824);
    color: #e2c275;
    border: 1px solid #d4af37;
    padding: 0.6rem 1.5rem;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 4px;
    margin: 0 auto;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .btn-luna-modal:hover {
    background: linear-gradient(135deg, #3d1b5e, #2a1240);
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
    transform: translateY(-1px);
  }
</style>