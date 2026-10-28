# TEKTARYON · TEK-03 · G3 Visual QA — Mónica García

**Expediente piloto:** TEK-PROF-01  
**Fecha de prueba:** 2026-10-27 (America/Mexico_City; ejecución UTC 2026-10-28)  
**Fuente metodológica:** TEKTARYON v0.1.0, anexo AETHRYON DRAFT v2.0.0, apartado 07.3 / 09.4 / 11 / 12  
**Repo:** https://github.com/raumor911/monica-garcia-sitio-profesional  
**Commit bajo prueba:** `c0146d66ec0e1737f04ba3a3d110560acafa5952`  
**Entorno:** GitHub Actions ubuntu-latest, Node 22, Playwright 1.56.1, Chromium headless, servido por Python HTTP en localhost:4173, `es-MX`, `prefers-reduced-motion: reduce`.  
**Entorno real de producción:** NO verificado. No se hizo despliegue.

## Estados autorizados / compuertas

- G0 Alcance: cerrado por instrucción expresa del responsable, 27-oct-2026.
- G1 Contrato: cerrado por instrucción expresa del responsable, 27-oct-2026.
- G2 Build: en curso.
- **G3 Verification: FAIL para esta ronda (defectos P1 abiertos).**
- G4, G5, G6: sin evaluar en esta ronda; no hubo autorización ni validación de publicación.

## Matriz visual ejecutada

Anchos: **360, 390, 768, 1024, 1440, 1920 px**.

Alturas de viewport: 844, 844, 1024, 900, 900 y 1080 px, respectivamente.

Rutas: `/`, `/como-puedo-ayudarte/`, `/perspectiva/`.

**Artefacto de capturas y ledger:** https://github.com/raumor911/monica-garcia-sitio-profesional/actions/runs/40630525614/artifacts/12791342486

El archivo contiene 18 capturas de página completa, dos capturas adicionales del menú móvil abierto (360/390), `qa-evidence-ledger.json` y README de evidencia. Retención automática del artefacto: 30 días.

| Ancho | Portada | Cómo puedo ayudarte | Perspectiva |
|---:|---|---|---|
| 360 | Sin overflow | Sin overflow | Sin overflow |
| 390 | Sin overflow | Sin overflow | Sin overflow |
| 768 | Sin overflow | Sin overflow | Sin overflow |
| 1024 | Sin overflow | **FAIL: 11 px** | **FAIL: 11 px** |
| 1440 | Sin overflow | Sin overflow | Sin overflow |
| 1920 | Sin overflow | Sin overflow | Sin overflow |

## Métricas de QA automatizada

- **134** comprobaciones en total: **114 PASS**, **2 FAIL**, **18 PENDING**.
- **2 defectos abiertos**, ambas manifestaciones del mismo problema de CSS.
- Sin pares superpuestos entre las familias de tarjetas evaluadas.
- Sin texto truncado por overflow CSS detectado en los selectores evaluados.
- Sin errores JavaScript detectados durante la navegación.
- SVG de herramientas y banderas cargan tras recorrer el documento y activar los elementos lazy-loaded.
- Los 18 PENDING corresponden a comparación humana de fidelidad con los mockups; no se convierten a PASS por existir capturas.

## Defect Register

### DEF-001 — Desbordamiento en «Cómo puedo ayudarte» a 1024px
- **Severidad:** P1 (visual/responsive)
- **Ruta:** `/como-puedo-ayudarte/`
- **Esperado:** sin overflow horizontal del documento.
- **Observado:** `scrollWidth - innerWidth = 11 px`. El bloque `.content-section.content-contrast` tiene `left=-11px`, `right=1035px` respecto a un viewport de 1024px.
- **Cómo reproducir:** iniciar servidor estático local, abrir la ruta a 1024px, inspeccionar la anchura de `document.documentElement.scrollWidth` y el rectángulo `.content-contrast`.
- **Evidencia:** `1024px-como-puedo-ayudarte.png` y `qa-evidence-ledger.json` en el artefacto.
- **Estado:** OPEN.

### DEF-002 — Desbordamiento en «Perspectiva» a 1024px
- **Severidad:** P1 (visual/responsive)
- **Ruta:** `/perspectiva/`
- **Esperado:** sin overflow horizontal del documento.
- **Observado:** los mismos **11 px** por extensión de `.content-section.content-contrast` fuera del contenedor.
- **Evidencia:** `1024px-perspectiva.png` y `qa-evidence-ledger.json`.
- **Estado:** OPEN.

**Hipótesis técnica localizada:** la regla `.content-contrast { margin-inline: -35px; }` amplía la sección cuando el contenedor aún no ofrece márgenes externos suficientes; la regla alternativa para <=800px evita el problema en anchos menores. Corregir solo después de autorizar intervención de desarrollo y repetir matriz en seis anchos.

## Límites de la evidencia

1. No se ha realizado comparación pixel a pixel ni aceptación editorial formal de cada captura contra el mockup.
2. La prueba fue local en Chromium de escritorio, no en navegadores móviles físicos.
3. No se midieron LCP, CLS, tiempo de carga en red móvil ni presupuesto de rendimiento.
4. El clic al CTA se validó como destino HTML correcto en la portada; no se probó el lanzamiento real de la app WhatsApp en un dispositivo.
5. G5 (HTTP público, DNS, TLS/SSL y canonical servido) no está evaluado.
6. La prueba no habilita despliegue; no acredita indexación.
7. El primer run contenía falsos positivos por imágenes `loading=lazy` aún no activadas por captura fullPage; se corrigió el método y el resultado reportado aquí procede exclusivamente del **segundo run**.

## Recomendación TEK-03

**NOT_READY** para aprobar G3. Mantener G2 en curso y abrir TEK-05/02 para parche mínimo del bloque compartido de páginas interiores, seguido de nueva ejecución G3. Mantener pendientes las revisiones de fidelidad contra mockups y no inferir G4/G5 aprobados.
