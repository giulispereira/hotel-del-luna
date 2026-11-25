<script>
  import { sessao } from '$lib/stores/sessao.svelte.js';
  import { onMount } from 'svelte';

  let totalQuartos = $state(0);
  let quartosDisponiveis = $state(0);
  let reservasAtivas = $state(0);
  let faturamentoEstimado = $state(0);
  let taxaOcupacao = $state(0);
  let carregando = $state(true);

  async function carregarMetricas() {
    try {
      const resQ = await fetch('http://localhost:3001/api/quartos');
      const quartos = await resQ.json();

      const resR = await fetch('http://localhost:3001/api/reservas');
      const reservas = await resR.json();

      totalQuartos = quartos.reduce((acc, q) => acc + q.quantidade_total, 0);
      quartosDisponiveis = quartos.reduce((acc, q) => acc + q.quantidade_disponivel, 0);
      reservasAtivas = reservas.length;
      faturamentoEstimado = reservas.reduce((acc, r) => acc + Number(r.valorTotal || 0), 0);

      if (totalQuartos > 0) {
        const ocupados = totalQuartos - quartosDisponiveis;
        taxaOcupacao = Math.round((ocupados / totalQuartos) * 100);
      } else {
        taxaOcupacao = 0;
      }
    } catch (e) {
      console.error('Erro ao carregar métricas:', e);
    } finally {
      carregando = false;
    }
  }

  onMount(() => {
    if (sessao.usuario) {
      carregarMetricas();
    } else {
      carregando = false;
    }
  });
</script>

