'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CustomerForm } from './customer-form'
import { Plus, Pencil } from 'lucide-react'
import { CustomerFormValues } from '@/lib/validations'

interface CustomerDialogProps {
  customer?: CustomerFormValues & { id: string }
  trigger?: React.ReactNode
}

export function CustomerDialog({ customer, trigger }: CustomerDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {customer
              ? 'Update customer details. Click save when you\'re done.'
              : 'Add a new customer to your CRM. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm initialData={customer} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
