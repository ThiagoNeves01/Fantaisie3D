# Fantaisie 3D: loja virtual Brasil + Canadá

E-commerce da **Fantaisie 3D** para produtos impressos em 3D, com duas operações comerciais independentes:

| Loja | URL | Idioma | Moeda | Pagamento previsto |
|---|---|---|---|---|
| 🇧🇷 Brasil | `/br/…` | Português | R$ (BRL) | Pix e cartão (Mercado Pago) |
| 🇨🇦 Canada | `/ca/en/…` | English | CA$ (CAD) | Cartão, Apple Pay, Google Pay (Stripe) |
| 🇨🇦 Canada | `/ca/fr/…` | Français | CA$ (CAD) | Cartão, Apple Pay, Google Pay (Stripe) |

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL · Drizzle ORM · Playwright.

> O briefing sugeria Prisma. Usamos **Drizzle** porque é 100% JavaScript, não depende de binários externos e funciona igualmente bem com Supabase. O esquema está em `src/db/schema.ts`.

---

## Status por fase

### ✅ Fase 1 (esta entrega)
- **Seletor de país e idioma** no cabeçalho, com bandeira: abre ao passar o mouse (desktop) ou ao tocar (celular), funciona pelo teclado, mantém a página atual (inclusive slugs de produto traduzidos) e fica salvo em cookie de 1 ano e na conta do cliente.
- **URLs traduzidas e SEO:** `/br/produtos`, `/ca/en/products`, `/ca/fr/produits` etc., com `hreflang`, `canonical`, `sitemap.xml`, `robots.txt` e dados estruturados (JSON-LD) de produto.
- **Traduções completas:** os dicionários `src/i18n/en-CA.ts` e `fr-CA.ts` são verificados pelo TypeScript contra `pt-BR.ts`, então o build falha se faltar alguma chave.
- **Catálogo por país:** preço, preço promocional, estoque e visibilidade são cadastrados separadamente para BR e CA (sem conversão cambial). Exemplos: o "Organizador de Temperos" só existe no Brasil e o "Robô Bolt Grafite" só no Canadá.
- Página inicial com banner, categorias, mais vendidos, novidades, promoções, personalizados, processo de fabricação, coleções, avaliações e Instagram.
- Catálogo com filtros (categoria, preço, cor, tamanho, lançamentos, mais vendidos, promoção, disponibilidade), ordenação e busca com sugestões automáticas.
- Página de produto com galeria e zoom, personalização (cor principal/secundária, tamanho, acabamento, texto) que **altera o preço**, medidas em cm ou polegadas, prazo de produção, material, conservação e aviso sobre variações da impressão 3D.
- **Carrinho** separado por país: quantidade, cupom, estimativa de frete por CEP/código postal, retirada local, frete grátis acima de um valor e **impostos canadenses por província** (TPS/GST, TVQ/QST, HST, PST). No Brasil, os impostos são exibidos como inclusos.
- **Contas:** cadastro, login, logout, confirmação de e-mail, recuperação de senha, compra como visitante (carrinho por cookie, mesclado ao entrar).
- **Área do cliente:** visão geral, pedidos com linha do tempo da produção 3D e rastreio, "comprar novamente", favoritos, endereços, orçamentos, dados pessoais, troca de senha e preferência de país/idioma.
- **"Crie com a Fantaisie 3D":** pedido de orçamento com upload de imagens e de arquivos STL/3MF, validados por extensão, tamanho e assinatura binária.
- Páginas institucionais (Sobre, FAQ, Privacidade, Termos, Trocas, Envio) por idioma, com textos-modelo para revisão jurídica (LGPD no Brasil; PIPEDA e Lei 25 no Canadá).
- E-mails transacionais no idioma do cliente.

### 🔜 Fase 2: checkout e frete
Checkout em etapas (identificação → endereço → envio → pagamento → revisão → confirmação), criação de pedidos, Mercado Pago (Pix e cartão), Stripe (cartão, Apple Pay, Google Pay) com webhooks, e integrações com Melhor Envio/Correios e Canada Post/Chit Chats. As tabelas `orders`, `order_items`, `payments` e `shipments` já existem.

### 🔜 Fase 3: painel administrativo
Produtos (PT/EN/FR, preços e estoque por país), pedidos e controle de produção, orçamentos com envio de proposta, clientes, cupons, banners, coleções, newsletter e relatórios por país/moeda. O papel `ADMIN` já existe na tabela de usuários.

---

## Como rodar localmente

Pré-requisitos: Node.js 20+ e PostgreSQL 15+.

