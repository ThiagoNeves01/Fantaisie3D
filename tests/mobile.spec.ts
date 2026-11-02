import { test, expect } from "@playwright/test";

test.describe("Celular", () => {
  test("seletor de país abre ao tocar na bandeira", async ({ page }) => {
    await page.goto("/br");
    await page.getByTestId("region-switcher").first().tap();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByTestId("region-ca-fr").tap();
    await expect(page).toHaveURL(/\/ca\/fr$/);
  });

  test("menu hambúrguer, busca e navegação", async ({ page }) => {
    await page.goto("/br");
    await page.getByTestId("menu-button").tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: "Produtos" }).tap();
    await expect(page).toHaveURL(/\/br\/produtos$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("filtros em gaveta funcionam por toque", async ({ page }) => {
    await page.goto("/br/produtos");
    await page.getByTestId("filters-open").tap();
    await page.getByRole("dialog").getByTestId("color-white").tap();
    await expect(page).toHaveURL(/color=white/);
    await page.getByRole("dialog").getByRole("button", { name: /Ver resultados/ }).tap();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("sem rolagem horizontal nas páginas principais", async ({ page }) => {
    for (const p of ["/br", "/br/produtos", "/br/produto/vaso-onda", "/br/carrinho", "/br/personalizados", "/ca/fr", "/br/entrar"]) {
      await page.goto(p);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, p).toBeLessThanOrEqual(0);
    }
  });

  test("adicionar ao carrinho pelo celular", async ({ page }) => {
    await page.goto("/br/produto/suporte-celular-inclinado");
    await page.getByTestId("add-to-cart").tap();
    await expect(page.getByTestId("added-toast")).toBeVisible();
    await page.getByTestId("cart-link").tap();
    await expect(page.getByTestId("cart-line")).toHaveCount(1);
  });
});
