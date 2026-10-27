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

El botón **Solicitar mi CV** va a WhatsApp porque no se ha publicado un PDF descargable: el CV disponible requiere revisar datos académicos y actualizar su enfoque hacia producto antes de exponerse públicamente.

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