```bash
npm install
cp .env.example .env            # ajuste DATABASE_URL e DIRECT_URL
npm run db:migrate              # cria as tabelas
npm run db:seed                 # produtos de exemplo, frete, impostos, textos e usuários demo
npm run dev                     # http://localhost:3000 → redireciona para /br
```

**Usuários de demonstração** (criados pelo seed):

| E-mail | Senha | Papel |
|---|---|---|
| `cliente@fantaisie3d.dev` | `Cliente12345` | Cliente com 3 pedidos de exemplo |
| `admin@fantaisie3d.dev` | `Admin12345` | Administrador (painel na Fase 3) |

**Cupons de exemplo:** `BEMVINDO10` e `FRETEGRATIS` (Brasil), `WELCOME10` e `BIENVENUE10` (Canadá).

**E-mails em desenvolvimento:** sem provedor configurado, os e-mails aparecem em `http://localhost:3000/br/dev-emails`. Essa página fica desativada em produção.

### Testes

```bash
npx playwright install chromium   # na primeira vez
npm run test:e2e                  # 24 testes: desktop + celular
```

Os testes cobrem a troca entre os três idiomas, preços por país, catálogo por região, hreflang, cookie persistente, cadastro/login/confirmação/recuperação de senha, carrinho (cupom, frete, impostos QC/ON), filtros, busca, personalização com preço, favoritos, endereços, orçamento com upload, contato, newsletter e responsividade (menu, filtros e seletor por toque, sem rolagem horizontal).

---

## Conectar ao Supabase

1. Crie um projeto em supabase.com.
2. Em **Project Settings → Database → Connection string**, copie:
   - `DATABASE_URL` → *Transaction pooler* (porta 6543)
   - `DIRECT_URL` → *Session* ou *Direct* (porta 5432)
3. Adicione `DATABASE_SSL="true"` no `.env`.
4. Rode `npm run db:migrate` e `npm run db:seed`.
5. **Uploads:** crie um bucket **privado** `quotes` no Supabase Storage e troque a função `saveUpload` em `src/lib/uploads.ts` pelo upload via `@supabase/supabase-js`, usando a service role key, somente no servidor.

A autenticação é própria (sessões em banco, senhas com bcrypt, token guardado apenas como hash, cookies `httpOnly`), então não depende do Supabase Auth. Login social (Google) já tem tabela (`oauth_accounts`) e pode ser ligado quando houver credenciais.

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure as variáveis do `.env.example` (no mínimo `DATABASE_URL`, `DIRECT_URL`, `DATABASE_SSL`, `APP_URL`).
3. O build roda `next build`. As migrações são aplicadas com `npm run db:migrate` (localmente ou num passo de CI).
4. O limite de tentativas de login usa memória do processo. Com várias instâncias, troque por Redis/Upstash em `src/lib/auth.ts`.

---

## Estrutura

```
src/
  proxy.ts               URLs públicas → rotas internas, cookie de país/idioma, detecção inicial
  lib/stores.ts          Configuração das 3 lojas e tabela de segmentos de URL traduzidos
  i18n/                  Dicionários pt-BR, en-CA, fr-CA (tipados)
  db/schema.ts           Modelo de dados completo (usuários, catálogo, preços/estoque por país, pedidos,
                         pagamentos, entregas, cupons, avaliações, orçamentos, impostos, páginas)
  db/seed*.ts            Dados de demonstração
  lib/                   catálogo, carrinho e totais, autenticação, e-mails, uploads, hreflang
  app/[store]/…          Páginas (a pasta [store] recebe br, ca-en ou ca-fr)
  app/actions/…          Server Actions (toda validação e autorização acontece no servidor)
  components/…           Interface
scripts/render/          Gerador das fotos 3D de demonstração (three.js + Chromium headless)
tests/                   Testes Playwright
brand-src/               Logos originais (PT, FR e EN)
```

### Trocar os produtos de exemplo
Todos os produtos do seed têm `is_sample = true` e mostram o selo "Exemplo". Até o painel ficar pronto (Fase 3), edite `src/db/seed-data.ts` e rode `npm run db:seed`. As fotos ficam em `public/products/<slug>-N.webp` (1000×1000, fundo claro).

### Identidade visual
- Cores: preto profundo `#101113`, turquesa elétrico `#00DCE8`, branco metálico `#F1F1F3`, turquesa escuro `#087F89`, grafite `#24272B`.
- Tipografia: Sora (títulos) e Inter (texto), servidas localmente.
- Elemento-assinatura: a órbita do emblema (banner, categorias em círculo, telas de login) e a textura de "linhas de camada" nas áreas escuras.
- O turquesa elétrico só aparece sobre fundo escuro ou como preenchimento. Sobre fundo claro, textos e links usam `#087F89`, que tem contraste adequado.
