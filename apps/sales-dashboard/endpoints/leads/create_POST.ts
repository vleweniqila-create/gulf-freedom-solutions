import superjson from "superjson";
import { db } from "../../helpers/db";
import { schema, type OutputType } from "./create_POST.schema";

export async function handle(request: Request) {
  try {
    const input = schema.parse(superjson.parse(await request.text()));
    const row = await db
      .insertInto("leads")
      .values({
        contactName: input.contactName,
        businessName: input.businessName,
        email: input.email || null,
        phone: input.phone || null,
        source: input.source,
        notes: input.notes || null,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return new Response(superjson.stringify({ id: row.id } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
