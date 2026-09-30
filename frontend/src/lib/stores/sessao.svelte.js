// Tenta restaurar do localStorage no carregamento inicial
const tokenSalvo = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
const usuarioSalvo = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('usuario') || 'null') : null;

export const sessao = $state({
  token: tokenSalvo,
  usuario: usuarioSalvo
});

export function login(novoToken, dadosUsuario) {
  sessao.token = novoToken;
  sessao.usuario = dadosUsuario;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('token', novoToken);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
  }
}

export function logout() {
  sessao.token = null;
  sessao.usuario = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
}