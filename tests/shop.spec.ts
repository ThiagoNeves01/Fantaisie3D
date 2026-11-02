import { test, expect } from "@playwright/test";

test.describe("Catálogo e produto", () => {
  test("filtros: cor, promoção, preço e ordenação", async ({ page }) => {
    await page.goto("/br/produtos");
    const all = await page.getByTestId("product-card").count();
    expect(all).toBeGreaterThan(10);

    await page.getByTestId("color-terracotta").click();
    await expect(page).toHaveURL(/color=terracotta/);
    await expect.poll(() => page.getByTestId("product-card").count()).toBeLessThan(all);
    for (const t of await page.getByTestId("product-card").locator("h3").allInnerTexts()) expect(t.length).toBeGreaterThan(0);

    await page.getByTestId("clear-filters").click();
    await page.getByTestId("filter-sale").click();
    await expect(page).toHaveURL(/sale=1/);
    await expect.poll(() => page.getByTestId("product-card").count()).toBe(3); // 3 produtos em promoção no Brasil

    await page.goto("/br/produtos?sort=price_asc");
    const prices = (await page.getByTestId("product-card").locator("p span.font-display").allInnerTexts())
      .map((t) => Number(t.replace(/[^\d,]/g, "").replace(",", ".")));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    await page.getByTestId("price-min").fill("100");
    await page.getByTestId("price-apply").click();
    await expect(page).toHaveURL(/min=100/);
    await expect.poll(async () => (await page.getByTestId("product-card").count())).toBeGreaterThan(0);
    const filtered = (await page.getByTestId("product-card").locator("p span.font-display").allInnerTexts())
      .map((t) => Number(t.replace(/[^\d,]/g, "").replace(",", ".")));
    for (const p of filtered) expect(p).toBeGreaterThanOrEqual(100);
  });

  test("busca com sugestões automáticas e estado sem resultados", async ({ page }) => {
    await page.goto("/br");
    await page.getByTestId("search-toggle").click();
    await page.getByTestId("search-input").first().fill("vaso");
    await expect(page.getByRole("listbox")).toContainText("Vaso Onda");
    await page.getByTestId("search-input").first().fill("xyzabc");
    await expect(page.getByRole("listbox")).toContainText("Não encontramos nada");
    await page.goto("/br/busca?q=xyzabc");
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });

  test("personalização altera o preço final; medidas em polegadas", async ({ page }) => {
    await page.goto("/br/produto/vaso-onda");
    await expect(page.getByTestId("final-price")).toHaveText("R$ 89,90");
    await page.getByTestId("opt-SIZE-L").click();
    await expect(page.getByTestId("final-price")).toHaveText("R$ 159,90");
    await page.getByTestId("opt-FINISH-silk").click();
    await expect(page.getByTestId("final-price")).toHaveText("R$ 174,90");
    await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await expect(page.getByTestId("final-price")).toHaveText("R$ 349,80");
    await page.getByTestId("unit-in").click();
    await expect(page.getByText(/5,5 × 7,9 × 5,5 pol/)).toBeVisible();
  });
});

test.describe("Carrinho", () => {
  test("adicionar, alterar quantidade, cupom, frete e remover (Brasil)", async ({ page }) => {
    await page.goto("/br/produto/vaso-onda");
    await page.getByTestId("opt-SIZE-L").click();
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("added-toast")).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    await page.goto("/br/produto/chaveiro-personalizado-nome");
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByText("Selecione nome ou texto")).toBeVisible(); // texto obrigatório
    await page.getByTestId("custom-text").fill("MARIA");
    await page.getByTestId("buy-now").click();
    await expect(page).toHaveURL(/\/br\/carrinho$/);

    await expect(page.getByTestId("cart-line")).toHaveCount(2);
    await expect(page.getByTestId("cart-lines")).toContainText("MARIA");
    await expect(page.getByTestId("cart-lines")).toContainText("G · 26 cm");
    await expect(page.getByTestId("subtotal")).toHaveText("R$ 184,80");

    await page.getByTestId("qty-plus").first().click();
    await expect(page.getByTestId("subtotal")).toHaveText("R$ 344,70");

    await page.getByTestId("coupon-input").fill("BEMVINDO10");
    await page.getByTestId("coupon-apply").click();
    await expect(page.getByTestId("discount")).toHaveText("−R$ 34,47");

    await page.getByTestId("postal-input").fill("01310100");
    await page.getByTestId("postal-submit").click();
    await expect(page.getByTestId("shipping-options")).toContainText("PAC");
    await expect(page.getByTestId("shipping-options")).toContainText("Retirada local");
    await expect(page.getByTestId("totals")).toContainText("Impostos inclusos");
    // acima de R$ 299: frete grátis no PAC
    await expect(page.getByTestId("total")).toHaveText("R$ 310,23");

    await page.getByTestId("remove-line").first().click();
    await expect(page.getByTestId("cart-line")).toHaveCount(1);
  });

  test("Canadá: carrinho separado e impostos por província (TPS/TVQ e HST)", async ({ page }) => {
    await page.goto("/ca/fr/produit/support-double-manettes");
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("added-toast")).toBeVisible();
    await page.goto("/ca/fr/panier");
    await expect(page.getByTestId("cart-line")).toHaveCount(1); // não mistura com o carrinho BR
    await expect(page.getByTestId("subtotal")).toHaveText("29,00 $");
    await page.getByTestId("postal-input").fill("H2X1Y4");
    await page.getByTestId("postal-submit").click();
    await expect(page.getByTestId("tax-GST")).toBeVisible();
    await expect(page.getByTestId("tax-QST")).toBeVisible();
    await expect(page.getByTestId("totals")).toContainText("TVQ");
    await page.getByTestId("province-select").selectOption("ON");
    await expect(page.getByTestId("tax-HST")).toBeVisible();
    await expect(page.getByTestId("tax-QST")).toHaveCount(0);
  });
});
