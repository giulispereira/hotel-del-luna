<script>
</script>

<div class="hero-home">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <span class="hero-subtitle">HOTELEIRO EXCLUSIVO</span>
    <h1>Onde o Luxo Encontra a Sofisticação</h1>
    <p>Desfrute de uma experiência única de elegância atemporal e conforto absoluto reservada para hóspedes que valorizam a excelência.</p>
    
    <div class="hero-actions">
      <a href="/quarto" class="btn-luna-primary">Explorar Acomodações</a>
      <a href="/reservas" class="btn-luna-outline">Minhas Reservas</a>
    </div>
  </div>

  <div class="stats-bar">
    <div class="stat-item">
      <h3>100+</h3>
      <p>Anos de Tradição</p>
    </div>
    <div class="stat-item">
      <h3>08</h3>
      <p>Suítes Imperiais</p>
    </div>
    <div class="stat-item">
      <h3>24h</h3>
      <p>Atendimento à Gerência</p>
    </div>
  </div>
</div>

<style>
  .hero-home {
    position: relative;
    width: 100%;
    min-height: calc(100vh - 180px);
    background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85');
    background-size: cover;
    background-position: center;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4rem 3rem;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(212, 175, 55, 0.3);
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(12, 5, 19, 0.92) 0%, rgba(24, 10, 36, 0.82) 100%);
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 2rem;
  }

  .hero-subtitle {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    letter-spacing: 0.35em;
    color: #bfa8d8;
    text-transform: uppercase;
  }

  .hero-content h1 {
    font-family: 'Cinzel', serif;
    font-size: 3rem;
    color: #e2c275;
    line-height: 1.15;
    letter-spacing: 0.05em;
    font-weight: 700;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  }

  .hero-content p {
    font-size: 1.05rem;
    color: #d1c4e9;
    line-height: 1.6;
    max-width: 600px;
  }

  .hero-actions {
    display: flex;
    gap: 1.2rem;
    margin-top: 1rem;
  }

  .btn-luna-primary {
    background: linear-gradient(135deg, #2a1240, #180824);
    color: #e2c275 !important;
    border: 1px solid #d4af37;
    padding: 0.85rem 1.75rem;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    border-radius: 4px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    display: inline-block;
  }

  .btn-luna-primary:hover {
    background: linear-gradient(135deg, #3d1b5e, #2a1240);
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
    transform: translateY(-2px);
  }

  .btn-luna-outline {
    background: transparent;
    color: #d1c4e9 !important;
    border: 1px solid rgba(212, 175, 55, 0.4);
    padding: 0.85rem 1.75rem;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    border-radius: 4px;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-block;
  }

  .btn-luna-outline:hover {
    border-color: #e2c275;
    color: #e2c275 !important;
    background: rgba(212, 175, 55, 0.05);
    transform: translateY(-2px);
  }

  .stats-bar {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    border-top: 1px solid rgba(212, 175, 55, 0.25);
    padding-top: 2rem;
    margin-top: 3rem;
  }

  .stat-item h3 {
    font-family: 'Cinzel', serif;
    font-size: 2rem;
    color: #e2c275;
    font-weight: 700;
  }

  .stat-item p {
    font-size: 0.85rem;
    color: #9575cd;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    margin-top: 0.2rem;
  }

  @media (max-width: 768px) {
    .hero-home {
      padding: 2.5rem 1.5rem;
    }
    .hero-content h1 {
      font-size: 2.2rem;
    }
    .stats-bar {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .hero-actions {
      flex-direction: column;
    }
  }
</style>