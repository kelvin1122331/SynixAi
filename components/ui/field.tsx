import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-xl border border-line bg-surface-2/70 px-3.5 text-fg placeholder:text-muted/70 outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 disabled:opacity-60";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-11 text-sm", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-24 py-3 text-sm leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldBase,
          "h-11 appearance-none pr-9 text-sm [&>option]:bg-surface-2 [&>option]:text-fg",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted"
      >
        <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Label({
  children,
  htmlFor,
  hint,
  required,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 flex items-center justify-between gap-2 text-[13px] font-semibold text-fg-soft", className)}>
      <span>
        {children}
        {required ? <span className="ml-0.5 text-rose-400">*</span> : null}
      </span>
      {hint ? <span className="text-[11.5px] font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <Label required={required} hint={hint}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? <p className="mt-1.5 text-[12px] font-medium text-rose-400">{error}</p> : null}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("group inline-flex items-center gap-2.5 text-[13px] font-medium text-fg-soft", className)}
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-transparent gradient-brand" : "border-line-strong bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-300",
            checked && "translate-x-5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
