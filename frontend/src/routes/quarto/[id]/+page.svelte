<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { sessao } from '$lib/stores/sessao.svelte.js';

  let quarto = $state(null);
  let carregando = $state(true);
  let erro = $state(null);

  // Estados para as datas de reserva
  let dataCheckIn = $state('');
  let dataCheckOut = $state('');

  // Controle do Modal Customizado
  let modalMensagem = $state('');
  let modalAberto = $state(false);
  let acaoAposFechar = $state(null);

  let quartoId = $derived($page.params.id);

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

  async function carregarDetalhes() {
    carregando = true;
    erro = null;
    try {
      const res = await fetch(`http://localhost:3001/api/quartos/${quartoId}`);
      if (res.ok) {
        quarto = await res.json();
      } else {
        erro = 'Quarto não encontrado.';
      }
    } catch (e) {
      erro = 'Erro de conexão com o servidor.';
    } finally {
      carregando = false;
    }
  }

  $effect(() => {
    if (quartoId) {
      carregarDetalhes();
    }
  });

  // Cálculo dinâmico de diárias e valor total
  let qtdDias = $derived(() => {
    if (!dataCheckIn || !dataCheckOut) return 0;
    const entrada = new Date(dataCheckIn);
    const saida = new Date(dataCheckOut);
    const diff = Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  });

  let valorTotal = $derived(() => {
    return quarto ? qtdDias() * quarto.preco : 0;
  });

  async function fazerReserva() {
    if (!sessao.usuario) {
      mostrarModal('Você precisa estar logado para realizar uma reserva!', () => goto('/login'));
      return;
    }

    if (!dataCheckIn || !dataCheckOut) {
      mostrarModal('Por favor, selecione as datas de check-in e check-out.');
      return;
    }

    if (qtdDias() <= 0) {
      mostrarModal('A data de check-out deve ser posterior ao check-in.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quartoId: quarto.id,
          nomeHospede: sessao.usuario.nome,
          email: sessao.usuario.email,
          dataCheckIn,
          dataCheckOut
        })
      });

      if (res.ok) {
        mostrarModal(`Reserva da ${quarto.nome} confirmada com sucesso!`, () => goto('/reservas'));
      } else {
        const dados = await res.json();
        mostrarModal(dados.mensagem || 'Erro ao realizar reserva.');
      }
    } catch (e) {
      mostrarModal('Falha na comunicação com o servidor.');
    }
  }
</script>

