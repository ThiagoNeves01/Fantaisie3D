# Como abrir o site da Fantaisie 3D no seu computador

Este guia mostra, passo a passo, como rodar a loja no seu computador para ver e testar tudo. Não é preciso saber programar: basta copiar e colar os comandos.

Na primeira vez leva cerca de 20 minutos, a maior parte instalando programas. Depois disso, abrir o site leva 1 minuto ([veja o fim do guia](#abrir-de-novo-nos-próximos-dias)).

---

## 1. Instale os programas (só na primeira vez)

Você precisa de três programas gratuitos:

| Programa | Para que serve | Onde baixar |
|---|---|---|
| **Node.js** (versão LTS) | Roda o site | https://nodejs.org → botão "LTS" |
| **PostgreSQL 16** | Guarda produtos, clientes e pedidos | https://www.postgresql.org/download/ |
| **Git** | Baixa o projeto do GitHub | https://git-scm.com/downloads |

**Durante a instalação do PostgreSQL:**
- Ele vai pedir uma **senha para o usuário `postgres`**. Escolha uma e **anote**, porque vai precisar dela no passo 3.
- Mantenha a porta **5432**.
- Pode deixar as outras opções como estão.

> **No Mac:** se preferir, instale tudo pelo Homebrew: `brew install node postgresql@16 git` e depois `brew services start postgresql@16`.

Depois de instalar, **feche e abra de novo** o terminal (se já estava aberto).

---

## 2. Baixe o projeto

Abra o terminal:
- **Windows:** menu Iniciar → digite **PowerShell** → abrir.
- **Mac:** abra o app **Terminal**.

Copie e cole, um por vez (aperte Enter depois de cada linha):

```bash
cd Documents
git clone https://github.com/ThiagoNeves01/Fantaisie3D.git
cd Fantaisie3D
```

Isso cria a pasta `Documents/Fantaisie3D` com o site.

> **Sem Git?** No GitHub, clique em **Code → Download ZIP**, descompacte em Documentos e, no terminal, entre na pasta com `cd Documents/Fantaisie3D-main`.

---

## 3. Crie o banco de dados (só na primeira vez)

**Windows:** no menu Iniciar, abra **SQL Shell (psql)**, que veio junto com o PostgreSQL. Ele faz algumas perguntas (Server, Database, Port, Username): aperte **Enter** em todas. Quando pedir **Password**, digite a senha que você anotou no passo 1 (ela não aparece enquanto você digita; isso é normal).

**Mac:** no Terminal, digite `psql postgres`.

Quando aparecer `postgres=#`, cole estas duas linhas e aperte Enter:

```sql
CREATE USER f3d WITH PASSWORD 'f3d_dev_pw' CREATEDB;
CREATE DATABASE fantaisie3d OWNER f3d;
```

Deve aparecer `CREATE ROLE` e `CREATE DATABASE`. Para sair, digite `\q` e Enter.

> Esse usuário e senha são só para testes no seu computador. Eles já estão configurados no arquivo de exemplo do próximo passo.

---

## 4. Prepare o site (só na primeira vez)

Volte ao terminal do passo 2, dentro da pasta `Fantaisie3D`, e rode um comando por vez:

**1) Crie o arquivo de configuração:**

- Windows (PowerShell):
  ```powershell
  copy .env.example .env
  ```
- Mac:
  ```bash
  cp .env.example .env
  ```

**2) Instale as dependências** (leva de 1 a 3 minutos):

```bash
npm install
```

**3) Crie as tabelas do banco:**

```bash
npm run db:migrate
```

Deve terminar com `migrations applied successfully!`.

**4) Coloque os produtos, textos e usuários de exemplo:**

```bash
npm run db:seed
```

Deve terminar com `✓ seed concluído`.

---

## 5. Abra o site

```bash
npm run dev
```

Espere aparecer algo como:

```
- Local:    http://localhost:3000
- Network:  http://192.168.0.15:3000
```

Agora abra o navegador e acesse **http://localhost:3000**. O site abre na loja do Brasil.

