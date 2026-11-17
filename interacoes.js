// Interações reaproveitáveis das prévias UPFAG (REGRAS.md 4c). Cada bloco só roda se o HTML dele existir na página.
// Copiar para site/interacoes.js e carregar com <script src="interacoes.js?v=N" defer></script>.

// 1. "Aberto agora" ao vivo. Precisa de <script type="application/json" id="horario">
//    {"tz":"America/Bahia","dias":{"1":["07:30","17:30"], ...}}  (0 = domingo; dia ausente = fechado)
//    e de elementos .js-aberto, que já trazem no HTML o horário fixo (vale sem JavaScript).
(() => {
  const fonte = document.getElementById("horario");
  if (!fonte) return;
  const h = JSON.parse(fonte.textContent);
  const nomes = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const agora = new Date(new Date().toLocaleString("en-US", { timeZone: h.tz }));
  const emMin = (s) => { const [a, b] = s.split(":").map(Number); return a * 60 + b; };
  const fala = (s) => s.replace(/^0/, "").replace(":", "h").replace("h00", "h");
  const dia = agora.getDay();
  const m = agora.getHours() * 60 + agora.getMinutes();
  const hoje = h.dias[dia];
  let aberto = false;
  let texto = "";
  if (hoje && m >= emMin(hoje[0]) && m < emMin(hoje[1])) {
    aberto = true;
    texto = `Aberto agora, até ${fala(hoje[1])}`;
  } else {
    for (let i = 0; i < 8; i++) {
      const d = (dia + i) % 7;
      const f = h.dias[d];
      if (!f) continue;
      if (i === 0 && m < emMin(f[0])) { texto = `Fechado, abre hoje ${fala(f[0])}`; break; }
      if (i > 0) { texto = `Fechado, abre ${i === 1 ? "amanhã" : nomes[d]} ${fala(f[0])}`; break; }
    }
  }
  document.querySelectorAll(".js-aberto").forEach((el) => {
    el.textContent = texto;
    el.hidden = false;
    el.classList.add("is-live");
    el.classList.toggle("is-open", aberto);
  });
})();

// 2. Seletor de problema. Estrutura: .js-sintomas com botões [data-sintoma][data-servico][data-texto],
//    um .sintomas__resultado (h3 + p) e um .sintomas__cta (.js-whats). A mensagem do WhatsApp vai em data-msg.
document.querySelectorAll(".js-sintomas").forEach((box) => {
  const out = box.querySelector(".sintomas__resultado");
  const cta = box.querySelector(".sintomas__cta");
  const modelo = box.dataset.msg || "Olá! Vim pelo site. {sintoma}. Quero agendar uma avaliação.";
  box.querySelectorAll("[data-sintoma]").forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      box.querySelectorAll("[data-sintoma]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      out.querySelector("h3").textContent = btn.dataset.servico;
      out.querySelector("p").textContent = btn.dataset.texto;
      cta.dataset.msg = modelo.replace("{sintoma}", btn.dataset.sintoma);
      out.classList.remove("is-pulse");
      void out.offsetWidth;
      out.classList.add("is-pulse");
      if (matchMedia("(max-width: 1023px)").matches) out.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });
});

// 3. Carrossel que passa sozinho. O arrastar é CSS (scroll-snap); aqui ficam os pontos e o avanço automático
//    a cada 4,5 s. Para quando a pessoa toca, passa o mouse, ou quando o carrossel sai da tela.
//    Com "reduzir movimento" ligado no aparelho, não avança sozinho.
document.querySelectorAll(".js-carrossel").forEach((lista) => {
  const itens = [...lista.children];
  if (itens.length < 2) return;
  const pontos = document.createElement("div");
  pontos.className = "carrossel__pontos";
  pontos.setAttribute("aria-hidden", "true");
  itens.forEach(() => pontos.appendChild(document.createElement("span")));
  lista.after(pontos);
  const atual = () => {
    const passo = itens[1].offsetLeft - itens[0].offsetLeft || 1;
    return Math.round(lista.scrollLeft / passo);
  };
  const noFim = () => lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 4;
  const marca = () => [...pontos.children].forEach((p, j) => p.classList.toggle("is-on", j === (noFim() ? itens.length - 1 : atual())));
  lista.addEventListener("scroll", marca, { passive: true });
  marca();

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let pausado = false;
  let visivel = false;
  const pausa = () => { pausado = true; clearTimeout(lista._volta); lista._volta = setTimeout(() => { pausado = false; }, 8000); };
  ["pointerdown", "touchstart", "wheel", "focusin"].forEach((ev) => lista.addEventListener(ev, pausa, { passive: true }));
  lista.addEventListener("mouseenter", () => { pausado = true; });
  lista.addEventListener("mouseleave", () => { pausado = false; });
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.4 }).observe(lista);
  setInterval(() => {
    if (pausado || !visivel || document.hidden) return;
    const prox = noFim() ? 0 : Math.min(atual() + 1, itens.length - 1);
    lista.scrollTo({ left: itens[prox].offsetLeft - itens[0].offsetLeft, behavior: "smooth" });
  }, 4500);
});
