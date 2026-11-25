<script>
  import { listarQuartos } from '$lib/api/quartos-api.js';
  import { sessao } from '$lib/stores/sessao.svelte.js';

  let quartos = $state([]);
  let carregando = $state(true);
  let erro = $state(null);

  let modalAberto = $state(false);
  let tipoModal = $state('aviso'); 
  let modalMensagem = $state('');
  let acaoAposFechar = $state(null);

  let editandoId = $state(null);
  let novoNome = $state('');
  let novoTipo = $state('Suíte Master');
  let novasComodidades = $state('');
  let novaQuantidade = $state(1);
  let novoPreco = $state('');
  let imagemBase64 = $state('');

  let quartoSelecionado = $state(null);
  let nomeHospede = $state('');
  let emailHospede = $state('');
  let documentoHospede = $state('');
  let dataCheckIn = $state('');
  let dataCheckOut = $state('');

  function abrirAviso(mensagem, acao = null) {
    tipoModal = 'aviso';
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

  function tentarCadastrarQuarto() {
    if (!sessao.usuario) {
      tipoModal = 'login-necessario';
      modalAberto = true;
      return;
    }
    editandoId = null;
    tipoModal = 'novo-quarto';
    novoNome = '';
    novoTipo = 'Suíte Master';
    novasComodidades = '';
    novaQuantidade = 1;
    novoPreco = '';
    imagemBase64 = '';
    modalAberto = true;
  }

  function abrirEdicaoQuarto(q) {
    editandoId = q.id;
    novoNome = q.nome;
    novoTipo = q.tipo;
    novasComodidades = q.comodidades || '';
    novaQuantidade = q.quantidade_total;
    novoPreco = q.preco;
    imagemBase64 = q.imagem_base64 || '';
    tipoModal = 'novo-quarto';
    modalAberto = true;
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        imagemBase64 = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async function salvarNovoQuarto(e) {
    e.preventDefault();
    try {
      const url = editandoId ? `http://localhost:3001/api/quartos/${editandoId}` : 'http://localhost:3001/api/quartos';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome,
          tipo: novoTipo,
          comodidades: novasComodidades,
          quantidadeTotal: Number(novaQuantidade),
          preco: Number(novoPreco),
          imagemBase64: imagemBase64 || null
        })
      });

      if (res.ok) {
        modalAberto = false;
        abrirAviso(editandoId ? 'Unidade atualizada com sucesso!' : 'Unidade cadastrada com sucesso!');
        carregarDados();
      } else {
        const dados = await res.json();
        alert(dados.mensagem || 'Erro ao salvar.');
      }
    } catch (e) {
      alert('Erro de conexão com o servidor.');
    }
  }

  async function excluirQuarto(id) {
    if (!confirm('Deseja realmente remover esta unidade do inventário?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/quartos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        carregarDados();
      } else {
        alert('Erro ao excluir unidade.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    }
  }

  function abrirModalAlocacao(quarto) {
    if (!sessao.usuario) {
      tipoModal = 'login-necessario';
      modalAberto = true;
      return;
    }
    if (quarto.quantidade_disponivel <= 0) {
      abrirAviso('Não há unidades disponíveis deste tipo.');
      return;
    }
    quartoSelecionado = quarto;
    nomeHospede = '';
    emailHospede = '';
    documentoHospede = '';
    dataCheckIn = '';
    dataCheckOut = '';
    tipoModal = 'alocar';
    modalAberto = true;
  }

  async function confirmarAlocacao(e) {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quartoId: quartoSelecionado.id,
          nomeHospede,
          emailHospede,
          documentoHospede,
          dataCheckIn,
          dataCheckOut
        })
      });

      if (res.ok) {
        modalAberto = false;
        abrirAviso(`Alocação registrada para ${nomeHospede}!`, () => carregarDados());
      } else {
        const dados = await res.json();
        alert(dados.mensagem || 'Erro ao alocar.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    }
  }

  async function carregarDados() {
    if (!sessao.usuario) {
      quartos = [];
      carregando = false;
      return;
    }

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

<div class="inventario-page">
  <div class="page-header-flex">
    <div>
      <h2>Inventário de Suítes & Unidades</h2>
      <p class="subtitle-desc">Gestão de capacidade operacional e disponibilidade por categoria</p>
    </div>
    <button class="btn-primary" onclick={tentarCadastrarQuarto}>
      + Nova Unidade
    </button>
  </div>

  {#if !sessao.usuario}
    <div class="empty-inventory-card">
      <div class="empty-icon">🔒</div>
      <h3>Acesso Restrito ao Inventário</h3>
      <p>Para visualizar e gerenciar as unidades do seu estabelecimento, faça login na sua conta corporativa.</p>
      <a href="/login" class="btn-primary" style="margin-top: 0.5rem; text-decoration: none; display: inline-block;">Fazer Login</a>
    </div>
  {:else if carregando}
    <div class="status-mensagem">Sincronizando inventário corporativo...</div>
  {:else if erro}
    <div class="status-mensagem erro">
      <p>Erro de conexão: {erro}</p>
      <button class="btn-secondary" onclick={carregarDados} style="margin-top: 1rem;">Tentar Novamente</button>
    </div>
  {:else if quartos.length === 0}
    <div class="empty-inventory-card">
      <div class="empty-icon">📂</div>
      <h3>Nenhuma Unidade Cadastrada</h3>
      <p>O inventário deste hotel está vazio. Cadastre o primeiro tipo de quarto/suíte.</p>
      <button class="btn-primary" onclick={tentarCadastrarQuarto}>Cadastrar Primeira Unidade</button>
    </div>
  {:else}
    <div class="grid-quartos">
      {#each quartos as q}
        <div class="card-quarto">
          <div class="card-img-container">
            <img src={q.imagem_base64 || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'} alt={q.nome} />
            <div class="card-actions-top">
              <button class="btn-action-icon" onclick={() => abrirEdicaoQuarto(q)} title="Editar Unidade">✎</button>
              <button class="btn-action-icon delete" onclick={() => excluirQuarto(q.id)} title="Excluir Unidade">✕</button>
            </div>
          </div>

          <div class="card-conteudo">
            <div class="card-top">
              <div>
                <h3>{q.nome}</h3>
                <span class="badge-tipo">{q.tipo}</span>
              </div>
              <span class="badge-status {q.quantidade_disponivel > 0 ? 'disponivel' : 'indisponivel'}">
                {q.quantidade_disponivel} / {q.quantidade_total} Livres
              </span>
            </div>

            {#if q.comodidades}
              <p class="comodidades-texto">✨ {q.comodidades}</p>
            {/if}

            <div class="preco-box">
              <span class="valor">R$ {q.preco}</span>
              <span class="periodo">/ diária corporativa</span>
            </div>

            <button 
              class="btn-alocar" 
              disabled={q.quantidade_disponivel <= 0} 
              onclick={() => abrirModalAlocacao(q)}
            >
              {q.quantidade_disponivel > 0 ? 'Alocar Unidade / Check-in' : 'Esgotado'}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if modalAberto}
  <div class="modal-overlay">
    <div class="modal-card">
      <span class="modal-subtitle">Del Luna Core System</span>

      {#if tipoModal === 'aviso'}
        <p class="modal-texto">{modalMensagem}</p>
        <button class="btn-primary" style="width: 100%;" onclick={fecharModal}>Confirmar</button>

      {:else if tipoModal === 'login-necessario'}
        <div class="auth-modal-content">
          <h3>Acesso Restrito</h3>
          <p class="modal-texto">Faça login com sua conta corporativa para gerenciar o inventário.</p>
          <div class="modal-actions-flex">
            <a href="/login" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none;">Fazer Login</a>
            <button class="btn-secondary" style="flex: 1;" onclick={fecharModal}>Cancelar</button>
          </div>
        </div>

      {:else if tipoModal === 'novo-quarto'}
        <h3>{editandoId ? 'Editar Unidade' : 'Cadastrar Nova Unidade'}</h3>
        <form onsubmit={salvarNovoQuarto} class="form-modal">
          <div class="input-group">
            <label for="input-nome">Nome / Identificação</label>
            <input id="input-nome" type="text" bind:value={novoNome} placeholder="Ex: Apartamento Standard" required />
          </div>
          <div class="input-group">
            <label for="input-tipo">Categoria</label>
            <input id="input-tipo" type="text" bind:value={novoTipo} placeholder="Suíte Master / Standard" required />
          </div>
          <div class="input-group">
            <label for="input-comodidades">Comodidades (Ex: Duas camas, Frigobar, Ar-condicionado)</label>
            <input id="input-comodidades" type="text" bind:value={novasComodidades} placeholder="Ex: 2 camas solteiro, frigobar, ar-condicionado" />
          </div>
          <div class="input-row">
            <div class="input-group">
              <label for="input-qtd">Quantidade Total</label>
              <input id="input-qtd" type="number" min="1" bind:value={novaQuantidade} required />
            </div>
            <div class="input-group">
              <label for="input-preco">Preço da Diária (R$)</label>
              <input id="input-preco" type="number" step="0.01" bind:value={novoPreco} placeholder="450.00" required />
            </div>
          </div>
          <div class="input-group">
            <label for="input-img">Enviar Imagem do Arquivo (Opcional)</label>
            <input id="input-img" type="file" accept="image/*" onchange={handleImageUpload} />
          </div>
          <div class="modal-actions-flex" style="margin-top: 0.5rem;">
            <button type="submit" class="btn-primary" style="flex: 1;">{editandoId ? 'Salvar Alterações' : 'Salvar'}</button>
            <button type="button" class="btn-secondary" style="flex: 1;" onclick={() => modalAberto = false}>Cancelar</button>
          </div>
        </form>

      {:else if tipoModal === 'alocar'}
        <h3>Alocar Unidade: {quartoSelecionado.nome}</h3>
        <form onsubmit={confirmarAlocacao} class="form-modal">
          <div class="input-group">
            <label for="aloc-nome">Nome do Hóspede</label>
            <input id="aloc-nome" type="text" bind:value={nomeHospede} placeholder="Carlos Silva" required />
          </div>
          <div class="input-group">
            <label for="aloc-doc">Documento (CPF / RG)</label>
            <input id="aloc-doc" type="text" bind:value={documentoHospede} placeholder="000.000.000-00" required />
          </div>
          <div class="input-group">
            <label for="aloc-email">E-mail</label>
            <input id="aloc-email" type="email" bind:value={emailHospede} placeholder="hospede@email.com" />
          </div>
          <div class="input-row">
            <div class="input-group">
              <label for="aloc-in">Check-in</label>
              <input id="aloc-in" type="date" bind:value={dataCheckIn} required />
            </div>
            <div class="input-group">
              <label for="aloc-out">Check-out</label>
              <input id="aloc-out" type="date" bind:value={dataCheckOut} required />
            </div>
          </div>
          <div class="modal-actions-flex" style="margin-top: 0.5rem;">
            <button type="submit" class="btn-primary" style="flex: 1;">Confirmar</button>
            <button type="button" class="btn-secondary" style="flex: 1;" onclick={() => modalAberto = false}>Cancelar</button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .inventario-page { display: flex; flex-direction: column; gap: 2rem; }
  .page-header-flex { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; }
  .page-header-flex h2 { font-size: 1.75rem; font-weight: 700; }
  .subtitle-desc { color: #a1a1aa; font-size: 0.85rem; margin-top: 0.2rem; }
  .status-mensagem { text-align: center; color: #71717a; padding: 4rem; font-size: 0.9rem; }
  .status-mensagem.erro { color: #f87171; }
  .empty-inventory-card { background: rgba(255,255,255,0.015); border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; padding: 4rem 2rem; max-width: 500px; margin: 3rem auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .empty-icon { font-size: 2.5rem; }
  .empty-inventory-card h3 { font-size: 1.2rem; font-weight: 600; color: #fff; }
  .empty-inventory-card p { color: #a1a1aa; font-size: 0.9rem; }
  .grid-quartos { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
  .card-quarto { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
  .card-img-container { position: relative; width: 100%; height: 180px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .card-img-container img { width: 100%; height: 100%; object-fit: cover; }
  .card-actions-top { position: absolute; top: 10px; right: 10px; display: flex; gap: 0.4rem; }
  .btn-action-icon { background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 28px; height: 28px; border-radius: 50%; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .btn-action-icon:hover { background: #fff; color: #000; }
  .btn-action-icon.delete { color: #f87171; border-color: rgba(239,68,68,0.4); }
  .btn-action-icon.delete:hover { background: #ef4444; color: #fff; }
  .card-conteudo { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.8rem; flex: 1; }
  .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .card-top h3 { font-size: 1rem; font-weight: 600; color: #fff; }
  .badge-tipo { font-size: 0.65rem; color: #a1a1aa; display: block; margin-top: 0.15rem; }
  .comodidades-texto { font-size: 0.8rem; color: #a1a1aa; line-height: 1.4; background: rgba(255,255,255,0.03); padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
  .badge-status { font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 500; }
  .badge-status.disponivel { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
  .badge-status.indisponivel { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .preco-box { display: flex; align-items: baseline; gap: 0.3rem; margin-top: auto; }
  .valor { font-size: 1.2rem; font-weight: 700; color: #fff; }
  .periodo { font-size: 0.75rem; color: #71717a; }
  .btn-alocar { width: 100%; background: rgba(255,255,255,0.06); color: #ededef; border: 1px solid rgba(255,255,255,0.12); padding: 0.65rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; border-radius: 6px; }
  .btn-alocar:hover:not(:disabled) { background: #fff; color: #000; }
  .btn-alocar:disabled { background: rgba(255,255,255,0.02); color: #52525b; cursor: not-allowed; }
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
  .modal-card { background: #09090b; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 2rem; width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 1.2rem; max-height: 90vh; overflow-y: auto; }
  .modal-subtitle { font-size: 0.7rem; color: #71717a; text-transform: uppercase; }
  .modal-texto { color: #d4d4d8; font-size: 0.9rem; }
  .modal-card h3 { font-size: 1.15rem; color: #fff; font-weight: 600; }
  .modal-actions-flex { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
  .form-modal { display: flex; flex-direction: column; gap: 0.9rem; text-align: left; }
  .input-group { display: flex; flex-direction: column; gap: 0.3rem; }
  .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .input-group label { font-size: 0.75rem; color: #a1a1aa; font-weight: 500; }
  .input-group input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.55rem 0.75rem; color: #fff; font-size: 0.85rem; }
</style>