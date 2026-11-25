import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();

app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080'] 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inicializarBanco() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(150) NOT NULL,
        cnpj VARCHAR(20) UNIQUE NOT NULL,
        responsavel VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quartos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        comodidades TEXT,
        quantidade_total INTEGER DEFAULT 1,
        quantidade_disponivel INTEGER DEFAULT 1,
        preco NUMERIC(10, 2) NOT NULL,
        imagem_base64 TEXT
      );

      CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        quarto_id INTEGER REFERENCES quartos(id) ON DELETE CASCADE,
        nome_hospede VARCHAR(100) NOT NULL,
        email_hospede VARCHAR(100),
        documento_hospede VARCHAR(50) NOT NULL,
        data_checkin DATE NOT NULL,
        data_checkout DATE NOT NULL,
        dias INTEGER,
        valor_total NUMERIC(10, 2),
        status VARCHAR(50) DEFAULT 'Ativa',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Banco NeonDB conectado e tabelas sincronizadas com sucesso!');
  } catch (err) {
    console.error('Erro ao inicializar tabelas no NeonDB:', err);
  }
}

inicializarBanco();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_del_luna_segredo_super_secreto_123';

app.post('/api/auth/registro', async (req, res) => {
  const { razaoSocial, cnpj, responsavel, email, senha } = req.body;
  if (!razaoSocial || !cnpj || !responsavel || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os dados fiscais da empresa.' });
  }

  try {
    const emailLimpo = email.trim().toLowerCase();
    const cnpjLimpo = cnpj.trim();

    const empresaExiste = await pool.query('SELECT * FROM empresas WHERE email = $1 OR cnpj = $2', [emailLimpo, cnpjLimpo]);
    if (empresaExiste.rows.length > 0) {
      return res.status(409).json({ mensagem: 'CNPJ ou E-mail já cadastrados no sistema.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novaEmpresa = await pool.query(
      'INSERT INTO empresas (razao_social, cnpj, responsavel, email, senha_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, razao_social, cnpj, responsavel, email',
      [razaoSocial, cnpjLimpo, responsavel, emailLimpo, senhaHash]
    );

    res.status(201).json(novaEmpresa.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro interno ao registrar empresa.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  const emailLimpo = email ? email.trim().toLowerCase() : '';

  if (
    (emailLimpo === 'admin@deluna.com' || emailLimpo === 'admin@delluna.com') && 
    (senha === 'admin123' || senha === 'admin@delluna.com')
  ) {
    const adminUser = { id: 'admin', nome: 'Gerência Del Luna PMS', email: 'admin@deluna.com', isAdmin: true };
    const token = jwt.sign({ id: 'admin', email: 'admin@deluna.com', isAdmin: true }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, usuario: adminUser });
  }

  try {
    const resultado = await pool.query('SELECT * FROM empresas WHERE email = $1', [emailLimpo]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    const empresa = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, empresa.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: empresa.id, email: empresa.email, isAdmin: false }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ 
      token, 
      usuario: { id: empresa.id, nome: empresa.razao_social, email: empresa.email, responsavel: empresa.responsavel, isAdmin: false } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
});

app.get('/api/quartos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM quartos ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao buscar inventário.' });
  }
});

