'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { estimateSchema, type EstimateFormValues } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Trash, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface EstimateBuilderProps {
  initialData?: EstimateFormValues & { id: string; estimateNumber: string }
  customerId?: string
}

export function EstimateBuilder({ initialData, customerId }: EstimateBuilderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateSchema),
    defaultValues: initialData || {
      customerId: customerId || '',
      title: '',
      description: '',
      status: 'draft',
      lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0, type: 'service' }],
      taxRate: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  })

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json()
    },
  })

  // Watch values for calculations
  const lineItems = useWatch({ control: form.control, name: 'lineItems' })
  const taxRate = useWatch({ control: form.control, name: 'taxRate' })

  // Calculate totals whenever line items or tax rate changes
  useEffect(() => {
    const subtotal = lineItems.reduce((acc, item) => {
      return acc + (item.quantity || 0) * (item.rate || 0)
    }, 0)

    const tax = subtotal * ((taxRate || 0) / 100)
    const total = subtotal + tax

    form.setValue('subtotal', subtotal)
    form.setValue('tax', tax)
    form.setValue('total', total)
  }, [lineItems, taxRate, form])

  const mutation = useMutation({
    mutationFn: async (values: EstimateFormValues) => {
      const url = initialData ? `/api/estimates/${initialData.id}` : '/api/estimates'
      const method = initialData ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save estimate')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] })
      router.push('/estimates')
    },
  })

  async function onSubmit(values: EstimateFormValues) {
    setIsLoading(true)
    try {
      await mutation.mutateAsync(values)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <Card className="bg-white/95 shadow-lg border-2">
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimate Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Kitchen Renovation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid Until</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal w-full",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="bottom" sideOffset={8}>
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 shadow-lg border-2">
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Terms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Estimate valid for 30 days..."
                        className="h-[200px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/95 shadow-lg border-2">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Line Items</h3>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 md:gap-4 items-end border-b pb-4">
                  <div className="sm:col-span-6">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sm:sr-only" : ""}>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Item description" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sm:sr-only" : ""}>Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              step="0.1"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {/* Mobile only label for next field to align grid */}
                    <div className="sm:hidden"></div>
                  </div>
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.rate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sm:sr-only" : ""}>Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="sm:col-span-1 text-right pb-2 font-medium flex justify-between sm:block">
                    <span className="sm:hidden text-sm text-muted-foreground">Amount:</span>
                    ${((form.watch(`lineItems.${index}.quantity`) || 0) * (form.watch(`lineItems.${index}.rate`) || 0)).toFixed(2)}
                  </div>
                  <div className="sm:col-span-1 pb-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full sm:w-auto"
                onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0, type: 'service' })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="flex flex-col items-end mt-8 space-y-2">
              <div className="flex justify-between w-full sm:w-64 text-sm">
                <span>Subtotal:</span>
                <span>${form.watch('subtotal')?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-64 items-center">
                <span className="text-sm">Tax Rate (%):</span>
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem className="w-20 mb-0">
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          className="h-8 text-right"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between w-full sm:w-64 text-sm">
                <span>Tax Amount:</span>
                <span>${form.watch('tax')?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-64 font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${form.watch('total')?.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : 'Save Estimate'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
