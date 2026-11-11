// frontend/src/lib/api/auth-api.js

const API_URL = 'http://localhost:3001/api/auth';

export async function loginApi(email, senha) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem || 'Erro ao realizar login.');
  return data;
}

export async function registroApi(nome, email, senha) {
  const res = await fetch(`${API_URL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem || 'Erro ao cadastrar.');
  return data;
}