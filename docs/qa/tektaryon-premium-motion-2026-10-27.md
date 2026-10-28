# TEKTARYON · G3 Premium Editorial Motion — RAUVIAWEB Mónica García

**Fecha:** 27-oct-2026 CDMX · 28-oct-2026 UTC  
**Vertical:** RAUVIAWEB Profesional · Piloto TEK-PROF-01  
**Dominio canónico:** https://monicagarcia.rauviaweb.mx/  
**Repositorio:** https://github.com/raumor911/monica-garcia-sitio-profesional  
**Commit probado (código y QA):** `a104dca3a128e1c65b8868c86b2adcfae769e24c`  
**Run G3:** https://github.com/raumor911/monica-garcia-sitio-profesional/actions/runs/40633528587  
**Evidencias:** https://github.com/raumor911/monica-garcia-sitio-profesional/actions/runs/40633528587/artifacts/12792920697

## Decisión editorial

Se eligió una **secuencia editorial de precisión**, sin parallax invasivo ni 3D, por ser más compatible con un perfil profesional orientado a reclutamiento. El movimiento es deliberado, breve y progresivo, compatible con una identidad visual sobria. No se introducen afirmaciones nuevas sobre estudios o títulos de Mónica.

## Implementación

- `premium-motion.js` — entrada escalonada del hero; revelado único de métricas, tarjetas, trayectoria, proyecto, habilidades, y bloques semánticos de las dos páginas interiores. Usa Web Animations API y IntersectionObserver.
- `premium-motion.css` — trazo progresivo de la línea de trayectoria, llenado secuencial de barras de idiomas y microinteracciones de CTA, tarjetas y logotipos en dispositivos con hover.
- Se mantuvieron los SVG animados originales del hero y del diagrama Clientes–Procesos–Producto.
- El botón existente `Pausar animaciones` completa y suspende la secuencia editorial y detiene los SVG; al reanudar no vuelve a disparar toda la entrada.
- El control móvil se ubicó debajo de la ilustración y se separó de la leyenda para evitar solapamiento.
- Páginas `/`, `/como-puedo-ayudarte/` y `/perspectiva/` incorporan la nueva capa. `scripts/build-seo.mjs` copia ambos archivos públicos al paquete `dist/`.
- Sin nuevas librerías de animación, sin cambios a contenido, SEO, LLMO o contratos MySQL.

## Resultados QA TEK-03

### Cobertura

Anchos: **360, 390, 768, 1024, 1440, 1920 px**.  
Páginas: inicio, Cómo puedo ayudarte y Perspectiva.

| Verificación | Resultado |
|---|---|
| Geometry / static visual — 134 checks | 116 PASS · 0 FAIL · 18 PENDING (fidelidad editorial no automatizable) |
| Premium motion regression — 114 checks | **114 PASS · 0 FAIL** |
| Efectos de entrada, timeline y barras | PASS en seis anchos |
| Botón pausar / reanudar | PASS en seis anchos |
| `prefers-reduced-motion: reduce` | PASS en seis anchos, tres rutas |
| Errores JS / desbordamiento horizontal | Ninguno detectado por el conjunto automatizado |
| GitHub Actions | SUCCESS |

El QA de capturas incluye 18 vistas completas y 2 del menú móvil, más 2 capturas de la página en estado de movimiento habilitado (390px/1440px), `qa-evidence-ledger.json` y `premium-motion-qa.json`.

### Defectos encontrados y resueltos

1. **MOT-001, P1 — interacción pausa bloqueada**: una actualización de clase en `MutationObserver` podía generar un ciclo de callbacks. Se corrigió con transición irreversible y desconexión del observador.
2. **MOT-002, P2 — superposición en móvil**: la etiqueta del control de pausa podía acercarse a la leyenda editorial sobre la ilustración. Se cambió a una fila independiente bajo el SVG y se ajustó la posición de la leyenda cuando el control está visible.
3. **MOT-003, P3 — evidencia incorrecta**: la captura normal se realizaba tras pausar. Se actualizó la prueba para reanudar antes de capturar.

## Límites y gates

- **G0 y G1**: cerrados por instrucción del responsable.
- **G2**: implementación frontend de animación terminada; integración MySQL de telemetría real sigue pendiente.
- **G3**: el bloque de QA automático visual/motion pasa; las 18 comparaciones editoriales con mockups no se elevan a aprobación cuantitativa pixel-perfect. Aceptación final del responsable pendiente.
- **G4/G5**: no autorizados; no se realizó despliegue.
- La medida de rendimiento real en un móvil físico y la verificación en Safari/iOS siguen siendo verificaciones futuras, no resultados de este run.

La variante sin JavaScript y `prefers-reduced-motion` conserva el contenido legible; las animaciones solo utilizan transform/opacity y no dependen de conectores o terceros.
