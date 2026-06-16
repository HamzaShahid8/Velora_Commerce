import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { FieldRenderer } from '../components/FieldRenderer'
import { authScreens } from '../config/modules'
import { useGenerateOtpMutation, useGetSignupRolesQuery, useLoginMutation, useRegisterMutation, useVerifyOtpMutation } from '../store/api'
import { setUser } from '../store/authSlice'
import { extractErrorMessage } from '../utils/format'

const emptyRoleOptions = []

function readStoredSignupUsers() {
  try {
    return JSON.parse(localStorage.getItem('velora_signup_users') || '{}')
  } catch {
    return {}
  }
}

function storeSignupUser(email, user) {
  if (!email || !user) return
  const current = readStoredSignupUsers()
  current[email] = user
  localStorage.setItem('velora_signup_users', JSON.stringify(current))
}

function signupUserByEmail(email) {
  if (!email) return null
  return readStoredSignupUsers()[email] ?? null
}

function createValues(fields, initial = {}) {
  return fields.reduce((acc, field) => {
    acc[field.key] = initial[field.key] ?? (field.type === 'checkbox' ? false : '')
    return acc
  }, {})
}

export function AuthFlowPage() {
  const dispatch = useDispatch()
  const [step, setStep] = useState('signup')
  const [pendingEmail, setPendingEmail] = useState('')
  const [values, setValues] = useState(() => createValues(authScreens.signup.fields))
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const page = authScreens[step]
  const { data: roleOptions = emptyRoleOptions, isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useGetSignupRolesQuery(undefined, { skip: step !== 'signup' })

  const [register, registerState] = useRegisterMutation()
  const [generateOtp, generateOtpState] = useGenerateOtpMutation()
  const [verifyOtp, verifyOtpState] = useVerifyOtpMutation()
  const [login, loginState] = useLoginMutation()

  const isLoading = registerState.isLoading || generateOtpState.isLoading || verifyOtpState.isLoading || loginState.isLoading

  const fields = useMemo(() => {
    return page.fields.map((field) => {
      if (field.key !== 'role') return field

      const options = roleOptions.map((role) => ({
        value: role.name,
        label: role.name ? role.name.charAt(0).toUpperCase() + role.name.slice(1) : role.name,
      }))

      return {
        ...field,
        type: 'select',
        options,
        disabled: rolesLoading,
        helperText: rolesLoading ? 'Loading roles...' : '',
      }
    })
  }, [page.fields, roleOptions, rolesLoading, rolesError])

  useEffect(() => {
    const initial = step === 'verifyOtp' ? { email: pendingEmail } : {}
    setValues(createValues(fields, initial))
    setError('')
    setNotice('')
  }, [step, fields, pendingEmail])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    try {
      if (step === 'signup') {
        const registeredUser = await register(values).unwrap()
        const uploadedImage = values.image instanceof File ? { name: values.image.name, preview: URL.createObjectURL(values.image) } : values.image
        storeSignupUser(values.email, {
          ...(registeredUser ?? {}),
          username: registeredUser?.username ?? values.username,
          email: registeredUser?.email ?? values.email,
          role: registeredUser?.role ?? values.role,
          image: registeredUser?.image ?? uploadedImage,
        })
        setPendingEmail(values.email)
        setNotice('Account created. OTP has been sent to your email.')
        setStep('verifyOtp')
        return
      }

      if (step === 'verifyOtp') {
        await verifyOtp({ email: values.email, otp: values.otp }).unwrap()
        setNotice('OTP verified successfully. Please login.')
        setStep('login')
        return
      }

      if (step === 'login') {
        const response = await login({ email: values.email, password: values.password }).unwrap()
        const signupUser = signupUserByEmail(values.email)
        const loginUser = response.user ?? response?.data?.user ?? response?.user_data ?? null
        const mergedUser = {
          ...(signupUser ?? {}),
          ...(loginUser ?? {}),
          id: loginUser?.id ?? loginUser?.user ?? signupUser?.id,
          username: loginUser?.username ?? signupUser?.username,
          email: loginUser?.email ?? values.email ?? signupUser?.email,
          image: loginUser?.image ?? signupUser?.image ?? '',
          role: loginUser?.role ?? signupUser?.role,
        }
        dispatch(setUser(mergedUser))
      }
    } catch (apiError) {
      setError(extractErrorMessage(apiError))
    }
  }

  const resendOtp = async () => {
    setError('')
    setNotice('')
    try {
      const email = values.email || pendingEmail
      await generateOtp({ email }).unwrap()
      setNotice('OTP generated and sent to your email.')
    } catch (apiError) {
      setError(extractErrorMessage(apiError))
    }
  }

  const switchPage = (nextStep) => {
    setPendingEmail('')
    setStep(nextStep)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4 py-2">
      <section className="w-full max-w-[380px]">
        <div className="mb-2 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-stone-950">{page.title}</h1>
          <p className="mt-0.5 text-[11px] leading-4 text-stone-500">{page.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_16px_40px_rgba(28,25,23,0.06)] sm:p-4">
          <form className="space-y-2" onSubmit={submit}>
            {fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
                compact
              />
            ))}

            {notice ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{notice}</p> : null}
            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p> : null}
            {step === 'signup' && rolesError ? (
              <button className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50" type="button" onClick={refetchRoles}>
                Retry loading roles
              </button>
            ) : null}

            <button disabled={isLoading} className="w-full rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
              {isLoading ? 'Please wait...' : page.submitLabel}
            </button>
          </form>

          {step === 'verifyOtp' ? (
            <button className="mt-3 w-full text-center text-xs font-medium text-stone-950 underline underline-offset-4" type="button" onClick={resendOtp} disabled={isLoading}>
              Generate OTP again
            </button>
          ) : null}

          {step === 'signup' ? (
            <p className="mt-3 text-center text-xs text-stone-600">
              Already have an account?{' '}
              <button className="font-medium text-stone-950 underline underline-offset-4" type="button" onClick={() => switchPage('login')}>
                Login
              </button>
            </p>
          ) : step === 'login' ? (
            <p className="mt-3 text-center text-xs text-stone-600">
              Don&apos;t have an account?{' '}
              <button className="font-medium text-stone-950 underline underline-offset-4" type="button" onClick={() => switchPage('signup')}>
                Signup
              </button>
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-stone-600">
              Need to change account?{' '}
              <button className="font-medium text-stone-950 underline underline-offset-4" type="button" onClick={() => switchPage('signup')}>
                Signup
              </button>
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
