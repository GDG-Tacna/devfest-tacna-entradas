// Swagger UI servido como HTML propio para que no herede los estilos de la app.
const SWAGGER = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.1";

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>API · DevFest 2026 Tacna</title>
  <meta name="robots" content="noindex" />
  <link rel="stylesheet" href="${SWAGGER}/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fff; }
    .franja { height: 6px; background: linear-gradient(90deg, #4285f4 0 25%, #ea4335 25% 50%, #fbbc04 50% 75%, #34a853 75%); }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div class="franja"></div>
  <div id="swagger"></div>
  <script src="${SWAGGER}/swagger-ui-bundle.js" crossorigin></script>
  <script>
    SwaggerUIBundle({
      url: "/api/v1/openapi.json",
      dom_id: "#swagger",
      deepLinking: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
    });
  </script>
</body>
</html>`;

export function GET() {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
