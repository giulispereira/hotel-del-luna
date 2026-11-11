import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_del_luna_segredo_super_secreto_123';

app.use((req, res, next) => {
  setTimeout(next, 300);
});

let usuarios = [];

let quartos = [
  { 
    id: '101', 
    nome: 'Suíte Presidencial Man-wol', 
    preco: 850, 
    disponivel: true, 
    imagem: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '102', 
    nome: 'Luxo Vista Mar Celestial', 
    preco: 500, 
    disponivel: true, 
    imagem: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '103', 
    nome: 'Standard Jardim da Lua', 
    preco: 300, 
    disponivel: true, 
    imagem: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '104', 
    nome: 'Suíte Executiva Chan-sung', 
    preco: 600, 
    disponivel: true, 
    imagem: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' 
  }
];

let reservas = [];

// Registro de usuários normais
app.post('/api/auth/registro', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!email || !senha || !nome) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
  }

  const usuarioExiste = usuarios.find(u => u.email === email);
  if (usuarioExiste) {
    return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const novoUsuario = { id: String(usuarios.length + 1), nome, email, senhaHash, isAdmin: false };
  usuarios.push(novoUsuario);

  const { senhaHash: _, ...usuarioSemSenha } = novoUsuario;
  res.status(201).json(usuarioSemSenha);
});

// Login unificado (Clientes e Admin)
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  const emailLimpo = email ? email.trim().toLowerCase() : '';

  // Acesso do Admin flexível
  if (
    (emailLimpo === 'admin@deluna.com' || emailLimpo === 'admin@delluna.com' || emailLimpo === '12.345.678/0001-99') && 
    (senha === 'admin123' || senha === 'admin@delluna.com' || senha === 'admin@deluna.com')
  ) {
    const adminUser = { id: 'admin', nome: 'Gerência Hotel Del Luna', email: 'admin@deluna.com', isAdmin: true };
    const token = jwt.sign({ id: 'admin', email: 'admin@deluna.com', isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, usuario: adminUser });
  }

  const usuario = usuarios.find(u => u.email === emailLimpo);
  if (!usuario) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ id: usuario.id, email: usuario.email, isAdmin: usuario.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
  const { senhaHash: _, ...usuarioSemSenha } = usuario;
  res.json({ token, usuario: usuarioSemSenha });
});

// Listar todos os quartos
app.get('/api/quartos', (req, res) => {
  res.json(quartos);
});

// Detalhes de um quarto
app.get('/api/quartos/:id', (req, res) => {
  const quarto = quartos.find(q => q.id === req.params.id);
  if (!quarto) return res.status(404).json({ mensagem: 'Quarto não encontrado' });
  res.json(quarto);
});

// Adicionar quarto (Admin)
app.post('/api/quartos', (req, res) => {
  const { nome, preco, imagem } = req.body;
  if (!nome || !preco) return res.status(400).json({ mensagem: 'Nome e preço são obrigatórios' });

  const novoQuarto = {
    id: String(Date.now()),
    nome,
    preco: Number(preco),
    disponivel: true,
    imagem: imagem || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  };

  quartos.push(novoQuarto);
  res.status(201).json(novoQuarto);
});

// Remover quarto (Admin)
app.delete('/api/quartos/:id', (req, res) => {
  quartos = quartos.filter(q => q.id !== req.params.id);
  res.json({ mensagem: 'Quarto removido com sucesso' });
});

// Listar reservas (Filtrado por e-mail ou todas para Admin)
app.get('/api/reservas', (req, res) => {
  const { email } = req.query;
  if (email) {
    const minhas = reservas.filter(r => r.email === email).map(r => ({
      ...r,
      quarto: quartos.find(q => q.id === r.quartoId)
    }));
    return res.json(minhas);
  }

  const todas = reservas.map(r => ({
    ...r,
    quarto: quartos.find(q => q.id === r.quartoId)
  }));
  res.json(todas);
});

// Criar reserva com datas
app.post('/api/reservas', (req, res) => {
  const { quartoId, nomeHospede, email, dataCheckIn, dataCheckOut } = req.body;

  if (!dataCheckIn || !dataCheckOut) {
    return res.status(400).json({ mensagem: 'Informe as datas de check-in e check-out.' });
  }

  const quarto = quartos.find(q => q.id === quartoId);
  if (!quarto) return res.status(404).json({ mensagem: 'Quarto não encontrado.' });

  const entrada = new Date(dataCheckIn);
  const saida = new Date(dataCheckOut);
  const dias = Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));

  if (dias <= 0) {
    return res.status(400).json({ mensagem: 'A data de check-out deve ser posterior ao check-in.' });
  }

  const valorTotal = dias * quarto.preco;

  const novaReserva = {
    id: String(Date.now()),
    quartoId,
    nomeHospede,
    email,
    dataCheckIn,
    dataCheckOut,
    dias,
    valorTotal,
    status: 'Confirmada',
    criadoEm: new Date()
  };

  reservas.push(novaReserva);
  quarto.disponivel = false;
  res.status(201).json(novaReserva);
});

// Cancelar reserva
app.delete('/api/reservas/:id', (req, res) => {
  const reserva = reservas.find(r => r.id === req.params.id);
  if (reserva) {
    const quarto = quartos.find(q => q.id === reserva.quartoId);
    if (quarto) quarto.disponivel = true;
    reservas = reservas.filter(r => r.id !== req.params.id);
  }
  res.json({ mensagem: 'Reserva cancelada com sucesso' });
});

app.listen(3001, () => {
  console.log('API do Hotel Del Luna rodando na porta 3001!');
});