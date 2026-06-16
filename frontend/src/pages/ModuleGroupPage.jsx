import { useMemo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ModulePage } from './ModulePage'
import { useGetCurrentPermissionsQuery } from '../store/api'
import { selectCurrentUser } from '../store/authSlice'
import { canAccessModule } from '../config/permissions'

const groupConfig = {
  profiles: {
    title: 'Profiles',
    subtitle: 'Manage profile records using backend-supported fields only.',
    moduleKeys: ['admin-profiles', 'manager-profiles', 'worker-profiles', 'client-profiles'],
  },
  'product-management': {
    title: 'Products',
    subtitle: 'Manage product designs and product inventory records.',
    moduleKeys: ['product-designs', 'products'],
  },
  billing: {
    title: 'Billing',
    subtitle: 'Manage invoices, invoice items, and payments.',
    moduleKeys: ['invoices', 'invoice-items', 'payments'],
  },
}

export function ModuleGroupPage({ groupKey, modules }) {
  const group = groupConfig[groupKey]
  const currentUser = useSelector(selectCurrentUser)
  const { data: permissionState, isLoading: permissionsLoading } = useGetCurrentPermissionsQuery()
  const groupModules = useMemo(
    () =>
      (group?.moduleKeys ?? [])
        .map((key) => modules.find((module) => module.key === key))
        .filter(Boolean)
        .filter((module) => canAccessModule(module.key, permissionState, currentUser)),
    [group, modules, permissionState, currentUser],
  )
  const [activeModuleKey, setActiveModuleKey] = useState(groupModules[0]?.key)

  useEffect(() => {
    if (!groupModules.length) return
    if (!groupModules.some((module) => module.key === activeModuleKey)) {
      setActiveModuleKey(groupModules[0].key)
    }
  }, [groupModules, activeModuleKey])

  const activeModule = groupModules.find((module) => module.key === activeModuleKey) ?? groupModules[0]

  if (!group) return null

  if (permissionsLoading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Checking permissions...</div>
  }

  if (!activeModule) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">No allowed modules available for your role.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-slate-950">{group.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{group.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groupModules.map((module) => {
          const isActive = module.key === activeModule.key

          return (
            <button
              key={module.key}
              type="button"
              onClick={() => setActiveModuleKey(module.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                isActive
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm font-medium">{module.title}</span>
              <span className="mt-2 block text-xs text-slate-500">Backend integrated</span>
            </button>
          )
        })}
      </div>

      <ModulePage module={activeModule} hideMainTitle />
    </div>
  )
}