<div class="detalhes-container">
  <a href="/quarto" class="btn-voltar">&larr; Voltar para acomodações</a>

  {#if carregando}
    <p class="status-msg">Carregando detalhes do quarto...</p>
  {:else if erro}
    <p class="status-msg erro">{erro}</p>
  {:else if quarto}
    <div class="quarto-card-detalhe">
      {#if quarto.imagem}
        <div class="detalhe-img-box">
          <img src={quarto.imagem} alt={quarto.nome} />
        </div>
      {/if}

      <div class="header-quarto">
        <h2>{quarto.nome}</h2>
        {#if !quarto.disponivel}
          <span class="badge esgotado">Esgotado</span>
        {:else}
          <span class="badge disponivel">Disponível</span>
        {/if}
      </div>

      <p class="descricao">
        Uma suíte requintada projetada para oferecer máximo conforto e uma atmosfera inesquecível no Hotel Del Luna.
      </p>

      <div class="preco-container">
        <span class="valor">R$ {quarto.preco}</span>
        <span class="periodo">/ noite</span>
      </div>

      {#if quarto.disponivel}
        <div class="datas-reserva-box">
          <h3>Planeje sua Estadia</h3>
          <div class="inputs-grid">
            <div class="input-group">
              <label for="checkin">Check-in</label>
              <input id="checkin" type="date" bind:value={dataCheckIn} required />
            </div>
            <div class="input-group">
              <label for="checkout">Check-out</label>
              <input id="checkout" type="date" bind:value={dataCheckOut} required />
            </div>
          </div>

          {#if qtdDias() > 0}
            <div class="resumo-calculo">
              <p>Período: <strong>{qtdDias()} {qtdDias() === 1 ? 'diária' : 'diárias'}</strong></p>
              <p class="total-geral">Valor Total: <strong>R$ {valorTotal()}</strong></p>
            </div>
          {/if}
        </div>
      {/if}

      <button 
        class="btn-reserva-lg" 
        disabled={!quarto.disponivel} 
        onclick={fazerReserva}
      >
        {quarto.disponivel ? 'Confirmar Reserva' : 'Acomodação Indisponível'}
      </button>
    </div>
  {/if}
</div>

<!-- MODAL CUSTOMIZADO -->
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
  .detalhes-container {
    max-width: 750px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .btn-voltar {
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    color: #bfa8d8;
    text-decoration: none;
    transition: color 0.2s;
  }

  .btn-voltar:hover {
    color: #e2c275;
  }

  .status-msg {
    text-align: center;
    padding: 3rem;
    color: #bfa8d8;
    font-family: 'Cinzel', serif;
  }

  .status-msg.erro {
    color: #ff6b6b;
  }

  .quarto-card-detalhe {
    background: linear-gradient(145deg, #180a24, #10051a);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 8px;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  }

  .detalhe-img-box {
    width: 100%;
    height: 280px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(212, 175, 55, 0.2);
  }

  .detalhe-img-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .header-quarto {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
    padding-bottom: 1rem;
  }

  .header-quarto h2 {
    font-family: 'Cinzel', serif;
    color: #e2c275;
    font-size: 1.75rem;
  }

  .badge {
    font-family: 'Cinzel', serif;
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
    border-radius: 3px;
    letter-spacing: 0.05em;
  }

  .badge.disponivel {
    background: rgba(40, 167, 69, 0.15);
    color: #75b798;
    border: 1px solid rgba(40, 167, 69, 0.4);
  }

  .badge.esgotado {
    background: rgba(220, 53, 69, 0.15);
    color: #ff6b6b;
    border: 1px solid rgba(220, 53, 69, 0.4);
  }

  .descricao {
    color: #d1c4e9;
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .preco-container {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  .valor {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: #fff;
  }

  .periodo {
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    color: #9575cd;
  }

  .datas-reserva-box {
    background: rgba(12, 5, 19, 0.6);
    border: 1px solid rgba(212, 175, 55, 0.25);
    border-radius: 6px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .datas-reserva-box h3 {
    font-family: 'Cinzel', serif;
    color: #e2c275;
    font-size: 1rem;
    letter-spacing: 0.05em;
  }

  .inputs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .input-group label {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    color: #bfa8d8;
  }

  .input-group input {
    background-color: #12071a;
    border: 1px solid rgba(212, 175, 55, 0.3);
    color: #fff;
    padding: 0.7rem;
    border-radius: 4px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .resumo-calculo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(212, 175, 55, 0.15);
    padding-top: 0.8rem;
    font-size: 0.9rem;
    color: #d1c4e9;
  }

  .total-geral {
    color: #e2c275;
    font-family: 'Cinzel', serif;
  }

  .btn-reserva-lg {
    background: linear-gradient(135deg, #2a1240, #180824);
    color: #e2c275;
    border: 1px solid #d4af37;
    padding: 0.9rem;
    font-family: 'Cinzel', serif;
    font-size: 0.9rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .btn-reserva-lg:hover:not(:disabled) {
    background: linear-gradient(135deg, #3d1b5e, #2a1240);
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
  }

  .btn-reserva-lg:disabled {
    background: #110818;
    color: #6e5585;
    border: 1px solid #2a193b;
    cursor: not-allowed;
  }

  /* MODAL */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(12, 5, 19, 0.8);
    backdrop-filter: blur(8px);
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
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
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
    cursor: pointer;
    border-radius: 4px;
    margin: 0 auto;
  }

  .btn-luna-modal:hover {
    background: #3d1b5e;
  }
</style>