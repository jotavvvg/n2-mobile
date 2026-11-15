# Delivery ADS

Aplicativo acadêmico de delivery desenvolvido para a disciplina de Análise e Desenvolvimento de Sistemas. O projeto permite descobrir estabelecimentos, consultar cardápios, montar um pedido, acompanhar pedidos realizados e manter a sessão do usuário após atualizar a aplicação.

## Visão geral

O repositório possui duas partes principais:

- **API:** servidor REST em Node.js, Express e MySQL.
- **Aplicativo:** cliente multiplataforma em React Native com Expo, React Navigation e suporte a Web.

O fluxo principal é:

1. O usuário cria uma conta ou entra com e-mail e senha.
2. O aplicativo consulta os estabelecimentos disponíveis.
3. O usuário abre um cardápio e adiciona produtos à sacola.
4. O checkout valida endereço, itens e total do pedido.
5. A API grava o pedido e seus itens em uma transação MySQL.
6. A tela **Pedidos** consulta os pedidos do usuário e exibe seus status.

> O projeto é acadêmico. A autenticação atual consulta e-mail e senha no banco e associa pedidos pelo `usuario_id`; ainda não existe autenticação por token/JWT.

## Stack

### Backend

- Node.js
- Express
- MySQL
- `mysql2/promise`
- CORS
- Dotenv

### Frontend

- React Native
- Expo SDK 58
- Expo Web
- React Navigation Native Stack
- React Native Web
- AsyncStorage para persistência da sessão
- Lucide React Native para ícones

## Estrutura do repositório

```text
.
├── backend/
│   ├── .env.example       # Modelo de configuração da API
│   ├── db.js              # Pool de conexões MySQL
│   ├── server.js          # Rotas e inicialização da API
│   └── package.json
├── database/
│   └── schema_and_seed.sql # Banco, tabelas e dados iniciais
├── mobile/
│   ├── App.js
│   ├── package.json
│   └── src/
│       ├── auth/           # Contexto da sessão
│       ├── components/     # Componentes reutilizáveis
│       ├── config/         # URL da API
│       ├── hooks/          # Hooks de responsividade
│       ├── navigation/     # Rotas e deep links
│       ├── screens/        # Telas do aplicativo
│       ├── theme/          # Tokens de cores, espaçamento e tipografia
│       └── utils/          # Validações e utilitários
├── package.json            # Comandos da raiz
└── step-by-step/           # Documentação de requisitos e rebase
```

## Pré-requisitos

Em uma máquina nova, instale:

- Node.js LTS e npm
- MySQL Server 8 ou compatível
- Git
- Opcional: MySQL Workbench, Expo Go e Android Studio

O projeto foi desenvolvido e validado com Node.js/npm, Expo Web e MySQL local. O Android Studio é necessário somente para usar um emulador Android.

## Instalação em uma máquina nova

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd sbs-n2-mobile
```

### 2. Instalar as dependências

Na raiz:

```bash
npm install
```

Instale também as dependências específicas de cada aplicação:

```bash
cd backend
npm install

cd ..\mobile
npm install

cd ..
```

Em macOS/Linux, use `cd ../mobile` e `cd ..` equivalentes.

### 3. Criar o banco, schema e dados iniciais

O arquivo [`database/schema_and_seed.sql`](./database/schema_and_seed.sql) cria o banco `delivery_ads`, as tabelas, as chaves estrangeiras e os dados iniciais. Ele pode ser executado pelo MySQL Workbench ou pelo cliente `mysql`.

Pelo cliente MySQL:

```bash
mysql -u root -p < database/schema_and_seed.sql
```

No PowerShell do Windows, caso a redireção acima não seja aceita pelo shell:

```powershell
cmd /c "mysql -u root -p < database\schema_and_seed.sql"
```

Alternativamente, abra o arquivo no MySQL Workbench, conecte-se ao servidor local e execute todo o script.

O script utiliza `IF NOT EXISTS` e `ON DUPLICATE KEY UPDATE`, portanto pode ser executado novamente para preparar ou atualizar o ambiente de desenvolvimento.

### 4. Configurar a API

Copie o arquivo de exemplo:

```bash
copy backend\.env.example backend\.env
```

No macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

Ajuste [`backend/.env.example`](./backend/.env.example) conforme o MySQL local:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=delivery_ads
PORT=3000
```

