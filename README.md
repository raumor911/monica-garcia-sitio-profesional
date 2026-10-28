# Sitio profesional · Mónica García Urrutia

Sitio de presentación profesional diseñado para que reclutadores y equipos digitales conozcan la trayectoria de Mónica, su experiencia en operaciones y su interés de transición hacia **Product Operations** y posiciones cercanas a **Product Ownership**.

## Cómo abrirlo en Visual Studio Code

1. Clona el repositorio: `git clone https://github.com/raumor911/monica-garcia-sitio-profesional.git`
2. Abre la carpeta en Visual Studio Code.
3. Abre `index.html` con la extensión **Live Server** (clic derecho → **Open with Live Server**).

No necesita `npm install`, proceso de compilación ni servicios externos. También puedes usar `python3 -m http.server 8000` en la raíz y abrir `http://localhost:8000`.

**Importante:** esta entrega es únicamente código en GitHub para revisión local: no se creó GPT Site ni se realizó despliegue público.

## Organización

- `index.html` — contenido semántico en español, metadatos SEO, datos estructurados Person, secciones de la página.
- `styles.css` — identidad gráfica, tipografía, diseño adaptable y accesibilidad visual.
- `app.js` — menú móvil, año dinámico y enlaces de contacto con texto precargado por WhatsApp.
- `assets/monica-garcia-monograma.svg` — monograma original MG.
- `assets/monica-garcia-logo-horizontal.svg` — variante horizontal del logotipo.
- `assets/monica-garcia-ilustracion-hero.svg` — ilustración conceptual, sin fotografía.
- `assets/favicon.svg` — ícono para pestaña.

## Direcciones de contacto

Todas las acciones de contacto directo se configuran desde `app.js` y apuntan a:

`https://wa.me/525569143748`

Hay mensajes distintos para oportunidades laborales, solicitud de CV y conversación sobre el dashboard. No se ha integrado un formulario, WhatsApp Business API, bot ni seguimiento de conversiones. No se almacena información personal del visitante.

La portada muestra únicamente el botón **Hablemos por WhatsApp**. `cv.html` permanece como documento HTML imprimible, accesible desde enlaces internos existentes, pero sin botón de CV en la portada. No se publica el PDF original porque existen datos académicos pendientes de verificar.

## Criterios editoriales y pendientes antes de publicar

1. **Universidad por verificar:** el CV proporcionado menciona al Tecnológico de Monterrey, mientras que la información adicional indicó Universidad Iberoamericana. Se omitió la universidad de la web hasta confirmar el dato.
2. **Cire Equity — Park West:** solo se conoce que el contrato duró tres meses; faltan las fechas para ubicarlo cronológicamente.
3. **Lumina:** el CV indica abril de 2025 a “present”; validar si sigue vigente antes de publicar.
4. **Producto:** la transición hacia Product Operations y Product Ownership está descrita como objetivo profesional, **no como experiencia formal previa en estos cargos**.
5. **Dashboard Lumina:** la gráfica en la página es una **representación conceptual**. Los únicos números de alcance utilizados son los respaldados por el CV: 130+ cuentas; no se atribuyen tasas de desempeño, resultados financieros ni porcentajes no verificados.
6. **Canales profesionales:** incorporar enlace de LinkedIn solamente si Mónica comparte la URL confirmada.
7. **Dominio e indexación:** al aprobar el dominio final se debe agregar `canonical`, `og:url`, URL absoluta para `og:image`, sitemap, robots.txt y verificación en Search Console. Evitar apuntar a un subdominio no confirmado.
8. **Derechos y privacidad:** confirmar autorización de Mónica para publicar nombres de empresas, cifras de cartera y cualquier caso de estudio. No se publica información confidencial del dashboard ni copia íntegra del CV.
9. **Logotipo:** identidad original sin copiar escudos ni marcas de universidades.

## Validación local recomendada

- Revisar `index.html` y confirmar que todas las rutas a `assets/` y los archivos CSS/JS carguen.
- Probar menú y CTA WhatsApp en 360 px, 390 px, tablet y escritorio, además de navegación con teclado.
- Verificar contraste, textos extensos y desplazamiento horizontal en móvil.
- Ejecutar `node --check app.js` para validar sintaxis del JavaScript.
- Confirmar que los enlaces de WhatsApp abren el chat correcto con su texto precargado.
- Comprobar el contenido con Mónica antes de conectar un dominio y solicitar indexación.

## Identidad visual

Color principal `#15372e`, acento `#8f263e`, fondos `#f7f4ef`. La composición sigue una línea editorial profesional: cercana, humana y clara para reclutadores. Se evita usar fotografías personales por decisión expresa de Mónica.

---

