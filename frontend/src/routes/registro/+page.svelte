<script>
  import { goto } from '$app/navigation';

  let razaoSocial = $state('');
  let cnpj = $state('');
  let responsavel = $state('');
  let email = $state('');
  let senha = $state('');
  let carregando = $state(false);
  let erro = $state(null);

  async function handleRegistro(e) {
    e.preventDefault();
    carregando = true;
    erro = null;

    try {
      const res = await fetch('http://localhost:3001/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razaoSocial, cnpj, responsavel, email, senha })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Empresa cadastrada com sucesso! Faça login para acessar o PMS.');
        goto('/login');
      } else {
        erro = data.mensagem || 'Erro ao registrar empresa.';
      }
    } catch (err) {
      erro = 'Erro de conexão com o servidor API.';
    } finally {
      carregando = false;
    }
  }
</script>

<div class="registro-page-container">
  <div class="registro-card">
    <div class="registro-header">
      <span class="registro-subtitle">Del Luna Core System</span>
      <h2>Cadastro de Estabelecimento</h2>
      <p class="subtitle-desc">Insira as credenciais fiscais e corporativas para registrar sua unidade hoteleira.</p>
    </div>

    <form onsubmit={handleRegistro} class="registro-form">
      {#if erro}
        <div class="error-box">{erro}</div>
      {/if}

      <div class="input-group">
        <label for="razaoSocial">Razão Social / Nome do Hotel</label>
        <input 
          id="razaoSocial" 
          type="text" 
          bind:value={razaoSocial} 
          placeholder="Ex: Del Luna Hotel Ltda" 
          required 
        />
      </div>

      <div class="input-row">
        <div class="input-group">
          <label for="cnpj">CNPJ</label>
          <input 
            id="cnpj" 
            type="text" 
            bind:value={cnpj} 
            placeholder="00.000.000/0001-00" 
            required 
          />
        </div>
        <div class="input-group">
          <label for="responsavel">Responsável Legal</label>
          <input 
            id="responsavel" 
            type="text" 
            bind:value={responsavel} 
            placeholder="Nome do Gerente" 
            required 
          />
        </div>
      </div>

      <div class="input-group">
        <label for="email">E-mail Corporativo</label>
        <input 
          id="email" 
          type="email" 
          bind:value={email} 
          placeholder="gerencia@hoteldeluna.com" 
          required 
        />
      </div>

      <div class="input-group">
        <label for="senha">Senha de Acesso</label>
        <input 
          id="senha" 
          type="password" 
          bind:value={senha} 
          placeholder="••••••••" 
          required 
        />
      </div>

      <button type="submit" class="btn-primary" disabled={carregando} style="width: 100%; margin-top: 0.5rem;">
        {carregando ? 'Validando CNPJ e Registrando...' : 'Cadastrar Estabelecimento'}
      </button>
    </form>

    <div class="registro-footer-text">
      <p>Já possui uma conta corporativa? <a href="/login">Faça login aqui</a></p>
    </div>
  </div>
</div>

<style>
  .registro-page-container {
    width: 100%;
    min-height: calc(100vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .registro-card {
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 2.5rem;
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  }

  .registro-header {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .registro-subtitle {
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    color: #71717a;
    text-transform: uppercase;
    font-weight: 600;
  }

  .registro-header h2 {
    font-size: 1.35rem;
    color: #ffffff;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .subtitle-desc {
    color: #a1a1aa;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .registro-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .input-group label {
    font-size: 0.75rem;
    color: #a1a1aa;
    font-weight: 500;
  }

  .input-group input {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.65rem 0.85rem;
    color: #ffffff;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .input-group input:focus {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .error-box {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.25);
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    text-align: center;
  }

  .registro-footer-text {
    text-align: center;
    font-size: 0.85rem;
    color: #71717a;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 1.2rem;
  }

  .registro-footer-text a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.2s ease;
  }

  .registro-footer-text a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .registro-card {
      padding: 1.5rem;
    }
    .input-row {
      grid-template-columns: 1fr;
    }
  }
</style>