import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getRolePermissionNames } from '../config/permissions'


function getDefaultApiBaseUrl() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8000'

  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || '127.0.0.1'
  return `${protocol}//${hostname}:8000`
}

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL

  if (!configuredUrl) return getDefaultApiBaseUrl()

  try {
    const parsedUrl = new URL(configuredUrl)
    const frontendHost = typeof window !== 'undefined' ? window.location.hostname : ''
    const isLocalBackend = ['localhost', '127.0.0.1'].includes(parsedUrl.hostname)
    const isLocalFrontend = ['localhost', '127.0.0.1'].includes(frontendHost)

    // Keep frontend and backend on the same local hostname so HttpOnly auth cookies are sent correctly.
    if (isLocalBackend && isLocalFrontend) {
      parsedUrl.hostname = frontendHost
      parsedUrl.protocol = window.location.protocol
      return parsedUrl.origin
    }

    return parsedUrl.origin
  } catch {
    return configuredUrl.replace(/\/+$/, '')
  }
}

const API_BASE_URL = getApiBaseUrl()


// These names are the backend's seeded signup roles from roles_permissions/management/commands/load_roles.py.
// They are used only if the backend does not expose role choices publicly before login.
// Values must stay as backend role.name strings because UserSerializer expects SlugRelatedField(slug_field='name').
const BACKEND_SIGNUP_ROLE_FALLBACK = ['admin', 'manager', 'worker', 'customer']

function backendSeedRoleOptions() {
  return BACKEND_SIGNUP_ROLE_FALLBACK.map((name) => ({ id: name, name }))
}

function findSchemaObject(root, ref) {
  if (!root || !ref || typeof ref !== 'string' || !ref.startsWith('#/')) return null
  return ref.slice(2).split('/').reduce((current, part) => current?.[part], root)
}

function extractEnumValuesFromSchemaNode(node, root, found = new Set(), seen = new Set()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return found
  seen.add(node)

  if (node.$ref) {
    extractEnumValuesFromSchemaNode(findSchemaObject(root, node.$ref), root, found, seen)
  }

  if (Array.isArray(node.enum)) {
    node.enum.forEach((value) => {
      if (value !== null && value !== undefined && value !== '') found.add(String(value))
    })
  }

  if (node.properties?.role) {
    extractEnumValuesFromSchemaNode(node.properties.role, root, found, seen)
  }

  for (const key of ['oneOf', 'anyOf', 'allOf']) {
    if (Array.isArray(node[key])) {
      node[key].forEach((child) => extractEnumValuesFromSchemaNode(child, root, found, seen))
    }
  }

  if (node.items) extractEnumValuesFromSchemaNode(node.items, root, found, seen)

  return found
}

function extractRoleOptionsFromOpenApiSchema(schema) {
  const roleValues = new Set()
  const paths = schema?.paths ?? {}

  for (const [path, methods] of Object.entries(paths)) {
    if (!path.includes('/api/accounts/register')) continue
    const requestSchema = methods?.post?.requestBody?.content?.['application/json']?.schema
      ?? methods?.post?.requestBody?.content?.['multipart/form-data']?.schema
      ?? methods?.post?.requestBody?.content?.['application/x-www-form-urlencoded']?.schema

    extractEnumValuesFromSchemaNode(requestSchema, schema, roleValues)
  }

  return Array.from(roleValues).map((name) => ({ id: name, name }))
}


function normalizeListResponse(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.data)) return response.data
  return []
}

function isFileValue(value) {
  return typeof File !== 'undefined' && value instanceof File
}

function needsFormData(body = {}) {
  return Object.values(body).some((value) => isFileValue(value))
}

function cleanBody(body = {}) {
  return Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value !== undefined && value !== null && value !== '' && !(key === 'image' && typeof value === 'string')),
  )
}

function buildBody(body = {}) {
  const cleaned = cleanBody(body)
  if (!needsFormData(cleaned)) return cleaned

  const formData = new FormData()
  Object.entries(cleaned).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
    } else {
      formData.append(key, value)
    }
  })
  return formData
}

function cleanFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function buildUrlWithQuery(url, filters = {}) {
  const cleaned = cleanFilters(filters)
  const params = new URLSearchParams()

  Object.entries(cleaned).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') params.append(key, item)
      })
      return
    }

    params.set(key, value)
  })

  const query = params.toString()
  return query ? `${url}?${query}` : url
}

