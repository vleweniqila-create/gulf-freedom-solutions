import { z } from "zod";
import superjson from "superjson";
import { LeadSourceArrayValues } from "../../helpers/schema";

export const schema = z.object({
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  businessName: z.string().trim().min(1, "Business name is required").max(160),
  email: z.string().trim().email().max(200).nullable(),
  phone: z.string().trim().max(40).nullable(),
  source: z.enum(LeadSourceArrayValues),
  notes: z.string().trim().max(2000).nullable(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { id: number };

export const postLeadsCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/leads/create`, {
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
