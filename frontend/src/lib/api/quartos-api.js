const API = 'http://localhost:3001/api';

export async function listarQuartos() {
  const res = await fetch(`${API}/quartos`);
  if (!res.ok) throw new Error(`Falha ao buscar quartos (${res.status})`);
  return res.json();
}

export async function criarReserva(dados) {
  const res = await fetch(`${API}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const resposta = await res.json();

  if (res.status === 400) {
    const erro = new Error('Erro de validação');
    erro.campos = resposta.campos;
    throw erro;
  }

  if (res.status === 409) {
    throw new Error(resposta.mensagem);
  }

  if (!res.ok) {
    throw new Error('Não foi possível concluir a reserva.');
  }

  return resposta;
}