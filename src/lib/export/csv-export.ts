export function generateCsv(data: Record<string, any>[], columns: { header: string; key: string; formatter?: (value: any) => string }[]): string {
  if (!data || data.length === 0) {
    return ''
  }

  // Generate header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',')

  // Generate data rows
  const rows = data.map(row => {
    return columns.map(col => {
      // Handle nested keys (e.g., 'customer.firstName')
      const keys = col.key.split('.')
      let value: any = row
      for (const key of keys) {
        value = value?.[key]
      }

      // Format value if formatter is provided
      if (col.formatter) {
        value = col.formatter(value)
      }

      // Handle undefined/null
      if (value === undefined || value === null) {
        return '""'
      }

      // Escape quotes and wrap in quotes
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    }).join(',')
  })

  return [headerRow, ...rows].join('\n')
}

