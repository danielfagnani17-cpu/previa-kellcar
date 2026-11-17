// Prévia: botões de WhatsApp e formulário não disparam nada de verdade.
// Na versão oficial: PREVIA = false e o HTML continua funcionando sozinho com o Netlify Forms.
const PREVIA = true;
const WHATSAPP = "5571994079418"; // número público do Instagram e do Linktree da KellCar

document.documentElement.classList.add("js");

// A mensagem sai de data-msg quando existir (o seletor de sintomas preenche), senão a padrão.
const PADRAO = "Olá! Vim pelo site e quero agendar um horário na KellCar.";
document.querySelectorAll(".js-whats").forEach((a) => {
  a.addEventListener("click", (e) => {
    const msg = a.dataset.msg || PADRAO;
    e.preventDefault();
    if (PREVIA) {
      alert(`Prévia: no site oficial este botão abre o WhatsApp da KellCar, (71) 99407-9418, com a mensagem:\n\n"${msg}"`);
      return;
    }
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });
  if (!PREVIA) a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(PADRAO)}`;
});

document.querySelectorAll(".js-call").forEach((a) => {
  if (PREVIA) a.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Prévia: no site oficial este botão liga direto para a KellCar, (71) 99407-9418.");
  });
});

const form = document.querySelector(".js-form");
if (form && PREVIA) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const done = form.querySelector(".form__done");
    done.textContent = "Prévia: no site oficial este pedido chega na hora para a KellCar, que responde pelo WhatsApp informado. Nada foi enviado.";
    done.hidden = false;
    form.querySelector("button[type=submit]").disabled = true;
  });
}

// Entrada das seções ao rolar.
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const items = document.querySelectorAll(".reveal");
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = `${(e.target.dataset.i ?? 0) * 70}ms`;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  items.forEach((el) => {
    el.dataset.i = [...el.parentElement.children].indexOf(el);
    io.observe(el);
  });
} else {
  items.forEach((el) => el.classList.add("is-in"));
}

// Barra fixa do celular: aparece depois do topo e some quando já existe um botão cheio
// (ou o formulário) na tela, para não repetir o mesmo botão duas vezes.
const barra = document.querySelector(".barra");
const heroCtas = document.querySelector(".hero__ctas");
if (barra && heroCtas && "IntersectionObserver" in window) {
  const state = { heroAbove: false };
  const vistos = new Set();
  const sync = () => barra.classList.toggle("is-visible", state.heroAbove && vistos.size === 0);
  new IntersectionObserver(([e]) => { state.heroAbove = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(heroCtas);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? vistos.add(e.target) : vistos.delete(e.target)));
    sync();
  }, { threshold: 0.6 });
  document.querySelectorAll("main .btn--accent:not(.hero__ctas .btn), .cta-row .btns, .final .btns, .js-form").forEach((el) => io.observe(el));
  new IntersectionObserver(([e]) => { e.isIntersecting ? vistos.add(e.target) : vistos.delete(e.target); sync(); }, { threshold: 0.05 }).observe(document.querySelector(".js-form"));
}

// Sintoma escolhido: preenche a ficha e já deixa o texto no pedido de orçamento.
const campoSintoma = document.querySelector(".js-ficha-sintoma");
const mensagem = document.querySelector(".js-form textarea");
let preenchido = "";
document.querySelectorAll("[data-sintoma]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const texto = btn.dataset.sintoma.replace(/^./, (c) => c.toUpperCase());
    if (campoSintoma) campoSintoma.textContent = texto;
    if (mensagem && (mensagem.value === "" || mensagem.value === preenchido)) {
      preenchido = `${texto}.`;
      mensagem.value = preenchido;
    }
  });
});

// Serviços no desktop: o painel sob o cursor (ou com foco) abre e ganha cor.
const tiles = document.querySelectorAll(".pilha .tile");
tiles.forEach((t) => {
  const abre = () => tiles.forEach((o) => o.classList.toggle("is-open", o === t));
  t.addEventListener("mouseenter", abre);
  t.addEventListener("focusin", abre);
});

// Rota do atendimento: a linha se desenha quando a seção entra na tela.
const rota = document.querySelector(".js-rota");
if (rota) {
  [...rota.children].forEach((li, n) => li.style.setProperty("--n", n));
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { rota.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.3 }).observe(rota);
  } else {
    rota.classList.add("is-in");
  }
}

// Semana: marca o dia de hoje no fuso da oficina.
const semana = document.querySelector(".js-semana");
if (semana) {
  const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bahia" })).getDay();
  semana.querySelector(`[data-d="${hoje}"]`)?.classList.add("hoje");
}
