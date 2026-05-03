# Coffee Kat

Projeto de e-commerce e painel administrativo para a cafeteria Coffee Kat. 
O sistema foi desenvolvido visando alta seguranca e design moderno (Glassmorphism).

## Arquitetura e Tecnologias

O projeto utiliza uma arquitetura Monorepo, contendo tanto o frontend quanto o backend no mesmo repositorio.

* Frontend -> React, Vite, Tailwind CSS
* Backend -> Node.js, Express
* Autenticacao -> Firebase Auth (via Session Cookies HttpOnly)
* Banco de Dados -> Firebase Firestore
* Seguranca da API -> Helmet, CORS restrito, Express Rate Limit
* Hospedagem -> Firebase Hosting (Frontend) e Render.com (Backend)

## Estrutura do Projeto

* /src -> Codigo fonte do Frontend (Componentes, Paginas, Contextos de Autenticacao e Carrinho)
* /backend -> Codigo fonte da API Node.js
* /public -> Arquivos estaticos e index.html
* /dist -> Build de producao (gerado automaticamente)

## Como rodar localmente

1. Requisitos:
   * Node.js v18 ou superior.
   * Projeto Firebase configurado com Firestore e Authentication (Email/Senha) ativos.

2. Configurando Variaveis de Ambiente:
   * Na raiz do projeto, crie um arquivo .env baseado nas credenciais publicas do seu Firebase SDK (VITE_FIREBASE_API_KEY, etc).
   * Na pasta /backend, crie um arquivo .env configurando FRONTEND_URL, NODE_ENV, SESSION_SECRET.
   * Coloque o arquivo de chave privada do Firebase (serviceAccountKey.json) na pasta /backend/config/.
   * Nota: Os arquivos .env e chaves estao protegidos pelo .gitignore e nao vao para o repositorio.

3. Instalando dependencias:
   * Rode o comando `npm install` na raiz do projeto.
   * Rode o comando `cd backend && npm install` na pasta do backend.

4. Rodando o projeto (Frontend e Backend simultaneamente):
   * Volte para a raiz e rode: `npm run dev:full`
   * O frontend estara disponivel em http://localhost:5173
   * O backend estara disponivel em http://localhost:3001

## Scripts Disponiveis (package.json)

* `npm run dev` -> Inicia apenas o frontend
* `npm run dev:back` -> Inicia apenas o backend em modo watch
* `npm run dev:full` -> Inicia front e back simultaneamente
* `npm run build` -> Compila o frontend para producao
* `npm run deploy` -> Compila o frontend e faz o deploy no Firebase Hosting