Não versionar `backend/.env`. Ele contém configurações específicas da máquina.

## Como executar

### Opção recomendada: API e aplicativo juntos

Na raiz do projeto:

```bash
npm run dev
```

Esse comando usa `concurrently` e inicia:

- API em `http://localhost:3000`
- Expo em modo desenvolvimento, normalmente em `http://localhost:8081`

### Executar separadamente

Terminal 1, API:

```bash
npm run dev --prefix backend
```

Terminal 2, aplicativo Web:

```bash
npm run web --prefix mobile
```

Ou, dentro da pasta `mobile`:

```bash
npm start
npm run web
npm run android
npm run ios
```

Para validar a API, abra `http://localhost:3000/api/estabelecimentos` no navegador ou use:

```bash
curl http://localhost:3000/api/estabelecimentos
```

## Execução por plataforma

### Web

Use:

```bash
npm run web --prefix mobile
```

No Web, o cliente usa automaticamente `http://localhost:3000/api`.

### Emulador Android

Inicie o backend na máquina e execute:

```bash
npm run android --prefix mobile
```

O arquivo [`mobile/src/config/api.js`](./mobile/src/config/api.js) usa `10.0.2.2` para acessar o `localhost` da máquina a partir do emulador Android.

### Aparelho físico

O celular e o computador precisam estar na mesma rede. Descubra o IPv4 local do computador e altere temporariamente `mobile/src/config/api.js`:

```js
export const API_URL = 'http://IP_DA_MAQUINA:3000/api';
```

Também é necessário permitir a porta 3000 no firewall, se solicitado pelo sistema operacional.

## Usuário e dados de teste

O seed cria o usuário:

```text
E-mail: aluno@ads.edu.br
Senha: 123456
```

Também são criados três estabelecimentos:

- Burger Stack
- Pizza Navigator
- Sushi Query

Cada estabelecimento recebe produtos de exemplo no mesmo script SQL.

## Entidades do banco

O modelo está em [`database/schema_and_seed.sql`](./database/schema_and_seed.sql).

### `usuarios`

Representa as contas do aplicativo.

- `id`: identificador.
- `nome`: nome do usuário.
- `email`: único.
- `senha`: senha armazenada para o fluxo acadêmico atual.
- `criado_em`: data de criação.

Um usuário pode possuir vários pedidos.

### `estabelecimentos`

Representa restaurantes ou lojas disponíveis.

- `id`
- `nome`
- `categoria`
- `tempo_estimado`
- `taxa_entrega`

Um estabelecimento possui vários produtos e pode receber vários pedidos.

### `produtos`

Representa itens de um estabelecimento.

- `id`
- `estabelecimento_id`
- `nome`
- `descricao`
- `preco`

Cada produto pertence a um estabelecimento. A exclusão do estabelecimento remove seus produtos.

### `pedidos`

Representa o pedido realizado pelo usuário.

- `id`
- `usuario_id`
- `estabelecimento_id`
- `endereco_entrega`
- `valor_total`
- `status`
- `criado_em`

O status inicial é `CONFIRMADO`. A tela também reconhece `PREPARANDO`, `A_CAMINHO` e `ENTREGUE`.

### `itens_pedido`

Representa os produtos e quantidades de cada pedido.

- `id`
- `pedido_id`
- `produto_id`
- `quantidade`
- `preco_unitario`

Um pedido possui vários itens. Os itens são removidos quando o pedido é removido.

## API REST

A API é implementada em [`backend/server.js`](./backend/server.js) e usa o prefixo `/api`.

