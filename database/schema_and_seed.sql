CREATE DATABASE IF NOT EXISTS delivery_ads
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE delivery_ads;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estabelecimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tempo_estimado VARCHAR(30) NOT NULL,
    taxa_entrega DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estabelecimento_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    preco DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    estabelecimento_id INT NOT NULL,
    endereco_entrega VARCHAR(255) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'CONFIRMADO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

INSERT INTO usuarios (id, nome, email, senha) VALUES
(1, 'Aluno Teste ADS', 'aluno@ads.edu.br', '123456')
ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha = VALUES(senha);

INSERT INTO estabelecimentos (id, nome, categoria, tempo_estimado, taxa_entrega) VALUES
(1, 'Burger Stack', 'Hamburgueria', '30-45 min', 5.90),
(2, 'Pizza Navigator', 'Pizzaria', '40-55 min', 7.50),
(3, 'Sushi Query', 'Japonesa', '25-35 min', 9.00)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    categoria = VALUES(categoria),
    tempo_estimado = VALUES(tempo_estimado),
    taxa_entrega = VALUES(taxa_entrega);

INSERT INTO produtos (id, estabelecimento_id, nome, descricao, preco) VALUES
(1, 1, 'X-FullStack Duplo', 'Dois blends de 160g, cheddar duplo, bacon crocante e molho da casa.', 34.90),
(2, 1, 'Batata Rústica SQL', 'Porção de 300g com alecrim, alho confitado e maionese verde.', 18.50),
(3, 1, 'Refrigerante Lata 350ml', 'Coca-Cola ou Guaraná Antarctica gelado.', 6.50),
(4, 2, 'Pizza Calabresa Artesanal', 'Massa de fermentação lenta, molho pelati, calabresa e cebola roxa.', 52.00),
(5, 2, 'Pizza Marguerita Especial', 'Mussarela de búfala, tomate cereja e manjericão fresco.', 56.00),
(6, 2, 'Borda Vulcão Catupiry', 'Adicional ou mini pizza doce de chocolate com morango.', 28.00),
(7, 3, 'Combo 20 Peças Express', '8 uramakis filadélfia, 6 hossomakis salmão, 6 niguiris.', 64.90),
(8, 3, 'Temaki Salmão Completo', 'Salmão batido com cream cheese e cebolinha (180g).', 29.90),
(9, 3, 'Harumaki de Queijo (2 un.)', 'Rolinho primavera crocante acompanhado de molho agridoce.', 14.00)
ON DUPLICATE KEY UPDATE
    estabelecimento_id = VALUES(estabelecimento_id),
    nome = VALUES(nome),
    descricao = VALUES(descricao),
    preco = VALUES(preco);
