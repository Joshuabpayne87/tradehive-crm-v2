import * as z from "zod"
import { addressSchema } from "./validations"

export const leadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "quoted", "won", "lost"]).optional(),
  notes: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadSchema>