Proyecto RAUVIAWEB · experiencia digital desarrollada por [RAUVIA Consulting](https://rauvia.com.mx/).


## Actualización de trayectoria — referencia editorial

La sección **Mi trayectoria** ahora muestra cinco experiencias en una sola línea temporal en escritorio (Marsh McLennan, Casa Cruz, Grand Velas Los Cabos, Lumina y Cire Equity — Park West), como en el mockup validado. Incluye indicadores circulares, líneas divisorias, fecha, espacio de identidad de empresa, puesto, ciudad (cuando está confirmada), resumen y etiqueta inferior alineada. En pantallas intermedias se distribuye en tres o dos columnas y en móvil cambia a una cronología vertical.

**Identidad de empresas:** Marsh McLennan utiliza una imagen vectorial referenciada desde Wikimedia Commons, por lo que su carga requiere conexión y debe comprobarse antes de publicar. Los nombres y símbolos de Casa Cruz, Grand Velas, Lumina y Park West usan tratamientos editoriales vectoriales/ tipográficos de referencia, no se presentan como archivos maestros de identidad oficial; sustituirlos por logos aprobados por los titulares cuando estén disponibles. Las representaciones se usan únicamente para identificar puestos anteriores, sin insinuar patrocinio ni afiliación de las empresas con la página.


## Animaciones SVG — lenguaje visual de la transición hacia producto

- **Ilustración de cabecera:** animación dentro del propio `assets/monica-garcia-ilustracion-hero.svg`, sin JavaScript ni librerías externas. Los enlaces entre nodos sugieren colaboración entre áreas, las tarjetas muestran seguimiento operativo y la gráfica representa medición y mejora continua. La figura profesional se mantiene estable para evitar movimiento distractor.
- **Diagrama Clientes → Procesos → Producto:** SVG inline en `index.html`, con órbitas y rutas de conexión, secuencia de tres etiquetas y un indicador que recorre la trayectoria cuando el navegador soporta `offset-path`. Sin soporte, las líneas y etiquetas se mantienen legibles.
- **Visibilidad:** `app.js` usa `IntersectionObserver` para iniciar y suspender el movimiento del diagrama al entrar o salir del viewport.
- **Accesibilidad:** el control **Pausar animaciones / Reanudar animaciones** detiene ambas composiciones. El SVG de cabecera cambia al archivo `assets/monica-garcia-ilustracion-hero-estatica.svg`; si el sistema declara `prefers-reduced-motion: reduce`, se usa automáticamente la versión estática y no se ejecuta movimiento ornamental.
- **Rendimiento:** gráficos vectoriales y CSS, sin animación sobre tamaño de layout, sin paquetes nuevos y sin llamadas de red o telemetría adicionales. El botón no altera otros enlaces ni funcionalidades.

**Comprobación recomendada:** probar entrada y salida de sección, reproducción y pausa, cambio de preferencia del sistema, vista de 360 px y navegadores Chrome, Safari y Firefox. El contenido permanece visible sin ejecutar JavaScript.

## Hero según mockup aprobado

La portada utiliza el encabezado en dos líneas **«OPERACIONES HOY, / MEJORES PRODUCTOS MAÑANA»**, el nombre en dos renglones, la especialidad **Product Operations & Client Experience**, la descripción de su propuesta de valor y un único CTA principal: **Hablemos por WhatsApp**. El botón para ver el CV se retiró de la portada por decisión editorial; el contacto conserva su número configurado. La disponibilidad distingue **México / Remoto** de **Abierta a oportunidades en México y equipos internacionales**.

El formato del CV en `cv.html` no reclama experiencia formal previa como Product Owner y evita publicar una universidad todavía no confirmada. Se puede imprimir o guardar como PDF con el botón correspondiente.

## SEO y LLMO — arquitectura semántica RAUVIAWEB

La implementación sigue la lógica de los sitios profesionales de Erika Morales y Allison García: HTML público y legible por crawlers, intención diferenciada por página, datos estructurados, archivos para motores de búsqueda y un contexto trazable para lectores de IA. **Incluye ahora una capa opcional de telemetría con backend Node**, con sitio aislado `monica-garcia` y destino contractual MySQL Hostinger `u345974778_rauviaplatform`; se conserva el sitio público estático. La telemetría permanece desactivada hasta configurar credenciales privadas, validar el esquema y autorizar su publicación. Ver [guía de telemetría](docs/telemetry-hostinger.md).

### Páginas y política de indexación

| URL | Objetivo | Indexación |
|---|---|---|
| `/` | Perfil, trayectoria, resultados y dashboard de Lumina | Sí |
| `/como-puedo-ayudarte/` | Necesidades de reclutadores y problemas que puede resolver | Sí |
| `/perspectiva/` | Narrativa de transición y criterio de trabajo | Sí |
| `/cv.html` | CV legible e imprimible para el visitante | No; mantiene `noindex,follow` |

Los archivos `llms.txt`, `llms-full.txt` y `knowledge/monica-garcia.json` ofrecen contexto sobre experiencia, intereses, métricas, procedencia y límites de las afirmaciones. No son un mecanismo garantizado de presencia, cita o ranking de IA. No se inventan certificaciones, universidades, enlaces de LinkedIn ni experiencia de Product Owner.

### Publicar con dominio real

**Dominio canónico confirmado:** `https://monicagarcia.rauviaweb.mx/`. Los archivos fuente y el generador SEO ya usan esta dirección en las tres rutas indexables. Para crear el paquete publicable, ejecuta:

```bash
npm test
npm run seo:build
```

El generador utiliza `https://monicagarcia.rauviaweb.mx` como origen por defecto. La opción `--site-url` se conserva para pruebas controladas con otros hosts; no debe usarse para publicar un dominio diferente. Ninguno de estos comandos despliega el sitio.

`seo:build` produce `dist/` con las páginas y recursos, canonical por ruta, `og:url`, imágenes OG absolutas, identificadores del grafo JSON-LD vinculados al mismo dominio, `robots.txt` con el sitemap de producción y `sitemap.xml` con exactamente las tres páginas indexables. La raíz del repositorio también contiene `robots.txt` y `sitemap.xml` para el dominio confirmado. `dist/` está ignorado por Git.

No publiques directamente la raíz del repositorio como carpeta final si necesitas sitemap/canonical definitivos; sirve para revisar localmente mediante Live Server. Usa `dist/` como raíz de archivos estáticos en el hosting elegido cuando llegue el momento.

### Verificación y límites

Ejecuta `npm test`: valida sintaxis JavaScript, enlaces locales, H1 y metadescripciones por página, JSON-LD, coherencia de identidad, avisos de no verificación externa, CV noindex, sitemap y canonical construidos con un dominio de prueba solo en una carpeta temporal que el propio test elimina. El workflow `.github/workflows/seo-llmo-qa.yml` repite la validación en GitHub Actions, **sin publicar el sitio**.

Antes de solicitar indexación, comprobar que el dominio confirmado tenga DNS y certificado HTTPS, resuelva correctamente las tres rutas, que no existan versiones duplicadas del host, y confirmar institución educativa, fechas exactas de Park West, vigencia de Lumina, autorización para publicar métricas, imagen de Open Graph compatible con redes sociales, enlace LinkedIn real y Search Console. La declaración `og:image` actual usa una ilustración SVG y debe validarse con los scrapers de destino; no todos aceptan SVG.

La capa es compatible con HTML estático y mantiene las CTA por WhatsApp, el estilo editorial, las animaciones y el footer que acredita a RAUVIA Consulting.

## Fidelidad visual — Habilidades, herramientas e idiomas

Esta sección se ajustó al mockup de referencia: **sin titular gigante**, tres columnas compactas separadas por líneas finas, 10 etiquetas de habilidades, 8 marcas en dos filas de cuatro, y banderas redondas con barras cualitativas para español, inglés y francés. El diseño mantiene una sola columna en móvil y dos columnas intermedias en tableta. Los recursos gráficos están en `assets/skills/*.svg` y no requieren red para cargar.

**Validación editorial antes de publicar:** el mockup incorpora `Product Operations (en desarrollo)`, `Data Analysis (básico)`, `Team Collaboration`, `Notion` y `Google Workspace`. El cargo de Product Operations está expresamente identificado como una dirección de desarrollo. Las habilidades y herramientas adicionales del mockup deben revisarse con Mónica antes de interpretarlas como experiencia laboral acreditada; no se han agregado a Schema.org o a llms.txt como competencias documentadas. Las barras de idioma son representaciones cualitativas (nativo, avanzado, básico), no porcentajes certificados. Algunas insignias de marca son recreaciones vectoriales del mockup y deben sustituirse por artes autorizadas si se exige identidad corporativa oficial.

Tres iconos (Stripe, Mailchimp y Notion) utilizan contornos vectoriales obtenidos del proyecto abierto Simple Icons (CC0), respetando que los nombres y símbolos siguen siendo marcas de sus titulares.

## TEKTARYON G2/G3 — Telemetría y seis anchos

Se implementó la instrumentación frontend de visitas, secciones y WhatsApp, y backend Node para eventos humanos y detección de crawlers, usando el contrato MySQL de Erika y Allison. Las claves nunca se incluyen en recursos públicos. El repositorio incorpora pruebas de servidor sin conexión real a Hostinger. La conexión de producción requiere verificar credenciales, esquema y hosting. Véase [`docs/telemetry-hostinger.md`](docs/telemetry-hostinger.md).

Se corrigió el desbordamiento de `.content-contrast` a 1024 px con una única regla de tablet; la ejecución de `TEKTARYON G3 — Visual QA` conserva capturas de seis anchos y su ledger en GitHub Actions. G3 permanece sujeto a revisión de evidencias y no habilita automáticamente un despliegue.