**Importante:** deixe o terminal aberto enquanto estiver usando o site. Para desligar, clique no terminal e aperte **Ctrl + C**.

### Ver no celular
Com o celular **no mesmo Wi-Fi** do computador, abra no navegador do celular o endereço da linha **Network** (por exemplo `http://192.168.0.15:3000`). Se não abrir, permita o Node.js no firewall do Windows quando ele perguntar.

---

## 6. O que testar

### As três lojas
| Loja | Endereço |
|---|---|
| 🇧🇷 Brasil (português, R$) | http://localhost:3000/br |
| 🇨🇦 Canadá (inglês, CA$) | http://localhost:3000/ca/en |
| 🇨🇦 Canadá (francês, CA$) | http://localhost:3000/ca/fr |

Ou passe o mouse na **bandeira** no canto superior direito e escolha o país e o idioma.

### Contas de teste
| Tipo | E-mail | Senha |
|---|---|---|
| Cliente com pedidos de exemplo | `cliente@fantaisie3d.dev` | `Cliente12345` |
| Administrador | `admin@fantaisie3d.dev` | `Admin12345` |

Você também pode criar uma conta nova em **Entrar → Criar conta**.

### Cupons de desconto
- Brasil: `BEMVINDO10` (10% acima de R$ 100) e `FRETEGRATIS` (acima de R$ 150)
- Canadá: `WELCOME10` ou `BIENVENUE10` (10% acima de $40)

### Calcular frete no carrinho
- Brasil: qualquer CEP válido, por exemplo `01310-100`
- Canadá: qualquer código postal, por exemplo `H2X 1Y4` (Québec) ou `M5V 2T6` (Ontário). O imposto muda conforme a província.

### E-mails do sistema
Ainda não há um serviço de e-mail configurado, então as mensagens (confirmação de cadastro, recuperação de senha, orçamento) aparecem em:
**http://localhost:3000/br/dev-emails**

Clique nos botões dentro do e-mail para confirmar a conta ou criar uma nova senha.

### Ainda não disponível
- **"Finalizar compra"** fica desativado até a Fase 2 (pagamentos com Pix, cartão, Apple Pay e Google Pay).
- **Painel administrativo**: Fase 3.

---

## Abrir de novo nos próximos dias

Os passos 1 a 4 só são feitos uma vez. Nas próximas vezes:

1. Abra o terminal.
2. Entre na pasta e ligue o site:
   ```bash
   cd Documents/Fantaisie3D
   npm run dev
   ```
3. Acesse **http://localhost:3000**.

### Quando houver uma versão nova no GitHub

```bash
cd Documents/Fantaisie3D
git pull
npm install
npm run db:migrate
npm run dev
```

Para restaurar os produtos de exemplo originais, rode `npm run db:seed`. Ele não apaga clientes nem contas.

---

## Problemas comuns

**"npm" ou "node" não é reconhecido como comando**
O Node.js não foi instalado ou o terminal estava aberto antes da instalação. Feche e abra o terminal. Se continuar, reinstale o Node.js.

**Erro `ECONNREFUSED` ou `connection refused` no `db:migrate` / `db:seed`**
O PostgreSQL não está rodando.
- Windows: menu Iniciar → **Serviços** → procure `postgresql-x64-16` → **Iniciar**.
- Mac: `brew services start postgresql@16`.

**Erro `password authentication failed for user "f3d"`**
O passo 3 não foi concluído. Abra o SQL Shell de novo e rode os dois comandos `CREATE`.

**Erro `database "fantaisie3d" does not exist`**
Falta o segundo comando do passo 3 (`CREATE DATABASE …`).

**Erro `Port 3000 is in use`**
O site já está aberto em outro terminal. Use esse terminal, ou feche-o com Ctrl + C e rode `npm run dev` de novo.

**A página abre sem produtos**
Rode `npm run db:seed` e recarregue a página.

**O site abriu na loja errada**
O site lembra o último país escolhido. Troque pela bandeira ou acesse direto http://localhost:3000/br.

---

Para detalhes técnicos (Supabase, deploy na Vercel, estrutura do código e testes), veja o [README.md](README.md).
