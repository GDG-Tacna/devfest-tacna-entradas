# DevFest 2026 Tacna · Entradas

Genera una entrada personalizada (con link propio) por cada asistente de la Experiencia Premium, a partir del diseño del Premium Pass.

Producción: https://entradas.gdgtacna.com · Admin: https://entradas.gdgtacna.com/admin

## Admin

En `/admin` se registra a cada asistente cuando confirma su pago (nombre, y opcionalmente correo, celular y nota de pago). Al guardar se genera su entrada y su link al instante. Desde la lista puedes:

- **Ver** la entrada, **Copiar** el link o enviarlo por **WhatsApp** (si tiene celular; a los números de 9 dígitos se les agrega +51).
- **Editar** los datos. El link no cambia aunque corrijas el nombre, y la imagen se actualiza sola.
- **Eliminar** al asistente (su link deja de funcionar).
- **Exportar CSV** con todos los asistentes y sus links (se abre bien en Excel).

El acceso es con la contraseña de la variable `ADMIN_PASSWORD`. Para cambiarla:

```bash
vercel env rm ADMIN_PASSWORD production
vercel env add ADMIN_PASSWORD production --sensitive
vercel deploy --prod   # o haz cualquier push a main
```

Cambiarla cierra todas las sesiones abiertas.

## API para terceros

API REST de solo lectura para que otros sistemas consulten a los asistentes. Base: `https://entradas.gdgtacna.com/api/v1`

- **Documentación interactiva (Swagger UI):** https://entradas.gdgtacna.com/docs
- **Especificación OpenAPI 3.1:** https://entradas.gdgtacna.com/api/v1/openapi.json (sirve para importar en Postman, Insomnia o generar clientes). Se define en `lib/openapi.ts`; si cambias la API, actualízala ahí.

### Autenticación

Cada petición debe llevar una API key:

```
Authorization: Bearer <API_KEY>
```

Las claves válidas están en la variable `API_KEYS`, separadas por coma. Lo ideal es **una clave por integración**: así puedes revocar una sin afectar a las demás. Para agregar o revocar:

```bash
vercel env rm API_KEYS production
vercel env add API_KEYS production --sensitive   # p. ej. dft_clave1,dft_clave2
vercel deploy --prod   # o haz cualquier push a main
```

Generar una clave nueva: `echo "dft_$(openssl rand -hex 24)"`.

La API está pensada para usarse **desde un servidor**. No pongas la clave en código que corra en el navegador o en una app móvil, porque cualquiera podría leerla.

### `GET /asistentes`

Lista a los asistentes en orden de registro (el más antiguo primero).

| Parámetro | Por defecto | Descripción |
| --- | --- | --- |
| `limite` | 50 | Cuántos devolver (1–200) |
| `offset` | 0 | Cuántos saltar, para paginar |
| `desde` | — | Fecha ISO 8601; solo los registrados **después** de ella. Útil para sincronizar solo los nuevos |

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "https://entradas.gdgtacna.com/api/v1/asistentes?limite=50&desde=2026-10-01T00:00:00Z"
```

```json
{
  "datos": [
    {
      "id": "ana-torres-quispe-a1b2c3",
      "nombre": "Ana Torres Quispe",
      "email": null,
      "telefono": null,
      "registrado_en": "2026-10-05T02:43:18.995Z",
      "entrada_url": "https://entradas.gdgtacna.com/entrada/ana-torres-quispe-a1b2c3",
      "imagen_url": "https://entradas.gdgtacna.com/entrada/ana-torres-quispe-a1b2c3/imagen"
    }
  ],
  "paginacion": { "total": 1, "limite": 50, "offset": 0, "siguiente_offset": null }
}
```

Para recorrer todo, repite la petición con `offset=siguiente_offset` hasta que sea `null`.

### `GET /asistentes/{id}`

Devuelve un asistente: `{ "datos": { ... } }`, con los mismos campos.

### Errores

Todas las respuestas de error tienen la forma `{ "error": { "codigo": "...", "mensaje": "..." } }`.

| Estado | `codigo` | Cuándo |
| --- | --- | --- |
| 400 | `parametro_invalido` | `limite`, `offset` o `desde` con formato incorrecto |
| 401 | `no_autorizado` | Falta la clave o no es válida |
| 404 | `no_encontrado` | El `id` no existe |

La **nota de pago** no se expone por la API, porque es de uso interno del admin. El correo y el celular sí se incluyen.

## Rutas públicas

| Ruta | Qué es |
| --- | --- |
| `/entrada/<id>` | Página del asistente con su entrada y botones para compartir |
| `/entrada/<id>/imagen` | PNG de la entrada (1024×1536) |
| `/entrada/<id>/opengraph-image` | Vista previa 1200×630 para LinkedIn, WhatsApp, etc. |

Las entradas se generan la primera vez que alguien las abre y luego quedan en caché. Al crear, editar o eliminar desde el admin, la caché se actualiza.

## Compartir

- **LinkedIn**: abre el diálogo de compartir con el link; LinkedIn muestra la vista previa con la entrada. (LinkedIn guarda su propia copia de la vista previa: si editas un nombre después de que alguien compartió, puede tardar en reflejarse allí.)
- **Instagram**: Instagram no permite compartir links desde la web. En el celular se abre el menú nativo para compartir la imagen; en computadora se descarga la imagen y se copia el texto.

## Base de datos

Neon Postgres, conectado al proyecto vía Vercel Marketplace (`DATABASE_URL`). Tabla `asistentes`; se crea con:

```bash
node --env-file=.env.local scripts/db-setup.mjs
```

**Ojo:** en local se usa la misma base de datos que producción.

## Publicar cambios

El proyecto de Vercel está conectado a este repo:

- **Push a `main`** → se publica en producción (https://entradas.gdgtacna.com).
- **Pull request** → Vercel crea una URL de prueba y la comenta en el PR.

Las URLs de prueba usan la **misma base de datos** que producción, y no tienen `ADMIN_PASSWORD` ni `API_KEYS` (el admin y la API no funcionan ahí). Úsalas para revisar cambios visuales, no para registrar asistentes.

Las variables de entorno se cambian en Vercel (`vercel env ...` o el dashboard), nunca en el repo. Después de cambiarlas hay que volver a publicar (`vercel deploy --prod` o un push a `main`).

## Desarrollo

```bash
vercel env pull .env.local   # trae DATABASE_URL
echo "ADMIN_PASSWORD=algo-local" >> .env.local
npm install
npm run dev                  # http://localhost:3000
```

## Archivos del diseño

- `assets/ticket-base.png` — el diseño original con la caja del nombre vacía y fondo transparente.
- `assets/GoogleSans-Bold.ttf` — Google Sans Bold (solo caracteres latinos) para dibujar el nombre.
