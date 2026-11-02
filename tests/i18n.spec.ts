import { test, expect, type Page } from "@playwright/test";

async function switchTo(page: Page, key: "br" | "ca-en" | "ca-fr") {
  await page.waitForLoadState("networkidle"); // espera a hidratação após a navegação anterior
  await page.getByTestId("region-switcher").first().hover();
  await page.getByTestId(`region-${key}`).click();
}

test.describe("Idioma e país", () => {
  test("raiz redireciona para o Brasil por padrão e mostra a bandeira do Brasil", async ({ page }) => {
    await page.context().setExtraHTTPHeaders({ "accept-language": "pt-BR" });
    await page.goto("/");
    await expect(page).toHaveURL(/\/br$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByTestId("region-switcher").first()).toContainText("PT");
  });

  test("menu abre ao passar o mouse e troca toda a interface para inglês (Canadá)", async ({ page }) => {
    await page.goto("/br");
    await page.getByTestId("region-switcher").first().hover();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByTestId("region-ca-en")).toContainText("Canada — English");
    await expect(page.getByTestId("region-ca-en")).toContainText("CAD / CA$");
    await page.getByTestId("region-ca-en").click();
    await expect(page).toHaveURL(/\/ca\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-CA");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Imagination takes shape.");
    const nav = page.getByRole("navigation").first();
    await expect(nav).toContainText("Products");
    await expect(nav).toContainText("About us");
    // sem mistura de idiomas na interface principal
    const body = await page.locator("body").innerText();
    for (const pt of ["Adicionar ao carrinho", "Mais vendidos", "Sobre nós", "Personalizados", "Explorar produtos"]) expect(body).not.toContain(pt);
    await expect(page.locator("footer")).toContainText("Canadian dollars");
  });

  test("francês canadense: textos, moeda e formatação", async ({ page }) => {
    await page.goto("/br");
    await switchTo(page, "ca-fr");
    await expect(page).toHaveURL(/\/ca\/fr$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr-CA");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("L’imagination prend forme.");
    await expect(page.getByRole("link", { name: "Donnez vie à votre imagination." }).or(page.getByRole("heading", { name: "Donnez vie à votre imagination." }))).toBeVisible();
    const prices = await page.getByTestId("product-card").first().locator("p").allInnerTexts();
    expect(prices.join(" ")).toMatch(/\d+,\d{2}\s\$/);
  });

  test("troca preserva a página atual (produto) com slug traduzido", async ({ page }) => {
    await page.goto("/br/produto/vaso-onda");
    await expect(page.getByTestId("product-title")).toHaveText("Vaso Onda");
    await expect(page.getByTestId("product-price")).toContainText("R$ 89,90");
    await switchTo(page, "ca-fr");
    await expect(page).toHaveURL(/\/ca\/fr\/produit\/vase-onda$/);
    await expect(page.getByTestId("product-title")).toHaveText("Vase Onda");
    await expect(page.getByTestId("product-price")).toContainText("34,00 $");
    await switchTo(page, "ca-en");
    await expect(page).toHaveURL(/\/ca\/en\/product\/onda-wave-vase$/);
    await expect(page.getByTestId("product-price")).toContainText("$34.00");
    await expect(page.getByTestId("add-to-cart")).toHaveText("Add to cart");
  });

  test("troca preserva páginas institucionais e o catálogo", async ({ page }) => {
    await page.goto("/br/sobre");
    await switchTo(page, "ca-en");
    await expect(page).toHaveURL(/\/ca\/en\/about$/);
    await page.goto("/ca/en/products");
    await switchTo(page, "br");
    await expect(page).toHaveURL(/\/br\/produtos$/);
  });

  test("escolha fica salva ao voltar ao site (cookie persistente)", async ({ page, context }) => {
    await page.goto("/br");
    await switchTo(page, "ca-fr");
    await expect(page).toHaveURL(/\/ca\/fr$/);
    const cookie = (await context.cookies()).find((c) => c.name === "f3d_store");
    expect(cookie?.value).toBe("ca-fr");
    expect(cookie!.expires).toBeGreaterThan(Date.now() / 1000 + 300 * 86400);
    const p2 = await context.newPage();
    await p2.goto("/");
    await expect(p2).toHaveURL(/\/ca\/fr$/);
  });

  test("catálogo e disponibilidade mudam por país", async ({ page }) => {
    // Organizador de temperos: somente Brasil
    await page.goto("/br/busca?q=temperos");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await page.goto("/ca/en/product/tiered-spice-rack");
    await expect(page.getByText("This product isn't available in this country.")).toBeVisible();
    // Robô Bolt grafite: exclusivo do Canadá
    await page.goto("/ca/en/search?q=graphite");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await page.goto("/br/busca?q=grafite edição");
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });

  test("SEO: hreflang nos três idiomas", async ({ page }) => {
    await page.goto("/br/produto/vaso-onda");
    const links = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) => els.map((e) => [e.getAttribute("hreflang"), e.getAttribute("href")]));
    const map = Object.fromEntries(links);
    expect(map["pt-BR"]).toContain("/br/produto/vaso-onda");
    expect(map["en-CA"]).toContain("/ca/en/product/onda-wave-vase");
    expect(map["fr-CA"]).toContain("/ca/fr/produit/vase-onda");
    expect(map["x-default"]).toBeTruthy();
  });
});