app.post('/api/quartos', async (req, res) => {
  const { nome, tipo, comodidades, quantidadeTotal, preco, imagemBase64 } = req.body;
  if (!nome || !preco || !quantidadeTotal) {
    return res.status(400).json({ mensagem: 'Nome, preço e quantidade são obrigatórios.' });
  }

  try {
    const qtd = parseInt(quantidadeTotal) || 1;
    const resultado = await pool.query(
      'INSERT INTO quartos (nome, tipo, comodidades, quantidade_total, quantidade_disponivel, preco, imagem_base64) VALUES ($1, $2, $3, $4, $4, $5, $6) RETURNING *',
      [nome, tipo || 'Standard', comodidades || '', qtd, Number(preco), imagemBase64 || null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('ERRO SQL AO INSERIR QUARTO:', err);
    res.status(500).json({ mensagem: 'Erro ao cadastrar unidade no banco de dados: ' + err.message });
  }
});

app.put('/api/quartos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, comodidades, quantidadeTotal, preco, imagemBase64 } = req.body;

  try {
    const qtd = parseInt(quantidadeTotal) || 1;
    const resultado = await pool.query(
      `UPDATE quartos 
       SET nome = $1, tipo = $2, comodidades = $3, quantidade_total = $4, quantidade_disponivel = $4, preco = $5, imagem_base64 = COALESCE($6, imagem_base64)
       WHERE id = $7 RETURNING *`,
      [nome, tipo, comodidades || '', qtd, Number(preco), imagemBase64, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Unidade não encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar quarto:', err);
    res.status(500).json({ mensagem: 'Erro ao atualizar unidade.' });
  }
});

app.delete('/api/quartos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM quartos WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Unidade removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao remover unidade.' });
  }
});

app.get('/api/reservas', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT r.*, q.nome as q_nome, q.tipo as q_tipo, q.comodidades as q_comodidades, q.preco as q_preco, q.imagem_base64 as q_imagem
      FROM reservas r
      LEFT JOIN quartos q ON r.quarto_id = q.id
      ORDER BY r.id DESC
    `);
    
    const formatadas = resultado.rows.map(row => ({
      id: row.id,
      quartoId: row.quarto_id,
      nomeHospede: row.nome_hospede,
      email: row.email_hospede,
      documentoHospede: row.documento_hospede,
      dataCheckIn: row.data_checkin,
      dataCheckOut: row.data_checkout,
      dias: row.dias,
      valorTotal: row.valor_total,
      status: row.status,
      criadoEm: row.criado_em,
      quarto: row.q_nome ? {
        nome: row.q_nome,
        tipo: row.q_tipo,
        comodidades: row.q_comodidades,
        preco: row.q_preco,
        imagem: row.q_imagem
      } : null
    }));

    res.json(formatadas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao buscar registros de alocação.' });
  }
});

app.post('/api/reservas', async (req, res) => {
  const { quartoId, nomeHospede, emailHospede, documentoHospede, dataCheckIn, dataCheckOut } = req.body;

  if (!quartoId || !nomeHospede || !documentoHospede || !dataCheckIn || !dataCheckOut) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const quartoRes = await pool.query('SELECT * FROM quartos WHERE id = $1', [quartoId]);
    if (quartoRes.rows.length === 0) return res.status(404).json({ mensagem: 'Unidade não encontrada.' });
    const quarto = quartoRes.rows[0];

    if (quarto.quantidade_disponivel <= 0) {
      return res.status(400).json({ mensagem: 'Não há unidades disponíveis deste tipo.' });
    }

    const entrada = new Date(dataCheckIn);
    const saida = new Date(dataCheckOut);
    const dias = Math.max(1, Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24)));
    const valorTotal = dias * Number(quarto.preco);

    const novaReserva = await pool.query(
      `INSERT INTO reservas (quarto_id, nome_hospede, email_hospede, documento_hospede, data_checkin, data_checkout, dias, valor_total, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [quartoId, nomeHospede, emailHospede || '', documentoHospede, dataCheckIn, dataCheckOut, dias, valorTotal, 'Ativa']
    );

    await pool.query('UPDATE quartos SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = $1', [quartoId]);

    res.status(201).json(novaReserva.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao registrar alocação.' });
  }
});

app.delete('/api/reservas/:id', async (req, res) => {
  try {
    const reservaRes = await pool.query('SELECT * FROM reservas WHERE id = $1', [req.params.id]);
    if (reservaRes.rows.length > 0) {
      const quartoId = reservaRes.rows[0].quarto_id;
      await pool.query('UPDATE quartos SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = $1', [quartoId]);
      await pool.query('DELETE FROM reservas WHERE id = $1', [req.params.id]);
    }
    res.json({ mensagem: 'Alocação encerrada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao encerrar alocação.' });
  }
});

app.listen(3001, () => {
  console.log('API do Del Luna PMS rodando na porta 3001!');
});