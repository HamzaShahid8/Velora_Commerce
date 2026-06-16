import { toLabel, formatCellValue, resolveMediaUrl } from '../utils/format'

function ViewIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.6" /></svg>
}
function EditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
}
function DeleteIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>
}

function CellValue({ columnKey, value }) {
  if (columnKey === 'image') {
    const imageUrl = resolveMediaUrl(value?.preview || (typeof value === 'string' ? value : ''))
    if (imageUrl) {
      return (
        <div className="flex items-center gap-3">
          <img src={imageUrl} alt={value?.name || 'Image'} className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200" />
          {value?.name ? <span className="max-w-40 truncate font-medium text-slate-700">{value.name}</span> : null}
        </div>
      )
    }
  }

  return formatCellValue(value)
}

export function SaaSEmptyTable({ columns, rows = [], emptyMessage, onView, onEdit, onDelete, canEdit = true, canDelete = true, showActions = true }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => {
                const key = column.key ?? column
                return <th key={key} className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{column.label ?? toLabel(key)}</th>
              })}
              {showActions ? <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={row.id ?? row._rowId ?? rowIndex} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  {columns.map((column) => {
                    const key = column.key ?? column
                    return <td key={key} className="max-w-72 whitespace-nowrap px-5 py-4 text-sm text-slate-700"><CellValue columnKey={key} value={row[key]} /></td>
                  })}
                  {showActions ? (
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => onView?.(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" title="View" aria-label="View"><ViewIcon /></button>
                        {canEdit ? <button type="button" onClick={() => onEdit?.(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700" title="Edit" aria-label="Edit"><EditIcon /></button> : null}
                        {canDelete ? <button type="button" onClick={() => onDelete?.(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700" title="Delete" aria-label="Delete"><DeleteIcon /></button> : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="px-5 py-12 text-center text-sm text-slate-500">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
