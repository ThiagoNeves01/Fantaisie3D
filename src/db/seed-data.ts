// Dados fictícios de demonstração, fáceis de substituir pelo painel (todos os produtos têm isSample = true).
import type { I18nText, MarketCents } from "./schema";

type L3 = { pt: string; en: string; fr: string };
export const tr = (t: L3): I18nText => ({ "pt-BR": t.pt, "en-CA": t.en, "fr-CA": t.fr });

export const FILAMENT_COLORS: Record<string, { hex: string }> = {
  white: { hex: "#F1F1F3" },
  black: { hex: "#1A1B1E" },
  graphite: { hex: "#3A3E44" },
  turquoise: { hex: "#00C9D4" },
  petrol: { hex: "#087F89" },
  sand: { hex: "#D8C3A5" },
  terracotta: { hex: "#C8664A" },
  lilac: { hex: "#A99BD6" },
  sage: { hex: "#9DB59A" },
  yellow: { hex: "#F2C14E" },
};

export const COLOR_LABELS: Record<string, L3> = {
  white: { pt: "Branco", en: "White", fr: "Blanc" },
  black: { pt: "Preto", en: "Black", fr: "Noir" },
  graphite: { pt: "Grafite", en: "Graphite", fr: "Graphite" },
  turquoise: { pt: "Turquesa", en: "Turquoise", fr: "Turquoise" },
  petrol: { pt: "Petróleo", en: "Teal", fr: "Bleu pétrole" },
  sand: { pt: "Areia", en: "Sand", fr: "Sable" },
  terracotta: { pt: "Terracota", en: "Terracotta", fr: "Terre cuite" },
  lilac: { pt: "Lilás", en: "Lilac", fr: "Lilas" },
  sage: { pt: "Verde-sálvia", en: "Sage green", fr: "Vert sauge" },
  yellow: { pt: "Amarelo", en: "Yellow", fr: "Jaune" },
};

export const CATEGORIES = [
  {
    key: "organizers", image: "/products/organizador-colmeia-1.webp", sortOrder: 1, featured: true,
    name: { pt: "Organizadores", en: "Organizers", fr: "Organisateurs" },
    slug: { pt: "organizadores", en: "organizers", fr: "organisateurs" },
    description: {
      pt: "Organizadores de mesa, porta-objetos, organizadores para cozinha e acessórios funcionais.",
      en: "Desk organizers, catch-alls, kitchen organizers and functional accessories.",
      fr: "Organisateurs de bureau, vide-poches, rangements de cuisine et accessoires pratiques.",
    },
  },
  {
    key: "decor", image: "/products/vaso-onda-1.webp", sortOrder: 2, featured: true,
    name: { pt: "Decorativos", en: "Home decor", fr: "Décoration" },
    slug: { pt: "decorativos", en: "home-decor", fr: "decoration" },
    description: {
      pt: "Vasos, esculturas, mini bibliotecas, calendários perpétuos e objetos de decoração.",
      en: "Vases, sculptures, book nooks, perpetual calendars and decorative objects.",
      fr: "Vases, sculptures, mini-bibliothèques, calendriers perpétuels et objets déco.",
    },
  },
  {
    key: "collectibles", image: "/products/astronauta-orbit-1.webp", sortOrder: 3, featured: true,
    name: { pt: "Funko Pop e Colecionáveis", en: "Figures & Collectibles", fr: "Figurines et objets de collection" },
    slug: { pt: "colecionaveis", en: "collectibles", fr: "objets-de-collection" },
    description: {
      pt: "Bonecos estilizados, miniaturas, figuras decorativas e colecionáveis originais produzidos pela Fantaisie 3D.",
      en: "Stylized figures, miniatures, decorative figurines and original collectibles made by Fantaisie 3D.",
      fr: "Figurines stylisées, miniatures, figurines déco et objets de collection originaux fabriqués par Fantaisie 3D.",
    },
  },
  {
    key: "stands", image: "/products/suporte-controles-1.webp", sortOrder: 4, featured: true,
    name: { pt: "Suportes", en: "Stands", fr: "Supports" },
    slug: { pt: "suportes", en: "stands", fr: "supports" },
    description: {
      pt: "Suportes para controles de videogame, celulares, headphones, acessórios e equipamentos.",
      en: "Stands for game controllers, phones, headphones, accessories and gear.",
      fr: "Supports pour manettes de jeu, téléphones, casques d’écoute, accessoires et équipement.",
    },
  },
  {
    key: "personalized", image: "/products/chaveiro-nome-1.webp", sortOrder: 5, featured: false,
    name: { pt: "Presentes personalizados", en: "Personalized gifts", fr: "Cadeaux personnalisés" },
    slug: { pt: "presentes-personalizados", en: "personalized-gifts", fr: "cadeaux-personnalises" },
    description: {
      pt: "Peças com nomes, datas e cores escolhidas por você.",
      en: "Pieces with names, dates and colours of your choice.",
      fr: "Des pièces avec les noms, dates et couleurs de votre choix.",
    },
  },
] as const;

type SizeDef = { code: string; label: L3; delta: MarketCents; scale: number };
type ProductDef = {
  sku: string; slugBase: string; category: string; material: string;
  dims: [number, number, number]; productionDays: number; madeToOrder?: boolean;
  isNew?: boolean; featured?: boolean; customizable?: boolean; salesCount: number;
  images: number; colors: string[]; secondaryColors?: string[]; sizes?: SizeDef[]; silk?: boolean;
  text?: { maxLength: number; delta: MarketCents };
  markets: { BR?: { price: number; sale?: number; stock: number }; CA?: { price: number; sale?: number; stock: number } };
  name: L3; slug: L3; short: L3; description: L3; care?: L3;
};

