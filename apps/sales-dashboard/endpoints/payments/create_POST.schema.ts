import { z } from "zod";
import superjson from "superjson";
import { PaymentKindArrayValues } from "../../helpers/schema";

export const schema = z.object({
  clientName: z.string().trim().min(1, "Client name is required").max(160),
  amount: z.number().positive("Amount must be more than 0").max(1_000_000),
  kind: z.enum(PaymentKindArrayValues),
  paidOn: z.date(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { id: number };

export const postPaymentsCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/payments/create`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};