<div class="dashboard-page">
  {#if !sessao.usuario}
    <!-- LANDING PAGE COMERCIAL COM PLANOS E PREÇOS (PRICING) -->
    <div class="hero-landing">
      <div class="hero-glow"></div>
      <div class="hero-badge-pill">
        <span class="pill-dot"></span> Del Luna PMS Enterprise v3.0
      </div>
      <div class="hero-content">
        <h1>A infraestrutura definitiva para gestão hoteleira em nuvem.</h1>
        <p>Substitua planilhas arcaicas por uma plataforma B2B multi-tenant robusta. Gerencie inventários, controle check-ins e elimine perdas operacionais.</p>
        <div class="hero-actions">
          <a href="/login" class="btn-primary-large">Acessar Sistema</a>
          <a href="/registro" class="btn-outline-large">Cadastrar Estabelecimento</a>
        </div>
      </div>

      <!-- SEÇÃO DE PLANOS / PRICING PARA O PROFESSOR VER O MODELO DE NEGÓCIO -->
      <div class="pricing-section">
        <h3>Planos de Licenciamento SaaS</h3>
        <div class="pricing-grid">
          <div class="pricing-card">
            <h4>Boutique Hotel</h4>
            <span class="price">R$ 299<span>/mês</span></span>
            <p>Ideal para pousadas e hotéis de pequeno porte.</p>
            <ul>
              <li>Até 30 Unidades</li>
              <li>Gestão de Check-in / Check-out</li>
              <li>Suporte via E-mail</li>
            </ul>
            <a href="/registro" class="btn-secondary" style="margin-top: 1rem; display: block; text-align: center; text-decoration: none;">Assinar Plano</a>
          </div>

          <div class="pricing-card featured">
            <span class="featured-badge">Mais Popular</span>
            <h4>Enterprise PMS</h4>
            <span class="price">R$ 799<span>/mês</span></span>
            <p>Para redes hoteleiras e grandes estabelecimentos.</p>
            <ul>
              <li>Unidades Ilimitadas (Multi-tenant)</li>
              <li>Métricas & Relatórios Financeiros de Caixa</li>
              <li>Suporte Prioritário 24/7</li>
            </ul>
            <a href="/registro" class="btn-primary" style="margin-top: 1rem; display: block; text-align: center; text-decoration: none;">Assinar Enterprise</a>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- DASHBOARD EXECUTIVO COM TAXA DE OCUPAÇÃO EM % -->
    <div class="dashboard-header">
      <div>
        <h2>Painel de Controle Executivo</h2>
        <p class="subtitle-desc">Bem-vindo, <strong>{sessao.usuario.nome}</strong>. Visão consolidada da operação.</p>
      </div>
      <div class="dashboard-actions">
        <a href="/quarto" class="btn-primary">+ Gerenciar Inventário</a>
        <a href="/reservas" class="btn-secondary">Nova Alocação</a>
      </div>
    </div>

    {#if carregando}
      <div class="status-mensagem">Calculando métricas em tempo real...</div>
    {:else}
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Taxa de Ocupação</span>
          <h3 class="success-text">{taxaOcupacao}%</h3>
          <p class="metric-sub">Eficiência de leitos ativos</p>
        </div>
        <div class="metric-card">
          <span class="metric-label">Unidades Disponíveis</span>
          <h3>{quartosDisponiveis} / {totalQuartos}</h3>
          <p class="metric-sub">Prontas para hóspedes</p>
        </div>
        <div class="metric-card">
          <span class="metric-label">Alocações Ativas</span>
          <h3>{reservasAtivas}</h3>
          <p class="metric-sub">Hospedados no momento</p>
        </div>
        <div class="metric-card">
          <span class="metric-label">Faturamento Estimado</span>
          <h3>R$ {faturamentoEstimado.toFixed(2)}</h3>
          <p class="metric-sub">Receita acumulada</p>
        </div>
      </div>

      <div class="dashboard-shortcuts">
        <div class="shortcut-card">
          <h3>Controle de Inventário</h3>
          <p>Adicione novas suítes, ajuste quantidades, edite preços e gerencie imagens.</p>
          <a href="/quarto" class="btn-secondary" style="margin-top: 1rem; display: inline-block; text-decoration: none;">Acessar Inventário</a>
        </div>
        <div class="shortcut-card">
          <h3>Fluxo de Check-in & Caixa</h3>
          <p>Monitore estadias, realize check-outs e verifique o histórico financeiro consolidado.</p>
          <a href="/reservas" class="btn-secondary" style="margin-top: 1rem; display: inline-block; text-decoration: none;">Acessar Alocações</a>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .dashboard-page { display: flex; flex-direction: column; gap: 2rem; }
  .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1.5rem; }
  .dashboard-header h2 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.03em; }
  .subtitle-desc { color: #a1a1aa; font-size: 0.9rem; margin-top: 0.2rem; }
  .dashboard-actions { display: flex; gap: 0.75rem; }
  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
  .metric-card { background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.08); padding: 1.5rem; border-radius: 10px; display: flex; flex-direction: column; gap: 0.4rem; }
  .metric-label { font-size: 0.75rem; color: #71717a; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
  .metric-card h3 { font-size: 2rem; font-weight: 700; color: #ffffff; }
  .success-text { color: #34d399 !important; }
  .metric-sub { font-size: 0.75rem; color: #a1a1aa; }
  .dashboard-shortcuts { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
  .shortcut-card { background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .shortcut-card h3 { font-size: 1.15rem; color: #ffffff; font-weight: 600; }
  .shortcut-card p { color: #a1a1aa; font-size: 0.9rem; line-height: 1.5; }

  /* Landing & Pricing */
  .hero-landing { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 2rem 1rem; gap: 3rem; }
  .hero-glow { position: absolute; width: 500px; height: 300px; background: radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, rgba(5, 5, 7, 0) 70%); top: 10%; left: 50%; transform: translate(-50%, -50%); z-index: 0; pointer-events: none; }
  .hero-badge-pill { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.75rem; color: #a1a1aa; }
  .pill-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
  .hero-content { position: relative; z-index: 1; max-width: 800px; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; }
  .hero-content h1 { font-size: 3rem; color: #ffffff; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; }
  .hero-content p { font-size: 1.1rem; color: #a1a1aa; line-height: 1.6; max-width: 640px; }
  .hero-actions { display: flex; gap: 1rem; margin-top: 1rem; }
  .btn-primary-large { background: #ffffff; color: #000000 !important; padding: 0.75rem 1.6rem; font-size: 0.85rem; font-weight: 600; border-radius: 6px; text-decoration: none; }
  .btn-outline-large { background: rgba(255, 255, 255, 0.03); color: #ededef !important; border: 1px solid rgba(255, 255, 255, 0.12); padding: 0.75rem 1.6rem; font-size: 0.85rem; font-weight: 500; border-radius: 6px; text-decoration: none; }

  .pricing-section { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem; }
  .pricing-section h3 { font-size: 1.4rem; color: #fff; font-weight: 600; }
  .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; text-align: left; }
  .pricing-card { background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 2rem; display: flex; flex-direction: column; gap: 1rem; position: relative; }
  .pricing-card.featured { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.02); }
  .featured-badge { position: absolute; top: -12px; right: 20px; background: #10b981; color: #000; font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px; text-transform: uppercase; }
  .pricing-card h4 { font-size: 1.1rem; color: #fff; font-weight: 600; }
  .price { font-size: 2rem; font-weight: 700; color: #fff; }
  .price span { font-size: 0.8rem; color: #71717a; font-weight: 400; }
  .pricing-card p { font-size: 0.85rem; color: #a1a1aa; }
  .pricing-card ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: #d4d4d8; padding: 0; }
  .pricing-card ul li::before { content: "✓ "; color: #34d399; font-weight: bold; }
</style>