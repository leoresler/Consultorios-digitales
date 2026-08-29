import type { ChangeEvent, SelectHTMLAttributes, InputHTMLAttributes } from 'react';

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
}

export function CampoTexto({ id, label, error, hint, className: extraClass, ...input }: CampoTextoProps) {
  return (
    <div>
      <label htmlFor={id} className="label-clinica">{label}</label>
      <input
        id={id}
        className={`input-clinica${error ? ' input-clinica-error' : ''}${extraClass ? ` ${extraClass}` : ''}`}
        {...input}
      />
      {error ? (
        <span className="error-text">{error}</span>
      ) : hint ? (
        <span className="hint-text">{hint}</span>
      ) : null}
    </div>
  );
}

interface OpcionSelect {
  value: string;
  label: string;
}

interface CampoSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  opciones: OpcionSelect[];
  placeholder?: string;
  error?: string | null;
}

export function CampoSelect({
  id,
  label,
  opciones,
  placeholder,
  error,
  ...select
}: CampoSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="label-clinica">{label}</label>
      <select
        id={id}
        className={`input-clinica${error ? ' input-clinica-error' : ''}`}
        {...select}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

/** Switch simple para toggles de formularios. */
export function CampoCheck({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      {label}
    </label>
  );
}
