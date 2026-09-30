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

<h2>Login - Hotel Del Luna</h2>

<form onsubmit={handleSubmit}>
  {#if erro}
    <p style="color: red;">{erro}</p>
  {/if}

  <div>
    <label for="email">E-mail</label>
    <input id="email" type="email" bind:value={email} required />
  </div>

  <br />

  <div>
    <label for="senha">Senha</label>
    <input id="senha" type="password" bind:value={senha} required />
  </div>

  <br />

  <button type="submit" disabled={carregando}>
    {carregando ? 'Entrando...' : 'Entrar'}
  </button>
</form>

<br />
<p>Ainda não tem conta? <a href="/registro">Cadastre-se aqui</a></p>