const CARE_PLA: L3 = {
  pt: "Limpe com pano macio levemente úmido. Evite sol direto prolongado, carros fechados e temperaturas acima de 50 °C. Não use na lava-louças.",
  en: "Wipe with a soft, slightly damp cloth. Avoid prolonged direct sunlight, hot cars and temperatures above 50 °C. Not dishwasher safe.",
  fr: "Nettoyez avec un chiffon doux légèrement humide. Évitez le soleil direct prolongé, les voitures chaudes et les températures supérieures à 50 °C. Ne va pas au lave-vaisselle.",
};
const CARE_PETG: L3 = {
  pt: "Resistente à umidade e a temperaturas até 70 °C. Lave à mão com água e sabão neutro.",
  en: "Moisture resistant and stable up to 70 °C. Hand wash with mild soap and water.",
  fr: "Résiste à l’humidité et aux températures jusqu’à 70 °C. Lavez à la main avec de l’eau et un savon doux.",
};
const CARE_FIGURE: L3 = {
  pt: "Peça decorativa, não é brinquedo. Mantenha longe de crianças menores de 3 anos (peças pequenas). Tire o pó com pincel macio.",
  en: "Decorative item, not a toy. Keep away from children under 3 (small parts). Dust with a soft brush.",
  fr: "Objet décoratif, pas un jouet. Tenir hors de portée des enfants de moins de 3 ans (petites pièces). Dépoussiérez avec un pinceau doux.",
};

const VASE_SIZES: SizeDef[] = [
  { code: "S", label: { pt: "P · 14 cm", en: "S · 14 cm", fr: "P · 14 cm" }, delta: { BR: 0, CA: 0 }, scale: 0.7 },
  { code: "M", label: { pt: "M · 20 cm", en: "M · 20 cm", fr: "M · 20 cm" }, delta: { BR: 3000, CA: 900 }, scale: 1 },
  { code: "L", label: { pt: "G · 26 cm", en: "L · 26 cm", fr: "G · 26 cm" }, delta: { BR: 7000, CA: 2000 }, scale: 1.3 },
];
const FIG_SIZES: SizeDef[] = [
  { code: "S", label: { pt: "Mini · 8 cm", en: "Mini · 8 cm", fr: "Mini · 8 cm" }, delta: { BR: 0, CA: 0 }, scale: 0.65 },
  { code: "M", label: { pt: "Padrão · 12 cm", en: "Standard · 12 cm", fr: "Standard · 12 cm" }, delta: { BR: 2500, CA: 800 }, scale: 1 },
  { code: "L", label: { pt: "Grande · 18 cm", en: "Large · 18 cm", fr: "Grand · 18 cm" }, delta: { BR: 6000, CA: 1800 }, scale: 1.5 },
];

