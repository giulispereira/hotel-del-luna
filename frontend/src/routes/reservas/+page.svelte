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
      const res = await fetch(`http://localhost:3002/api/reservas${emailQuery}`);
      
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

<div class="reservas-page">
  <div class="page-header">
    <h2>Minhas Reservas</h2>
    <p class="subtitle-desc">Gerencie suas estadias exclusivas no Hotel Del Luna</p>
  </div>

  {#if !sessao.usuario}
    <div class="auth-required-card">
      <div class="auth-content">
        <h3>Acesso Restrito</h3>
        <p>Você precisa estar autenticado no sistema para visualizar suas reservas e histórico de estadias.</p>
        <a href="/login" class="btn-luna-primary">Fazer Login Agora</a>
      </div>
    </div>
  {:else if carregando}
    <div class="status-mensagem">Buscando suas reservas...</div>
  {:else if erro}
    <div class="status-mensagem erro">{erro}</div>
  {:else if reservas.length === 0}
    <div class="empty-card">
      <h3>Nenhuma Reserva Encontrada</h3>
      <p>Você ainda não possui acomodações reservadas em nosso hotel.</p>
      <a href="/quarto" class="btn-luna-primary">Explorar Quartos Disponíveis</a>
    </div>
  {:else}
    <div class="grid-quartos">
      {#each reservas as r}
        <div class="card-quarto">
          {#if r.quarto && r.quarto.imagem}
            <div class="card-img-container">
              <img src={r.quarto.imagem} alt={r.quarto.nome} />
            </div>
          {/if}
          <div class="card-conteudo">
            <div class="card-top">
              <h3>{r.quarto ? r.quarto.nome : `Quarto ID: ${r.quartoId}`}</h3>
              <span class="badge-reservado">Confirmado</span>
            </div>

            <div class="reserva-detalhes">
              <p><strong>Hóspede:</strong> {r.nomeHospede}</p>
              <p><strong>E-mail:</strong> {r.email}</p>
            </div>

            {#if r.quarto}
              <div class="preco-box">
                <span class="valor">R$ {r.quarto.preco}</span>
                <span class="periodo">/ noite</span>
              </div>
            {/if}

            <div class="reserva-data-footer">
              Reservado em: {new Date(r.criadoEm).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .reservas-page {
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

  .auth-required-card, .empty-card {
    background: linear-gradient(145deg, #180a24, #10051a);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 10px;
    padding: 3rem 2rem;
    max-width: 500px;
    margin: 3rem auto;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .auth-content, .empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
  }

  .auth-required-card h3, .empty-card h3 {
    font-family: 'Cinzel', serif;
    color: #e2c275;
    font-size: 1.5rem;
    letter-spacing: 0.08em;
  }

  .auth-required-card p, .empty-card p {
    color: #d1c4e9;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .btn-luna-primary {
    background: linear-gradient(135deg, #2a1240, #180824);
    color: #e2c275 !important;
    border: 1px solid #d4af37;
    padding: 0.75rem 1.75rem;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    margin-top: 0.5rem;
  }

  .btn-luna-primary:hover {
    background: linear-gradient(135deg, #3d1b5e, #2a1240);
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
    transform: translateY(-1px);
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
    gap: 1rem;
    flex: 1;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-top h3 {
    font-family: 'Cinzel', serif;
    color: #e2c275;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .badge-reservado {
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

  .reserva-detalhes {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: #d1c4e9;
  }

  .reserva-detalhes strong {
    color: #bfa8d8;
  }

  .preco-box {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
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

  .reserva-data-footer {
    margin-top: auto;
    font-size: 0.75rem;
    color: #9575cd;
    font-family: 'Cinzel', serif;
    border-top: 1px solid rgba(212, 175, 55, 0.15);
    padding-top: 0.75rem;
  }
</style>