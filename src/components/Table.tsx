import React from 'react'

type Column<T> = {
  key: keyof T
  header: string
  render?: (row: T) => React.ReactNode
}

export default function Table<T extends { id?: string | number }>({ columns, data }: { columns: Column<T>[], data: T[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} className="border px-3 py-2 text-left text-sm font-semibold text-gray-700 bg-gray-50">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={(row.id ?? idx) as React.Key} className="border-t hover:bg-gray-50">
              {columns.map((c) => (
                <td key={String(c.key)} className="border px-3 py-2 text-sm text-gray-900">
                  {c.render ? c.render(row) : String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


