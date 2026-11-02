// Interações da prévia estática (dentro de cada página capturada).
(function () {
  var body = document.body;
  var name = body.getAttribute("data-page");
  var alts = {};
  try { alts = JSON.parse(body.getAttribute("data-alts") || "{}"); } catch (e) {}
  var lang = document.documentElement.lang;
  var T = {
    "pt-BR": { off: "Prévia estática: esta ação funciona no site rodando (ver COMO-ABRIR.md).", page: "Esta página não faz parte da prévia.", label: "País e idioma" },
    "en-CA": { off: "Static preview: this action works on the running site.", page: "This page isn't included in the preview.", label: "Country and language" },
    "fr-CA": { off: "Aperçu statique : cette action fonctionne sur le site en ligne.", page: "Cette page ne fait pas partie de l’aperçu.", label: "Pays et langue" },
  }[lang] || {};

  try { parent.postMessage({ type: "f3d-page", name: name }, "*"); } catch (e) {}

  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "pv-toast";
      toastEl.setAttribute("role", "status");
      body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("on"); }, 2600);
  }

  // ── Seletor de país/idioma ──
  var STORES = [
    { locale: "pt-BR", flag: "br", label: "Brasil — Português", sub: "BRL / R$" },
    { locale: "en-CA", flag: "ca", label: "Canada — English", sub: "CAD / CA$" },
    { locale: "fr-CA", flag: "ca", label: "Canada — Français", sub: "CAD / CA$" },
  ];
  var FLAG = {
    br: '<svg viewBox="0 0 30 21" width="26" height="18"><rect width="30" height="21" rx="2.5" fill="#009C3B"/><path d="M15 2.6 27 10.5 15 18.4 3 10.5Z" fill="#FFDF00"/><circle cx="15" cy="10.5" r="4.6" fill="#002776"/></svg>',
    ca: '<svg viewBox="0 0 30 21" width="26" height="18"><rect width="30" height="21" rx="2.5" fill="#fff"/><rect width="7.5" height="21" fill="#D52B1E"/><rect x="22.5" width="7.5" height="21" fill="#D52B1E"/><path fill="#D52B1E" d="M15 3.6l1 2 1.2-.6-.5 3 1.8-1.8.3 1 1.9-.3-.6 2 .7.4-2.7 2.2.3 1.2-2.6-.5.1 3.1h-.6l.1-3.1-2.6.5.3-1.2-2.7-2.2.7-.4-.6-2 1.9.3.3-1 1.8 1.8-.5-3 1.2.6Z"/></svg>',
  };
  var menu;
  function openRegion(btn) {
    closeRegion();
    menu = document.createElement("div");
    menu.className = "pv-region";
    menu.setAttribute("role", "menu");
    var html = '<p class="pv-region-t">' + (T.label || "") + "</p>";
    STORES.forEach(function (s) {
      var target = alts[s.locale];
      html += '<a role="menuitemradio" aria-checked="' + (s.locale === lang) + '" href="' + (target ? target + ".html" : "#") + '">' +
        FLAG[s.flag] + '<span><b>' + s.label + "</b><small>" + s.sub + "</small></span>" + (s.locale === lang ? '<i>✓</i>' : "") + "</a>";
    });
    menu.innerHTML = html;
    body.appendChild(menu);
    var r = btn.getBoundingClientRect();
    var w = Math.min(304, window.innerWidth - 16);
    menu.style.width = w + "px";
    menu.style.top = r.bottom + 8 + "px";
    menu.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + "px";
    menu.addEventListener("mouseleave", function () { if (menu && !menu._byClick) closeRegion(); });
  }
  function closeRegion() { if (menu) { menu.remove(); menu = null; } }
  document.querySelectorAll('[data-testid="region-switcher"]').forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (menu && menu._byClick) return closeRegion();
      if (!menu) openRegion(btn);
      menu._byClick = true; // aberto pelo clique/toque: fica aberto até escolher ou clicar fora
    });
    btn.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches && btn.closest("header")) openRegion(btn); });
  });
  document.addEventListener("click", function (e) { if (menu && !menu.contains(e.target)) closeRegion(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeRegion(); });

  function catsPage() {
    var prefix = name.indexOf("ca-") === 0 ? name.split("-").slice(0, 2).join("-") : "br";
    return prefix + "-" + ({ "pt-BR": "categorias", "en-CA": "categories", "fr-CA": "categories" })[lang] + ".html";
  }

  // ── Menu do celular ──
  var menuBtn = document.querySelector('[data-testid="menu-button"]');
  var desktopNav = document.querySelector("header nav ul");
  if (menuBtn && desktopNav) {
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wrap = document.createElement("div");
      wrap.className = "pv-drawer";
      var links = "";
      desktopNav.querySelectorAll("li").forEach(function (li) {
        var a = li.querySelector("a"), btn = li.querySelector("button");
        if (a) links += '<a href="' + a.getAttribute("href") + '">' + a.textContent + "</a>";
        else if (btn) links += '<a href="' + catsPage() + '">' + btn.textContent + "</a>";
      });
      wrap.innerHTML = '<div class="pv-drawer-bg"></div><nav><button class="pv-x" aria-label="×">×</button>' + links + "</nav>";
      body.appendChild(wrap);
      wrap.querySelector(".pv-drawer-bg").onclick = wrap.querySelector(".pv-x").onclick = function () { wrap.remove(); };
    });
  }

  // ── Botão "Categorias" do cabeçalho: abre a lista de categorias ──
  document.querySelectorAll("header nav button[aria-expanded]").forEach(function (b) {
    b.addEventListener("click", function () {
      location.href = catsPage();
    });
  });

  // ── Ações que dependem do servidor ──
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (a && a.getAttribute("data-off")) { e.preventDefault(); toast(T.page); return; }
    var b = e.target.closest("button");
    if (!b || b.closest(".pv-region, .pv-drawer") || b.matches('[data-testid="region-switcher"], [data-testid="menu-button"]') || b.closest("header nav")) return;
    // opções de cor/tamanho: seleção visual
    if (b.getAttribute("role") === "radio") {
      var group = b.closest('[role="radiogroup"]');
      if (group) {
        group.querySelectorAll('[role="radio"]').forEach(function (x) {
          x.setAttribute("aria-checked", "false");
          x.classList.remove("ring-2", "ring-ink", "border-ink", "bg-ink", "text-metal");
        });
        b.setAttribute("aria-checked", "true");
        if (b.style.background) b.classList.add("ring-2", "ring-ink"); else b.classList.add("border-ink", "bg-ink", "text-metal");
      }
      return;
    }
    if (b.getAttribute("role") === "tab") return;
    e.preventDefault();
    toast(T.off);
  }, true);
  document.addEventListener("submit", function (e) { e.preventDefault(); toast(T.off); }, true);
})();
