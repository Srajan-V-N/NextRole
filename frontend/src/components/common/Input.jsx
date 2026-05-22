export default function Input({
  label,
  error,
  icon,
  className = '',
  textarea = false,
  rows = 3,
  ...props
}) {
  const base = `input-base dark:bg-dark-surface dark:text-dark-text dark:border-dark-border dark:placeholder:text-dark-muted`
  const inputClass = `${base} ${error ? 'border-error focus:border-error focus:ring-error/25' : ''} ${icon ? 'pl-9' : ''} ${className}`

  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        {textarea ? (
          <textarea
            rows={rows}
            className={`${inputClass} resize-none leading-relaxed`}
            {...props}
          />
        ) : (
          <input className={inputClass} {...props} />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error font-medium">{error}</p>
      )}
    </div>
  )
}
