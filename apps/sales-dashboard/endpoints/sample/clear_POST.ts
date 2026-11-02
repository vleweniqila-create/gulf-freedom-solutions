import superjson from "superjson";
import { db } from "../../helpers/db";
import type { OutputType } from "./clear_POST.schema";

// Removes only the rows seeded as examples (is_sample = true); real entries are never touched.
export async function handle(_request: Request) {
  try {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom("payments").where("isSample", "=", true).execute();
      await trx.deleteFrom("deals").where("isSample", "=", true).execute();
      await trx.deleteFrom("leads").where("isSample", "=", true).execute();
    });
    return new Response(superjson.stringify({ ok: true } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
