# EDUCA-BRUMA

[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org) [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-purple?logo=supabase)](https://supabase.com) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)

*EDUCA-BRUMA* é um sistema web de gestão de avaliações desenvolvido para a Secretaria de Educação de Brumadinho. Ele permite o gerenciamento completo de escolas, turmas, alunos, professores e provas de forma intuitiva e segura. O foco é na simplicidade para educadores e administradores, com suporte a autenticação, inserção de respostas e análise de desempenho.

## ✨ Funcionalidades

* **🏫 Painel Administrativo**: Gerencie de forma centralizada escolas, séries, turmas, professores e alunos.
* **📝 Gestão de Provas**: Crie facilmente novos provões, defina questões, configure gabaritos e associe provas a múltiplas turmas.
* **📊 Inserção de Dados**: Interface otimizada para inserir rapidamente as respostas dos alunos em cada avaliação.
* **📈 Resultados e Análises**: Visualize instantaneamente resultados detalhados, incluindo ranking de alunos por turma, métricas de desempenho geral e estatísticas por questão para identificar lacunas de aprendizado.
* **🔒 Segurança**: Construído sobre o **Supabase**, com autenticação e segurança em nível de linha (row-level security) para proteger os dados dos alunos.
* **🌐 Baseado na Web**: Acessível a partir de qualquer navegador moderno.

## 💻 Stack Tecnológica

- **Frontend**: React 18+ com TypeScript, React Router para roteamento.
- **Estilização**: Tailwind CSS, Lucide React (ícones).
- **Backend**: Supabase (PostgreSQL para banco, Auth para autenticação).
- **Outras Bibliotecas**: Axios, Hooks personalizados para contexto e notificações.

---

## 🚀 Primeiros Passos

Siga estas instruções para configurar e executar sua própria instância do **EducaSys**.

### Pré-requisitos

* [Node.js](https://nodejs.org/) (recomenda-se a versão LTS)
* [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
* Uma conta gratuita no [Supabase](https://supabase.com/)

### 1. Configurar o Backend no Supabase

1. **Crie um novo projeto Supabase**:

   * Acesse o [Painel do Supabase](https://app.supabase.com/) e clique em **"New project"**.
   * Dê um nome ao seu projeto (exemplo: `educasys-municipio`) e crie uma senha segura para o banco de dados. Guarde essa senha.
   * Escolha uma região próxima aos seus usuários e clique em **"Create project"**.

2. **Configure o esquema do banco de dados**:

   * Assim que o projeto estiver pronto, vá até o **SQL Editor** no painel lateral do Supabase.
   * Clique em **"+ New query"**.
   * Abra o arquivo `schema.sql` deste repositório, copie todo o conteúdo e cole no editor SQL do Supabase.
   * Clique em **"RUN"**. Isso criará todas as tabelas, relações e políticas de segurança necessárias para o funcionamento do sistema.

3. **Obtenha suas credenciais de API**:

   * No painel do Supabase, vá em **Project Settings** (ícone de engrenagem).
   * Clique em **API**.
   * Você encontrará seu **Project URL** e suas **Project API Keys**. Utilize apenas a chave pública `anon`.
   * Mantenha essa página aberta — você precisará dessas informações no próximo passo.

### 2. Configurar o Frontend

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/dionatandiego11/bruma-educa-app.git
   cd educasys
   ```

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Configure as credenciais do Supabase**:

   * Abra o arquivo `src/services/supabaseClient.ts`.
   * Substitua os valores de `supabaseUrl` e `supabaseAnonKey` pelos obtidos no painel do Supabase.

   Seu arquivo deve ficar assim:

   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = 'https://xxxxxx.supabase.co'; // <-- SUA URL AQUI
   const supabaseAnonKey = 'ey...'; // <-- SUA ANON KEY AQUI
   ```

4. **Rode o projeto em desenvolvimento**:

     ```bash
     npm run dev
     ```
   * Abra o navegador e acesse o endereço mostrado no terminal (geralmente `http://localhost:3000`).

### 3. Primeiro Login

A aplicação já estará rodando! O primeiro usuário a se registrar será o administrador inicial.
*Observação: o esquema SQL não cria usuários automaticamente — você deve criar um via Supabase Auth ou pelo fluxo de cadastro do app.*

Para criar seu primeiro usuário:

1. Vá em **Authentication** no painel do Supabase.
2. Clique em **"Add user"** e insira um e-mail e senha.
3. Use essas credenciais para acessar o sistema.

## 🏗️ Estrutura do Projeto

```
/
src/
├── components/         # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── PageLayout.tsx
│   └── QuestionStatsModal.tsx
├── hooks/             # Custom hooks
│   ├── useAuth.tsx
│   └── useNotification.tsx
├── pages/             # Páginas da aplicação
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── AdminPage.tsx
│   ├── CreateProvaoPage.tsx
│   ├── InsertDataPage.tsx
│   └── ResultsPage.tsx
├── services/          # Serviços e APIs
│   ├── dbService.ts
│   └── supabaseClient.ts
└── types/             # Definições TypeScript
    └── index.ts
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para melhorar o **EducaSys**, siga os passos abaixo:

1. **Faça um fork** do repositório no GitHub.
2. **Clone** o repositório forkado para sua máquina.
3. Crie uma **nova branch** para sua melhoria ou correção.
4. Faça as alterações e **commit** com mensagens claras e descritivas.
5. **Envie (push)** suas alterações para seu fork.
6. Crie um **Pull Request** para a branch `main` do repositório original.

## 📞 Contato

Desenvolvido para a Secretaria de Educação de Brumadinho. Para dúvidas ou sugestões, entre em contato via email: dionatan.pmb@gmail.com.

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