function normalizeModuleListArg(arg) {
  if (typeof arg === 'string') return { moduleKey: arg, filters: {} }
  return { moduleKey: arg?.moduleKey, filters: arg?.filters ?? {} }
}

function normalizeRoleOptions(response) {
  return normalizeListResponse(response)
    .map((role) => {
      if (typeof role === 'string') return { id: role, name: role }
      const name = role?.name ?? role?.role ?? role?.display_name ?? role?.value
      if (!name) return null
      return { id: role.id ?? role.value ?? name, name }
    })
    .filter(Boolean)
}

function extractChoicesFromField(field) {
  const choices = field?.choices

  if (Array.isArray(choices)) {
    return choices
      .map((choice) => {
        if (typeof choice === 'string') return { id: choice, name: choice }
        const value = choice?.value ?? choice?.name ?? choice?.display_name
        const label = choice?.display_name ?? choice?.label ?? choice?.name ?? value
        if (!value && !label) return null
        return { id: value ?? label, name: String(label ?? value) }
      })
      .filter(Boolean)
  }

  if (choices && typeof choices === 'object') {
    return Object.entries(choices).map(([value, label]) => ({ id: value, name: String(label ?? value) }))
  }

  return []
}

function extractRoleOptionsFromOptionsMetadata(response) {
  const directRoleField = response?.actions?.POST?.role ?? response?.actions?.post?.role ?? response?.role
  const directChoices = extractChoicesFromField(directRoleField)
  if (directChoices.length) return directChoices

  const stack = [response]
  const seen = new Set()

  while (stack.length) {
    const current = stack.pop()
    if (!current || typeof current !== 'object' || seen.has(current)) continue
    seen.add(current)

    if (current.role && typeof current.role === 'object') {
      const choices = extractChoicesFromField(current.role)
      if (choices.length) return choices
    }

    for (const value of Object.values(current)) {
      if (value && typeof value === 'object') stack.push(value)
    }
  }

  return []
}

function readSignupUserByEmail(email) {
  if (!email || typeof localStorage === 'undefined') return null
  try {
    const users = JSON.parse(localStorage.getItem('velora_signup_users') || '{}')
    return users[email] ?? null
  } catch {
    return null
  }
}

function currentUserRow(state) {
  const user = state?.auth?.user
  if (!user) return null

  const signupUser = readSignupUserByEmail(user.email)

  return {
    id: user.id ?? user.user ?? signupUser?.id ?? '—',
    username: user.username ?? signupUser?.username ?? user.user ?? '—',
    email: user.email ?? signupUser?.email ?? '—',
    image: user.image ?? signupUser?.image ?? '',
    role: user.role ?? signupUser?.role ?? '—',
  }
}

function normalizeRoleName(role) {
  if (!role) return ''
  if (typeof role === 'string') return role.toLowerCase()
  return String(role.name ?? role.role ?? '').toLowerCase()
}

function normalizePermissionName(permission) {
  if (!permission) return ''
  if (typeof permission === 'string') return permission
  return permission.name ?? permission.permission ?? ''
}

function normalizeRolePermissionIds(role) {
  const permissions = role?.permissions
  if (!Array.isArray(permissions)) return []
  return permissions.map((permission) => (typeof permission === 'object' ? permission.id ?? permission.name : permission))
}

function currentUserId(state) {
  const user = state?.auth?.user
  return user?.id ?? user?.user ?? null
}

function resolveUserNameFromState(state, userId) {
  const user = state?.auth?.user
  const id = user?.id ?? user?.user
  if (String(id) === String(userId)) return user.username ?? user.email ?? `User #${userId}`
  return `User #${userId}`
}

function enrichProfileRows(rows, state) {
  return rows.map((row) => {
    if (!row || row.user === undefined || row.user === null || typeof row.user === 'object') return row
    return {
      ...row,
      user_display: resolveUserNameFromState(state, row.user),
    }
  })
}


function normalizeProbeStatus(error) {
  const status = error?.status
  if (status === 401 || status === 403 || status === 404 || status === 405) return false
  if (!error) return true
  return false
}

function hasOptionsAction(optionsData, actionName) {
  const actions = optionsData?.actions ?? {}
  return Boolean(actions[actionName] || actions[actionName.toLowerCase()] || actions[actionName.toUpperCase()])
}

