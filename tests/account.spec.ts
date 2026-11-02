import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const unique = () => `teste+${Date.now()}${Math.floor(Math.random() * 1000)}@fantaisie3d.dev`;

test.describe("Cadastro, login e área do cliente", () => {
  test("cadastro com validação, confirmação de e-mail, logout e login", async ({ page }) => {
    const email = unique();
    await page.goto("/br/cadastro");
    await page.getByTestId("register-submit").click();
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expect(page.getByText("É preciso aceitar os termos")).toBeVisible();

    await page.getByLabel("Nome completo").fill("Ana Teste");
    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("fraca");
    await page.getByLabel("Confirmar senha").fill("fraca");
    await page.getByTestId("terms").check();
    await page.getByTestId("register-submit").click();
    await expect(page.getByText(/pelo menos 8 caracteres/)).toBeVisible();
    await expect(page.getByText("É preciso aceitar os termos")).toHaveCount(0);

    await page.getByLabel("Senha", { exact: true }).fill("SenhaForte123");
    await page.getByLabel("Confirmar senha").fill("SenhaForte123");
    await page.getByTestId("terms").check();
    await page.getByTestId("register-submit").click();
    await expect(page).toHaveURL(/\/br\/conta\?welcome=1/);
    await expect(page.getByTestId("account-hello")).toHaveText("Olá, Ana");
    await expect(page.getByTestId("email-status")).toContainText("não confirmado");

    // confirmação pelo link do e-mail (caixa de saída de desenvolvimento)
    await page.goto("/br/dev-emails");
    const iframe = page.frameLocator("iframe").first();
    const link = await iframe.getByRole("link", { name: "Confirmar e-mail" }).getAttribute("href");
    await page.goto(link!.replace(/^https?:\/\/[^/]+/, ""));
    await expect(page.getByTestId("verify-result")).toHaveText("E-mail confirmado. Obrigado!");
    await page.goto("/br/conta");
    await expect(page.getByTestId("email-status")).toContainText("E-mail confirmado");

    await page.getByTestId("logout").click();
    await expect(page).toHaveURL(/\/br$/);
    await page.goto("/br/conta");
    await expect(page).toHaveURL(/\/br\/entrar\?next=/);

    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("errada123");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("form-message")).toHaveText("E-mail ou senha incorretos.");
    await page.getByLabel("Senha", { exact: true }).fill("SenhaForte123");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/br\/conta$/);
  });

  test("recuperação de senha pelo e-mail", async ({ page }) => {
    await page.goto("/br/recuperar-senha");
    await page.getByLabel("E-mail", { exact: true }).fill("cliente@fantaisie3d.dev");
    await page.getByTestId("forgot-submit").click();
    await expect(page.getByTestId("form-message")).toContainText("Se houver uma conta");
    await page.goto("/br/dev-emails");
    const link = await page.frameLocator("iframe").first().getByRole("link", { name: "Criar nova senha" }).getAttribute("href");
    await page.goto(link!.replace(/^https?:\/\/[^/]+/, ""));
    await page.getByLabel("Nova senha").fill("Cliente12345");
    await page.getByLabel("Confirmar senha").fill("Cliente12345");
    await page.getByTestId("reset-submit").click();
    await expect(page).toHaveURL(/\/br\/entrar\?reset=1/);
    await expect(page.getByText("Senha alterada")).toBeVisible();
    // o link não pode ser reutilizado
    await page.goto(link!.replace(/^https?:\/\/[^/]+/, ""));
    await page.getByLabel("Nova senha").fill("Outra12345");
    await page.getByLabel("Confirmar senha").fill("Outra12345");
    await page.getByTestId("reset-submit").click();
    await expect(page.getByTestId("form-message")).toContainText("inválido ou expirou");
  });

  test("cliente demo: pedidos com produção e rastreio, favoritos, endereço e preferência", async ({ page }) => {
    await page.goto("/br/entrar");
    await page.getByLabel("E-mail", { exact: true }).fill("cliente@fantaisie3d.dev");
    await page.getByLabel("Senha", { exact: true }).fill("Cliente12345");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/br\/conta$/);

    await page.goto("/br/conta/pedidos");
    await expect(page.getByTestId("order-card")).toHaveCount(3);
    await expect(page.getByText("QB123456789BR")).toBeVisible();
    await expect(page.getByText("Produção: Em impressão")).toBeVisible();
    await expect(page.getByText("Pedido CA-20114")).toBeVisible();
    await expect(page.getByTestId("order-card").filter({ hasText: "CA-20114" })).toContainText("$"); // valores na moeda do pedido

    await page.goto("/br/produto/vaso-onda");
    // idempotente: se já estiver nos favoritos, remove e adiciona de novo
    if ((await page.getByTestId("favorite-page").getAttribute("aria-pressed")) === "true") {
      await page.getByTestId("favorite-page").click();
      await expect(page.getByTestId("favorite-page")).toHaveAttribute("aria-pressed", "false");
    }
    await page.getByTestId("favorite-page").click();
    await expect(page.getByTestId("favorite-page")).toHaveAttribute("aria-pressed", "true");
    await page.goto("/br/conta/favoritos");
    await expect(page.getByTestId("favorites-list")).toContainText("Vaso Onda");

    await page.goto("/br/conta/enderecos");
    await page.getByLabel("Destinatário").fill("Cliente Exemplo");
    await page.getByLabel("CEP").fill("01310-100");
    await page.getByLabel("Rua / Avenida").fill("Av. Paulista");
    await page.getByLabel("Número").fill("1000");
    await page.getByLabel("Cidade").fill("São Paulo");
    await page.getByLabel("Estado (UF)").fill("SP");
    await page.getByTestId("address-save").click();
    await expect(page.getByTestId("address-list")).toContainText("Av. Paulista, 1000");

    // preferência salva na conta: trocar país enquanto logado e entrar de novo
    await page.goto("/br/conta");
    await page.getByTestId("region-switcher").last().click();
    await page.getByTestId("region-ca-en").last().click();
    await expect(page).toHaveURL(/\/ca\/en\/account$/);
    await expect(page.getByTestId("pref-store")).toContainText("Canada — English");
    await page.waitForLoadState("networkidle");
    // volta a preferência para o Brasil (estado inicial do cliente demo)
    await page.getByTestId("region-switcher").last().click();
    await page.getByTestId("region-br").last().click();
    await expect(page).toHaveURL(/\/br\/conta$/);
  });

  test("favoritos exigem login", async ({ page }) => {
    await page.goto("/br/produtos");
    await page.getByRole("button", { name: "Adicionar aos favoritos" }).first().click();
    await expect(page).toHaveURL(/\/br\/entrar\?next=.*&fav=1/);
    await expect(page.getByText("Entre na sua conta para salvar favoritos.")).toBeVisible();
  });
});

