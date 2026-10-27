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
    window.addEventListener("resize", () => { if (window.innerWidth > 980) closeMenu(); });
  }
  // La secuencia se activa solo cuando entra al viewport; fuera de pantalla queda en pausa.
  const motionSections = [...document.querySelectorAll("[data-animate-in-view]")];
  if ("IntersectionObserver" in window) {
    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.12 });
    motionSections.forEach((section) => motionObserver.observe(section));
  } else {
    motionSections.forEach((section) => section.classList.add("is-visible"));
  }

  // Control accesible para detener ambas ilustraciones; la imagen animada
  // se sustituye por su SVG estático porque está cargada como <img>.
  const illustration = document.getElementById("hero-illustration");
  const motionToggle = document.querySelector(".motion-toggle");
  const motionLabel = motionToggle?.querySelector(".motion-toggle-label");
  const motionIcon = motionToggle?.querySelector(".motion-toggle-icon");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let userPaused = false;

  function updateMotion() {
    const systemPaused = reducedMotion?.matches ?? false;
    const paused = userPaused || systemPaused;
    document.documentElement.classList.toggle("motion-paused", paused);
    if (illustration) {
      const src = paused ? illustration.dataset.staticSrc : illustration.dataset.motionSrc;
      if (src && illustration.getAttribute("src") !== src) illustration.setAttribute("src", src);
    }
    if (motionToggle) {
      motionToggle.hidden = systemPaused;
      motionToggle.setAttribute("aria-pressed", String(userPaused));
    }
    if (motionLabel) motionLabel.textContent = userPaused ? "Reanudar animaciones" : "Pausar animaciones";
    if (motionIcon) motionIcon.textContent = userPaused ? "▶" : "Ⅱ";
  }

  motionToggle?.addEventListener("click", () => {
    userPaused = !userPaused;
    updateMotion();
  });
  reducedMotion?.addEventListener?.("change", updateMotion);
  updateMotion();

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
