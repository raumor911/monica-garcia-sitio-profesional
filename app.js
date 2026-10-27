(() => {
  "use strict";
  const phone = "525569143748";
  const messages = {
    oportunidad: "Hola, Mónica. Vi tu sitio profesional y me gustaría conversar contigo sobre una oportunidad laboral.",
    cv: "Hola, Mónica. Vi tu sitio profesional y me gustaría solicitar tu CV para conocer mejor tu experiencia.",
    proyecto: "Hola, Mónica. Vi tu proyecto de dashboard operativo en tu sitio profesional y me gustaría conocer más."
  };
  const whatsappUrl = (type = "oportunidad") => `https://wa.me/${phone}?text=${encodeURIComponent(messages[type] || messages.oportunidad)}`;

  document.querySelectorAll("[data-wa]").forEach((link) => {
    link.href = whatsappUrl(link.dataset.wa);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${link.textContent.trim()} (abre WhatsApp en una pestaña nueva)`);
  });

  // La navegación y el enlace del caso de estudio también solicitan contacto directo por WhatsApp.
  const directContact = document.querySelector(".nav-contact");
  const projectContact = document.querySelector(".text-link");
  for (const [link, type] of [[directContact, "oportunidad"], [projectContact, "proyecto"]]) {
    if (!link) continue;
    link.href = whatsappUrl(type);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const closeMenu = () => {
    if (!toggle || !nav) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 800) closeMenu(); });
  }
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