test.describe("Formulários", () => {
  test("orçamento personalizado com imagem e STL", async ({ page }) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "f3d-"));
    const png = path.join(dir, "ref.png");
    fs.writeFileSync(png, Buffer.from("89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA6364F8FF1F0005FE02FEA7D6A4520000000049454E44AE426082", "hex"));
    const stl = path.join(dir, "peca.stl");
    fs.writeFileSync(stl, "solid peca\nendsolid peca\n");
    const fake = path.join(dir, "virus.stl");
    fs.writeFileSync(fake, Buffer.from("MZ\x90\x00 nao e um stl valido de verdade, so bytes aleatorios ".repeat(3)));

    await page.goto("/br/personalizados");
    await page.getByLabel("Nome", { exact: true }).fill("Bruno");
    await page.getByLabel("E-mail", { exact: true }).fill("bruno@exemplo.com");
    await page.getByTestId("quote-description").fill("curto");
    await page.getByTestId("quote-submit").click();
    await expect(page.getByText("pelo menos 20 caracteres")).toBeVisible();

    await page.getByTestId("quote-description").fill("Quero um suporte de parede para três skates, em preto fosco.");
    await page.getByTestId("file-models").setInputFiles(fake);
    await page.getByTestId("quote-submit").click();
    await expect(page.getByText("Tipo de arquivo não permitido")).toBeVisible();

    await page.getByTestId("file-images").setInputFiles(png);
    await page.getByTestId("file-models").setInputFiles(stl);
    await page.getByTestId("quote-submit").click();
    await expect(page.getByTestId("quote-success")).toContainText(/Solicitação Q\d{4}-\w+ enviada/);
    await expect(page.getByTestId("quote-success")).toContainText("não é uma compra");
  });

  test("contato e newsletter", async ({ page }) => {
    await page.goto("/ca/en/contact");
    await page.getByLabel("Name").fill("Jo");
    await page.getByLabel("Email", { exact: true }).fill("jo@example.com");
    await page.getByLabel("Subject").fill("Custom order");
    await page.getByLabel("Message").fill("Hello there, do you ship to Halifax?");
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-success")).toHaveText("Message sent! We'll get back to you soon.");

    const email = `nl${Date.now()}@example.com`;
    await page.locator("footer").getByPlaceholder("Your email").fill(email);
    await page.locator("footer").getByRole("button", { name: "Subscribe" }).click();
    await expect(page.locator("footer")).toContainText("You're in!");
  });
});
