export function toLabel(value) {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatCellValue(value) {
  if (Array.isArray(value)) return value.length ? value.map(formatCellValue).join(', ') : '—'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (value && typeof value === 'object') {
    if ('stock' in value && Object.keys(value).length === 1) return value.stock ?? '—'
    if ('email' in value) return value.email
    if ('username' in value) return value.username
    if ('name' in value) return value.name
    if ('invoice_number' in value) return value.invoice_number
    if ('code' in value) return value.code
    if ('title' in value) return value.title
    if ('id' in value) return value.id
    return JSON.stringify(value)
  }
  return value === undefined || value === null || value === '' ? '—' : value
}

export function extractErrorMessage(error) {
  const data = error?.data
  if (!data) return error?.error || 'Something went wrong.'
  if (typeof data === 'string') return data
  if (data.error) return data.error
  if (data.message) return data.message
  if (data.detail) return data.detail
  const firstKey = Object.keys(data)[0]
  const firstValue = data[firstKey]
  if (Array.isArray(firstValue)) return `${toLabel(firstKey)}: ${firstValue.join(', ')}`
  if (firstValue) return `${toLabel(firstKey)}: ${firstValue}`
  return 'Something went wrong.'
}

function getApiBaseForMedia() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL

  if (!configuredUrl && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`
  }

  if (!configuredUrl) return ''

  try {
    const parsedUrl = new URL(configuredUrl)
    const frontendHost = typeof window !== 'undefined' ? window.location.hostname : ''

    if (['localhost', '127.0.0.1'].includes(parsedUrl.hostname) && ['localhost', '127.0.0.1'].includes(frontendHost)) {
      parsedUrl.hostname = frontendHost
      parsedUrl.protocol = window.location.protocol
      return parsedUrl.origin
    }

    return parsedUrl.origin
  } catch {
    return configuredUrl.replace(/\/+$/, '')
  }
}

export function resolveMediaUrl(value) {
  if (!value || typeof value !== 'string') return value
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) return value
  if (value.startsWith('/')) return `${getApiBaseForMedia()}${value}`
  return value
}
