import { FieldRenderer } from './FieldRenderer'

export function BackendForm({ title = 'Form', fields = [], values = {}, onChange, onSubmit, onCancel, submitLabel = 'Save' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-medium tracking-tight text-slate-950 sm:text-xl">{title}</h2>
      </div>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        {fields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <FieldRenderer field={field} value={values[field.key]} onChange={onChange} />
          </div>
        ))}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end md:col-span-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
