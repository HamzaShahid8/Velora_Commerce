import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { SaaSStatCard } from '../components/SaaSStatCard'
import { SaaSEmptyTable } from '../components/SaaSEmptyTable'
import { useGetAccountDashboardQuery, useGetDashboardQuery, useGetModuleListQuery } from '../store/api'
import { selectCurrentUser } from '../store/authSlice'
import { extractErrorMessage, toLabel } from '../utils/format'

const productColumns = ['id', 'design', 'title', 'stock', 'created_by']
const operationalDashboardKeys = new Set([
  'products_low_stock',
  'products_high_stock',
  'product_low_stock',
  'product_high_stock',
  'product_stock',
  'total_users',
  'total_clients',
  'total_workers',
  'total_products',
  'total_invoices',
  'total_payments',
  'total_product_designs',
  'total_invoices_count',
  'products',
  'product_designs',
  'payments',
])

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeRoleName(role) {
  if (!role) return ''
  if (typeof role === 'string') return role.toLowerCase()
  return String(role.name ?? role.role ?? '').toLowerCase()
}

function unwrapDashboardPayload(payload) {
  if (!payload || typeof payload !== 'object') return {}

  const candidates = [
    payload,
    payload.data,
    payload.dashboard,
    payload.dashboard_data,
    payload.results,
    payload.user_dashboard,
  ].filter((item) => item && typeof item === 'object' && !Array.isArray(item))

  const best = candidates.find((item) => Object.keys(item).some((key) => operationalDashboardKeys.has(key)))
  return best ?? candidates[0] ?? {}
}

function chooseDashboardData(accountData, dashboardData) {
  const accountPayload = unwrapDashboardPayload(accountData)
  const dashboardPayload = unwrapDashboardPayload(dashboardData)

  const accountHasOperationalValues = Object.keys(accountPayload).some((key) => operationalDashboardKeys.has(key))
  const dashboardHasOperationalValues = Object.keys(dashboardPayload).some((key) => operationalDashboardKeys.has(key))

  if (accountHasOperationalValues && dashboardHasOperationalValues) {
    return { ...dashboardPayload, ...accountPayload }
  }

  if (accountHasOperationalValues) return accountPayload
  if (dashboardHasOperationalValues) return dashboardPayload
  return Object.keys(accountPayload).length ? accountPayload : dashboardPayload
}

function hasOperationalValues(data) {
  return Boolean(data && typeof data === 'object' && Object.keys(data).some((key) => operationalDashboardKeys.has(key)))
}

function valueForCard(value) {
  if (Array.isArray(value)) return value.length
  if (isPlainObject(value) && 'stock' in value) return value.stock ?? 0
  if (isPlainObject(value)) {
    const values = Object.values(value).filter((item) => item !== null && item !== undefined && typeof item !== 'object')
    return values.length ? values.join(', ') : '—'
  }
  return value ?? '—'
}

function tableColumnsForKey(key) {
  if (key.includes('product_design')) return ['id', 'code', 'name', 'price', 'status', 'category']
  if (key.includes('invoice')) return ['id', 'invoice_number', 'customer', 'grand_total', 'status', 'payment_method']
  if (key.includes('payment')) return ['id', 'invoice', 'amount', 'payment_method', 'paid_at']
  return productColumns
}