export const PRODUCTS: ProductDef[] = [
  {
    sku: "F3D-DEC-001", slugBase: "vaso-onda", category: "decor", material: "PLA", dims: [14, 20, 14], productionDays: 3,
    featured: true, salesCount: 186, images: 3, colors: ["turquoise", "sand", "white", "terracotta", "lilac"], sizes: VASE_SIZES, silk: true,
    markets: { BR: { price: 8990, stock: 12 }, CA: { price: 3400, stock: 6 } },
    name: { pt: "Vaso Onda", en: "Onda Wave Vase", fr: "Vase Onda" },
    slug: { pt: "vaso-onda", en: "onda-wave-vase", fr: "vase-onda" },
    short: {
      pt: "Vaso decorativo com curvas orgânicas e nervuras em espiral.",
      en: "Decorative vase with organic curves and spiral ribs.",
      fr: "Vase décoratif aux courbes organiques et nervures en spirale.",
    },
    description: {
      pt: "O Vaso Onda combina curvas suaves com nervuras em espiral que mudam com a luz ao longo do dia. Ideal para flores secas, galhos ou como peça única na estante. Por ser impresso em modo espiral, tem paredes finas e um brilho delicado. Para flores naturais, use um recipiente de vidro por dentro.",
      en: "The Onda vase pairs soft curves with spiral ribs that shift with the light throughout the day. Perfect for dried flowers, branches or as a stand-alone piece on a shelf. Printed in spiral mode, it has thin walls and a subtle sheen. For fresh flowers, place a glass insert inside.",
      fr: "Le vase Onda marie des courbes douces à des nervures en spirale qui changent avec la lumière au fil de la journée. Idéal pour les fleurs séchées, les branches ou seul sur une étagère. Imprimé en mode spirale, il a des parois fines et un léger lustre. Pour des fleurs fraîches, utilisez un contenant en verre à l’intérieur.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-DEC-002", slugBase: "vaso-onda-areia", category: "decor", material: "PLA", dims: [14, 20, 14], productionDays: 3,
    isNew: true, salesCount: 22, images: 2, colors: ["sand", "white", "sage"], sizes: VASE_SIZES,
    markets: { BR: { price: 8990, sale: 7490, stock: 8 }, CA: { price: 3400, sale: 2800, stock: 4 } },
    name: { pt: "Vaso Onda Edição Areia", en: "Onda Vase, Sand Edition", fr: "Vase Onda, édition Sable" },
    slug: { pt: "vaso-onda-edicao-areia", en: "onda-vase-sand-edition", fr: "vase-onda-edition-sable" },
    short: {
      pt: "Edição em tons neutros, perfeita para decoração escandinava.",
      en: "A neutral-toned edition, perfect for Scandinavian interiors.",
      fr: "Une édition aux tons neutres, parfaite pour un décor scandinave.",
    },
    description: {
      pt: "A mesma silhueta do Vaso Onda em filamento com acabamento fosco e tons naturais de areia, branco e sálvia. Combina com madeira clara, linho e plantas secas.",
      en: "The Onda silhouette in a matte filament with natural sand, white and sage tones. Pairs beautifully with light wood, linen and dried botanicals.",
      fr: "La silhouette du vase Onda dans un filament mat aux tons naturels de sable, de blanc et de sauge. S’agence avec le bois clair, le lin et les plantes séchées.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-DEC-003", slugBase: "mini-biblioteca", category: "decor", material: "PLA", dims: [18, 22, 10], productionDays: 6,
    madeToOrder: true, featured: true, customizable: true, salesCount: 74, images: 3, colors: ["graphite", "white", "black", "petrol"],
    markets: { BR: { price: 18990, stock: 0 }, CA: { price: 7200, stock: 0 } },
    name: { pt: "Mini Biblioteca Decorativa", en: "Mini Library Book Nook", fr: "Mini-bibliothèque décorative" },
    slug: { pt: "mini-biblioteca-decorativa", en: "mini-library-book-nook", fr: "mini-bibliotheque-decorative" },
    short: {
      pt: "Estante em miniatura com livrinhos coloridos e luminária de LED.",
      en: "A miniature bookcase with tiny colourful books and an LED lamp.",
      fr: "Une bibliothèque miniature avec de petits livres colorés et une lampe DEL.",
    },
    description: {
      pt: "Uma estante em miniatura com três prateleiras, livros pintados à mão e uma pequena luminária de LED (pilhas inclusas). Uma peça para quem ama livros, ótima para presentear. Cada unidade é montada à mão, por isso é produzida sob encomenda.",
      en: "A miniature three-shelf bookcase with hand-painted books and a small LED lamp (batteries included). A must for book lovers and a great gift. Each unit is hand-assembled, so it's made to order.",
      fr: "Une bibliothèque miniature à trois tablettes avec des livres peints à la main et une petite lampe DEL (piles incluses). Un incontournable pour les amoureux de lecture et une belle idée cadeau. Chaque pièce est assemblée à la main, donc fabriquée sur commande.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-DEC-004", slugBase: "calendario-perpetuo", category: "decor", material: "PLA", dims: [24, 9, 9], productionDays: 4,
    salesCount: 58, images: 3, colors: ["black", "white", "petrol", "terracotta"], secondaryColors: ["white", "black", "sand"],
    markets: { BR: { price: 11990, stock: 5 }, CA: { price: 4600, stock: 3 } },
    name: { pt: "Calendário Perpétuo de Cubos", en: "Perpetual Cube Calendar", fr: "Calendrier perpétuel à cubes" },
    slug: { pt: "calendario-perpetuo-cubos", en: "perpetual-cube-calendar", fr: "calendrier-perpetuel-cubes" },
    short: {
      pt: "Dois cubos e blocos de mês para marcar qualquer data, todo ano.",
      en: "Two cubes and month blocks to show any date, year after year.",
      fr: "Deux cubes et des blocs de mois pour afficher n’importe quelle date, année après année.",
    },
    description: {
      pt: "Com dois cubos numerados e 12 blocos de mês, o calendário forma qualquer data do ano. A base tem encaixes magnéticos que seguram as peças no lugar. Os meses vêm no idioma da loja em que você comprou.",
      en: "Two numbered cubes and 12 month blocks let you display any date of the year. The base has magnetic slots that keep the pieces in place. Month blocks are printed in the language of the store you buy from.",
      fr: "Deux cubes numérotés et 12 blocs de mois permettent d’afficher n’importe quelle date de l’année. La base aimantée garde les pièces bien en place. Les mois sont imprimés dans la langue de la boutique où vous achetez.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-DEC-005", slugBase: "escultura-orbita", category: "decor", material: "PLA Silk", dims: [16, 22, 16], productionDays: 5,
    isNew: true, featured: true, salesCount: 31, images: 3, colors: ["white", "black", "turquoise"], secondaryColors: ["turquoise", "petrol", "graphite"],
    markets: { BR: { price: 14990, stock: 4 }, CA: { price: 5900, stock: 2 } },
    name: { pt: "Escultura Órbita", en: "Orbit Sculpture", fr: "Sculpture Orbite" },
    slug: { pt: "escultura-orbita", en: "orbit-sculpture", fr: "sculpture-orbite" },
    short: {
      pt: "Nó geométrico contínuo com anel orbital, inspirado no emblema Fantaisie.",
      en: "A continuous geometric knot with an orbital ring, inspired by the Fantaisie emblem.",
      fr: "Un nœud géométrique continu entouré d’un anneau orbital, inspiré de l’emblème Fantaisie.",
    },
    description: {
      pt: "Uma escultura que só existe graças à impressão 3D: um nó contínuo, sem emendas, envolto por um anel orbital. Impressa em filamento silk, com brilho acetinado. Base em cor de destaque à sua escolha.",
      en: "A sculpture only 3D printing could make: a seamless continuous knot circled by an orbital ring. Printed in silk filament with a satin sheen. Base in the accent colour of your choice.",
      fr: "Une sculpture que seule l’impression 3D rend possible : un nœud continu, sans joint, entouré d’un anneau orbital. Imprimée en filament soyeux au fini satiné. Base dans la couleur d’accent de votre choix.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-DEC-006", slugBase: "vaso-suculenta", category: "decor", material: "PETG", dims: [15, 10, 15], productionDays: 3,
    salesCount: 96, images: 3, colors: ["terracotta", "white", "sage", "graphite"],
    markets: { BR: { price: 5990, sale: 4790, stock: 20 }, CA: { price: 2400, sale: 1900, stock: 10 } },
    name: { pt: "Vaso Heptagonal para Suculentas", en: "Heptagon Succulent Planter", fr: "Pot heptagonal pour plantes grasses" },
    slug: { pt: "vaso-heptagonal-suculentas", en: "heptagon-succulent-planter", fr: "pot-heptagonal-plantes-grasses" },
    short: {
      pt: "Vaso facetado com furo de drenagem, para suculentas e cactos.",
      en: "A faceted planter with a drainage hole, for succulents and cacti.",
      fr: "Un pot à facettes avec trou de drainage, pour plantes grasses et cactus.",
    },
    description: {
      pt: "Impresso em PETG, resistente à água e ao sol da janela. Tem furo de drenagem e pratinho encaixável. A planta da foto é ilustrativa e não acompanha o produto.",
      en: "Printed in PETG, it handles water and windowsill sun. Includes a drainage hole and snap-in saucer. Plant shown for illustration only, not included.",
      fr: "Imprimé en PETG, il résiste à l’eau et au soleil du rebord de fenêtre. Trou de drainage et soucoupe emboîtable inclus. Plante illustrée à titre indicatif, non incluse.",
    },
    care: CARE_PETG,
  },
  {
    sku: "F3D-ORG-001", slugBase: "organizador-colmeia", category: "organizers", material: "PLA", dims: [22, 12, 20], productionDays: 3,
    featured: true, salesCount: 142, images: 3, colors: ["white", "black", "turquoise", "sand"], secondaryColors: ["turquoise", "petrol", "white", "yellow"],
    markets: { BR: { price: 9990, stock: 15 }, CA: { price: 3900, stock: 8 } },
    name: { pt: "Organizador de Mesa Colmeia", en: "Honeycomb Desk Organizer", fr: "Organisateur de bureau Alvéole" },
    slug: { pt: "organizador-mesa-colmeia", en: "honeycomb-desk-organizer", fr: "organisateur-bureau-alveole" },
    short: {
      pt: "Sete módulos hexagonais em alturas diferentes para canetas e objetos.",
      en: "Seven hexagonal cells at different heights for pens and small items.",
      fr: "Sept alvéoles hexagonales de hauteurs variées pour crayons et petits objets.",
    },
    description: {
      pt: "Inspirado nas colmeias, o organizador tem sete compartimentos em alturas diferentes para canetas, pincéis, tesouras e clipes. Escolha a cor principal e a cor de destaque dos módulos.",
      en: "Inspired by honeycombs, this organizer has seven compartments at different heights for pens, brushes, scissors and clips. Choose the main colour and the accent colour of the cells.",
      fr: "Inspiré des alvéoles d’abeilles, cet organisateur compte sept compartiments de hauteurs différentes pour crayons, pinceaux, ciseaux et trombones. Choisissez la couleur principale et la couleur d’accent.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-ORG-002", slugBase: "porta-canetas-twist", category: "organizers", material: "PLA", dims: [10, 11, 10], productionDays: 2,
    salesCount: 210, images: 3, colors: ["petrol", "turquoise", "white", "black", "lilac", "yellow"],
    markets: { BR: { price: 4490, stock: 30 }, CA: { price: 1800, stock: 15 } },
    name: { pt: "Porta-Canetas Twist", en: "Twist Pen Holder", fr: "Porte-crayons Twist" },
    slug: { pt: "porta-canetas-twist", en: "twist-pen-holder", fr: "porte-crayons-twist" },
    short: {
      pt: "Porta-canetas torcido com nervuras, um clássico da mesa de trabalho.",
      en: "A twisted, ribbed pen holder, a desk classic.",
      fr: "Un porte-crayons torsadé et nervuré, un classique du bureau.",
    },
    description: {
      pt: "Um porta-canetas com torção suave e nervuras que dão textura e firmeza. Cabe cerca de 20 canetas e combina com o Organizador Colmeia.",
      en: "A pen holder with a gentle twist and ribs that add texture and strength. Holds about 20 pens and pairs with the Honeycomb Organizer.",
      fr: "Un porte-crayons à torsion douce, avec nervures pour la texture et la solidité. Contient environ 20 crayons et s’agence avec l’organisateur Alvéole.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-ORG-003", slugBase: "organizador-temperos", category: "organizers", material: "PETG", dims: [28, 14, 15], productionDays: 4,
    salesCount: 63, images: 3, colors: ["sand", "white", "black"],
    markets: { BR: { price: 12990, stock: 6 } }, // somente Brasil
    name: { pt: "Organizador de Temperos em Degraus", en: "Tiered Spice Rack", fr: "Étagère à épices à paliers" },
    slug: { pt: "organizador-temperos-degraus", en: "tiered-spice-rack", fr: "etagere-epices-paliers" },
    short: {
      pt: "Três degraus para 15 potes de tempero, com todos os rótulos visíveis.",
      en: "Three tiers for 15 spice jars, every label in view.",
      fr: "Trois paliers pour 15 pots d’épices, toutes les étiquettes bien visibles.",
    },
    description: {
      pt: "Organize a despensa ou a bancada com três degraus que deixam todos os potes à vista. Impresso em PETG, resistente à umidade da cozinha. Os potes não acompanham o produto.",
      en: "Organize your pantry or counter with three tiers that keep every jar in view. Printed in moisture-resistant PETG. Jars not included.",
      fr: "Organisez le garde-manger ou le comptoir grâce à trois paliers qui gardent chaque pot à la vue. Imprimé en PETG résistant à l’humidité. Pots non inclus.",
    },
    care: CARE_PETG,
  },
  {
    sku: "F3D-ORG-004", slugBase: "bandeja-organizadora", category: "organizers", material: "PLA", dims: [26, 4, 16], productionDays: 3,
    isNew: true, salesCount: 18, images: 3, colors: ["white", "black", "sand", "lilac"], secondaryColors: ["turquoise", "petrol", "yellow", "white"],
    markets: { BR: { price: 7990, stock: 10 }, CA: { price: 3200, stock: 5 } },
    name: { pt: "Bandeja Organizadora de Mesa", en: "Desk Organizer Tray", fr: "Plateau organisateur de bureau" },
    slug: { pt: "bandeja-organizadora-mesa", en: "desk-organizer-tray", fr: "plateau-organisateur-bureau" },
    short: {
      pt: "Bandeja com divisórias para lápis, post-its, clipes e pequenos objetos.",
      en: "A divided tray for pencils, sticky notes, clips and small items.",
      fr: "Un plateau à compartiments pour crayons, papillons adhésifs, trombones et petits objets.",
    },
    description: {
      pt: "Uma bandeja baixa com quatro divisórias em cor de destaque, pensada para gavetas e mesas. Os cantos internos arredondados facilitam pegar objetos pequenos e limpar.",
      en: "A low tray with four accent-colour dividers, designed for drawers and desks. Rounded inner corners make it easy to pick up small items and to clean.",
      fr: "Un plateau bas à quatre séparateurs de couleur d’accent, conçu pour les tiroirs et les bureaux. Les coins intérieurs arrondis facilitent la prise des petits objets et le nettoyage.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-COL-001", slugBase: "astronauta-orbit", category: "collectibles", material: "PLA", dims: [8, 12, 7], productionDays: 5,
    featured: true, customizable: true, salesCount: 128, images: 3, colors: ["white", "black", "lilac"], secondaryColors: ["turquoise", "yellow", "terracotta"], sizes: FIG_SIZES,
    markets: { BR: { price: 7990, stock: 9 }, CA: { price: 2900, stock: 5 } },
    name: { pt: "Mini Figura Astronauta Orbit", en: "Orbit Astronaut Mini Figure", fr: "Mini-figurine Astronaute Orbit" },
    slug: { pt: "mini-figura-astronauta-orbit", en: "orbit-astronaut-mini-figure", fr: "mini-figurine-astronaute-orbit" },
    short: {
      pt: "Personagem original da Fantaisie 3D, com visor brilhante e antena.",
      en: "An original Fantaisie 3D character with a glossy visor and antenna.",
      fr: "Un personnage original de Fantaisie 3D, avec visière brillante et antenne.",
    },
    description: {
      pt: "Orbit é o explorador oficial da Fantaisie 3D: um personagem original, criado e modelado pela nossa equipe. Visor com acabamento brilhante, detalhes em cor de destaque e três tamanhos para colecionar.",
      en: "Orbit is the official Fantaisie 3D explorer: an original character designed and modelled by our team. Glossy visor, accent-colour details and three sizes to collect.",
      fr: "Orbit est l’explorateur officiel de Fantaisie 3D : un personnage original conçu et modélisé par notre équipe. Visière au fini brillant, détails de couleur d’accent et trois formats à collectionner.",
    },
    care: CARE_FIGURE,
  },
  {
    sku: "F3D-COL-002", slugBase: "robo-bolt", category: "collectibles", material: "PLA", dims: [9, 12, 7], productionDays: 5,
    salesCount: 87, images: 3, colors: ["turquoise", "white", "yellow"], secondaryColors: ["graphite", "black", "white"], sizes: FIG_SIZES,
    markets: { BR: { price: 7490, stock: 7 }, CA: { price: 2700, stock: 4 } },
    name: { pt: "Robô Colecionável Bolt", en: "Bolt Collectible Robot", fr: "Robot de collection Bolt" },
    slug: { pt: "robo-colecionavel-bolt", en: "bolt-collectible-robot", fr: "robot-collection-bolt" },
    short: {
      pt: "Robozinho original com olhos luminosos e braços articulados.",
      en: "An original little robot with glowing eyes and poseable arms.",
      fr: "Un petit robot original aux yeux lumineux et aux bras articulés.",
    },
    description: {
      pt: "Bolt é um personagem original da Fantaisie 3D. Braços articulados, olhos impressos em filamento que brilha no escuro e antena removível.",
      en: "Bolt is an original Fantaisie 3D character. Poseable arms, eyes printed in glow-in-the-dark filament and a removable antenna.",
      fr: "Bolt est un personnage original de Fantaisie 3D. Bras articulés, yeux imprimés en filament phosphorescent et antenne amovible.",
    },
    care: CARE_FIGURE,
  },
  {
    sku: "F3D-COL-003", slugBase: "robo-bolt-grafite", category: "collectibles", material: "PLA", dims: [9, 12, 7], productionDays: 5,
    isNew: true, salesCount: 12, images: 2, colors: ["graphite"], secondaryColors: ["turquoise"],
    markets: { CA: { price: 3200, stock: 3 } }, // edição exclusiva do Canadá
    name: { pt: "Robô Bolt Edição Grafite", en: "Bolt Robot, Graphite Edition", fr: "Robot Bolt, édition Graphite" },
    slug: { pt: "robo-bolt-edicao-grafite", en: "bolt-robot-graphite-edition", fr: "robot-bolt-edition-graphite" },
    short: {
      pt: "Edição limitada em grafite com detalhes turquesa.",
      en: "Limited edition in graphite with turquoise details.",
      fr: "Édition limitée en graphite avec détails turquoise.",
    },
    description: {
      pt: "Edição limitada do Bolt em grafite fosco com olhos turquesa luminosos. Disponível somente na loja do Canadá.",
      en: "A limited edition of Bolt in matte graphite with glowing turquoise eyes. Available exclusively in our Canada store.",
      fr: "Une édition limitée de Bolt en graphite mat aux yeux turquoise lumineux. Offerte exclusivement dans notre boutique canadienne.",
    },
    care: CARE_FIGURE,
  },
  {
    sku: "F3D-SUP-001", slugBase: "suporte-controles", category: "stands", material: "PETG", dims: [24, 22, 13], productionDays: 3,
    featured: true, salesCount: 175, images: 3, colors: ["graphite", "black", "white", "turquoise"],
    markets: { BR: { price: 8990, sale: 7490, stock: 14 }, CA: { price: 3500, sale: 2900, stock: 7 } },
    name: { pt: "Suporte Duplo para Controles", en: "Dual Controller Stand", fr: "Support double pour manettes" },
    slug: { pt: "suporte-duplo-controles", en: "dual-controller-stand", fr: "support-double-manettes" },
    short: {
      pt: "Guarde dois controles de videogame na vertical, com estilo.",
      en: "Store two game controllers upright, in style.",
      fr: "Rangez deux manettes de jeu à la verticale, avec style.",
    },
    description: {
      pt: "Suporte em dois níveis para controles dos principais consoles. Braços com borda de apoio e base larga antiderrapante. Os controles da foto são ilustrativos e não acompanham o produto.",
      en: "A two-level stand that fits controllers from the major consoles. Arms with a front lip and a wide non-slip base. Controllers shown for illustration only, not included.",
      fr: "Un support à deux niveaux compatible avec les manettes des principales consoles. Bras avec rebord et large base antidérapante. Manettes illustrées à titre indicatif, non incluses.",
    },
    care: CARE_PETG,
  },
  {
    sku: "F3D-SUP-002", slugBase: "suporte-headphone", category: "stands", material: "PETG", dims: [17, 26, 17], productionDays: 3,
    salesCount: 92, images: 3, colors: ["black", "white", "graphite"], secondaryColors: ["turquoise", "petrol", "black"],
    markets: { BR: { price: 9490, stock: 9 }, CA: { price: 3700, stock: 5 } },
    name: { pt: "Suporte para Headphone Curva", en: "Curve Headphone Stand", fr: "Support pour casque Courbe" },
    slug: { pt: "suporte-headphone-curva", en: "curve-headphone-stand", fr: "support-casque-courbe" },
    short: {
      pt: "Haste ondulada e apoio largo que protege o arco do fone.",
      en: "A wavy stem with a wide cradle that protects the headband.",
      fr: "Une tige ondulée et un appui large qui protège l’arceau du casque.",
    },
    description: {
      pt: "A haste em curva dá leveza ao suporte, e o apoio superior largo distribui o peso sem marcar o arco do fone. A base pesada evita que tombe.",
      en: "The curved stem keeps it light-looking, while the wide top cradle spreads the weight without marking the headband. A weighted base keeps it steady.",
      fr: "La tige courbée allège l’ensemble, et le large appui répartit le poids sans marquer l’arceau. La base lestée assure la stabilité.",
    },
    care: CARE_PETG,
  },
  {
    sku: "F3D-SUP-003", slugBase: "suporte-celular", category: "stands", material: "PLA", dims: [9, 13, 11], productionDays: 2,
    salesCount: 164, images: 3, colors: ["white", "black", "turquoise", "lilac", "sage"],
    markets: { BR: { price: 3990, stock: 25 }, CA: { price: 1600, stock: 12 } },
    name: { pt: "Suporte de Celular Inclinado", en: "Angled Phone Stand", fr: "Support incliné pour téléphone" },
    slug: { pt: "suporte-celular-inclinado", en: "angled-phone-stand", fr: "support-incline-telephone" },
    short: {
      pt: "Ângulo ideal para chamadas de vídeo, com passagem para o cabo.",
      en: "The ideal angle for video calls, with a cable pass-through.",
      fr: "L’angle idéal pour les appels vidéo, avec passe-câble.",
    },
    description: {
      pt: "Inclinação de 65° para ver vídeos e fazer chamadas, com abertura para carregar o celular no suporte. Compatível com aparelhos de até 8 mm de espessura com capinha.",
      en: "A 65° angle for videos and calls, with an opening to charge your phone while it rests. Fits phones up to 8 mm thick with a case.",
      fr: "Une inclinaison de 65° pour les vidéos et les appels, avec une ouverture pour recharger le téléphone. Compatible avec les appareils jusqu’à 8 mm d’épaisseur avec étui.",
    },
    care: CARE_PLA,
  },
  {
    sku: "F3D-PER-001", slugBase: "chaveiro-nome", category: "personalized", material: "PETG", dims: [7, 0.6, 2.4], productionDays: 2,
    customizable: true, featured: true, salesCount: 233, images: 3, colors: ["petrol", "turquoise", "black", "lilac", "terracotta"], secondaryColors: ["white", "black", "yellow"],
    text: { maxLength: 12, delta: { BR: 0, CA: 0 } },
    markets: { BR: { price: 2490, stock: 50 }, CA: { price: 1200, stock: 30 } },
    name: { pt: "Chaveiro Personalizado com Nome", en: "Personalized Name Keychain", fr: "Porte-clés personnalisé avec nom" },
    slug: { pt: "chaveiro-personalizado-nome", en: "personalized-name-keychain", fr: "porte-cles-personnalise-nom" },
    short: {
      pt: "Seu nome em relevo, em duas cores, com argola de metal.",
      en: "Your name in raised lettering, in two colours, with a metal ring.",
      fr: "Votre nom en relief, en deux couleurs, avec anneau en métal.",
    },
    description: {
      pt: "Chaveiro com nome ou palavra de até 12 caracteres em relevo, impresso em duas cores e com argola de metal. Ótimo para presentes, lembrancinhas e identificação de mochilas.",
      en: "A keychain with a name or word of up to 12 characters in raised lettering, printed in two colours, with a metal ring. Great for gifts, party favours and backpack tags.",
      fr: "Un porte-clés avec un nom ou un mot de 12 caractères maximum en relief, imprimé en deux couleurs, avec anneau en métal. Parfait pour les cadeaux, les souvenirs et l’identification des sacs.",
    },
    care: CARE_PETG,
  },
];

export const FINISH_OPTIONS = [
  { code: "matte", label: { pt: "Fosco padrão", en: "Standard matte", fr: "Mat standard" }, delta: { BR: 0, CA: 0 } },
  { code: "silk", label: { pt: "Silk acetinado", en: "Satin silk", fr: "Soyeux satiné" }, delta: { BR: 1500, CA: 500 } },
];

export const REVIEWS: { sku: string; rating: number; author: string; text: L3 }[] = [
  { sku: "F3D-DEC-001", rating: 5, author: "Mariana C.", text: { pt: "Ficou lindo na estante, a textura é ainda mais bonita pessoalmente.", en: "Looks beautiful on my shelf, the texture is even nicer in person.", fr: "Magnifique sur ma tablette, la texture est encore plus belle en vrai." } },
  { sku: "F3D-DEC-001", rating: 4, author: "Lucas P.", text: { pt: "Chegou bem embalado. O tamanho G é imponente!", en: "Arrived well packed. The large size makes a statement!", fr: "Bien emballé. Le grand format fait son effet!" } },
  { sku: "F3D-ORG-001", rating: 5, author: "Renata S.", text: { pt: "Minha mesa nunca esteve tão organizada. Amei a combinação de cores.", en: "My desk has never been this tidy. Love the colour combo.", fr: "Mon bureau n’a jamais été aussi bien rangé. J’adore l’agencement des couleurs." } },
  { sku: "F3D-COL-001", rating: 5, author: "Thiago N.", text: { pt: "O Orbit é muito fofo e bem acabado. Já quero a coleção toda.", en: "Orbit is adorable and beautifully finished. I want the whole set.", fr: "Orbit est adorable et très bien fini. Je veux toute la collection." } },
  { sku: "F3D-SUP-001", rating: 5, author: "Gabriel M.", text: { pt: "Firme e bonito, os controles encaixam certinho.", en: "Sturdy and good-looking, the controllers fit perfectly.", fr: "Solide et beau, les manettes s’y placent parfaitement." } },
  { sku: "F3D-SUP-001", rating: 4, author: "Ana L.", text: { pt: "Ótimo custo-benefício. Prazo de produção cumprido.", en: "Great value. Production time was right on schedule.", fr: "Excellent rapport qualité-prix. Délai de fabrication respecté." } },
  { sku: "F3D-PER-001", rating: 5, author: "Juliana F.", text: { pt: "Fiz para as lembrancinhas do aniversário, todo mundo amou!", en: "Made them as party favours and everyone loved them!", fr: "Je les ai offerts en souvenirs de fête, tout le monde a adoré!" } },
  { sku: "F3D-DEC-003", rating: 5, author: "Camila R.", text: { pt: "Presente perfeito para minha irmã que ama ler. Detalhes incríveis.", en: "The perfect gift for my book-loving sister. Amazing details.", fr: "Le cadeau parfait pour ma sœur qui adore lire. Des détails incroyables." } },
  { sku: "F3D-SUP-003", rating: 4, author: "Pedro H.", text: { pt: "Uso todo dia nas reuniões. Simples e funcional.", en: "I use it every day for meetings. Simple and practical.", fr: "Je l’utilise tous les jours pour mes réunions. Simple et pratique." } },
  { sku: "F3D-DEC-006", rating: 5, author: "Beatriz A.", text: { pt: "Minha suculenta ficou feliz! O pratinho é muito prático.", en: "My succulent is thriving! The saucer is very handy.", fr: "Ma plante grasse est ravie! La soucoupe est très pratique." } },
];

export const COLLECTIONS = [
  { key: "home-office", seasonal: false, image: "/products/organizador-colmeia-1.webp", labels: { pt: "Home office criativo", en: "Creative home office", fr: "Bureau à domicile créatif" }, skus: ["F3D-ORG-001", "F3D-ORG-002", "F3D-ORG-004", "F3D-SUP-003", "F3D-SUP-002"] },
  { key: "holidays", seasonal: true, image: "/images/banner-custom.webp", labels: { pt: "Presentes de fim de ano", en: "Holiday gifts", fr: "Cadeaux des Fêtes" }, skus: ["F3D-PER-001", "F3D-COL-001", "F3D-DEC-003", "F3D-DEC-005", "F3D-COL-002"] },
  { key: "gamer", seasonal: false, image: "/products/suporte-controles-1.webp", labels: { pt: "Setup gamer", en: "Gaming setup", fr: "Coin gamer" }, skus: ["F3D-SUP-001", "F3D-SUP-002", "F3D-COL-002", "F3D-COL-003"] },
];

export const SHIPPING = {
  BR: {
    name: "Fantaisie 3D Brasil",
    origin: { city: "São Paulo", region: "SP", postalCode: "01310-100", country: "BR" },
    pickupAddress: "Ateliê Fantaisie 3D, São Paulo/SP (endereço enviado após a confirmação)",
    freeShippingMin: 29900,
    payments: ["pix", "card"],
    rules: [
      { code: "pac", carrier: "Correios", labels: { "pt-BR": "PAC (Correios)", "en-CA": "PAC (Correios)", "fr-CA": "PAC (Correios)" }, baseCents: 2290, perItemCents: 300, minDays: 5, maxDays: 10 },
      { code: "sedex", carrier: "Correios", labels: { "pt-BR": "SEDEX (Correios)", "en-CA": "SEDEX (Correios)", "fr-CA": "SEDEX (Correios)" }, baseCents: 3890, perItemCents: 500, minDays: 2, maxDays: 4 },
    ],
  },
  CA: {
    name: "Fantaisie 3D Canada",
    origin: { city: "Montréal", region: "QC", postalCode: "H2X 1Y4", country: "CA" },
    pickupAddress: "Atelier Fantaisie 3D, Montréal (QC)",
    freeShippingMin: 10000,
    payments: ["card", "apple_pay", "google_pay"],
    rules: [
      { code: "chitchats", carrier: "Chit Chats", labels: { "pt-BR": "Chit Chats Econômico", "en-CA": "Chit Chats Economy", "fr-CA": "Chit Chats Économique" }, baseCents: 990, perItemCents: 150, minDays: 4, maxDays: 9 },
      { code: "expedited", carrier: "Canada Post", labels: { "pt-BR": "Canada Post Expedited", "en-CA": "Canada Post Expedited", "fr-CA": "Postes Canada Accélérés" }, baseCents: 1590, perItemCents: 200, minDays: 2, maxDays: 5 },
    ],
  },
};

// Impostos do Canadá (taxas vigentes conhecidas; o administrador deve confirmar com o contador).
export const CA_TAXES: { region: string; code: string; rate: string; label: L3 }[] = [
  { region: "*", code: "GST", rate: "0.05", label: { pt: "GST (federal)", en: "GST", fr: "TPS" } },
  { region: "QC", code: "QST", rate: "0.09975", label: { pt: "QST (Québec)", en: "QST", fr: "TVQ" } },
  { region: "ON", code: "HST", rate: "0.13", label: { pt: "HST", en: "HST", fr: "TVH" } },
  { region: "NB", code: "HST", rate: "0.15", label: { pt: "HST", en: "HST", fr: "TVH" } },
  { region: "NL", code: "HST", rate: "0.15", label: { pt: "HST", en: "HST", fr: "TVH" } },
  { region: "NS", code: "HST", rate: "0.14", label: { pt: "HST", en: "HST", fr: "TVH" } },
  { region: "PE", code: "HST", rate: "0.15", label: { pt: "HST", en: "HST", fr: "TVH" } },
  { region: "BC", code: "PST", rate: "0.07", label: { pt: "PST (BC)", en: "PST", fr: "TVP" } },
  { region: "MB", code: "PST", rate: "0.07", label: { pt: "RST (MB)", en: "RST", fr: "TVD" } },
  { region: "SK", code: "PST", rate: "0.06", label: { pt: "PST (SK)", en: "PST", fr: "TVP" } },
];

export const COUPONS = [
  { code: "BEMVINDO10", market: "BR" as const, type: "PERCENT" as const, value: 10, minSubtotal: 10000 },
  { code: "FRETEGRATIS", market: "BR" as const, type: "FREE_SHIPPING" as const, value: 0, minSubtotal: 15000 },
  { code: "WELCOME10", market: "CA" as const, type: "PERCENT" as const, value: 10, minSubtotal: 4000 },
  { code: "BIENVENUE10", market: "CA" as const, type: "PERCENT" as const, value: 10, minSubtotal: 4000 },
];
