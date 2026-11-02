// Textos institucionais e legais iniciais (modelos). pt-BR = operação Brasil; en-CA / fr-CA = operação Canadá.
// Formato: markdown simples (## títulos, parágrafos, listas com "- ").
type PageDef = { key: string; title: string; body: string };

export const PAGES: Record<"pt-BR" | "en-CA" | "fr-CA", PageDef[]> = {
  "pt-BR": [
    {
      key: "about", title: "Sobre a Fantaisie 3D",
      body: `A Fantaisie 3D é uma marca criativa dedicada a transformar ideias em produtos físicos por meio da impressão 3D.

## Nossa história
Nascemos da vontade de ver a imaginação ganhar forma. Cada peça do nosso catálogo é desenhada, impressa e finalizada pela nossa equipe, camada por camada.

## O que fazemos
- Objetos de decoração com formas que só a impressão 3D permite.
- Organizadores e suportes funcionais para o dia a dia.
- Colecionáveis e personagens originais.
- Peças sob medida para clientes, empresas e eventos.

## Como trabalhamos
Produzimos sob demanda, o que reduz desperdício e permite personalizar cores, tamanhos e acabamentos. Usamos filamentos como PLA e PETG e revisamos cada peça antes do envio.

## Brasil e Canadá
Temos operações independentes no Brasil e no Canadá, cada uma com produção, estoque, preços e entregas locais.`,
    },
    {
      key: "faq", title: "Perguntas frequentes",
      body: `## Quanto tempo leva a produção?
Cada produto informa o prazo de produção na página. Em geral, de 2 a 6 dias úteis, somados ao prazo de entrega escolhido.

## As peças têm linhas aparentes?
Sim, levemente. As linhas de camada são características naturais da impressão 3D e fazem parte do acabamento.

## Posso escolher as cores?
Sim. A maioria dos produtos permite escolher cor principal, cor de destaque, tamanho e acabamento.

## Vocês fazem peças personalizadas?
Sim! Acesse "Personalizados", conte sua ideia e envie referências ou o arquivo STL/3MF. Enviaremos um orçamento sem compromisso.

## Quais formas de pagamento são aceitas?
Pix e cartão de crédito, processados com segurança por um provedor de pagamentos certificado.

## Vocês reproduzem personagens de filmes e jogos?
Não sem licença. Produzimos personagens originais e peças autorizadas pelos titulares dos direitos.`,
    },
    {
      key: "privacy", title: "Política de privacidade",
      body: `Esta política descreve como a Fantaisie 3D trata dados pessoais na operação Brasil, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).

## Dados que coletamos
- Cadastro: nome, e-mail, telefone e senha (armazenada de forma criptografada).
- Pedidos: endereço de entrega, itens comprados e histórico.
- Navegação: preferências de país e idioma e cookies essenciais.

## Finalidades
Processar pedidos, entregar produtos, prestar atendimento, cumprir obrigações legais e, com seu consentimento, enviar novidades.

## Pagamentos
Não armazenamos dados completos de cartão. Os pagamentos são processados diretamente pelo provedor contratado.

## Seus direitos
Você pode solicitar acesso, correção, portabilidade, anonimização ou exclusão dos seus dados e revogar consentimentos pelo nosso contato.

## Contato do encarregado (DPO)
privacidade@fantaisie3d.com (endereço de exemplo, a ser configurado).`,
    },
    {
      key: "terms", title: "Termos e condições",
      body: `Ao usar este site e comprar na loja Brasil, você concorda com estes termos.

## Produtos sob demanda
Muitos produtos são fabricados após a confirmação do pagamento. O prazo de produção é informado em cada produto.

## Preços
Os preços estão em reais (R$) e incluem os impostos aplicáveis. O frete é calculado no carrinho e confirmado no checkout.

## Personalizações
Itens personalizados (nomes, textos ou medidas sob encomenda) são produzidos exclusivamente para você.

## Propriedade intelectual
Os modelos, fotos e textos do site pertencem à Fantaisie 3D. Não produzimos réplicas de marcas ou personagens protegidos sem autorização.

## Foro
Estes termos são regidos pelas leis brasileiras, especialmente o Código de Defesa do Consumidor.`,
    },
    {
      key: "returns", title: "Política de trocas e devoluções",
      body: `## Direito de arrependimento
Em compras online, você pode desistir em até 7 dias corridos após o recebimento (art. 49 do Código de Defesa do Consumidor), com reembolso integral.

## Produtos com defeito
Se a peça chegar danificada ou com defeito de fabricação, avise-nos em até 30 dias com fotos. Fazemos a troca ou o reembolso sem custo.

## Variações naturais
Linhas de camada e pequenas variações de tom são características da impressão 3D e não são consideradas defeitos.

## Como solicitar
Entre em contato informando o número do pedido.`,
    },
    {
      key: "shipping", title: "Política de envio",
      body: `## Prazos
Prazo total = prazo de produção + prazo de entrega da modalidade escolhida.

## Modalidades
Enviamos por Correios (PAC e SEDEX) e transportadoras parceiras. As opções disponíveis aparecem no carrinho após informar o CEP.

## Frete grátis
Pedidos acima do valor indicado no carrinho têm frete grátis na modalidade econômica.

## Retirada local
Quando disponível, a retirada é gratuita e agendada após a confirmação do pedido.

## Rastreamento
O código de rastreio é enviado por e-mail e aparece em "Minha conta" assim que o pedido é postado.`,
    },
  ],
  "en-CA": [
    {
      key: "about", title: "About Fantaisie 3D",
      body: `Fantaisie 3D is a creative brand dedicated to turning ideas into physical products through 3D printing.

## Our story
We started with a simple wish: to see imagination take shape. Every piece in our catalogue is designed, printed and finished by our team, layer by layer.

## What we make
- Home decor with shapes only 3D printing can create.
- Practical organizers and stands for everyday life.
- Original characters and collectibles.
- Made-to-measure pieces for customers, businesses and events.

## How we work
We print on demand, which reduces waste and lets you customize colours, sizes and finishes. We use filaments such as PLA and PETG and inspect every piece before shipping.

## Brazil and Canada
We run independent operations in Brazil and Canada, each with its own local production, inventory, pricing and delivery.`,
    },
    {
      key: "faq", title: "Frequently asked questions",
      body: `## How long does production take?
Each product page shows its production time, usually 2 to 6 business days, plus the shipping time you choose.

## Will I see layer lines?
Yes, slightly. Layer lines are a natural part of 3D printing and part of the finish.

## Can I choose the colours?
Yes. Most products let you choose a main colour, an accent colour, a size and a finish.

## Do you make custom pieces?
Yes! Visit "Custom", tell us about your idea and send references or an STL/3MF file. We'll send you a no-obligation quote.

## Which payment methods do you accept?
Credit cards, Apple Pay and Google Pay, processed securely by a certified payment provider.

## Do you reproduce characters from movies and games?
Not without a licence. We make original characters and pieces authorized by the rights holders.`,
    },
    {
      key: "privacy", title: "Privacy policy",
      body: `This policy explains how Fantaisie 3D handles personal information in its Canadian operation, in accordance with PIPEDA and, for Québec residents, the Act respecting the protection of personal information in the private sector (Law 25).

## Information we collect
- Account: name, email, phone and password (stored encrypted).
- Orders: shipping address, items purchased and order history.
- Browsing: country and language preferences and essential cookies.

## Why we use it
To process and deliver orders, provide support, meet legal obligations and, with your consent, send news and promotions.

## Payments
We never store full card details. Payments are processed directly by our payment provider.

## Your rights
You may request access to, correction of or deletion of your information, and withdraw consent at any time by contacting us.

## Privacy officer
privacy@fantaisie3d.com (example address, to be configured).`,
    },
    {
      key: "terms", title: "Terms and conditions",
      body: `By using this site and buying from the Canada store, you agree to these terms.

## Made-to-order products
Many products are made after payment is confirmed. Production time is shown on each product page.

## Pricing and taxes
Prices are in Canadian dollars (CA$). Applicable taxes (GST/HST, QST or PST depending on the province) are added at checkout.

## Personalized items
Personalized items (names, text or custom sizes) are made exclusively for you.

## Intellectual property
Models, photos and text on this site belong to Fantaisie 3D. We don't make replicas of protected brands or characters without authorization.

## Governing law
These terms are governed by the laws of the province of Québec and the federal laws of Canada applicable therein, without limiting consumer protection laws of your province.`,
    },
    {
      key: "returns", title: "Returns and exchanges policy",
      body: `## Returns
Unused, non-personalized items may be returned within 30 days of delivery for a refund.

## Damaged or defective items
If your piece arrives damaged or with a manufacturing defect, contact us within 30 days with photos. We'll replace or refund it at no cost.

## Natural variations
Layer lines and slight colour variations are characteristic of 3D printing and aren't considered defects.

## Personalized items
Personalized items can't be returned unless defective.

## How to request
Contact us with your order number.`,
    },
    {
      key: "shipping", title: "Shipping policy",
      body: `## Timelines
Total time = production time + delivery time for the service you choose.

## Services
We ship with Canada Post and Chit Chats. Available options appear in the cart once you enter your postal code.

## Free shipping
Orders above the amount shown in the cart ship free with the economy service.

## Local pickup
When available, pickup is free and scheduled after your order is confirmed.

## Tracking
Your tracking number is emailed to you and appears in "My account" as soon as your order ships.`,
    },
  ],
  "fr-CA": [
    {
      key: "about", title: "À propos de Fantaisie 3D",
      body: `Fantaisie 3D est une marque créative qui transforme les idées en objets grâce à l’impression 3D.

## Notre histoire
Tout a commencé par une envie : voir l’imagination prendre forme. Chaque pièce de notre catalogue est conçue, imprimée et finie par notre équipe, couche par couche.

## Ce que nous fabriquons
- Des objets déco aux formes que seule l’impression 3D permet.
- Des organisateurs et des supports pratiques pour le quotidien.
- Des personnages et objets de collection originaux.
- Des pièces sur mesure pour les particuliers, les entreprises et les événements.

## Notre façon de travailler
Nous imprimons sur demande, ce qui réduit le gaspillage et permet de personnaliser couleurs, formats et finis. Nous utilisons des filaments comme le PLA et le PETG et inspectons chaque pièce avant l’expédition.

## Brésil et Canada
Nous avons des opérations indépendantes au Brésil et au Canada, chacune avec sa propre fabrication, son inventaire, ses prix et sa livraison.`,
    },
    {
      key: "faq", title: "Foire aux questions",
      body: `## Quel est le délai de fabrication?
Chaque fiche produit indique son délai, généralement de 2 à 6 jours ouvrables, auquel s’ajoute le délai de livraison choisi.

## Les lignes de couche sont-elles visibles?
Oui, légèrement. Elles font naturellement partie de l’impression 3D et de son fini.

## Puis-je choisir les couleurs?
Oui. La plupart des produits permettent de choisir une couleur principale, une couleur d’accent, un format et un fini.

## Faites-vous des pièces sur mesure?
Oui! Rendez-vous dans « Sur mesure », décrivez votre idée et envoyez des références ou un fichier STL/3MF. Nous vous enverrons une soumission sans engagement.

## Quels modes de paiement acceptez-vous?
Les cartes de crédit, Apple Pay et Google Pay, traités de façon sécurisée par un fournisseur certifié.

## Reproduisez-vous des personnages de films ou de jeux?
Pas sans licence. Nous créons des personnages originaux et des pièces autorisées par les titulaires des droits.`,
    },
    {
      key: "privacy", title: "Politique de confidentialité",
      body: `Cette politique explique comment Fantaisie 3D traite les renseignements personnels dans son opération canadienne, conformément à la LPRPDE et, pour les résidents du Québec, à la Loi sur la protection des renseignements personnels dans le secteur privé (Loi 25).

## Renseignements recueillis
- Compte : nom, courriel, téléphone et mot de passe (stocké de façon chiffrée).
- Commandes : adresse de livraison, articles achetés et historique.
- Navigation : préférences de pays et de langue et témoins essentiels.

## Utilisation
Traiter et livrer les commandes, offrir le service à la clientèle, respecter nos obligations légales et, avec votre consentement, vous envoyer nos nouveautés.

## Paiements
Nous ne conservons jamais les données complètes des cartes. Les paiements sont traités directement par notre fournisseur.

## Vos droits
Vous pouvez demander l’accès à vos renseignements, leur rectification ou leur suppression, et retirer votre consentement en tout temps en nous écrivant.

## Responsable de la protection des renseignements personnels
confidentialite@fantaisie3d.com (adresse d’exemple, à configurer).`,
    },
    {
      key: "terms", title: "Conditions générales",
      body: `En utilisant ce site et en achetant dans la boutique Canada, vous acceptez les présentes conditions.

## Produits fabriqués sur commande
Plusieurs produits sont fabriqués après la confirmation du paiement. Le délai de fabrication est indiqué sur chaque fiche.

## Prix et taxes
Les prix sont en dollars canadiens ($ CA). Les taxes applicables (TPS/TVH, TVQ ou TVP selon la province) sont ajoutées à la caisse.

## Articles personnalisés
Les articles personnalisés (noms, textes ou formats sur mesure) sont fabriqués exclusivement pour vous.

## Propriété intellectuelle
Les modèles, photos et textes du site appartiennent à Fantaisie 3D. Nous ne fabriquons pas de répliques de marques ou de personnages protégés sans autorisation.

## Droit applicable
Les présentes conditions sont régies par les lois du Québec et les lois fédérales du Canada qui s’y appliquent, sans limiter les lois de protection du consommateur de votre province.`,
    },
    {
      key: "returns", title: "Politique de retours et d’échanges",
      body: `## Retours
Les articles non utilisés et non personnalisés peuvent être retournés dans les 30 jours suivant la livraison pour un remboursement.

## Articles endommagés ou défectueux
Si votre pièce arrive endommagée ou présente un défaut de fabrication, écrivez-nous dans les 30 jours avec des photos. Nous la remplacerons ou la rembourserons sans frais.

## Variations naturelles
Les lignes de couche et les légères variations de teinte sont propres à l’impression 3D et ne sont pas des défauts.

## Articles personnalisés
Les articles personnalisés ne peuvent être retournés, sauf en cas de défaut.

## Comment faire une demande
Écrivez-nous en indiquant votre numéro de commande.`,
    },
    {
      key: "shipping", title: "Politique de livraison",
      body: `## Délais
Délai total = délai de fabrication + délai de livraison du service choisi.

## Services
Nous expédions avec Postes Canada et Chit Chats. Les options offertes s’affichent dans le panier après la saisie de votre code postal.

## Livraison gratuite
Les commandes supérieures au montant indiqué dans le panier sont livrées gratuitement avec le service économique.

## Cueillette sur place
Lorsqu’elle est offerte, la cueillette est gratuite et planifiée après la confirmation de la commande.

## Suivi
Votre numéro de suivi vous est envoyé par courriel et s’affiche dans « Mon compte » dès l’expédition.`,
    },
  ],
};
