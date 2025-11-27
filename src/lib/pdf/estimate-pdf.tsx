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
})

interface EstimatePDFProps {
  estimate: any
  companyName?: string
  companyAddress?: string
}

export const EstimatePDF: React.FC<EstimatePDFProps> = ({
  estimate,
  companyName = 'TradeHive Demo Co.',
  companyAddress = '123 Business Rd\nCity, ST 12345',
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Estimate #{estimate.estimateNumber}</Text>
          <Text style={styles.companyInfo}>{companyName}</Text>
          <Text style={styles.companyInfo}>{companyAddress}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text>{estimate.customer.firstName} {estimate.customer.lastName}</Text>
          {estimate.customer.address && <Text>{estimate.customer.address}</Text>}
          {(estimate.customer.city || estimate.customer.state) && (
            <Text>
              {estimate.customer.city}{estimate.customer.city && estimate.customer.state ? ', ' : ''}
              {estimate.customer.state} {estimate.customer.zip || ''}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</Text>
          </View>
          {estimate.validUntil && (
            <View style={styles.row}>
              <Text style={styles.label}>Valid Until:</Text>
              <Text style={styles.value}>{format(new Date(estimate.validUntil), 'MMM d, yyyy')}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{estimate.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>Amount</Text>
          </View>
          {estimate.lineItems.map((item: any, index: number) => (
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
            <Text>${estimate.subtotal.toFixed(2)}</Text>
          </View>
          {estimate.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({estimate.taxRate}%):</Text>
              <Text>${estimate.tax.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total:</Text>
            <Text>${estimate.total.toFixed(2)}</Text>
          </View>
        </View>

        {estimate.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes & Terms:</Text>
            <Text>{estimate.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}


