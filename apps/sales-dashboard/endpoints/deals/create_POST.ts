import superjson from "superjson";
import { db } from "../../helpers/db";
import { schema, type OutputType } from "./create_POST.schema";

export async function handle(request: Request) {
  try {
    const input = schema.parse(superjson.parse(await request.text()));
    const row = await db
      .insertInto("deals")
      .values({
        clientName: input.clientName,
        service: input.service,
        stage: input.stage,
        oneTimeValue: input.oneTimeValue,
        monthlyValue: input.monthlyValue,
        expectedClose: input.expectedClose,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return new Response(superjson.stringify({ id: row.id } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
