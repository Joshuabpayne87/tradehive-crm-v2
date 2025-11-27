import { JobCalendar } from '@/components/calendar/job-calendar'

export default function SchedulePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Job Schedule</h1>
      </div>
      <JobCalendar />
    </div>
  )
}
