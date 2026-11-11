<script>
  import { loginApi } from '$lib/api/auth-api.js';
  import { login } from '$lib/stores/sessao.svelte.js';
  import { goto } from '$app/navigation';

  let email = $state('');
  let senha = $state('');
  let carregando = $state(false);
  let erro = $state(null);

  async function handleSubmit(e) {
    e.preventDefault();
    carregando = true;
    erro = null;

    try {
      const data = await loginApi(email, senha);
      login(data.token, data.usuario);
      goto('/quarto');
    } catch (err) {
      erro = err.message;
    } finally {
      carregando = false;
    }
  }
</script>

<div class="login-page-bg">
  <div class="glass-overlay"></div>
  
  <div class="login-card-glass">
    <div class="login-header">
      <span class="login-subtitle">Área Restrita</span>
      <h2>Entrar no Sistema</h2>
    </div>

    <form onsubmit={handleSubmit} class="login-form">
      {#if erro}
        <div class="error-box">{erro}</div>
      {/if}

      <div class="input-group">
        <label for="email">E-mail</label>
        <input 
          id="email" 
          type="email" 
          bind:value={email} 
          placeholder="seu@email.com" 
          required 
        />
      </div>

      <div class="input-group">
        <label for="senha">Senha</label>
        <input 
          id="senha" 
          type="password" 
          bind:value={senha} 
          placeholder="••••••••" 
          required 
        />
      </div>

      <button type="submit" class="btn-submit" disabled={carregando}>
        {carregando ? 'Autenticando...' : 'Entrar'}
      </button>
    </form>

    <div class="login-footer-text">
      <p>Ainda não tem conta? <a href="/registro">Cadastre-se aqui</a></p>
    </div>
  </div>
</div>

<style>
  .login-page-bg {
    position: relative;
    width: 100%;
    min-height: calc(100vh - 220px);
    background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85');
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(212, 175, 55, 0.3);
  }

  .glass-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(12, 5, 19, 0.85) 0%, rgba(24, 10, 36, 0.75) 100%);
    z-index: 1;
  }

  .login-card-glass {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 440px;
    background: rgba(22, 11, 34, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(212, 175, 55, 0.35);
    border-radius: 12px;
    padding: 2.8rem 2.5rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7),
                0 0 25px rgba(212, 175, 55, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .login-header {
    text-align: center;
  }

  .login-subtitle {
    font-family: 'Cinzel', serif;
    font-size: 0.7rem;
    letter-spacing: 0.35em;
    color: #bfa8d8;
    text-transform: uppercase;
    display: block;
    margin-bottom: 0.4rem;
  }

  .login-header h2 {
    font-family: 'Cinzel', serif;
    color: #e2c275;
    font-size: 1.6rem;
    letter-spacing: 0.08em;
    font-weight: 700;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .input-group label {
    font-family: 'Cinzel', serif;
    font-size: 0.78rem;
    color: #d1c4e9;
    letter-spacing: 0.05em;
  }

  .input-group input {
    background-color: rgba(12, 5, 19, 0.65);
    border: 1px solid rgba(212, 175, 55, 0.3);
    color: #fff;
    padding: 0.8rem 1rem;
    border-radius: 6px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.25s ease;
  }

  .input-group input::placeholder {
    color: rgba(209, 196, 233, 0.4);
  }

  .input-group input:focus {
    border-color: #ffd700;
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.35);
    background-color: rgba(18, 7, 26, 0.85);
  }

  .error-box {
    background-color: rgba(220, 53, 69, 0.2);
    color: #ff6b6b;
    border: 1px solid rgba(220, 53, 69, 0.45);
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    text-align: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .btn-submit {
    margin-top: 0.5rem;
    width: 100%;
    background: linear-gradient(135deg, #2a1240, #180824);
    color: #e2c275;
    border: 1px solid #d4af37;
    padding: 0.85rem;
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  }

  .btn-submit:hover:not(:disabled) {
    background: linear-gradient(135deg, #3d1b5e, #2a1240);
    border-color: #ffd700;
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.45);
    transform: translateY(-2px);
  }

  .btn-submit:disabled {
    background: rgba(17, 8, 24, 0.6);
    color: #6e5585;
    border: 1px solid #2a193b;
    cursor: not-allowed;
    box-shadow: none;
  }

  .login-footer-text {
    text-align: center;
    font-size: 0.85rem;
    color: #bfa8d8;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
    padding-top: 1.2rem;
  }

  .login-footer-text a {
    color: #e2c275;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  .login-footer-text a:hover {
    color: #ffd700;
    text-shadow: 0 0 8px rgba(226, 194, 117, 0.5);
  }

  @media (max-width: 480px) {
    .login-card-glass {
      padding: 2rem 1.5rem;
    }
  }
</style>