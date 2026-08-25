import { Wallet2 } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand">
            <Wallet2 className="h-5 w-5 text-paper-raised" strokeWidth={2} />
          </div>
          <span className="font-display text-xl font-medium tracking-tight text-text-primary">
            Meu Dinheiro
          </span>
        </div>

        <div className="rounded-lg border border-border bg-paper-raised p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-medium text-text-primary">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}

export function FormField({
  label,
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  const id = props.id ?? props.name;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={id}
        className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand"
        {...props}
      />
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-expense-soft px-3 py-2 text-sm text-expense">
      {message}
    </p>
  );
}