function hasValues(data) {
  return data && typeof data === 'object' && Object.keys(data).length > 0
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function stockNumber(product) {
  const value = Number(product?.stock ?? 0)
  return Number.isFinite(value) ? value : 0
}

function buildManagerDashboardFallback({ products, workerProfiles, clientProfiles, invoices, payments }) {
  const productRows = asArray(products)

  return {
    product_stock: { stock: productRows.reduce((total, product) => total + stockNumber(product), 0) },
    total_workers: asArray(workerProfiles).length,
    total_clients: asArray(clientProfiles).length,
    total_products: productRows.length,
    total_invoices: asArray(invoices).length,
    total_payments: asArray(payments).length,
    product_high_stock: productRows.filter((product) => stockNumber(product) > 30).sort((a, b) => stockNumber(a) - stockNumber(b)),
    product_low_stock: productRows.filter((product) => stockNumber(product) < 10).sort((a, b) => stockNumber(a) - stockNumber(b)),
  }
}

export function DashboardPage() {
  const currentUser = useSelector(selectCurrentUser)
  const roleName = normalizeRoleName(currentUser?.role)
  const isManager = roleName === 'manager'

  const dashboardQuery = useGetDashboardQuery()
  const accountQuery = useGetAccountDashboardQuery()

  const productsQuery = useGetModuleListQuery('products', { skip: !isManager })
  const workerProfilesQuery = useGetModuleListQuery('worker-profiles', { skip: !isManager })
  const clientProfilesQuery = useGetModuleListQuery('client-profiles', { skip: !isManager })
  const invoicesQuery = useGetModuleListQuery('invoices', { skip: !isManager })
  const paymentsQuery = useGetModuleListQuery('payments', { skip: !isManager })

  const backendDashboardData = chooseDashboardData(accountQuery.data, dashboardQuery.data)
  const managerFallbackData = useMemo(() => {
    if (!isManager) return {}
    return buildManagerDashboardFallback({
      products: productsQuery.data,
      workerProfiles: workerProfilesQuery.data,
      clientProfiles: clientProfilesQuery.data,
      invoices: invoicesQuery.data,
      payments: paymentsQuery.data,
    })
  }, [isManager, productsQuery.data, workerProfilesQuery.data, clientProfilesQuery.data, invoicesQuery.data, paymentsQuery.data])

  const useManagerFallback = isManager && (!hasOperationalValues(backendDashboardData) || dashboardQuery.isError)
  const dashboardData = useManagerFallback ? managerFallbackData : backendDashboardData

  const fallbackLoading = isManager && (productsQuery.isLoading || workerProfilesQuery.isLoading || clientProfilesQuery.isLoading || invoicesQuery.isLoading || paymentsQuery.isLoading)
  const isLoading = dashboardQuery.isLoading || accountQuery.isLoading || (useManagerFallback && fallbackLoading)
  const isError = dashboardQuery.isError && accountQuery.isError && !useManagerFallback
  const error = accountQuery.error ?? dashboardQuery.error

  const entries = Object.entries(dashboardData ?? {}).filter(([, value]) => value !== undefined && value !== null)
  const cardEntries = entries.filter(([, value]) => !Array.isArray(value))
  const tableEntries = entries.filter(([, value]) => Array.isArray(value))

  const retry = () => {
    dashboardQuery.refetch()
    accountQuery.refetch()
    if (isManager) {
      productsQuery.refetch()
      workerProfilesQuery.refetch()
      clientProfilesQuery.refetch()
      invoicesQuery.refetch()
      paymentsQuery.refetch()
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">Dashboard</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Operations overview</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
            View the latest boutique, inventory, billing, and user activity available for your role.
          </p>
        </div>
      </section>

      {isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          {extractErrorMessage(error)}
          <button type="button" onClick={retry} className="ml-3 underline underline-offset-4">Retry</button>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <SaaSStatCard title="Loading dashboard" value="—" />
        ) : cardEntries.length ? (
          cardEntries.map(([key, value]) => <SaaSStatCard key={key} title={toLabel(key)} value={valueForCard(value)} />)
        ) : (
          <SaaSStatCard title="Dashboard" value="—" description="No dashboard values available for this role yet." />
        )}
      </section>

      {hasValues(dashboardData) && tableEntries.length ? (
        <section className="grid gap-5 xl:grid-cols-2">
          {tableEntries.map(([key, rows]) => (
            <div key={key} className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">{toLabel(key)}</h2>
                <p className="mt-1 text-sm text-slate-500">Records returned by the backend dashboard for your role.</p>
              </div>
              <SaaSEmptyTable columns={tableColumnsForKey(key)} rows={rows} emptyMessage={`No ${toLabel(key).toLowerCase()} available.`} showActions={false} />
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}
