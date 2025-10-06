# Projeto da Aplicação de Prestação de Contas

## 1. Estrutura da Aplicação

- **Backend:** API RESTful utilizando Flask em Python. Responsável pela lógica de negócio, manipulação do banco de dados e geração dos PDFs.
- **Frontend:** Aplicação de página única (SPA) utilizando React. Consumirá a API do backend para fornecer uma interface de usuário interativa.
- **Banco de Dados:** SQLite para simplicidade e portabilidade, ideal para uma aplicação local.

## 2. Esquema do Banco de Dados

### Tabela: `servidores`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `nome` | TEXT | Nome do servidor |
| `cargo` | TEXT | Cargo do servidor |

### Tabela: `cargos`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `nome_cargo` | TEXT | Nome do Cargo |
| `valor_diaria_dentro_estado` | REAL | Valor da diária para viagens dentro do estado |
| `valor_diaria_fora_estado` | REAL | Valor da diária para viagens fora do estado |

### Tabela: `presidentes`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `nome` | TEXT | Nome do Presidente da Câmara |

### Tabela: `prestacoes_contas`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `servidor_id` | INTEGER | Chave Estrangeira para `servidores.id` |
| `presidente_id` | INTEGER | Chave Estrangeira para `presidentes.id` |
| `data_criacao` | TEXT | Data de criação da prestação de contas |

### Tabela: `adiantamentos`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `prestacao_id` | INTEGER | Chave Estrangeira para `prestacoes_contas.id` |
| `tipo` | TEXT | 'diaria' ou 'passagem' |
| `numero_adiantamento` | TEXT | Número do adiantamento |
| `numero_empenho` | TEXT | Número do empenho |
| `valor` | REAL | Valor do adiantamento |
| `data_adiantamento` | TEXT | Data do adiantamento |

### Tabela: `despesas_diarias`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `prestacao_id` | INTEGER | Chave Estrangeira para `prestacoes_contas.id` |
| `diarias_dentro_estado` | INTEGER | Quantidade de diárias dentro do estado |
| `refeicoes_dentro_estado` | INTEGER | Quantidade de refeições dentro do estado |
| `diarias_fora_estado` | INTEGER | Quantidade de diárias fora do estado |
| `refeicoes_fora_estado` | INTEGER | Quantidade de refeições fora do estado |

### Tabela: `documentos_comprovacao`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `prestacao_id` | INTEGER | Chave Estrangeira para `prestacoes_contas.id` |
| `tipo_documento` | TEXT | 'nota_fiscal', 'nota_hotel', 'curso', 'certificado', 'relatorio', 'atestado' |
| `descricao` | TEXT | Descrição do documento |
| `caminho_arquivo` | TEXT | Caminho para o arquivo do documento (se aplicável) |

### Tabela: `despesas_passagens`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave Primária, autoincremento |
| `prestacao_id` | INTEGER | Chave Estrangeira para `prestacoes_contas.id` |
| `bpe` | TEXT | Código BPE da passagem |
| `valor` | REAL | Valor da passagem |
| `tipo_viagem` | TEXT | 'ida' ou 'volta' |

## 3. Estrutura das Telas (Frontend)

1.  **Tela Inicial:**
    -   Seleção/Cadastro de Servidor.
    -   Seleção/Cadastro de Presidente da Câmara.
    -   Botão para acessar a tela de configuração de valores de diárias por cargo.
    -   Botão "Avançar".

2.  **Tela de Configuração de Diárias:**
    -   Cadastro e edição de cargos e seus respectivos valores de diária (dentro e fora do estado).

3.  **Tela de Adiantamentos:**
    -   Cadastro dos adiantamentos de diária e passagem (número, empenho, valor, data).
    -   Cálculo e exibição do total de diárias e refeições (dentro e fora do estado).
    -   Comparativo entre o valor total das diárias/refeições e o valor do adiantamento.
    -   Botão "Avançar".

4.  **Tela de Notas Fiscais e Documentos:**
    -   Cadastro de notas fiscais (hotel, etc.).
    -   Botão para adicionar outros documentos comprobatórios.
    -   Botão "Avançar".

5.  **Tela de Prestação de Contas de Passagens:**
    -   Cadastro de passagens (BPE, valor, ida/volta).
    -   Cálculo do valor a ser devolvido, se houver.

6.  **Tela Final/Impressão:**
    -   Botões para gerar e imprimir os 3 PDFs:
        -   Prestação de Contas da Diária.
        -   Prestação de Contas das Passagens.
        -   Parecer da Contadora.

## 4. Lógica de Negócio Especial

-   O cálculo de 1 refeição será 15% do valor de 1 diária (conforme o tipo, dentro ou fora do estado).
-   Se a prestação de contas for do Presidente da Câmara, o parecer final deverá ter um campo para a assinatura de outro membro da mesa diretora.

