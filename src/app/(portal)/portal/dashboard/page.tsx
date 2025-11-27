import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

async function getCustomer() {
  const cookieStore = await cookies()
  const customerId = cookieStore.get('portal_customer_id')?.value

  if (!customerId) return null

  return prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      company: true,
      estimates: {
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export default async function PortalDashboard() {
  const customer = await getCustomer()

  if (!customer) {
    redirect('/portal/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl">{customer.company.name}</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              Welcome, {customer.firstName}
            </span>
            <Link href="/portal/login">
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Estimates Section */}
          <Card>
            <CardHeader>
              <CardTitle>Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.estimates.length === 0 ? (
                <p className="text-muted-foreground text-sm">No estimates found.</p>
              ) : (
                <div className="space-y-4">
                  {customer.estimates.map((estimate) => (
                    <div key={estimate.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{estimate.title}</div>
                        <div className="text-sm text-muted-foreground">
                          #{estimate.estimateNumber} • {format(new Date(estimate.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-medium">${estimate.total.toFixed(2)}</span>
                        <Badge variant={
                          estimate.status === 'approved' ? 'default' : 
                          estimate.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="text-xs capitalize">
                          {estimate.status}
                        </Badge>
                        <Link href={`/portal/estimates/${estimate.id}`}>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices Section */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.invoices.length === 0 ? (
                <p className="text-muted-foreground text-sm">No invoices found.</p>
              ) : (
                <div className="space-y-4">
                  {customer.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">Invoice #{invoice.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-medium">${invoice.total.toFixed(2)}</span>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'overdue' ? 'destructive' : 'secondary'
                        } className="text-xs capitalize">
                          {invoice.status}
                        </Badge>
                        <Link href={`/pay/${invoice.id}`}>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            {invoice.status === 'paid' ? 'View Receipt' : 'Pay Now'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}



