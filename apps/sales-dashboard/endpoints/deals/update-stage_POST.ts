import superjson from "superjson";
import { db } from "../../helpers/db";
import { schema, type OutputType } from "./update-stage_POST.schema";

export async function handle(request: Request) {
  try {
    const input = schema.parse(superjson.parse(await request.text()));
    const res = await db
      .updateTable("deals")
      .set({ stage: input.stage, updatedAt: new Date() })
      .where("id", "=", input.id)
      .executeTakeFirst();
    if (Number(res.numUpdatedRows) === 0) {
      return new Response(superjson.stringify({ error: "Deal not found" }), { status: 404 });
    }
    return new Response(superjson.stringify({ ok: true } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
