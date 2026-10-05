import { especificacion } from "@/lib/openapi";

export function GET() {
  return Response.json(especificacion(), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
