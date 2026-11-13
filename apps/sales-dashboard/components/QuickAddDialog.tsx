import { useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Calendar } from "./Calendar";
import { useSalesMutations } from "../helpers/useSalesMutations";
import { salesLabels } from "../helpers/salesLabels";
import { toast } from "../helpers/toast";
import type { DealStage, LeadSource, PaymentKind, ServiceType } from "../helpers/schema";
import styles from "./QuickAddDialog.module.css";

type Kind = "lead" | "deal" | "payment";

const COPY: Record<Kind, { title: string; description: string; submit: string }> = {
  lead: { title: "Add a lead", description: "Someone who might need a site or ads.", submit: "Save lead" },
  deal: { title: "Add a deal", description: "Work you've quoted or are discussing.", submit: "Save deal" },
  payment: { title: "Log a payment", description: "Money received, counted in revenue.", submit: "Log payment" },
};

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: Date | null; onChange: (d: Date | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={styles.dateButton}>
            <CalendarDays size={16} />
            {value ? value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(d: Date | undefined) => {
              onChange(d ?? null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function QuickAddDialog({ kind, trigger, className }: { kind: Kind; trigger: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const m = useSalesMutations();

  // Lead fields
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<LeadSource>("referral");
  const [notes, setNotes] = useState("");
  // Deal fields
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState<ServiceType>("website");
  const [stage, setStage] = useState<DealStage>("discovery");
  const [oneTime, setOneTime] = useState("1500");
  const [monthly, setMonthly] = useState("149");
  const [expectedClose, setExpectedClose] = useState<Date | null>(null);
  // Payment fields
  const [amount, setAmount] = useState("");
  const [paymentKind, setPaymentKind] = useState<PaymentKind>("one_time");
  const [paidOn, setPaidOn] = useState<Date | null>(new Date());

  const reset = () => {
    setContactName(""); setBusinessName(""); setEmail(""); setPhone(""); setSource("referral"); setNotes("");
    setClientName(""); setService("website"); setStage("discovery"); setOneTime("1500"); setMonthly("149"); setExpectedClose(null);
    setAmount(""); setPaymentKind("one_time"); setPaidOn(new Date());
  };

  const pending = m.createLead.isPending || m.createDeal.isPending || m.createPayment.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (kind === "lead") {
        await m.createLead.mutateAsync({
          contactName, businessName, source,
          email: email.trim() || null, phone: phone.trim() || null, notes: notes.trim() || null,
        });
        toast.success("Lead added", { description: businessName });
      } else if (kind === "deal") {
        await m.createDeal.mutateAsync({
          clientName, service, stage,
          oneTimeValue: Number(oneTime) || 0, monthlyValue: Number(monthly) || 0, expectedClose,
        });
        toast.success("Deal added", { description: clientName });
      } else {
        if (!paidOn) throw new Error("Pick the date it was paid");
        await m.createPayment.mutateAsync({ clientName, amount: Number(amount), kind: paymentKind, paidOn });
        toast.success("Payment logged", { description: `${salesLabels.money(Number(amount))} from ${clientName}` });
      }
      reset();
      setOpen(false);
    } catch (err) {
      const issues = (err as { issues?: { message: string }[] }).issues;
      toast.error(issues?.[0]?.message ?? (err as Error).message);
    }
  };

  const copy = COPY[kind];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={`${styles.content} ${className ?? ""}`}>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className={styles.form}>
          {kind === "lead" && (
            <>
              <Field label="Contact name"><Input value={contactName} onChange={(e) => setContactName(e.target.value)} required /></Field>
              <Field label="Business"><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required /></Field>
              <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label="Phone"><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <Field label="Where they came from" wide>
                <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(salesLabels.source).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Notes" wide><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            </>
          )}
          {kind === "deal" && (
            <>
              <Field label="Client" wide><Input value={clientName} onChange={(e) => setClientName(e.target.value)} required /></Field>
              <Field label="Service">
                <Select
                  value={service}
                  onValueChange={(v) => {
                    const s = v as ServiceType;
                    setService(s);
                    setOneTime(String(salesLabels.serviceDefaults[s].oneTime));
                    setMonthly(String(salesLabels.serviceDefaults[s].monthly));
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(salesLabels.service).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Stage">
                <Select value={stage} onValueChange={(v) => setStage(v as DealStage)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {salesLabels.stageOrder.map((k) => <SelectItem key={k} value={k}>{salesLabels.stage[k]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="One-time fee ($)"><Input type="number" min={0} step="1" value={oneTime} onChange={(e) => setOneTime(e.target.value)} /></Field>
              <Field label="Monthly ($/mo)"><Input type="number" min={0} step="1" value={monthly} onChange={(e) => setMonthly(e.target.value)} /></Field>
              <DateField label="Expected close" value={expectedClose} onChange={setExpectedClose} />
            </>
          )}
          {kind === "payment" && (
            <>
              <Field label="Client" wide><Input value={clientName} onChange={(e) => setClientName(e.target.value)} required /></Field>
              <Field label="Amount ($)"><Input type="number" min={1} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></Field>
              <Field label="Type">
                <Select value={paymentKind} onValueChange={(v) => setPaymentKind(v as PaymentKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time (site build)</SelectItem>
                    <SelectItem value="recurring">Recurring (Care, ads)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <DateField label="Paid on" value={paidOn} onChange={setPaidOn} />
            </>
          )}
          <DialogFooter className={styles.footer}>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : copy.submit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
