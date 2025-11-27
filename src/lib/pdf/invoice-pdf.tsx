import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  companyInfo: {
    marginBottom: 20,
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1pt solid #e0e0e0',
  },
  tableCell: {
    fontSize: 10,
  },
  colDescription: { width: '50%' },
  colQty: { width: '15%', textAlign: 'right' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
    fontSize: 10,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2pt solid #000',
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 10,
  },
  paid: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  balance: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
})

interface InvoicePDFProps {
  invoice: any
  companyName?: string
  companyAddress?: string
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  companyName = 'TradeHive Demo Co.',
  companyAddress = '123 Business Rd\nCity, ST 12345',
}) => {
  const balanceDue = invoice.total - invoice.amountPaid

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice #{invoice.invoiceNumber}</Text>
          <Text style={styles.companyInfo}>{companyName}</Text>
          <Text style={styles.companyInfo}>{companyAddress}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text>{invoice.customer.firstName} {invoice.customer.lastName}</Text>
          {invoice.customer.address && <Text>{invoice.customer.address}</Text>}
          {(invoice.customer.city || invoice.customer.state) && (
            <Text>
              {invoice.customer.city}{invoice.customer.city && invoice.customer.state ? ', ' : ''}
              {invoice.customer.state} {invoice.customer.zip || ''}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</Text>
          </View>
          {invoice.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>${item.rate.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          {invoice.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%):</Text>
              <Text>${invoice.tax.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total:</Text>
            <Text>${invoice.total.toFixed(2)}</Text>
          </View>
          {invoice.amountPaid > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount Paid:</Text>
              <Text style={styles.paid}>-${invoice.amountPaid.toFixed(2)}</Text>
            </View>
          )}
          {balanceDue > 0 && (
            <View style={[styles.totalRow, { marginTop: 10, paddingTop: 10, borderTop: '1pt solid #000' }]}>
              <Text style={styles.totalLabel}>Balance Due:</Text>
              <Text style={styles.balance}>${balanceDue.toFixed(2)}</Text>
            </View>
          )}
          {balanceDue === 0 && (
            <View style={[styles.totalRow, { marginTop: 10 }]}>
              <Text style={[styles.paid, { fontSize: 12 }]}>PAID IN FULL</Text>
            </View>
          )}
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Payment Instructions:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}


