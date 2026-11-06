import { Helmet } from "react-helmet";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CircleDollarSign, Handshake, Plus, Repeat, UserPlus, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import { ThemeModeSwitch } from "../components/ThemeModeSwitch";
import { QuickAddDialog } from "../components/QuickAddDialog";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../components/Chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { useDashboard } from "../helpers/useDashboard";
import { useSalesMutations } from "../helpers/useSalesMutations";
import { salesLabels } from "../helpers/salesLabels";
import { toast } from "../helpers/toast";
import type { DealStage, LeadStatus } from "../helpers/schema";
import styles from "./_index.module.css";

const chartConfig = {
  recurring: { label: "Recurring", color: "var(--chart-color-1)" },
  oneTime: { label: "One-time", color: "var(--chart-color-2)" },
} satisfies ChartConfig;

const money = salesLabels.money;

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub?: React.ReactNode; tone?: "money" }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{icon}{label}</div>
      <div className={`${styles.kpiValue} ${tone === "money" ? styles.moneyValue : ""}`}>{value}</div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  );
}

export default function SalesDashboardPage() {
  const { data, isFetching, error, refetch } = useDashboard();
  const m = useSalesMutations();
  const loading = !data && isFetching;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const changeStage = (id: number, stage: DealStage, client: string) =>
    m.updateDealStage.mutate(
      { id, stage },
      {
        onSuccess: () => toast.success(stage === "won" ? `${client} won! Log the payment when it lands.` : `Moved to ${salesLabels.stage[stage]}`),
        onError: (e) => toast.error(e.message),
      },
    );

  const changeLeadStatus = (id: number, status: LeadStatus) =>
    m.updateLeadStatus.mutate({ id, status }, { onError: (e) => toast.error(e.message) });

  const k = data?.kpis;
  const delta = k ? k.revenueThisMonth - k.revenueLastMonth : 0;

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Sales Dashboard · Gulf Freedom Solutions</title>
      </Helmet>

      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.mark} aria-hidden>GF</div>
          <div>
            <h1 className={styles.title}>Sales dashboard</h1>
            <p className={styles.subtitle}>Gulf Freedom Solutions · {today}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <QuickAddDialog kind="lead" trigger={<Button variant="outline" size="sm"><UserPlus size={16} />Lead</Button>} />
          <QuickAddDialog kind="deal" trigger={<Button variant="outline" size="sm"><Handshake size={16} />Deal</Button>} />
          <QuickAddDialog kind="payment" trigger={<Button size="sm"><Plus size={16} />Log payment</Button>} />
          <ThemeModeSwitch />
        </div>
      </header>

      {error && (
        <div className={styles.errorBox}>
          Couldn't load the dashboard: {error.message}
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {data?.hasSampleData && (
        <div className={styles.sampleBanner}>
          <Info size={16} />
          <span>You're looking at example clients so you can see how it works. Clear them before adding your real ones.</span>
          <Button
            size="sm"
            variant="ghost"
            disabled={m.clearSample.isPending}
            onClick={() => m.clearSample.mutate(undefined, { onSuccess: () => toast.success("Example data cleared") })}
          >
            {m.clearSample.isPending ? "Clearing…" : "Clear example data"}
          </Button>
        </div>
      )}

      <section className={styles.kpis}>
        {loading || !k ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className={styles.kpiSkeleton} />)
        ) : (
          <>
            <Kpi
              icon={<CircleDollarSign size={14} />}
              label="Revenue this month"
              value={money(k.revenueThisMonth)}
              tone="money"
              sub={
                <span className={delta >= 0 ? styles.up : styles.down}>
                  {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {money(Math.abs(delta))} vs last month
                </span>
              }
            />
            <Kpi icon={<Repeat size={14} />} label="Monthly recurring" value={`${money(k.monthlyRecurring)}/mo`} sub="From won deals (Care + ads)" />
            <Kpi icon={<Handshake size={14} />} label="Pipeline value" value={money(k.pipelineValue)} sub={`${k.openDeals} open deal${k.openDeals === 1 ? "" : "s"} · fee + 12 mo`} />
            <Kpi icon={<UserPlus size={14} />} label="New leads" value={String(k.newLeads30d)} sub="Last 30 days" />
          </>
        )}
      </section>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.revenueCard}`}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Revenue</h2>
            {k && <span className={styles.cardMeta}>Year to date <strong>{money(k.revenueYearToDate)}</strong></span>}
          </div>
          {loading || !data ? (
            <Skeleton className={styles.chartSkeleton} />
          ) : (
            <ChartContainer config={chartConfig} className={styles.chart}>
              <BarChart data={data.monthlyRevenue} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} width={52} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v: number) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)} />
                <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="recurring" stackId="r" fill="var(--color-recurring)" radius={[0, 0, 2, 2]} />
                <Bar dataKey="oneTime" stackId="r" fill="var(--color-oneTime)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </section>

        <section className={`${styles.card} ${styles.dealsCard}`}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Deals in progress</h2>
            {data && <span className={styles.cardMeta}>{data.openDeals.length} open</span>}
          </div>
          {loading || !data ? (
            <div className={styles.list}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className={styles.rowSkeleton} />)}</div>
          ) : data.openDeals.length === 0 ? (
            <p className={styles.empty}>No open deals. Add one when you quote a client.</p>
          ) : (
            <ul className={styles.list}>
              {data.openDeals.map((d) => (
                <li key={d.id} className={styles.dealRow}>
                  <div className={styles.dealMain}>
                    <div className={styles.dealClient}>{d.clientName}</div>
                    <div className={styles.dealMeta}>
                      {salesLabels.service[d.service]}
                      {d.expectedClose && <> · close {salesLabels.shortDate(d.expectedClose)}</>}
                    </div>
                  </div>
                  <div className={styles.dealValue}>
                    {d.oneTimeValue > 0 && <span>{money(d.oneTimeValue)}</span>}
                    {d.monthlyValue > 0 && <span className={styles.monthly}>+{money(d.monthlyValue)}/mo</span>}
                  </div>
                  <Select value={d.stage} onValueChange={(v) => changeStage(d.id, v as DealStage, d.clientName)}>
                    <SelectTrigger className={`${styles.stageSelect} ${styles[`stage_${d.stage}`]}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {salesLabels.stageOrder.map((s) => <SelectItem key={s} value={s}>{salesLabels.stage[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </li>
              ))}
            </ul>
          )}
          {data && data.recentWins.length > 0 && (
            <div className={styles.wins}>
              <span className={styles.winsLabel}>Recently won</span>
              {data.recentWins.map((w) => (
                <span key={w.id} className={styles.winChip}>
                  <span className={styles.dot} />{w.clientName}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className={`${styles.card} ${styles.leadsCard}`}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Recent leads</h2>
            {data && <span className={styles.cardMeta}>Newest first</span>}
          </div>
          {loading || !data ? (
            <div className={styles.list}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className={styles.rowSkeleton} />)}</div>
          ) : data.recentLeads.length === 0 ? (
            <p className={styles.empty}>No leads yet. Add the next business owner you talk to.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Source</th>
                    <th>Added</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeads.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div className={styles.leadBiz}>{l.businessName}</div>
                        {l.notes && <div className={styles.leadNotes}>{l.notes}</div>}
                      </td>
                      <td>
                        <div>{l.contactName}</div>
                        <div className={styles.leadContact}>
                          {l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}
                          {l.email && <a href={`mailto:${l.email}`}>{l.email}</a>}
                        </div>
                      </td>
                      <td className={styles.muted}>{salesLabels.source[l.source]}</td>
                      <td className={styles.muted}>{l.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                      <td>
                        <Select value={l.status} onValueChange={(v) => changeLeadStatus(l.id, v as LeadStatus)}>
                          <SelectTrigger className={`${styles.statusSelect} ${styles[`status_${l.status}`]}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {salesLabels.leadStatusOrder.map((s) => <SelectItem key={s} value={s}>{salesLabels.leadStatus[s]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <footer className={styles.footer}>Whatever you do, work at it with all your heart. Col 3:23</footer>
    </div>
  );
}
