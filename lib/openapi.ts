import { SITE_URL } from "@/lib/asistentes";

const errorRef = { $ref: "#/components/schemas/Error" };
const respuestaError = (description: string, codigo: string, mensaje: string) => ({
  description,
  content: { "application/json": { schema: errorRef, example: { error: { codigo, mensaje } } } },
});

export function especificacion() {
  return {
    openapi: "3.1.0",
    info: {
      title: "API de asistentes · DevFest 2026 Tacna",
      version: "1.0.0",
      description: [
        "API de solo lectura con los asistentes de la **Experiencia Premium** del DevFest 2026 Tacna y los links de sus entradas.",
        "",
        "**Autenticación:** envía tu API key en el header `Authorization: Bearer <API_KEY>`. Pulsa **Authorize** para probar los endpoints desde esta página.",
        "",
        "Usa la API **desde tu servidor**: no incluyas la clave en código que corra en el navegador o en una app móvil.",
      ].join("\n"),
      contact: { name: "GDG Tacna", url: "https://devfest.gdgtacna.com" },
    },
    servers: [{ url: `${SITE_URL}/api/v1` }],
    security: [{ apiKey: [] }],
    tags: [{ name: "Asistentes", description: "Personas registradas en la Experiencia Premium y sus entradas." }],
    paths: {
      "/asistentes": {
        get: {
          tags: ["Asistentes"],
          operationId: "listarAsistentes",
          summary: "Listar asistentes",
          description:
            "Devuelve los asistentes en orden de registro (el más antiguo primero). Para recorrer todos, repite la petición con `offset = paginacion.siguiente_offset` hasta que sea `null`.",
          parameters: [
            {
              name: "limite",
              in: "query",
              description: "Cuántos asistentes devolver.",
              schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
            },
            {
              name: "offset",
              in: "query",
              description: "Cuántos asistentes saltar, para paginar.",
              schema: { type: "integer", minimum: 0, default: 0 },
            },
            {
              name: "desde",
              in: "query",
              description:
                "Solo los registrados **después** de esta fecha (ISO 8601, p. ej. `2026-10-01T00:00:00Z`). Útil para sincronizar solo los nuevos.",
              schema: { type: "string", format: "date-time" },
            },
          ],
          responses: {
            "200": {
              description: "Página de asistentes.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["datos", "paginacion"],
                    properties: {
                      datos: { type: "array", items: { $ref: "#/components/schemas/Asistente" } },
                      paginacion: { $ref: "#/components/schemas/Paginacion" },
                    },
                  },
                },
              },
            },
            "400": respuestaError("Parámetro inválido.", "parametro_invalido", "'limite' debe ser un entero entre 1 y 200."),
            "401": { $ref: "#/components/responses/NoAutorizado" },
          },
        },
      },
      "/asistentes/{id}": {
        get: {
          tags: ["Asistentes"],
          operationId: "obtenerAsistente",
          summary: "Obtener un asistente",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Identificador del asistente (es el final del link de su entrada).",
              schema: { type: "string" },
              example: "ana-torres-quispe-a1b2c3",
            },
          ],
          responses: {
            "200": {
              description: "El asistente.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["datos"],
                    properties: { datos: { $ref: "#/components/schemas/Asistente" } },
                  },
                },
              },
            },
            "401": { $ref: "#/components/responses/NoAutorizado" },
            "404": respuestaError("No existe un asistente con ese id.", "no_encontrado", "No existe un asistente con id 'abc'."),
          },
        },
      },
    },
    components: {
      securitySchemes: {
        apiKey: { type: "http", scheme: "bearer", description: "API key entregada por GDG Tacna." },
      },
      responses: {
        NoAutorizado: respuestaError(
          "Falta la API key o no es válida.",
          "no_autorizado",
          "Falta la API key o no es válida. Envíala como 'Authorization: Bearer <clave>'.",
        ),
      },
      schemas: {
        Asistente: {
          type: "object",
          required: ["id", "nombre", "email", "telefono", "registrado_en", "entrada_url", "imagen_url"],
          properties: {
            id: { type: "string", example: "ana-torres-quispe-a1b2c3" },
            nombre: { type: "string", example: "Ana Torres Quispe" },
            email: { type: ["string", "null"], format: "email", example: "ana@example.com" },
            telefono: { type: ["string", "null"], example: "987654321" },
            registrado_en: { type: "string", format: "date-time", example: "2026-10-05T02:43:18.995Z" },
            entrada_url: {
              type: "string",
              format: "uri",
              description: "Página pública de la entrada, con botones para compartir.",
              example: `${SITE_URL}/entrada/ana-torres-quispe-a1b2c3`,
            },
            imagen_url: {
              type: "string",
              format: "uri",
              description: "Imagen PNG de la entrada (1024×1536).",
              example: `${SITE_URL}/entrada/ana-torres-quispe-a1b2c3/imagen`,
            },
          },
        },
        Paginacion: {
          type: "object",
          required: ["total", "limite", "offset", "siguiente_offset"],
          properties: {
            total: { type: "integer", description: "Total de asistentes que cumplen el filtro.", example: 120 },
            limite: { type: "integer", example: 50 },
            offset: { type: "integer", example: 0 },
            siguiente_offset: {
              type: ["integer", "null"],
              description: "Offset de la siguiente página, o `null` si no hay más.",
              example: 50,
            },
          },
        },
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["codigo", "mensaje"],
              properties: {
                codigo: { type: "string", enum: ["parametro_invalido", "no_autorizado", "no_encontrado"] },
                mensaje: { type: "string" },
              },
            },
          },
        },
      },
    },
  };
}
