# RAUVIAWEB Mónica García — Telemetría Hostinger / TEKTARYON

## Contrato técnico

- **Sitio:** `https://monicagarcia.rauviaweb.mx`
- **TELEMETRY_SITE_ID:** `monica-garcia`
- **TELEMETRY_SITE_HOST:** `monicagarcia.rauviaweb.mx`
- **DB_NAME:** `u345974778_rauviaplatform`
- **Referencia de arquitectura:** Erika Morales + Allison García (tablas compartidas `visitors`, `sessions`, `web_events`, `ai_crawler_visits`).
- **Backend:** `telemetry/server.mjs` (Node 22, HTTP nativo y mysql2 como dependencia exclusivamente de servidor).
- **Cliente:** `telemetry/client.js` incluido en las tres páginas semánticas por `scripts/build-seo.mjs`.
- **Estado:** implementación de código, integración viva a MySQL **pendiente de credenciales, inspección del esquema y validación desde Hostinger**. No se ha hecho despliegue ni escritura real.

## Modelo de datos existente (sin DDL automático)

`visitors`: `site_id`, `visitor_id`, `first_seen_at`, `last_seen_at`.

`sessions`: `site_id`, `session_id`, `visitor_id`, `started_at`, `last_activity_at`, `landing_page`, `exit_page`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `device_type`.

`web_events`: `site_id`, `visitor_id`, `session_id`, `event_name`, `event_timestamp`, `properties`.

`ai_crawler_visits`: `site_id`, `crawler_name`, `crawler_family`, `user_agent`, `request_path`, `request_method`, `status_code`, `referer`, `requested_at`, `response_time_ms`, `ip_hash`, `properties`.

Validación obligatoria: las tablas deben existir, contener los campos de contrato, permitir `ip_hash = NULL` y tener índice **UNIQUE(site_id, visitor_id)** en `visitors` y **UNIQUE(site_id, session_id)** en `sessions`. Un índice UNIQUE exclusivamente por visitor/session sin site_id es incompatible y bloqueará la inserción. **No aplicar ALTER ni CREATE a ciegas** en la base compartida.

Comprobaciones SQL de solo lectura para Hostinger/phpMyAdmin:

```sql
SELECT DATABASE();
SHOW COLUMNS FROM visitors;
SHOW INDEX FROM visitors;
SHOW COLUMNS FROM sessions;
SHOW INDEX FROM sessions;
SHOW COLUMNS FROM web_events;
SHOW INDEX FROM web_events;
SHOW COLUMNS FROM ai_crawler_visits;
SHOW INDEX FROM ai_crawler_visits;
```

Las tablas compartidas pertenecen a RAUVIA; el servidor rechaza `DB_NAME` diferente, `site_id` diferente o índices que impidan aislamiento multisitio.

## Eventos capturados

**Personas:** `page_view` en las tres rutas públicas; `section_view` una vez por sección visible; `whatsapp_click` y `rauvia_click` en interacciones de contacto. El cliente solicita `/api/telemetry/config` únicamente desde el host canónico, y solo transmite cuando `enabled=true`. DNT/GPC, agentes de bots y navegador sin UUID seguro quedan fuera.

**Crawlers:** GET/HEAD de páginas y recursos semánticos como `robots.txt`, `sitemap.xml` y `llms.txt`. Detección basada en User-Agent, **no identidad criptográficamente verificada**: `properties.verified=false`. Se filtran recursos estáticos y se deduplican solicitudes dentro de una ventana de 60 s.

**Privacidad:** no se registra IP, `x-forwarded-for`, referer, URL con query, mensaje de WhatsApp, formulario, correo, nombre ni keystrokes. Los UUID se mantienen en `sessionStorage` durante un máximo de 30 minutos de inactividad; en servidor se transforman mediante SHA-256 asociado al site_id. El campo `user_agent` de crawler guarda el nombre del crawler detectado (no cadena completa); `ip_hash` es NULL. Sin cookies de analytics. Incluir la descripción de medición agregada en el aviso de privacidad antes de publicar.

## Configuración en Hostinger

La arquitectura **requiere un proceso Node activo en el mismo origen** que sirve el sitio, o una reescritura/proxy seguro de `/api/telemetry` y `/api/telemetry/config` hacia ese backend. **Una carpeta `dist/` estática por sí sola no puede escribir en MySQL**. No enviar claves de BD al navegador, a GitHub, al archivo público `dist/` ni a código JavaScript cliente.

1. Crear el archivo privado `.env` a partir de `.env.example`, con `DB_HOST`, `DB_USER` y `DB_PASSWORD` proporcionados por Hostinger. Configurar `DB_NAME=u345974778_rauviaplatform`, `TELEMETRY_SITE_ID=monica-garcia`, `TELEMETRY_SITE_HOST=monicagarcia.rauviaweb.mx`, `TELEMETRY_ENABLED=1`, `SITE_MODE=production`. Verificar que el hosting pueda conectar a MySQL local/remoto.
2. Instalar dependencias solo en servidor (`npm install --omit=dev`) y generar publicación (`npm run seo:build`). `dist/` debe contener exclusivamente los recursos estáticos, incluido `telemetry/client.js`.
3. Ejecutar diagnóstico del esquema desde entorno autorizado (`npm run telemetry:check-db`), sin crear ni alterar tablas. Requiere credenciales. Debe reportar `schemaVerified=true`.
4. Para prueba aislada iniciar `npm run telemetry:start`, comprobar `GET /healthz` y `GET /api/telemetry/config`. El estado solo expone flags, nunca host de BD ni claves.
5. Configurar dominio HTTPS y el proxy/Node server solo en la etapa de release G4 autorizada; entonces probar desde el dominio real dos eventos y una visita de crawler de prueba, comprobando filas filtradas por `site_id`. No ejecutar escrituras de prueba en la base compartida sin control.
6. Mantener `TELEMETRY_ENABLED=0` cuando no exista conexión verificada. Con fallo de BD, la respuesta del sitio y el WhatsApp permanecen disponibles; los eventos fallidos se descartan y **no** se inventa persistencia.

## Pruebas automáticas

`npm test` incluye SEO/LLMO y pruebas del contrato de servidor usando MySQL simulado (sin conectar con Hostinger): aislamiento, SQL de cuatro tablas, rechazo de origen cruzado, crawler, privacidad, rutas y modo preview noindex.

`TEKTARYON G3 — Visual QA` toma capturas a 360/390/768/1024/1440/1920 px. El cliente de telemetría **no hace peticiones en localhost**, por tanto no afecta estas pruebas ni genera registros espurios en MySQL.

## Gate status

- G0 y G1: cerrados por decisión del responsable.
- G2: integración de código y contrato de BD preparados; falta validar esquema remoto y hosting.
- G3: pruebas visuales y de servidor; visual contra mockups requiere revisión humana.
- G4/G5: no autorizados en este desarrollo. Ningún despliegue efectuado.
