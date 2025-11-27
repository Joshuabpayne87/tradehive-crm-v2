import * as z from "zod"

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0.01, "Amount must be positive"),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)), // Handle date string from form
  invoiceId: z.string().optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

