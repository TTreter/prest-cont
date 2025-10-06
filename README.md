# Aplicação de Prestação de Contas - Câmara Municipal de Município Exemplo

Esta é uma aplicação web local desenvolvida para auxiliar na prestação de contas de diárias para servidores públicos da Câmara Municipal de Município Exemplo.

## Funcionalidades

- Cadastro e seleção de servidores e presidentes da Câmara.
- Configuração de valores de diárias por cargo (dentro e fora do estado).
- Registro de adiantamentos de diárias e passagens.
- Cálculo automático de totais de diárias e refeições, com comparativo ao adiantamento.
- Cadastro de documentos comprobatórios (notas fiscais, notas de hotel, etc.).
- Registro de despesas de passagens, com cálculo de valores a devolver.
- Geração de três PDFs para impressão: Prestação de Contas de Diária, Prestação de Contas de Passagem e Parecer da Contadora.

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

1.  **Descompacte o arquivo `prestacao_contas_app.zip`** em um diretório de sua escolha.

2.  **Configurar e Iniciar o Backend (API Flask):**
    a.  Abra um **novo terminal ou Prompt de Comando** e navegue até o diretório `backend` do projeto descompactado:
        ```bash
        cd /caminho/para/prestacao_contas_app/backend
        ```
    b.  **Instale as dependências do Python:**
        ```bash
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        ```
        *Nota: Se você preferir usar um ambiente virtual existente ou criar um novo manualmente, ative-o antes de executar os comandos `pip install`.*

    c.  **Exclua o arquivo do banco de dados existente (se houver):**
        Navegue até o diretório `backend/src/database/` e exclua o arquivo `app.db` (se ele existir). Isso garantirá que um novo banco de dados limpo seja criado com a estrutura correta.
        ```bash
        # No terminal, a partir da raiz do seu projeto:
        del src\database\app.db  # No Windows
        # ou
        rm src/database/app.db   # No macOS/Linux
        ```

    d.  **Inicie o servidor Flask:**
        ```bash
        python src\main.py
        ```
        O servidor será iniciado e estará acessível em `http://127.0.0.1:5000`. Deixe este terminal aberto e o servidor rodando.

3.  **Acessar o Frontend (Aplicação React):**
    a.  Abra seu navegador web e acesse:
        ```
        http://127.0.0.1:5000
        ```
    b.  A aplicação React será carregada e você poderá começar a usar o sistema de prestação de contas.

## Observações

-   O banco de dados SQLite (`app.db`) será criado automaticamente no diretório `backend/src/database/` na primeira vez que o backend for iniciado.
-   Os PDFs gerados serão baixados diretamente pelo navegador.
-   Para parar a aplicação, basta fechar o terminal onde o servidor Flask está rodando (ou pressionar `Ctrl+C`).

Se tiver qualquer problema ou precisar de assistência, por favor, entre em contato.
