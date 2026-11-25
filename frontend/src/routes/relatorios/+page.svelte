<script>
  import { sessao } from '$lib/stores/sessao.svelte.js';

  let reservas = $state([]);
  let faturamentoTotal = $state(0);
  let totalEstadias = $state(0);
  let carregando = $state(true);

  async function carregarRelatorios() {
    if (!sessao.usuario) {
      carregando = false;
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/reservas');
      if (res.ok) {
        reservas = await res.json();
        totalEstadias = reservas.length;
        faturamentoTotal = reservas.reduce((acc, r) => acc + Number(r.valorTotal || 0), 0);
      }
    } catch (e) {
      console.error('Erro ao carregar relatórios:', e);
    } finally {
      carregando = false;
    }
  }

  $effect(() => {
    carregarRelatorios();
  });
</script>

<div class="relatorios-page">
  <div class="page-header-flex">
    <div>
      <h2>Relatórios & Auditoria de Caixa</h2>
      <p class="subtitle-desc">Consolidado financeiro e histórico de transações de hospedagem</p>
    </div>
  </div>

  {#if !sessao.usuario}
    <div class="auth-required-card">
      <h3>Acesso Restrito ao Sistema</h3>
      <p>Você precisa estar autenticado como gestor para visualizar os relatórios financeiros.</p>
      <a href="/login" class="btn-primary" style="margin-top: 1rem; text-decoration: none;">Fazer Login</a>
    </div>
  {:else if carregando}
    <div class="status-mensagem">Gerando relatório de faturamento...</div>
  {:else}
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Receita Total Acumulada</span>
        <h3 class="success-text">R$ {faturamentoTotal.toFixed(2)}</h3>
        <p class="metric-sub">Faturamento bruto de alocações</p>
      </div>
      <div class="metric-card">
        <span class="metric-label">Total de Estadias Registradas</span>
        <h3>{totalEstadias}</h3>
        <p class="metric-sub">Check-ins efetuados</p>
      </div>
    </div>

    <div class="table-container">
      <h3>Histórico de Transações de Caixa</h3>
      {#if reservas.length === 0}
        <p class="empty-text">Nenhuma transação registrada no período.</p>
      {:else}
        <table class="tabela-financeira">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hóspede</th>
              <th>Documento</th>
              <th>Período</th>
              <th>Dias</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {#each reservas as r}
              <tr>
                <td>#{r.id}</td>
                <td>{r.nomeHospede}</td>
                <td>{r.documentoHospede}</td>
                <td>{r.dataCheckIn} a {r.dataCheckOut}</td>
                <td>{r.dias} dias</td>
                <td class="success-text">R$ {Number(r.valorTotal).toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}
</div>

<style>
  .relatorios-page { display: flex; flex-direction: column; gap: 2rem; }
  .page-header-flex { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; }
  .page-header-flex h2 { font-size: 1.75rem; font-weight: 700; }
  .subtitle-desc { color: #a1a1aa; font-size: 0.85rem; margin-top: 0.2rem; }
  .status-mensagem { text-align: center; color: #71717a; padding: 4rem; font-size: 0.9rem; }

  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
  .metric-card { background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.08); padding: 1.5rem; border-radius: 10px; display: flex; flex-direction: column; gap: 0.4rem; }
  .metric-label { font-size: 0.75rem; color: #71717a; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
  .metric-card h3 { font-size: 2rem; font-weight: 700; color: #ffffff; }
  .success-text { color: #34d399 !important; }
  .metric-sub { font-size: 0.75rem; color: #a1a1aa; }

  .table-container { background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .table-container h3 { font-size: 1.15rem; color: #fff; font-weight: 600; }
  .empty-text { color: #71717a; font-size: 0.85rem; padding: 1rem 0; }

  .tabela-financeira { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
  .tabela-financeira th { color: #71717a; font-weight: 600; padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); text-transform: uppercase; font-size: 0.7rem; }
  .tabela-financeira td { padding: 0.85rem 0.75rem; color: #d4d4d8; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .tabela-financeira tr:hover { background: rgba(255,255,255,0.02); }

  .auth-required-card { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 3rem 2rem; max-width: 440px; margin: 4rem auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .auth-required-card h3 { font-size: 1.15rem; font-weight: 600; color: #fff; }
  .auth-required-card p { color: #a1a1aa; font-size: 0.9rem; }
</style>