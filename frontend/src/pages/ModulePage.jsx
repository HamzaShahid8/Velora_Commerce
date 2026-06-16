import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { SaaSEmptyTable } from '../components/SaaSEmptyTable'
import { BackendForm } from '../components/BackendForm'
import { FieldRenderer } from '../components/FieldRenderer'
import { formatCellValue, toLabel, extractErrorMessage, resolveMediaUrl } from '../utils/format'
import {
  useCreateModuleRecordMutation,
  useDeleteModuleRecordMutation,
  useDownloadClientProfilePdfMutation,
  useGetCurrentPermissionsQuery,
  useGetModuleListQuery,
  useGetSignupRolesQuery,
  useUpdateModuleRecordMutation,
} from '../store/api'
import { selectCurrentUser } from '../store/authSlice'
import { canCreateModule, canDeleteModule, canUpdateModule, canViewModule } from '../config/permissions'

const emptyRows = []

function createEmptyValues(fields) {
  return fields.reduce((acc, field) => {
    acc[field.key] = field.type === 'checkbox' ? false : field.type === 'multiselect' ? [] : ''
    return acc
  }, {})
}

function compactValues(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))]
}

function dynamicOptions(field, optionData) {
  if (field.options) return field.options

  if (field.key === 'role') return compactValues((optionData.roles ?? []).map((item) => item.name))
  if (field.key === 'created_by' || field.key === 'customer' || field.key === 'received_by') return compactValues((optionData.users ?? []).map((item) => item.email))
  if (field.key === 'design' || field.key === 'product_design') return compactValues((optionData['product-designs'] ?? []).map((item) => item.code))
  if (field.key === 'invoice') return compactValues((optionData.invoices ?? []).map((item) => item.invoice_number))

  return []
}


function optionLabel(item) {
  if (!item || typeof item !== 'object') return item ?? ''
  return item.email ?? item.username ?? item.invoice_number ?? item.code ?? item.name ?? item.title ?? item.id ?? ''
}

function dynamicFilterOptions(field, optionData) {
  if (field.options) return field.options

  if (field.key === 'customer') {
    return compactValues((optionData.users ?? []).map((item) => item?.id ? { value: item.id, label: optionLabel(item) } : null))
  }

  if (field.key === 'invoice') {
    return compactValues((optionData.invoices ?? []).map((item) => item?.id ? { value: item.id, label: optionLabel(item) } : null))
  }

  if (field.key === 'product_design') {
    return compactValues((optionData['product-designs'] ?? []).map((item) => item?.id ? { value: item.id, label: optionLabel(item) } : null))
  }

  return []
}

function DetailValue({ columnKey, value }) {
  if (columnKey === 'image') {
    const imageUrl = resolveMediaUrl(value?.preview || (typeof value === 'string' ? value : ''))
    if (imageUrl) {
      return (
        <div className="flex items-center gap-3">
          <img src={imageUrl} alt={value?.name || 'Image'} className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200" />
          {value?.name ? <span className="text-sm font-semibold text-slate-900">{value.name}</span> : null}
        </div>
      )
    }
  }

  return formatCellValue(value)
}

function hasActiveFilters(filters = {}) {
  return Object.values(filters).some((value) => value !== undefined && value !== null && value !== '')
}

function activeFilterCount(filters = {}) {
  return Object.values(filters).filter((value) => value !== undefined && value !== null && value !== '').length
}

function formatFilterValue(value) {
  if (value === undefined || value === null || value === '') return '—'
  return String(value)
}

function ProfessionalFilters({ fields, values, appliedFilters, onChange, onApply, onClear }) {
  const [expanded, setExpanded] = useState(hasActiveFilters(appliedFilters))
  const searchField = fields.find((field) => field.key === 'search')
  const orderingField = fields.find((field) => field.key === 'ordering')
  const remainingFields = fields.filter((field) => field.key !== 'search' && field.key !== 'ordering')
  const appliedCount = activeFilterCount(appliedFilters)

  return (
    <form onSubmit={onApply} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(240px,1fr)_220px]">
          {searchField ? (
            <FieldRenderer
              field={{ ...searchField, label: 'Search' }}
              value={values[searchField.key] ?? ''}
              onChange={onChange}
              compact
            />
          ) : null}
          {orderingField ? (
            <FieldRenderer
              field={{ ...orderingField, label: 'Sort by' }}
              value={values[orderingField.key] ?? ''}
              onChange={onChange}
              compact
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {remainingFields.length ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                expanded || appliedCount
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6h16" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>
              Filters
              {appliedCount ? <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs text-white">{appliedCount}</span> : null}
            </button>
          ) : null}
          <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
            Apply
          </button>
          <button type="button" onClick={onClear} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
            Reset
          </button>
        </div>
      </div>

      {expanded && remainingFields.length ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Advanced filters</h2>
              <p className="mt-0.5 text-xs text-slate-500">Use backend-supported filter fields only.</p>
            </div>
            {appliedCount ? <span className="text-xs font-medium text-emerald-700">{appliedCount} active</span> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {remainingFields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={values[field.key] ?? ''}
                onChange={onChange}
                compact
              />
            ))}
          </div>
        </div>
      ) : null}

      {hasActiveFilters(appliedFilters) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(appliedFilters)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => {
              const label = fields.find((field) => field.key === key)?.label ?? toLabel(key)
              return (
                <span key={key} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-900">{formatFilterValue(value)}</span>
                </span>
              )
            })}
        </div>
      ) : null}
    </form>
  )
}