| Método | Rota | Finalidade |
|---|---|---|
| `POST` | `/api/usuarios/cadastro` | Cria uma conta |
| `POST` | `/api/usuarios/login` | Autentica o usuário |
| `GET` | `/api/estabelecimentos` | Lista estabelecimentos |
| `GET` | `/api/estabelecimentos/:id/produtos` | Lista produtos de um estabelecimento |
| `GET` | `/api/pedidos?usuario_id=1` | Lista pedidos agrupados por usuário |
| `POST` | `/api/pedidos` | Valida e registra um pedido |

Ao registrar um pedido, o backend:

1. Abre uma transação.
2. Confere se o estabelecimento existe.
3. Busca os preços reais dos produtos no banco.
4. Confere se os produtos pertencem ao estabelecimento.
5. Recalcula subtotal, taxa e total.
6. Insere `pedidos` e `itens_pedido`.
7. Confirma a transação ou desfaz tudo em caso de erro.

## Telas e componentes

### Telas

- **Login:** autenticação e restauração da sessão.
- **Cadastro:** criação de usuário com validações.
- **Home:** busca, filtros de categoria e cards de estabelecimentos.
- **Cardápio:** produtos, quantidades e sacola.
- **Pedido:** endereço, resumo, validação e envio do pedido.
- **Pedidos:** acompanhamento dos pedidos persistidos e seus status.

### Componentes principais

- `ResponsiveLayout`: cabeçalho Web responsivo, navegação, sessão, logout e retorno.
- `StoreCard`: card de estabelecimento.
- `ProductCard`: card de produto e controle de quantidade.
- `CartSidebar`: resumo da sacola no desktop.
- `CartSummaryBar`: resumo fixo da sacola no mobile.
- `CategoryPills`: filtros de categoria.
- `AppButton` e `AppInput`: controles visuais reutilizáveis.
- `FeedbackBanner`: mensagens de erro, sucesso e informação.

### Navegação

As rotas são definidas em [`mobile/src/navigation/AppNavigator.js`](./mobile/src/navigation/AppNavigator.js). No Web, os caminhos principais são:

- `/entrar`
- `/cadastro`
- `/restaurantes`
- `/cardapio`
- `/pedido`
- `/pedidos`

## Persistência da sessão

O [`SessionContext.js`](./mobile/src/auth/SessionContext.js) salva o usuário autenticado usando AsyncStorage. Por isso, no Web e no mobile, a sessão permanece após atualizar a página enquanto os dados locais não forem removidos.

O logout remove essa sessão e retorna para a tela de login.

## Solução de problemas

### A API não inicia

1. Confirme se o MySQL está em execução.
2. Verifique `backend/.env`.
3. Confirme se o banco `delivery_ads` foi criado.
4. Teste a conexão executando novamente `database/schema_and_seed.sql`.
5. Verifique se a porta 3000 está livre.

### O aplicativo exibe erro de comunicação

Confirme se:

- a API está em execução;
- o cliente está usando a URL correta em `mobile/src/config/api.js`;
- Web, emulador ou aparelho conseguem alcançar a máquina que executa a API;
- o firewall não está bloqueando a porta 3000.

### O Expo mantém uma versão antiga

Pare o servidor Expo e inicie novamente com cache limpo:

```bash
npx expo start --clear
```

### O banco está vazio

Execute novamente o script SQL completo. Ele cria as tabelas e reinsere os dados iniciais previstos para desenvolvimento.

## Observações de segurança e produção

Este projeto atende ao escopo acadêmico atual, mas não deve ser publicado em produção sem evoluções importantes:

- substituir senha em texto por hash seguro;
- adicionar autenticação por sessão ou token;
- validar autorização do usuário no acesso aos pedidos;
- restringir CORS;
- usar variáveis de ambiente seguras;
- adicionar migrations versionadas para ambientes reais;
- configurar HTTPS e observabilidade.

