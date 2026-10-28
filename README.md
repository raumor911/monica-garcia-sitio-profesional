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

El botón **Ver mi CV** abre `cv.html`, una versión HTML imprimible del resumen profesional, con opción de guardar como PDF desde el navegador. No se publica el PDF original proporcionado porque hay una discrepancia académica por verificar; la versión HTML omite el nombre de la universidad hasta confirmarlo.

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

La portada utiliza el encabezado en dos líneas **«OPERACIONES HOY, / MEJORES PRODUCTOS MAÑANA»**, el nombre en dos renglones, la especialidad **Product Operations & Client Experience**, la descripción de su propuesta de valor y los dos CTA del mockup. El botón **Hablemos por WhatsApp** conserva el contacto configurado; **Ver mi CV** abre la versión HTML imprimible y no redirige a WhatsApp porque no busca iniciar una conversación. La disponibilidad distingue **México / Remoto** de **Abierta a oportunidades en México y equipos internacionales**.

El formato del CV en `cv.html` no reclama experiencia formal previa como Product Owner y evita publicar una universidad todavía no confirmada. Se puede imprimir o guardar como PDF con el botón correspondiente.

## SEO y LLMO — arquitectura semántica RAUVIAWEB

La implementación sigue la lógica de los sitios profesionales de Erika Morales y Allison García: HTML público y legible por crawlers, intención diferenciada por página, datos estructurados, archivos para motores de búsqueda y un contexto trazable para lectores de IA. **No incluye telemetría ni un backend**; no se reusa ni se crea una conexión MySQL de los otros sitios sin una autorización explícita de infraestructura.

### Páginas y política de indexación

| URL | Objetivo | Indexación |
|---|---|---|
| `/` | Perfil, trayectoria, resultados y dashboard de Lumina | Sí |
| `/como-puedo-ayudarte/` | Necesidades de reclutadores y problemas que puede resolver | Sí |
| `/perspectiva/` | Narrativa de transición y criterio de trabajo | Sí |
| `/cv.html` | CV legible e imprimible para el visitante | No; mantiene `noindex,follow` |

Los archivos `llms.txt`, `llms-full.txt` y `knowledge/monica-garcia.json` ofrecen contexto sobre experiencia, intereses, métricas, procedencia y límites de las afirmaciones. No son un mecanismo garantizado de presencia, cita o ranking de IA. No se inventan certificaciones, universidades, enlaces de LinkedIn ni experiencia de Product Owner.

### Publicar con dominio real

La fuente de Git **no declara una URL canónica inventada**. Una vez que el dominio de Mónica esté confirmado, genera la carpeta publicable:

```bash
npm run seo:build -- --site-url https://DOMINIO_CONFIRMADO
npm test
```

> Reemplaza `https://DOMINIO_CONFIRMADO` con el origen HTTPS real, sin ruta ni barra adicional en el argumento. El generador no acepta dominios de ejemplo y **no realiza ningún despliegue ni push adicional**.

`seo:build` produce `dist/` con las páginas y recursos, canonical por ruta, `og:url`, imágenes OG absolutas, identificadores del grafo JSON-LD vinculados al mismo dominio, `robots.txt` con el sitemap de producción y `sitemap.xml` con exactamente las tres páginas indexables. `dist/` está ignorado por Git.

No publiques directamente la raíz del repositorio como carpeta final si necesitas sitemap/canonical definitivos; sirve para revisar localmente mediante Live Server. Usa `dist/` como raíz de archivos estáticos en el hosting elegido cuando llegue el momento.

### Verificación y límites

Ejecuta `npm test`: valida sintaxis JavaScript, enlaces locales, H1 y metadescripciones por página, JSON-LD, coherencia de identidad, avisos de no verificación externa, CV noindex, sitemap y canonical construidos con un dominio de prueba solo en una carpeta temporal que el propio test elimina. El workflow `.github/workflows/seo-llmo-qa.yml` repite la validación en GitHub Actions, **sin publicar el sitio**.

Antes de solicitar indexación, confirmar: dominio y HTTPS, redirección entre variantes del host, institución educativa, fechas exactas de Park West, vigencia de Lumina, autorización para publicar métricas, imagen de Open Graph compatible con los canales sociales deseados, enlace LinkedIn real y Search Console. La declaración `og:image` actual usa una ilustración SVG y debe validarse con los scrapers de destino; no todos aceptan SVG.

La capa es compatible con HTML estático y mantiene las CTA por WhatsApp, el estilo editorial, las animaciones y el footer que acredita a RAUVIA Consulting.
