import * as z from "zod"

export const addressSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
})

export const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ...addressSchema.shape,
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number().optional(), // Calculated
  type: z.enum(["service", "material", "labor"]).optional(),
})

export const estimateSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  estimateNumber: z.string().optional(), // Generated server-side if empty
  status: z.enum(["draft", "sent", "viewed", "approved", "rejected", "expired"]).optional(),
  validUntil: z.union([z.string(), z.date()]).transform((val) => val instanceof Date ? val : new Date(val)).optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  subtotal: z.number().optional(),
  taxRate: z.number().min(0).optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
})

export type EstimateFormValues = z.infer<typeof estimateSchema>

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  jobId: z.string().optional(),
  title: z.string().optional(), // Sometimes invoices have titles too
  invoiceNumber: z.string().optional(),
  status: z.enum(["draft", "sent", "viewed", "paid", "partial", "overdue", "void"]).optional(),
  dueDate: z.union([z.string(), z.date()]).transform((val) => val instanceof Date ? val : new Date(val)).optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  subtotal: z.number().optional(),
  taxRate: z.number().min(0).optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  amountPaid: z.number().optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>

export const jobSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  title: z.string().min(1, "Job title is required"),
  description: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  scheduledAt: z.union([z.string(), z.date()]).transform((val) => val instanceof Date ? val : new Date(val)).optional(),
  completedAt: z.union([z.string(), z.date()]).transform((val) => val instanceof Date ? val : new Date(val)).optional(),
  notes: z.string().optional(),
  assignedToUserId: z.string().optional(),
  ...addressSchema.shape,
})

export type JobFormValues = z.infer<typeof jobSchema>

export const companySettingsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  logo: z.string().optional(),
  taxId: z.string().optional(),
  timezone: z.string().optional(),
  stripePricingModel: z.enum(["pass_through", "standard"]).optional(),
  ...addressSchema.shape,
})

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>

