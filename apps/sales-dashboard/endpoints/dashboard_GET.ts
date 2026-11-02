import superjson from "superjson";
import { sql } from "kysely";
import { db } from "../helpers/db";
import type { OutputType, DashboardDeal } from "./dashboard_GET.schema";

const OPEN_STAGES = ["discovery", "proposal", "negotiation"] as const;

export async function handle(_request: Request) {
  try {
    const [monthlyRows, totals, dealRows, leadRows, newLeads, sample] = await Promise.all([
      db
        .selectFrom("payments")
        .select([
          sql<string>`to_char(date_trunc('month', paid_on), 'YYYY-MM')`.as("month"),
          sql<string>`coalesce(sum(amount) filter (where kind = 'one_time'), 0)`.as("oneTime"),
          sql<string>`coalesce(sum(amount) filter (where kind = 'recurring'), 0)`.as("recurring"),
        ])
        .where(sql<boolean>`paid_on >= date_trunc('month', current_date) - interval '5 months'`)
        .groupBy(sql`date_trunc('month', paid_on)`)
        .execute(),
      db
        .selectFrom("payments")
        .select([
          sql<string>`coalesce(sum(amount) filter (where paid_on >= date_trunc('month', current_date)), 0)`.as("thisMonth"),
          sql<string>`coalesce(sum(amount) filter (where paid_on >= date_trunc('month', current_date) - interval '1 month' and paid_on < date_trunc('month', current_date)), 0)`.as("lastMonth"),
          sql<string>`coalesce(sum(amount) filter (where paid_on >= date_trunc('year', current_date)), 0)`.as("ytd"),
        ])
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("deals")
        .select(["id", "clientName", "service", "stage", "oneTimeValue", "monthlyValue", "expectedClose", "updatedAt"])
        .orderBy("updatedAt", "desc")
        .execute(),
      db
        .selectFrom("leads")
        .select(["id", "contactName", "businessName", "email", "phone", "source", "status", "notes", "createdAt"])
        .orderBy("createdAt", "desc")
        .limit(12)
        .execute(),
      db
        .selectFrom("leads")
        .select(sql<string>`count(*)`.as("count"))
        .where(sql<boolean>`created_at >= now() - interval '30 days'`)
        .executeTakeFirstOrThrow(),
      sql<{ has: boolean }>`select (exists(select 1 from leads where is_sample) or exists(select 1 from deals where is_sample) or exists(select 1 from payments where is_sample)) as has`
        .execute(db)
        .then((r) => r.rows[0]),
    ]);

    const byMonth = new Map(monthlyRows.map((r) => [r.month, r]));
    const now = new Date();
    const monthlyRevenue: OutputType["monthlyRevenue"] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const row = byMonth.get(key);
      monthlyRevenue.push({
        month: key,
        label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
        oneTime: Number(row?.oneTime ?? 0),
        recurring: Number(row?.recurring ?? 0),
      });
    }

    const deals: DashboardDeal[] = dealRows.map((d) => ({
      ...d,
      oneTimeValue: Number(d.oneTimeValue),
      monthlyValue: Number(d.monthlyValue),
    }));
    const openDeals = deals.filter((d) => (OPEN_STAGES as readonly string[]).includes(d.stage));
    const wonDeals = deals.filter((d) => d.stage === "won");

    const output: OutputType = {
      kpis: {
        revenueThisMonth: Number(totals.thisMonth),
        revenueLastMonth: Number(totals.lastMonth),
        revenueYearToDate: Number(totals.ytd),
        monthlyRecurring: wonDeals.reduce((s, d) => s + d.monthlyValue, 0),
        // Pipeline counts the one-time fee plus the first 12 months of recurring value.
        pipelineValue: openDeals.reduce((s, d) => s + d.oneTimeValue + d.monthlyValue * 12, 0),
        openDeals: openDeals.length,
        newLeads30d: Number(newLeads.count),
      },
      monthlyRevenue,
      openDeals,
      recentWins: wonDeals.slice(0, 5),
      recentLeads: leadRows,
      hasSampleData: Boolean(sample?.has),
    };
    return new Response(superjson.stringify(output satisfies OutputType));
  } catch (error) {
    console.error("dashboard failed", error);
    return new Response(superjson.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
