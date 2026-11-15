import clsx from "clsx";

type Props = {
  id: string; label: string; required?: boolean; help?: string; error?: string; children: React.ReactNode; className?: string;
};

/** Label + control + help/error wiring. The child control should set `aria-describedby` via `describedBy(id, …)`. */
export function Field({ id, label, required, help, error, children, className }: Props) {
  return (
    <div className={clsx(className)}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span aria-hidden className="text-danger"> *</span>}
      </label>
      {children}
      {help && !error && <p id={`${id}-help`} className="field-help">{help}</p>}
      {error && <p id={`${id}-error`} role="alert" className="field-error">{error}</p>}
    </div>
  );
}

export const describedBy = (id: string, help?: boolean, error?: boolean) =>
  error ? `${id}-error` : help ? `${id}-help` : undefined;
