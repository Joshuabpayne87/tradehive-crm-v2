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
import { JobForm } from './job-form'
import { Plus } from 'lucide-react'

export function JobDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule Job</DialogTitle>
          <DialogDescription>
            Create a new job and add it to the schedule.
          </DialogDescription>
        </DialogHeader>
        <JobForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}



