export function SaaSStatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
        {value ?? '—'}
      </div>
      {description ? <p className="mt-2 text-sm leading-5 text-slate-500">{description}</p> : null}
    </div>
  )
}
