<script>
  import { registroApi } from '$lib/api/auth-api.js';
  import { goto } from '$app/navigation';

  let nome = $state('');
  let email = $state('');
  let senha = $state('');
  let carregando = $state(false);
  let erro = $state(null);
  let sucesso = $state(false);

  async function handleSubmit(e) {
    e.preventDefault();
    carregando = true;
    erro = null;

    try {
      await registroApi(nome, email, senha);
      sucesso = true;
      setTimeout(() => {
        goto('/login');
      }, 1500);
    } catch (err) {
      erro = err.message;
    } finally {
      carregando = false;
    }
  }
</script>

<h2>Criar Conta - Hotel Del Luna</h2>

{#if sucesso}
  <p style="color: green;">Conta criada com sucesso! Redirecionando para o login...</p>
{:else}
  <form onsubmit={handleSubmit}>
    {#if erro}
      <p style="color: red;">{erro}</p>
    {/if}

    <div>
      <label for="nome">Nome Completo</label>
      <input id="nome" type="text" bind:value={nome} required />
    </div>

    <br />

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
      {carregando ? 'Cadastrando...' : 'Cadastrar'}
    </button>
  </form>
{/if}