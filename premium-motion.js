/**
 * RAUVIAWEB / Mónica García — Premium editorial motion v1
 *
 * Progressive enhancement: content remains visible in HTML and without JS.
 * One-shot Web Animations API reveals; only opacity / transform.
 * No external dependencies, tracking or layout changes.
 */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const active = new Set();
  const motionAllowed = () => !reduced?.matches && !root.classList.contains("motion-paused");
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;

  const enterAnimation = [
    { opacity: 0, transform: "translate3d(0, 18px, 0)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)" }
  ];
  const ease = "cubic-bezier(.22,.72,.24,1)";
  let observer;

  const settle = (node) => {
    node.dataset.motionRevealed = "true";
    node.classList.remove("premium-motion-pending");
  };
  const animateOnce = (node) => {
    if (node.dataset.motionRevealed) return;
    settle(node);
    if (!motionAllowed() || document.visibilityState === "hidden") return;
    const delay = Math.min(Number(node.dataset.motionDelay) || 0, 240);
    const duration = Number(node.dataset.motionDuration) || 650;
    const animation = node.animate(enterAnimation, {
      duration, delay, easing: ease, fill: "both"
    });
    active.add(animation);
    const done = () => {
      active.delete(animation);
      animation.cancel(); // Reset temporary presentation; natural CSS is the final state.
    };
    animation.addEventListener("finish", done, { once: true });
    animation.addEventListener("cancel", () => active.delete(animation), { once: true });
  };
  const revealAll = () => {
    observer?.disconnect();
    document.querySelectorAll(".premium-motion-pending").forEach(settle);
    for (const a of [...active]) {
      try { a.finish(); } catch { a.cancel(); }
    }
    root.classList.remove("premium-motion-active");
  };
  // Existing site control toggles <html class="motion-paused">.
  const pauseWatch = new MutationObserver(() => {
    if (!motionAllowed()) revealAll();
  });
  pauseWatch.observe(root, { attributes: true, attributeFilter: ["class"] });
  reduced?.addEventListener?.("change", () => {
    if (!motionAllowed()) revealAll();
  });
  if (!motionAllowed()) return;

  const assignments = [
    [".hero-copy .hero-eyebrow", 0, 590],
    [".hero-copy .hero-name", 70, 750],
    [".hero-copy .hero-role", 155, 630],
    [".hero-copy .hero-text", 200, 630],
    [".hero-copy .hero-actions", 235, 620],
    [".hero-copy .availability", 240, 570],
    [".page-hero .page-breadcrumb", 0, 540],
    [".page-hero .eyebrow", 70, 570],
    [".page-hero h1", 110, 700],
    [".page-hero .page-lead", 165, 650],
    [".page-hero .page-hero-actions", 220, 590]
  ];
  // Stagger is capped: nearby items feel related, long pages never feel delayed.
  const groups = [
    [".metric-grid .metric", 65],
    [".value-grid .value-card", 75],
    [".timeline .career-card", 70],
    [".project-impact > div", 65],
    [".skills-section .skill-chips li", 24],
    [".skills-section .brand-tool", 35],
    [".skills-section .language-item", 65],
    [".content-grid article", 85],
    [".story-stack > div", 85],
    [".qa-list > div", 65],
    [".seo-context-links .seo-context-link", 95]
  ];
  for (const [selector, spacing] of groups) {
    document.querySelectorAll(selector).forEach((node, i) => {
      assignments.push([node, Math.min(i * spacing, 220), 620]);
    });
  }
  document.querySelectorAll(
    ".intro-section .eyebrow,.intro-section h2,.section-heading,.project-copy > .eyebrow,.project-copy > h2,.next-copy > .eyebrow,.next-copy > h2,.content-section > .eyebrow,.content-section > h2,.page-bottom .eyebrow,.page-bottom h2,.contact-section .eyebrow,.contact-section h2"
  ).forEach(node => assignments.push([node, 20, 660]));

  const seen = new Set();
  const nodes = [];
  for (const [elementOrSelector, delay, duration] of assignments) {
    const element = typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector) : elementOrSelector;
    if (!element || seen.has(element)) continue;
    seen.add(element);
    element.dataset.motionDelay = String(delay);
    element.dataset.motionDuration = String(duration);
    nodes.push(element);
  }
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      animateOnce(entry.target);
    }
  }, { rootMargin: "0px 0px -5% 0px", threshold: 0.08 });

  root.classList.add("premium-motion-active");
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    // Avoid hiding or shifting visible content during the initial paint.
    if (rect.top <= window.innerHeight * .93 && rect.bottom >= 0) {
      animateOnce(node);
    } else {
      node.classList.add("premium-motion-pending");
      observer.observe(node);
    }
  }

  // A line draws once across the career timeline; never modifies layout.
  const timeline = document.querySelector(".timeline");
  if (timeline) {
    const lineObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        timeline.classList.add("premium-line-drawn");
        lineObserver.disconnect();
      }
    }, { threshold: 0.12 });
    lineObserver.observe(timeline);
  }
  // Language bars fill once, preserving original percentages in inline CSS.
  const languages = document.querySelector(".skills-section .language-levels");
  if (languages) {
    const barObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        languages.classList.add("premium-bars-filled");
        barObserver.disconnect();
      }
    }, { threshold: 0.15 });
    barObserver.observe(languages);
  }
})();