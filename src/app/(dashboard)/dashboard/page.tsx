'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import {
  ArrowUpRight,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Plus,
  CreditCard,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { JobDialog } from '@/components/jobs/job-dialog'
import { CustomerDialog } from '@/components/customers/customer-dialog'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) {
          console.error('Failed to fetch stats:', res.status)
          // Return empty stats instead of throwing
          return {
            financials: { totalRevenue: 0, outstandingBalance: 0, revenueThisMonth: 0 },
            counts: { customers: 0, activeJobs: 0, pendingEstimates: 0 },
            revenueHistory: []
          }
        }
        return res.json()
      } catch (error) {
        console.error('Error fetching stats:', error)
        return {
          financials: { totalRevenue: 0, outstandingBalance: 0, revenueThisMonth: 0 },
          counts: { customers: 0, activeJobs: 0, pendingEstimates: 0 },
          revenueHistory: []
        }
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  })

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/recent-activity')
        if (!res.ok) {
          console.error('Failed to fetch activity:', res.status)
          return []
        }
        return res.json()
      } catch (error) {
        console.error('Error fetching activity:', error)
        return []
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  })

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-6 md:space-y-8 px-2 md:px-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/invoices/new" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Button>
          </Link>
          <Link href="/estimates/new" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Estimate
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.financials?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'hsl(45, 100%, 50%)' }}>
              ${stats?.financials?.outstandingBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.counts?.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled or In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Estimates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.counts?.pendingEstimates || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              {/* Revenue Chart */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[250px] md:h-[350px]">
              {stats?.revenueHistory && stats.revenueHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueHistory}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="total" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {activityLoading ? (
                <div className="text-sm text-muted-foreground">Loading activity...</div>
              ) : activity?.length === 0 ? (
                <div className="text-muted-foreground text-sm">No recent activity.</div>
              ) : (
                activity?.map((item: any) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-right">
                      {item.amount !== undefined && (
                        <div>${item.amount.toLocaleString()}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(item.date), 'MMM d')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

            {/* Quick Actions */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
           <Link href="/estimates/new" className="flex flex-col items-center justify-center p-6 h-full">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <div className="font-medium">Create Estimate</div>
          </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:scale-105">
          <Link href="/invoices/new" className="flex flex-col items-center justify-center p-6 h-full">
            <DollarSign className="h-8 w-8 mb-2" style={{ color: 'hsl(142, 76%, 36%)' }} />
            <div className="font-medium">Create Invoice</div>
          </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:scale-105">
          <div className="h-full">
             <JobDialog trigger={
               <div className="flex flex-col items-center justify-center p-6 h-full w-full">
                <Calendar className="h-8 w-8 mb-2" style={{ color: 'hsl(45, 100%, 50%)' }} />
                <div className="font-medium">Schedule Job</div>
              </div>
             } />
          </div>
        </Card>
        <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:scale-105">
          <div className="h-full">
            <CustomerDialog trigger={
              <div className="flex flex-col items-center justify-center p-6 h-full w-full">
                <Users className="h-8 w-8 mb-2" style={{ color: 'hsl(142, 76%, 36%)' }} />
                <div className="font-medium">Add Customer</div>
              </div>
            } />
          </div>
        </Card>
      </div>
    </div>
  )
}
