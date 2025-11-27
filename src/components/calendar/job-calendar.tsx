'use client'

import { useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobDialog } from '@/components/jobs/job-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const locales = {
    'en-US': enUS,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface JobEvent {
    id: string
    title: string
    start: Date
    end: Date
    resource: any
}

export function JobCalendar() {
    const router = useRouter()
    const [view, setView] = useState(Views.MONTH)
    const [date, setDate] = useState(new Date())

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const res = await fetch('/api/jobs')
            if (!res.ok) throw new Error('Failed to fetch jobs')
            return res.json()
        },
    })

    // Transform jobs to calendar events
    const events: JobEvent[] = jobs?.map((job: any) => {
        const start = new Date(job.scheduledAt || job.createdAt)
        // Default duration of 2 hours if no end time (or we could add endTime to schema later)
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

        return {
            id: job.id,
            title: `${job.title} - ${job.customer.firstName} ${job.customer.lastName}`,
            start,
            end,
            resource: job,
        }
    }) || []

    const handleSelectEvent = useCallback(
        (event: JobEvent) => {
            router.push(`/jobs/${event.id}`)
        },
        [router]
    )

    const eventStyleGetter = (event: JobEvent) => {
        const status = event.resource.status
        let backgroundColor = '#3174ad'

        switch (status) {
            case 'completed':
                backgroundColor = '#10b981' // green
                break
            case 'in_progress':
                backgroundColor = '#3b82f6' // blue
                break
            case 'cancelled':
                backgroundColor = '#ef4444' // red
                break
            case 'scheduled':
                backgroundColor = '#f59e0b' // amber
                break
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
            },
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center">Loading schedule...</div>
    }

    return (
        <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Schedule</CardTitle>
                <JobDialog trigger={
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Schedule Job
                    </Button>
                } />
            </CardHeader>
            <CardContent className="h-full pb-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day', 'agenda']}
                    view={view}
                    date={date}
                    onView={(newView: any) => setView(newView)}
                    onNavigate={(newDate: any) => setDate(newDate)}
                />
            </CardContent>
        </Card>
    )
}
