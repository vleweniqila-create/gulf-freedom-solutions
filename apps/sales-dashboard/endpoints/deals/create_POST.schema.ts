import { z } from "zod";
import superjson from "superjson";
import { DealStageArrayValues, ServiceTypeArrayValues } from "../../helpers/schema";

export const schema = z.object({
  clientName: z.string().trim().min(1, "Client name is required").max(160),
  service: z.enum(ServiceTypeArrayValues),
  stage: z.enum(DealStageArrayValues),
  oneTimeValue: z.number().min(0).max(1_000_000),
  monthlyValue: z.number().min(0).max(100_000),
  expectedClose: z.date().nullable(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { id: number };

export const postDealsCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/deals/create`, {
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
