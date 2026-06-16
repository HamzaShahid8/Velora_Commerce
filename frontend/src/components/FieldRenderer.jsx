export function FieldRenderer({ field, value, onChange, disabled = false, compact = false }) {
  const baseClass = compact
    ? 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400'
    : 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400'

  const handleChange = (event) => {
    if (field.type === 'checkbox') {
      onChange?.(field.key, event.target.checked)
      return
    }

    if (field.type === 'file') {
      const file = event.target.files?.[0] ?? null
      if (file) {
        file.preview = URL.createObjectURL(file)
      }
      onChange?.(field.key, file)
      return
    }

    if (field.type === 'multiselect') {
      onChange?.(
        field.key,
        Array.from(event.target.selectedOptions).map((option) => option.value),
      )
      return
    }

    onChange?.(field.key, event.target.value)
  }

  return (
    <label className="block">
      <span className={compact ? 'text-[11px] font-medium text-slate-700' : 'text-sm font-semibold text-slate-700'}>{field.label}</span>

      {field.type === 'textarea' ? (
        <textarea
          className={`${baseClass} ${compact ? 'min-h-16' : 'min-h-28'} resize-y`}
          placeholder={field.label}
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled || field.disabled}
          required={field.required}
        />
      ) : field.type === 'select' || field.type === 'multiselect' ? (
        <select
          className={baseClass}
          multiple={field.type === 'multiselect'}
          value={value ?? (field.type === 'multiselect' ? [] : '')}
          onChange={handleChange}
          disabled={disabled || field.disabled}
          required={field.required && field.type !== 'multiselect'}
        >
          {field.type !== 'multiselect' ? <option value="">Select {field.label}</option> : null}
          {(field.options ?? []).map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option
            const optionLabel = typeof option === 'object' ? option.label : option
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            )
          })}
        </select>
      ) : field.type === 'checkbox' ? (
        <div className={`${compact ? 'mt-1 rounded-lg px-3 py-1.5' : 'mt-2 rounded-xl px-4 py-3'} flex items-center gap-3 border border-slate-200 bg-white`}>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 accent-emerald-700"
            checked={Boolean(value)}
            onChange={handleChange}
            disabled={disabled || field.disabled}
          />
          <span className="text-sm text-slate-600">{Boolean(value) ? 'True' : 'False'}</span>
        </div>
      ) : (
        <>
          <input
            className={baseClass}
            type={field.type}
            placeholder={field.label}
            value={field.type === 'file' ? undefined : value ?? ''}
            onChange={handleChange}
            disabled={disabled || field.disabled}
            required={field.required}
          />
          {field.type === 'file' && value ? (
            <div className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
              {value.preview ? <img src={value.preview} alt={value.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200" /> : null}
              <span className="truncate">{value.name ?? String(value)}</span>
            </div>
          ) : null}
        </>
      )}
      {field.helperText ? <p className="mt-1 text-xs text-slate-500">{field.helperText}</p> : null}
    </label>
  )
}
