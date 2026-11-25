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

<div class="login-page-container">
  <div class="login-card">
    <div class="login-header">
      <span class="login-subtitle">Del Luna Core System</span>
      <h2>Acesso ao Painel</h2>
      <p class="subtitle-desc">Entre com suas credenciais corporativas para gerenciar o inventário e as reservas.</p>
    </div>

    <form onsubmit={handleSubmit} class="login-form">
      {#if erro}
        <div class="error-box">{erro}</div>
      {/if}

      <div class="input-group">
        <label for="email">E-mail Corporativo</label>
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

      <button type="submit" class="btn-primary" disabled={carregando} style="width: 100%; margin-top: 0.5rem;">
        {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
      </button>
    </form>

    <div class="login-footer-text">
      <p>Ainda não tem conta corporativa? <a href="/registro">Cadastre-se aqui</a></p>
    </div>
  </div>
</div>

<style>
  .login-page-container {
    width: 100%;
    min-height: calc(100vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .login-card {
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 2.5rem;
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  }

  .login-header {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .login-subtitle {
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    color: #71717a;
    text-transform: uppercase;
    font-weight: 600;
  }

  .login-header h2 {
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

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

  .login-footer-text {
    text-align: center;
    font-size: 0.85rem;
    color: #71717a;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 1.2rem;
  }

  .login-footer-text a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.2s ease;
  }

  .login-footer-text a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 1.5rem;
    }
  }
</style>