function rowsFromResponse(response) {
  if (response?.error) return []
  return normalizeListResponse(response?.data)
}

const sidebarProbeModules = [
  'admin-profiles',
  'manager-profiles',
  'worker-profiles',
  'client-profiles',
  'product-designs',
  'products',
  'invoices',
  'invoice-items',
  'payments',
]

const moduleConfig = {
  users: { url: '/api/accounts/register/', readOnlyUpdateDelete: true, tag: 'Users' },
  'admin-profiles': { url: '/api/profiles/admins/', tag: 'AdminProfiles' },
  'manager-profiles': { url: '/api/profiles/managers/', tag: 'ManagerProfiles' },
  'worker-profiles': { url: '/api/profiles/workers/', tag: 'WorkerProfiles' },
  'client-profiles': { url: '/api/profiles/clients/', tag: 'ClientProfiles' },
  'product-designs': { url: '/api/products/product_designs/', tag: 'ProductDesigns' },
  products: { url: '/api/products/products/', tag: 'Products' },
  invoices: { url: '/api/billing/invoices/', tag: 'Invoices' },
  'invoice-items': { url: '/api/billing/invoice-items/', tag: 'InvoiceItems' },
  payments: { url: '/api/billing/payments/', tag: 'Payments' },
}

export const veloraApi = createApi({
  reducerPath: 'veloraApi',
  baseQuery: async (args, api, extraOptions) => {
    const rawBaseQuery = fetchBaseQuery({
      baseUrl: API_BASE_URL,
      credentials: 'include',
    })

    let result = await rawBaseQuery(args, api, extraOptions)

    if (result?.error?.status === 401) {
      const refreshResult = await rawBaseQuery({ url: '/api/accounts/refresh/', method: 'POST' }, api, extraOptions)

      if (!refreshResult?.error) {
        result = await rawBaseQuery(args, api, extraOptions)
      }
    }

    return result
  },
  tagTypes: Object.values(moduleConfig).map((item) => item.tag).concat(['Dashboard', 'Auth', 'Account', 'Roles']),
  endpoints: (builder) => ({
    getCurrentPermissions: builder.query({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        const state = api.getState()
        const authUser = state?.auth?.user
        const roleName = normalizeRoleName(authUser?.role)

        if (authUser?.is_superuser) {
          return { data: { role: roleName, isSuperuser: true, permissions: ['*'], source: 'superuser' } }
        }

        let dashboardRole = roleName
        const accountResponse = await baseQuery('/api/accounts/dashboard/')
        if (!accountResponse.error) {
          dashboardRole = normalizeRoleName(accountResponse.data?.role) || dashboardRole
        }

        const permissionNames = getRolePermissionNames(dashboardRole)

        return {
          data: {
            role: dashboardRole,
            isSuperuser: Boolean(authUser?.is_superuser),
            permissions: permissionNames,
            source: 'frontend_role_permission_map_from_admin_panel',
          },
        }
      },
      providesTags: ['Account', 'Roles'],
    }),

    getModuleAccess: builder.query({
      async queryFn(moduleKey, _api, _extraOptions, baseQuery) {
        if (moduleKey === 'users') {
          return { data: { moduleKey, view: true, create: false, update: false, delete: false } }
        }

        const url = moduleConfig[moduleKey]?.url
        if (!url) return { data: { moduleKey, view: false, create: false, update: false, delete: false } }

        const listResponse = await baseQuery(url)
        const view = normalizeProbeStatus(listResponse.error)

        const optionsResponse = await baseQuery({ url, method: 'OPTIONS' })
        const create = !optionsResponse.error && hasOptionsAction(optionsResponse.data, 'POST')

        let update = false
        let destroy = false
        const rows = rowsFromResponse(listResponse)
        const firstId = rows?.[0]?.id

        if (firstId) {
          const detailOptionsResponse = await baseQuery({ url: `${url}${firstId}/`, method: 'OPTIONS' })
          if (!detailOptionsResponse.error) {
            update = hasOptionsAction(detailOptionsResponse.data, 'PUT') || hasOptionsAction(detailOptionsResponse.data, 'PATCH')
            destroy = hasOptionsAction(detailOptionsResponse.data, 'DELETE')
          }
        }

        return { data: { moduleKey, view, create, update, delete: destroy } }
      },
      providesTags: (_result, _error, moduleKey) => [{ type: moduleConfig[moduleKey]?.tag ?? 'Account', id: 'ACCESS' }],
    }),

    getSidebarAccess: builder.query({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const accessByModule = {}
        const allowedKeys = []

        for (const moduleKey of sidebarProbeModules) {
          const url = moduleConfig[moduleKey]?.url
          if (!url) continue

          const listResponse = await baseQuery(url)
          const view = normalizeProbeStatus(listResponse.error)

          const optionsResponse = await baseQuery({ url, method: 'OPTIONS' })
          const create = !optionsResponse.error && hasOptionsAction(optionsResponse.data, 'POST')

          // Update/delete are best resolved from role permissions. If backend does not expose role permissions,
          // frontend only uses safe probes and never sends destructive test requests.
          accessByModule[moduleKey] = { view, create, update: false, delete: false }

          if (view || create) {
            allowedKeys.push(moduleKey)
          }
        }

        return { data: { moduleKeys: allowedKeys, accessByModule } }
      },
      providesTags: ['Account', 'Dashboard'],
    }),

    getSignupRoles: builder.query({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        // Never call GET /api/accounts/register/. The backend register view has no queryset for GET.
        // The pasted error is caused exactly by a GET request to this endpoint.

        // 1) Best case: DRF OPTIONS exposes serializer choices for the Role SlugRelatedField.
        const registerOptionsResponse = await baseQuery({ url: '/api/accounts/register/', method: 'OPTIONS' })

        if (!registerOptionsResponse.error) {
          const roleOptions = extractRoleOptionsFromOptionsMetadata(registerOptionsResponse.data)
          if (roleOptions.length) return { data: roleOptions }
        }

        // 2) Public schema fallback. This is still backend-driven and does not call the protected roles endpoint first.
        const schemaResponse = await baseQuery('/api/schema/?format=json')
        if (!schemaResponse.error) {
          const schemaRoleOptions = extractRoleOptionsFromOpenApiSchema(schemaResponse.data)
          if (schemaRoleOptions.length) return { data: schemaRoleOptions }
        }

        // 3) Authenticated fallback for users who already have view_role permission.
        const rolesResponse = await baseQuery('/api/roles_permissions/roles/')
        if (!rolesResponse.error) {
          const roleOptions = normalizeRoleOptions(rolesResponse.data)
          if (roleOptions.length) return { data: roleOptions }
        }

        // 4) Last frontend-only fallback copied from backend load_roles command.
        // No extra roles are invented; these are the backend's default seeded roles.
        return { data: backendSeedRoleOptions() }
      },
      providesTags: ['Roles'],
    }),
    register: builder.mutation({
      query: (body) => ({
        url: '/api/accounts/register/',
        method: 'POST',
        body: buildBody(body),
      }),
      invalidatesTags: ['Users'],
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/api/accounts/login/',
        method: 'POST',
        body: cleanBody(body),
      }),
      invalidatesTags: ['Auth', 'Dashboard'],
    }),
    logout: builder.mutation({
      query: (body = {}) => ({
        url: '/api/accounts/logout/',
        method: 'POST',
        body: cleanBody(body),
      }),
      invalidatesTags: ['Auth', 'Dashboard'],
    }),
    refreshToken: builder.mutation({
      query: () => ({ url: '/api/accounts/refresh/', method: 'POST' }),
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: '/api/accounts/change_password/',
        method: 'POST',
        body: cleanBody(body),
      }),
    }),
    generateOtp: builder.mutation({
      query: (body) => ({
        url: '/api/accounts/otp_generate/',
        method: 'POST',
        body: cleanBody(body),
      }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: '/api/accounts/verify_otp/',
        method: 'POST',
        body: cleanBody(body),
      }),
    }),
    getAccountDashboard: builder.query({
      query: () => '/api/accounts/dashboard/',
      providesTags: ['Account'],
    }),
    getDashboard: builder.query({
      query: () => '/api/dashboard/dashboard/',
      providesTags: ['Dashboard'],
    }),
    downloadClientProfilePdf: builder.mutation({
      query: (id) => ({
        url: `/api/profiles/clients/${id}/download_pdf/`,
        method: 'GET',
        responseHandler: async (response) => response.blob(),
        cache: 'no-cache',
      }),
    }),
    getModuleList: builder.query({
      async queryFn(arg, api, _extraOptions, baseQuery) {
        const { moduleKey, filters } = normalizeModuleListArg(arg)

        if (moduleKey === 'users') {
          const existingUser = currentUserRow(api.getState())
          const dashboardResponse = await baseQuery('/api/accounts/dashboard/')

          if (!dashboardResponse.error) {
            const dashboard = dashboardResponse.data ?? {}
            return {
              data: [
                {
                  id: existingUser?.id ?? dashboard.id ?? dashboard.user_id ?? '—',
                  username: dashboard.user ?? existingUser?.username ?? '—',
                  email: dashboard.email ?? existingUser?.email ?? '—',
                  image: existingUser?.image ?? '',
                  role: dashboard.role ?? existingUser?.role ?? '—',
                },
              ],
            }
          }

          return { data: existingUser ? [existingUser] : [] }
        }

        const url = moduleConfig[moduleKey]?.url
        if (!url) return { data: [] }

        const response = await baseQuery(buildUrlWithQuery(url, filters))
        if (response.error) return { error: response.error }
        const rows = normalizeListResponse(response.data)
        const data = moduleKey?.includes('profiles') ? enrichProfileRows(rows, api.getState()) : rows
        return { data }
      },
      providesTags: (result, error, arg) => {
        const { moduleKey } = normalizeModuleListArg(arg)
        return [{ type: moduleConfig[moduleKey]?.tag, id: 'LIST' }]
      },
    }),
    getModuleDetail: builder.query({
      query: ({ moduleKey, id }) => `${moduleConfig[moduleKey]?.url}${id}/`,
      providesTags: (result, error, { moduleKey, id }) => [{ type: moduleConfig[moduleKey]?.tag, id }],
    }),
    createModuleRecord: builder.mutation({
      queryFn: async ({ moduleKey, body }, _api, _extraOptions, baseQuery) => {
        if (moduleKey === 'users') {
          return { error: { status: 403, data: { detail: 'This action is not available from frontend for this module.' } } }
        }
        const response = await baseQuery({
          url: moduleConfig[moduleKey]?.url,
          method: 'POST',
          body: buildBody(body),
        })
        return response.error ? { error: response.error } : { data: response.data }
      },
      invalidatesTags: (result, error, { moduleKey }) => [{ type: moduleConfig[moduleKey]?.tag, id: 'LIST' }, 'Dashboard'],
    }),
    updateModuleRecord: builder.mutation({
      query: ({ moduleKey, id, body }) => ({
        url: `${moduleConfig[moduleKey]?.url}${id}/`,
        method: 'PATCH',
        body: buildBody(body),
      }),
      invalidatesTags: (result, error, { moduleKey, id }) => [{ type: moduleConfig[moduleKey]?.tag, id }, { type: moduleConfig[moduleKey]?.tag, id: 'LIST' }, 'Dashboard'],
    }),
    deleteModuleRecord: builder.mutation({
      queryFn: async ({ moduleKey, id }, _api, _extraOptions, baseQuery) => {
        if (moduleKey === 'users') {
          return { error: { status: 403, data: { detail: 'This action is not available from frontend for this module.' } } }
        }
        const response = await baseQuery({
          url: `${moduleConfig[moduleKey]?.url}${id}/`,
          method: 'DELETE',
        })
        return response.error ? { error: response.error } : { data: response.data }
      },
      invalidatesTags: (result, error, { moduleKey }) => [{ type: moduleConfig[moduleKey]?.tag, id: 'LIST' }, 'Dashboard'],
    }),
  }),
})

export const moduleApiConfig = moduleConfig

export const {
  useGetCurrentPermissionsQuery,
  useGetSidebarAccessQuery,
  useGetModuleAccessQuery,
  useGetSignupRolesQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useGenerateOtpMutation,
  useVerifyOtpMutation,
  useGetAccountDashboardQuery,
  useGetDashboardQuery,
  useDownloadClientProfilePdfMutation,
  useGetModuleListQuery,
  useGetModuleDetailQuery,
  useCreateModuleRecordMutation,
  useUpdateModuleRecordMutation,
  useDeleteModuleRecordMutation,
} = veloraApi
