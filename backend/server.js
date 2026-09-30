import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // Libera acesso ao SvelteKit (Vite)
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_del_luna_segredo_super_secreto_123';

// Atraso artificial de 400ms para testar o estado de carregando (Skeleton/Spinner)
app.use((req, res, next) => {
  setTimeout(next, 400);
});

// Seed de Usuários (Banco em memória)
let usuarios = [];

// Seed inicial com 8 quartos do Hotel Del Luna
let quartos = [
  { id: '101', nome: 'Suíte Presidencial Man-wol', preco: 850, disponivel: true },
  { id: '102', nome: 'Luxo Vista Mar Celestial', preco: 500, disponivel: true },
  { id: '103', nome: 'Standard Jardim da Lua', preco: 300, disponivel: true },
  { id: '104', nome: 'Suíte Executiva Chan-sung', preco: 600, disponivel: false },
  { id: '105', nome: 'Quarto Deluxe Estelar', preco: 450, disponivel: true },
  { id: '106', nome: 'Suíte Real Fantasma', preco: 950, disponivel: true },
  { id: '107', nome: 'Standard Sol Poente', preco: 250, disponivel: false },
  { id: '108', nome: 'Cobertura Lua Cheia', preco: 1200, disponivel: true }
];

let reservas = [];

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// POST /api/auth/registro - Cadastrar novo usuário
app.post('/api/auth/registro', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!email || !senha || !nome) {
    return res.status(400).json({ mensagem: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const usuarioExiste = usuarios.find(u => u.email === email);
  if (usuarioExiste) {
    return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
  }

  // Criptografa a senha antes de salvar
  const senhaHash = await bcrypt.hash(senha, 10);

  const novoUsuario = { id: String(usuarios.length + 1), nome, email, senhaHash };
  usuarios.push(novoUsuario);

  const { senhaHash: _, ...usuarioSemSenha } = novoUsuario;
  res.status(201).json(usuarioSemSenha);
});

// POST /api/auth/login - Autenticar usuário e gerar token
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
  }

  // Gera o token JWT com validade de 1h
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const { senhaHash: _, ...usuarioSemSenha } = usuario;
  res.json({ token, usuario: usuarioSemSenha });
});


// ==========================================
// ROTAS DE QUARTOS E RESERVAS
// ==========================================

// GET /api/quartos - Listar todos
app.get('/api/quartos', (req, res) => {
  res.json(quartos);
});

// GET /api/quartos/:id - Buscar um quarto por ID
app.get('/api/quartos/:id', (req, res) => {
  const quarto = quartos.find(q => q.id === req.params.id);
  if (!quarto) {
    return res.status(404).json({ mensagem: 'Quarto não encontrado' });
  }
  res.json(quarto);
});

// POST /api/reservas - Criar uma nova reserva com validação de contrato (400 e 409)
app.post('/api/reservas', (req, res) => {
  const { quartoId, nomeHospede, email } = req.body;
  const erros = {};

  if (!nomeHospede || nomeHospede.trim().length < 3) {
    erros.nomeHospede = 'Informe o nome completo do hóspede (mínimo 3 caracteres)';
  }

  if (!email || !email.includes('@')) {
    erros.email = 'Use o formato nome@dominio.com';
  }

  // Devolve erro 400 se faltar algum campo
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: erros });
  }

  // Devolve erro 409 se o e-mail já tiver reserva cadastrada
  const reservaExistente = reservas.find(r => r.email === email && r.quartoId === quartoId);
  if (reservaExistente) {
    return res.status(409).json({ mensagem: 'Este e-mail já possui uma reserva para este quarto.' });
  }

  const novaReserva = {
    id: String(reservas.length + 1),
    quartoId,
    nomeHospede,
    email,
    criadoEm: new Date()
  };

  reservas.push(novaReserva);
  res.status(201).json(novaReserva);
});

app.listen(3001, () => {
  console.log('API do Hotel Del Luna rodando na porta 3001!');
});