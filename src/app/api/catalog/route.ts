import catalog from "@/data/catalog.json";

export async function GET() {
  return Response.json(catalog);
}
