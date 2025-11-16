# Aplicação de Prestação de Contas - Câmara Municipal de Município Exemplo

Esta é uma aplicação web desenvolvida para auxiliar na prestação de contas de diárias para servidores públicos da Câmara Municipal de Município Exemplo.

## Funcionalidades

### Principais Recursos
- **Sistema de Autenticação Seguro**: Login com usuário e senha, proteção JWT, sessões seguras
- **Gestão de Usuários**: Cadastro, login, alteração de senha e controle de acesso
- **Cadastro de Servidores e Presidentes**: Gerenciamento completo de dados
- **Configuração de Diárias**: Valores por cargo (dentro e fora do estado)
- **Controle de Adiantamentos**: Registro de diárias e passagens
- **Cálculos Automáticos**: Totais de diárias e refeições com comparativo
- **Documentos Comprobatórios**: Gestão de notas fiscais, notas de hotel, etc.
- **Despesas de Passagens**: Controle completo com cálculo de devoluções
- **Geração de PDFs**: Três relatórios completos para impressão

### Segurança
- Autenticação JWT (JSON Web Token)
- Hash de senhas com Bcrypt
- Proteção de rotas e recursos
- Tokens com expiração automática (1h para acesso, 30 dias para refresh)
- Renovação automática de tokens

## Estrutura do Projeto

O projeto é dividido em duas partes principais:

- `backend/`: Uma API RESTful desenvolvida com Flask (Python) que gerencia o banco de dados (SQLite) e a lógica de negócio, incluindo a geração dos PDFs.
- `frontend/`: Uma aplicação de página única (SPA) desenvolvida com React que fornece a interface de usuário.

## Como Executar a Aplicação (Localmente)

Siga os passos abaixo para configurar e executar a aplicação em seu computador:

### Pré-requisitos

Certifique-se de ter o seguinte software instalado:

-   **Python 3.8+**: Certifique-se de que o Python esteja instalado e adicionado ao `PATH` do sistema. Você pode verificar isso abrindo o Prompt de Comando e digitando `python --version` e `pip --version`. Se os comandos não forem reconhecidos, você precisará reinstalar o Python, marcando a opção "Add Python to PATH" durante a instalação, ou adicioná-lo manualmente.
-   **Node.js 18+** (com `pnpm` instalado globalmente: `npm install -g pnpm`)

### Passos para Instalação e Execução Manual

1.  **Clone ou descompacte o projeto** em um diretório de sua escolha.

2.  **Configurar e Iniciar o Backend (API Flask):**
    
    a.  Abra um **novo terminal ou Prompt de Comando** e navegue até o diretório `backend` do projeto:
    ```bash
    cd /caminho/para/prestacao_contas_app/backend
    ```
    
    b.  **Instale as dependências do Python:**
    ```bash
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    ```
    *Nota: Recomenda-se usar um ambiente virtual Python para isolar as dependências.*
    
    c.  **(Opcional) Configure variáveis de ambiente para maior segurança:**
    ```bash
    # Windows (PowerShell)
    $env:JWT_SECRET_KEY="sua-chave-secreta-aqui"
    
    # macOS/Linux
    export JWT_SECRET_KEY="sua-chave-secreta-aqui"
    ```
    
    d.  **Exclua o banco de dados existente (se houver) para criar um novo:**
    ```bash
    # Windows
    del src\database\app.db
    
    # macOS/Linux
    rm src/database/app.db
    ```
    
    e.  **Inicie o servidor Flask:**
    ```bash
    python src\main.py
    ```
    O servidor será iniciado e estará acessível em `http://127.0.0.1:5000`. Deixe este terminal aberto e o servidor rodando.

3.  **Instalar dependências do Frontend:**
    
    a.  Abra um **segundo terminal** e navegue até o diretório `frontend`:
    ```bash
    cd /caminho/para/prestacao_contas_app/frontend
    ```
    
    b.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

4.  **Acessar a Aplicação:**
    
    a.  Abra seu navegador web e acesse:
    ```
    http://127.0.0.1:5000
    ```
    
    b.  **Primeiro Acesso - Criar Usuário:**
    - Na tela de login, clique em "Não tem uma conta? Registre-se"
    - Preencha os dados: usuário, email e senha
    - Após criar a conta, faça login com suas credenciais
    
    c.  A aplicação será carregada e você poderá começar a usar o sistema de prestação de contas.

## Observações Importantes

### Segurança
-   **Primeiro Acesso**: É necessário criar uma conta de usuário antes de usar o sistema
-   **Senha**: Use senhas fortes com letras, números e caracteres especiais
-   **Token JWT**: Os tokens de acesso expiram em 1 hora, mas são renovados automaticamente
-   **Produção**: Em ambiente de produção, altere as chaves secretas (`SECRET_KEY` e `JWT_SECRET_KEY`)

### Banco de Dados
-   O banco de dados SQLite (`app.db`) será criado automaticamente no diretório `backend/src/database/` na primeira vez que o backend for iniciado
-   **Índices otimizados** foram adicionados para melhor performance em consultas frequentes
-   Para redefinir o banco, basta deletar o arquivo `app.db` e reiniciar o servidor

### Recursos
-   Os PDFs gerados serão baixados diretamente pelo navegador
-   O sistema utiliza **lazy loading** no frontend para carregar componentes sob demanda
-   **CORS** está configurado para permitir comunicação entre frontend e backend

### Desenvolvimento
-   **Backend**: Flask com autenticação JWT e bcrypt
-   **Frontend**: React com React Router e lazy loading
-   **Performance**: Índices no banco de dados e code splitting no frontend

### Parar a Aplicação
-   Para parar o servidor Flask: pressione `Ctrl+C` no terminal
-   Para fazer logout: clique no botão "Sair" no cabeçalho da aplicação

## Tecnologias Utilizadas

### Backend
- Python 3.8+
- Flask (Framework web)
- Flask-JWT-Extended (Autenticação JWT)
- Flask-Bcrypt (Hash de senhas)
- Flask-SQLAlchemy (ORM)
- SQLite (Banco de dados)
- ReportLab (Geração de PDFs)

### Frontend
- React 19
- React Router (Navegação)
- Axios (HTTP Client)
- Tailwind CSS (Estilização)
- shadcn/ui (Componentes)
- Lucide React (Ícones)

## Suporte

Se tiver qualquer problema ou precisar de assistência, por favor, entre em contato.
