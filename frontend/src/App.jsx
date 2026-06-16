import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ModulePage } from './pages/ModulePage'
import { AuthFlowPage } from './pages/AuthFlowPage'
import { groupedPageKeys, modules, navigation } from './config/modules'
import { ModuleGroupPage } from './pages/ModuleGroupPage'
import { clearUser, selectCurrentUser } from './store/authSlice'
import { useGetCurrentPermissionsQuery, useLogoutMutation } from './store/api'
import { canAccessModule } from './config/permissions'

export default function App() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [activePage, setActivePage] = useState('dashboard')
  const [pageHistory, setPageHistory] = useState(['dashboard'])
  const [pageHistoryIndex, setPageHistoryIndex] = useState(0)
  const [logout] = useLogoutMutation()
  const { data: permissionState } = useGetCurrentPermissionsQuery(undefined, { skip: !currentUser })
  const allowedModules = useMemo(() => {
    return modules.filter((module) => canAccessModule(module.key, permissionState, currentUser))
  }, [permissionState, currentUser])

  const allowedNavigation = useMemo(() => {
    const hasAllowedModule = (keys) => keys.some((key) => allowedModules.some((module) => module.key === key))

    return navigation.filter((item) => {
      if (item.key === 'dashboard') return true
      if (item.key === 'users') return hasAllowedModule(['users'])
      if (item.key === 'profiles') return hasAllowedModule(['admin-profiles', 'manager-profiles', 'worker-profiles', 'client-profiles'])
      if (item.key === 'product-management') return hasAllowedModule(['product-designs', 'products'])
      if (item.key === 'billing') return hasAllowedModule(['invoices', 'invoice-items', 'payments'])
      return false
    })
  }, [allowedModules])

  const activeModule = useMemo(() => allowedModules.find((module) => module.key === activePage), [activePage, allowedModules])
  const isGroupedPage = groupedPageKeys.includes(activePage)

  const navigateToPage = (pageKey) => {
    if (!pageKey || pageKey === activePage) return

    setPageHistory((current) => {
      const trimmedHistory = current.slice(0, pageHistoryIndex + 1)
      return [...trimmedHistory, pageKey]
    })
    setPageHistoryIndex((current) => current + 1)
    setActivePage(pageKey)
  }

  const goBack = () => {
    if (pageHistoryIndex <= 0) return

    const nextIndex = pageHistoryIndex - 1
    setPageHistoryIndex(nextIndex)
    setActivePage(pageHistory[nextIndex])
  }

  const goForward = () => {
    if (pageHistoryIndex >= pageHistory.length - 1) return

    const nextIndex = pageHistoryIndex + 1
    setPageHistoryIndex(nextIndex)
    setActivePage(pageHistory[nextIndex])
  }

  const handleLogout = async () => {
    try {
      await logout({}).unwrap()
    } catch {
      // Backend requires a refresh token in the request body, but tokens are stored in HttpOnly cookies.
      // Frontend still clears local auth state so the user returns to login.
    } finally {
      dispatch(clearUser())
      setActivePage('dashboard')
      setPageHistory(['dashboard'])
      setPageHistoryIndex(0)
    }
  }

  if (!currentUser) return <AuthFlowPage />

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={navigateToPage}
      onBack={goBack}
      onForward={goForward}
      canGoBack={pageHistoryIndex > 0}
      canGoForward={pageHistoryIndex < pageHistory.length - 1}
      onLogout={handleLogout}
      currentUser={currentUser}
      navigationItems={allowedNavigation}
    >
      {activePage === 'dashboard' ? <DashboardPage /> : null}
      {isGroupedPage ? <ModuleGroupPage groupKey={activePage} modules={allowedModules} /> : null}
      {!isGroupedPage && activeModule ? <ModulePage module={activeModule} /> : null}
    </AppLayout>
  )
}
