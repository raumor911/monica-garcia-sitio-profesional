/* RAUVIAWEB v0.2 | site-scoped session telemetry, no cookies or PII. */
(() => {
  "use strict";
  const SITE_ID = "monica-garcia";
  const HOST = "monicagarcia.rauviaweb.mx";
  const paths = new Set(["/","/como-puedo-ayudarte/","/perspectiva/"]);
  if (location.hostname !== HOST || !paths.has(location.pathname)) return;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
  if (/bot|crawler|spider|ChatGPT-User|GPTBot|ClaudeBot|PerplexityBot/i.test(navigator.userAgent)) return;
  if (!crypto.randomUUID) return;

  const boot = async () => {
    let config;
    try {
      const response = await fetch("/api/telemetry/config", { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) return;
      config = await response.json();
    } catch { return; }
    if (config?.enabled !== true || config?.site_id !== SITE_ID) return;

    const key = "rauviaweb:monica-garcia:session";
    const timeout = 30 * 60 * 1000;
    let ids;
    const now = Date.now();
    try {
      ids = JSON.parse(sessionStorage.getItem(key) || "null");
    } catch { /* sessionStorage may be blocked */ }
    if (!ids || typeof ids.active !== "number" || now - ids.active > timeout ||
        !/^[a-f0-9-]{36}$/i.test(ids.visitor_id || "") ||
        !/^[a-f0-9-]{36}$/i.test(ids.session_id || "")) {
      ids = { visitor_id: crypto.randomUUID(), session_id: crypto.randomUUID(), active: now };
    }
    const save = () => {
      ids.active = Date.now();
      try { sessionStorage.setItem(key, JSON.stringify(ids)); } catch { /* blocked */ }
    };
    save();
    const seenSections = new Set();
    const send = (event, properties = {}) => {
      try {
        if (Date.now() - ids.active > timeout) {
          ids.visitor_id = crypto.randomUUID();
          ids.session_id = crypto.randomUUID();
          seenSections.clear();
        }
        save();
        const data = JSON.stringify({
          site_id: SITE_ID, event, visitor_id: ids.visitor_id, session_id: ids.session_id,
          path: location.pathname,
          device_type: innerWidth < 768 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop",
          properties
        });
        const blob = new Blob([data], { type: "application/json" });
        if (navigator.sendBeacon?.("/api/telemetry", blob)) return;
        fetch("/api/telemetry", { method: "POST", body: data, headers: { "Content-Type": "application/json" }, keepalive: true, credentials: "same-origin" }).catch(() => {});
      } catch { /* analytics must not block the site */ }
    };

    send("page_view");
    document.addEventListener("click", event => {
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const action = /^https:\/\/wa\.me\/525569143748(?:[/?#]|$)/i.test(href)
        ? "whatsapp_click" : /^https:\/\/(?:www\.)?rauvia\.com\.mx\/?/i.test(href) ? "rauvia_click" : null;
      if (!action) return;
      const position = link.closest("footer") ? "footer" : link.closest("header") ? "header"
        : link.closest(".hero") ? "hero" : "content";
      send(action, { location: position });
    }, { passive: true });

    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = entry.target;
        const sectionId = section.id || (section.classList.contains("page-hero") ? "page-hero" : "");
        if (!sectionId || !/^[a-z0-9_-]{1,60}$/i.test(sectionId) || seenSections.has(sectionId)) continue;
        seenSections.add(sectionId);
        send("section_view", { section: sectionId });
        observer.unobserve(section);
      }
    }, { threshold: 0.25 });
    document.querySelectorAll("main section[id], main .page-hero").forEach(section => observer.observe(section));
  };
  void boot();
})();