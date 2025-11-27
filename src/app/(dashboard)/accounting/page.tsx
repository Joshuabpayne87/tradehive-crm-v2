'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionDialog } from '@/components/accounting/transaction-dialog'
import { format, startOfYear, endOfYear } from 'date-fns'
import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

export default function AccountingPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  })

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())
      
      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch transactions')
      return res.json()
    },
  })

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['profit-loss', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())

      const res = await fetch(`/api/reports/profit-loss?${params}`)
      if (!res.ok) throw new Error('Failed to fetch report')
      return res.json()
    },
  })

  if (transactionsLoading || reportLoading) return <div className="container mx-auto py-8">Loading accounting...</div>

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-6 md:space-y-8 px-2 md:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Accounting</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <TransactionDialog />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${report?.summary.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${report?.summary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report?.summary.netProfit >= 0 ? 'text-foreground' : 'text-red-600'}`}>
              ${report?.summary.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.summary.margin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Net Profit / Revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No transactions recorded.</p>
            ) : (
              <div className="space-y-4">
                {transactions?.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'income' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{t.category}</div>
                        <div className="text-xs text-muted-foreground">{t.description || 'No description'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{format(new Date(t.date), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(report?.breakdown.expenses || {}).map(([category, amount]: [string, any]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span>${amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(report?.breakdown.expenses || {}).length === 0 && (
                <p className="text-muted-foreground text-sm">No expenses recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