export function ModulePage({ module, hideMainTitle = false }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [formValues, setFormValues] = useState(createEmptyValues(module.fields ?? []))
  const [viewRow, setViewRow] = useState(null)
  const [filterValues, setFilterValues] = useState({})
  const [appliedFilters, setAppliedFilters] = useState({})
  const [localError, setLocalError] = useState('')
  const [notice, setNotice] = useState('')
  const currentUser = useSelector(selectCurrentUser)
  const { data: permissionState, isLoading: permissionsLoading } = useGetCurrentPermissionsQuery()
  const allowView = canViewModule(module.key, permissionState, currentUser)
  const allowCreate = canCreateModule(module.key, permissionState, currentUser)
  const allowUpdate = canUpdateModule(module.key, permissionState, currentUser)
  const allowDelete = canDeleteModule(module.key, permissionState, currentUser)

  const { data: rows = emptyRows, isLoading, isError, error, refetch } = useGetModuleListQuery({ moduleKey: module.key, filters: appliedFilters }, { skip: !allowView })
  const { data: users = emptyRows } = useGetModuleListQuery('users')
  const { data: productDesigns = emptyRows } = useGetModuleListQuery('product-designs')
  const { data: invoices = emptyRows } = useGetModuleListQuery('invoices')
  const { data: roles = emptyRows } = useGetSignupRolesQuery()

  const [createRecord, createState] = useCreateModuleRecordMutation()
  const [updateRecord, updateState] = useUpdateModuleRecordMutation()
  const [deleteRecord, deleteState] = useDeleteModuleRecordMutation()
  const [downloadClientProfilePdf, downloadPdfState] = useDownloadClientProfilePdfMutation()

  const optionData = useMemo(
    () => ({ users, 'product-designs': productDesigns, invoices, roles }),
    [users, productDesigns, invoices, roles],
  )

  const fields = useMemo(
    () =>
      (module.fields ?? []).map((field) => ({
        ...field,
        type: field.key === 'role' && optionData.roles?.length ? 'select' : field.type,
        options: field.key === 'role' && optionData.roles?.length ? dynamicOptions(field, optionData) : field.type === 'select' || field.type === 'multiselect' ? dynamicOptions(field, optionData) : field.options,
      })),
    [module.fields, optionData],
  )

  const filterFields = useMemo(
    () => {
      const backendFilterFields = (module.filters?.fields ?? []).map((field) => ({
        ...field,
        options: field.type === 'select' ? dynamicFilterOptions(field, optionData) : field.options,
      }))

      if (module.filters?.search) {
        backendFilterFields.push({ key: 'search', label: 'Search', type: 'text' })
      }

      if (module.filters?.ordering?.length) {
        backendFilterFields.push({
          key: 'ordering',
          label: 'Ordering',
          type: 'select',
          options: module.filters.ordering.flatMap((field) => [
            { value: field, label: `${toLabel(field)} ascending` },
            { value: `-${field}`, label: `${toLabel(field)} descending` },
          ]),
        })
      }

      return backendFilterFields
    },
    [module.filters, optionData],
  )

  const hasBackendFilters = filterFields.length > 0

  const resetForm = () => {
    setFormValues(createEmptyValues(fields ?? []))
    setEditingRow(null)
    setFormOpen(false)
  }

  const handleApplyFilters = (event) => {
    event.preventDefault()
    setAppliedFilters(filterValues)
  }

  const handleClearFilters = () => {
    setFilterValues({})
    setAppliedFilters({})
  }

  const handleAdd = () => {
    if (!allowCreate) {
      setNotice('')
      setLocalError('Your role does not have create permission for this module.')
      return
    }
    setFormValues(createEmptyValues(fields ?? []))
    setEditingRow(null)
    setViewRow(null)
    setLocalError('')
    setNotice('')
    setFormOpen(true)
  }

  const handleEdit = (row) => {
    if (!allowUpdate) return
    setFormValues(row)
    setEditingRow(row)
    setViewRow(null)
    setLocalError('')
    setNotice('')
    setFormOpen(true)
  }

  const handleDelete = async (row) => {
    if (!allowDelete) return
    setLocalError('')
    setNotice('')
    if (!row.id) return
    try {
      await deleteRecord({ moduleKey: module.key, id: row.id }).unwrap()
      setNotice('Record deleted successfully.')
      if (viewRow?.id === row.id) setViewRow(null)
    } catch (apiError) {
      setLocalError(extractErrorMessage(apiError))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')
    setNotice('')

    try {
      if (editingRow?.id) {
        if (!allowUpdate) {
          setLocalError('Your role does not have update permission for this module.')
          return
        }
        await updateRecord({ moduleKey: module.key, id: editingRow.id, body: formValues }).unwrap()
        setNotice('Record updated successfully.')
      } else {
        if (!allowCreate) {
          setLocalError('Your role does not have create permission for this module.')
          return
        }
        await createRecord({ moduleKey: module.key, body: formValues }).unwrap()
        setNotice('Record created successfully.')
      }
      resetForm()
    } catch (apiError) {
      setLocalError(extractErrorMessage(apiError))
    }
  }

  const handleDownloadClientPdf = async (row) => {
    if (module.key !== 'client-profiles' || !row?.id) return
    setLocalError('')
    setNotice('')

    try {
      const blob = await downloadClientProfilePdf(row.id).unwrap()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `client_profile_${row.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setNotice('Client profile PDF downloaded successfully.')
    } catch (apiError) {
      setLocalError(extractErrorMessage(apiError))
    }
  }

  const busy = createState.isLoading || updateState.isLoading || deleteState.isLoading || downloadPdfState.isLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          {module.illustration ? <img src={module.illustration} alt={module.title} className="hidden h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200 sm:block" /> : null}
          {hideMainTitle ? null : <h1 className="text-xl font-medium tracking-tight text-slate-950 sm:text-2xl">{module.title}</h1>}
        </div>
        <button
          onClick={handleAdd}
          className={`w-full rounded-xl px-5 py-3 text-sm font-medium shadow-sm transition sm:w-auto ${
            allowCreate
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
          }`}
          type="button"
          disabled={busy || permissionsLoading || !allowCreate}
          title={allowCreate ? `Add ${module.title.replace(/s$/, '')}` : 'Create permission is not allowed for your role.'}
        >
          Add {module.title.replace(/s$/, '')}
        </button>
      </div>

      {notice ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p> : null}
      {hasBackendFilters ? (
        <ProfessionalFilters
          fields={filterFields}
          values={filterValues}
          appliedFilters={appliedFilters}
          onChange={(key, value) => setFilterValues((current) => ({ ...current, [key]: value }))}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      ) : null}

      {localError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{localError}</p> : null}
      {!allowView ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">Your role can access this module, but it does not have view permission. Only allowed actions are shown.</p>
      ) : null}
      {isError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {extractErrorMessage(error)} <button type="button" onClick={refetch} className="underline underline-offset-4">Retry</button>
        </p>
      ) : null}

      {!allowView ? null : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Loading {module.title.toLowerCase()}...</div>
      ) : (
        <SaaSEmptyTable
          columns={module.columns}
          rows={rows}
          emptyMessage={module.emptyMessage}
          onView={setViewRow}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={allowUpdate}
          canDelete={allowDelete}
        />
      )}

      {viewRow ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{module.title} Details</h2>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {module.key === 'client-profiles' ? (
                <button
                  onClick={() => handleDownloadClientPdf(viewRow)}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={downloadPdfState.isLoading}
                >
                  {downloadPdfState.isLoading ? 'Downloading...' : 'Download PDF'}
                </button>
              ) : null}
              <button onClick={() => setViewRow(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" type="button">
                Close
              </button>
            </div>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {module.columns.map((column) => (
              <div key={column} className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{toLabel(column)}</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900"><DetailValue columnKey={column} value={viewRow[column]} /></dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {formOpen ? (
        <BackendForm
          title={editingRow ? `Edit ${module.title}` : `Add ${module.title}`}
          fields={fields}
          values={formValues}
          onChange={(key, value) => setFormValues((current) => ({ ...current, [key]: value }))}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          submitLabel={busy ? 'Saving...' : editingRow ? 'Update' : 'Save'}
        />
      ) : null}
    </div>
  )
}
