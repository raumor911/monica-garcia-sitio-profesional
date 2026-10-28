# TEKTARYON — G3 Visual QA y validación de telemetría (Mónica García)

**Vertical:** RAUVIAWEB Profesional · **Piloto:** TEK-PROF-01  
**Fecha:** 27-oct-2026 (CDMX) / ejecución 28-oct-2026 UTC  
**Dominio previsto:** https://monicagarcia.rauviaweb.mx/  
**Repositorio:** https://github.com/raumor911/monica-garcia-sitio-profesional  
**Commit visual probado:** `2c01b9141412` (versión con enlaces CV eliminados de páginas interiores).  
**Run:** https://github.com/raumor911/monica-garcia-sitio-profesional/actions/runs/40631951978  
**Capturas/ledger:** https://github.com/raumor911/monica-garcia-sitio-profesional/actions/runs/40631951978/artifacts/12791409663

## 1. Decisión de gates

- G0 Alcance: cerrado por instrucción del responsable.
- G1 Contrato: cerrado por instrucción del responsable.
- G2 Construcción: en curso. CSS y código de telemetría implementados; integración viva y esquema en Hostinger sin comprobar.
- **G3 Visual/geométrico: PASS automático (116 PASS, 0 FAIL).**
- **G3 Fidelidad editorial: revisión humana realizada, con salvedades anotadas; validación formal de activos pendiente.**
- G4/G5: NO autorizados. Ningún despliegue ni escritura real a MySQL.

## 2. Matriz ejecutada

Se tomaron **18 capturas completas** para tres rutas `/`, `/como-puedo-ayudarte/` y `/perspectiva/`, y **dos capturas del menú abierto** a 360 y 390 px.

| Ancho | Altura | Portada | Cómo puedo ayudarte | Perspectiva |
|---:|---:|---|---|---|
| 360 | 844 | PASS | PASS | PASS |
| 390 | 844 | PASS | PASS | PASS |
| 768 | 1024 | PASS | PASS | PASS |
| 1024 | 900 | PASS | PASS | PASS |
| 1440 | 900 | PASS | PASS | PASS |
| 1920 | 1080 | PASS | PASS | PASS |

Prueba: sin scroll horizontal, solapamientos de familias de tarjetas, texto truncado en selectores inspeccionados, errores JavaScript ni imágenes rotas. Se activaron imágenes lazy durante el desplazamiento y se verificó la navegación móvil. **134 comprobaciones: 116 PASS + 18 PENDING de comparación automática con mockups**, sin defectos detectados por geometría. Los 18 PENDING son pasos de inspección visual, no pruebas automáticamente aprobadas.

## 3. Cierre de defectos

**DEF-001** `/como-puedo-ayudarte/` a 1024 px: anteriormente overflow 11 px. **RESUELTO** tras reemplazar margen lateral -35 px por -24 px en media query 801–1100 px.

**DEF-002** `/perspectiva/` a 1024 px: anteriormente overflow 11 px. **RESUELTO** por la misma regla compartida.

**DEF-003 — CTA residual de CV en páginas interiores:** durante revisión humana existían enlaces «Ver CV» y «Ver mi CV» en `/como-puedo-ayudarte/` y `/perspectiva/` pese a decisión de solo WhatsApp. **RESUELTO**, se retiraron los enlaces y se agregó prueba SEO para impedir su reintroducción.

Los tres casos requieren conservar sus evidencias en los artefactos del run final. No se alteró el diseño aprobado de las demás secciones.

## 4. Comparación visual contra mockup RAUVIAWEB aprobado

Se revisaron visualmente las seis composiciones de portada en capturas y se contrastaron con el mockup editorial entregado para Mónica. Se revisaron además recortes de la portada de 1440 px en trayectoria, tarjetas de valor y habilidades, y las dos rutas interiores a 1024 px. Resultado por componente:

| Componente | Resultado de comparación | Observaciones |
|---|---|---|
| Paleta y tipografía | Consistente | Verde profundo, vino, marfil y títulos serif; tamaños responsive |
| Hero y WhatsApp | Consistente con decisiones posteriores | Nombre en dos líneas, especialidad y único CTA WhatsApp; la ilustración conceptual SVG no es idéntica al boceto original |
| Indicadores 100/125/40/130 | Consistente | Cuatro iconos lineales y divisor; en móvil se reorganiza en cuadrícula 2 × 2 |
| Cómo puedo aportar | Consistente | Cuatro tarjetas e iconos de personas, engrane, red y barras; textos más extensos que el mockup |
| Trayectoria | Consistente a nivel de estructura | Cinco columnas en escritorio; algunos logotipos son aproximaciones editoriales y requieren artes oficiales |
| Habilidades/herramientas/idiomas | Consistente | Tres bloques compactos, ocho marcas vectoriales, banderas y barras cualitativas |
| Páginas interiores | Revisadas por consistencia | No existe mockup píxel a píxel aprobado para estas dos rutas; se revisó legibilidad y coherencia editorial, no fidelidad exacta |
| Móviles 360/390 | Adaptación responsiva aceptable técnicamente | Diseño apilado, navegación hamburguesa, sin overflow; no pretende reproducir distribución de escritorio |

**No se puede declarar equivalencia visual 100%/95% como métrica numérica:** no hay fixture pixel-perfect versionado ni evidencia de arte oficial de todas las marcas. La comparación humana está efectuada, las diferencias conocidas están identificadas y no hay bloqueo geométrico automático. La aceptación editorial final de estas diferencias corresponde al responsable.

## 5. Telemetría: TEK-02 / TEK-03

**Implementado en GitHub:** `telemetry/client.js`, `telemetry/server.mjs`, `telemetry/db.mjs` y `telemetry/server.test.mjs`.

- Identidad: `monica-garcia`.
- Host: `monicagarcia.rauviaweb.mx`.
- DB compartida requerida: `u345974778_rauviaplatform`.
- Tablas contrato: `visitors`, `sessions`, `web_events`, `ai_crawler_visits`.
- Eventos: `page_view`, `section_view`, `whatsapp_click`, `rauvia_click`, crawler GET/HEAD en documentos HTML/semánticos.
- Seguridad: credenciales solo servidor; sin IP ni datos de conversaciones; filtrado de propiedades, UUIDs aislados por `site_id`, DNT/GPC; origen validado y rate limit.
- **QA de contrato:** PASS en CI con motor MySQL simulado; no representa una conexión real a Hostinger.
- **QA de persistencia real:** PENDING. Se deben conocer las credenciales y verificar esquema, índices y permisos reales en Hostinger, sin alterar tablas compartidas sin inspección.

La arquitectura no transmite eventos desde el navegador directamente a MySQL. Requiere proceso backend en el mismo origen o proxy seguro, como se documenta en `docs/telemetry-hostinger.md`.

## 6. Limitaciones y próximos controles

- No se midieron Core Web Vitals sobre red móvil ni accesibilidad con usuarios o dispositivos físicos.
- No se verificaron DNS, SSL ni respuesta del dominio en producción.
- No se compararon imágenes por similitud de píxel a píxel.
- No se ejecutaron escrituras en la BD Hostinger ni se configuraron secretos.
- **No aprobar G4/G5 de forma implícita.** La liberación requiere autorización explícita.

Referencia histórica: `docs/qa/tektaryon-g3-visual-2026-10-27.md` recoge los defectos de la primera ronda, ahora resueltos según este expediente.
