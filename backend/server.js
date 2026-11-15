const cors = require('cors');
const express = require('express');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function roundToCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

app.post('/api/usuarios/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body || {};
  const normalizedName = typeof nome === 'string' ? nome.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedName || !normalizedEmail || typeof senha !== 'string' || !senha.trim()) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [normalizedName, normalizedEmail, senha],
    );

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      usuario: { id: result.insertId, nome: normalizedName, email: normalizedEmail },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    console.error('Erro ao cadastrar usuário:', error);
    return res.status(500).json({ erro: 'Não foi possível realizar o cadastro.' });
  }
});

app.post('/api/usuarios/login', async (req, res) => {
  const { email, senha } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || typeof senha !== 'string' || !senha) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, nome, email FROM usuarios WHERE email = ? AND senha = ? LIMIT 1',
      [normalizedEmail, senha],
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    return res.status(200).json({ usuario: rows[0] });
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    return res.status(500).json({ erro: 'Não foi possível realizar o login.' });
  }
});

app.get('/api/estabelecimentos', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nome, categoria, tempo_estimado, taxa_entrega FROM estabelecimentos ORDER BY id',
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar estabelecimentos:', error);
    return res.status(500).json({ erro: 'Não foi possível carregar os estabelecimentos.' });
  }
});

app.get('/api/estabelecimentos/:id/produtos', async (req, res) => {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ erro: 'Identificador de estabelecimento inválido.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, estabelecimento_id, nome, descricao, preco FROM produtos WHERE estabelecimento_id = ? ORDER BY id',
      [Number(id)],
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return res.status(500).json({ erro: 'Não foi possível carregar os produtos.' });
  }
});

app.get('/api/pedidos', async (req, res) => {
  const { usuario_id: usuarioId } = req.query;

  if (!isPositiveInteger(usuarioId)) {
    return res.status(400).json({ erro: 'Identificador de usuário inválido.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
        p.id,
        p.endereco_entrega,
        p.valor_total,
        p.status,
        p.criado_em,
        e.id AS estabelecimento_id,
        e.nome AS estabelecimento_nome,
        ip.produto_id,
        ip.quantidade,
        ip.preco_unitario,
        pr.nome AS produto_nome
      FROM pedidos p
      INNER JOIN estabelecimentos e ON e.id = p.estabelecimento_id
      LEFT JOIN itens_pedido ip ON ip.pedido_id = p.id
      LEFT JOIN produtos pr ON pr.id = ip.produto_id
      WHERE p.usuario_id = ?
      ORDER BY p.criado_em DESC, p.id DESC, ip.id ASC`,
      [Number(usuarioId)],
    );

    const pedidos = [];
    const pedidosPorId = new Map();
    for (const row of rows) {
      let pedido = pedidosPorId.get(row.id);
      if (!pedido) {
        pedido = {
          id: row.id,
          endereco_entrega: row.endereco_entrega,
          valor_total: row.valor_total,
          status: row.status,
          criado_em: row.criado_em,
          estabelecimento_id: row.estabelecimento_id,
          estabelecimento_nome: row.estabelecimento_nome,
          itens: [],
        };
        pedidosPorId.set(row.id, pedido);
        pedidos.push(pedido);
      }

      if (row.produto_id !== null) {
        pedido.itens.push({
          produto_id: row.produto_id,
          produto_nome: row.produto_nome,
          quantidade: row.quantidade,
          preco_unitario: row.preco_unitario,
        });
      }
    }

    return res.status(200).json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos do usuário:', error);
    return res.status(500).json({ erro: 'Não foi possível carregar seus pedidos.' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  const {
    usuario_id: usuarioId,
    estabelecimento_id: estabelecimentoId,
    endereco_entrega: enderecoEntrega,
    valor_total: valorTotalInformado,
    itens,
  } = req.body || {};

  if (
    !isPositiveInteger(usuarioId) ||
    !isPositiveInteger(estabelecimentoId) ||
    typeof enderecoEntrega !== 'string' ||
    !enderecoEntrega.trim() ||
    !Array.isArray(itens) ||
    itens.length === 0
  ) {
    return res.status(400).json({ erro: 'Informe usuário, estabelecimento, endereço e ao menos um item.' });
  }

  const itensValidos = itens.every(
    (item) =>
      item &&
      isPositiveInteger(item.produto_id) &&
      isPositiveInteger(item.quantidade) &&
      Number.isFinite(Number(item.preco_unitario)) &&
      Number(item.preco_unitario) >= 0,
  );
  if (!itensValidos) {
    return res.status(400).json({ erro: 'Um ou mais itens do pedido são inválidos.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [estabelecimentos] = await connection.execute(
      'SELECT taxa_entrega FROM estabelecimentos WHERE id = ?',
      [Number(estabelecimentoId)],
    );
    if (estabelecimentos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ erro: 'Estabelecimento não encontrado.' });
    }

    const itensComPrecoDoBanco = [];
    let subtotal = 0;
    for (const item of itens) {
      const [produtos] = await connection.execute(
        'SELECT id, preco FROM produtos WHERE id = ? AND estabelecimento_id = ?',
        [Number(item.produto_id), Number(estabelecimentoId)],
      );
      if (produtos.length === 0) {
        await connection.rollback();
        return res.status(400).json({ erro: 'Um ou mais produtos não pertencem a este estabelecimento.' });
      }

      const precoUnitario = Number(produtos[0].preco);
      if (roundToCents(Number(item.preco_unitario)) !== roundToCents(precoUnitario)) {
        await connection.rollback();
        return res.status(400).json({ erro: 'O preço de um produto foi atualizado. Recarregue o cardápio.' });
      }

      itensComPrecoDoBanco.push({
        produtoId: Number(item.produto_id),
        quantidade: Number(item.quantidade),
        precoUnitario,
      });
      subtotal += precoUnitario * Number(item.quantidade);
    }

    const valorCalculado = roundToCents(subtotal + Number(estabelecimentos[0].taxa_entrega));
    if (
      !Number.isFinite(Number(valorTotalInformado)) ||
      roundToCents(Number(valorTotalInformado)) !== valorCalculado
    ) {
      await connection.rollback();
      return res.status(400).json({ erro: 'O valor total do pedido não corresponde aos itens e à taxa de entrega.' });
    }

    const [pedido] = await connection.execute(
      'INSERT INTO pedidos (usuario_id, estabelecimento_id, endereco_entrega, valor_total) VALUES (?, ?, ?, ?)',
      [Number(usuarioId), Number(estabelecimentoId), enderecoEntrega.trim(), valorCalculado],
    );

    for (const item of itensComPrecoDoBanco) {
      await connection.execute(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [pedido.insertId, item.produtoId, item.quantidade, item.precoUnitario],
      );
    }

    await connection.commit();
    return res.status(201).json({
      mensagem: 'Pedido registrado com sucesso!',
      pedido_id: pedido.insertId,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Erro ao desfazer transação do pedido:', rollbackError);
      }
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ erro: 'Usuário ou estabelecimento não encontrado.' });
    }

    console.error('Erro ao registrar pedido:', error);
    return res.status(500).json({ erro: 'Não foi possível registrar o pedido.' });
  } finally {
    if (connection) connection.release();
  }
});

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

async function startServer() {
  await pool.query('SELECT 1');
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} e conectado ao MySQL (3306).`);
  });
}

startServer().catch((error) => {
  console.error('Não foi possível iniciar a API ou conectar ao MySQL:', error);
  process.exitCode = 1;
});
