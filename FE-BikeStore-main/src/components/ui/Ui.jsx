import { useState } from "react";
import { cn, orderStatusMap } from "../../utils/helpers";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Control Panel</p>
        <h2 className="font-headline text-3xl font-black tracking-tight text-primary md:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-[70ch] text-sm text-on-surface-variant">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className }) {
  return <div className={cn("rounded-[1.25rem] bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/35", className)}>{children}</div>;
}

export function Input({ label, className, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span> : null}
      <input {...props} className={cn("soft-inset w-full rounded-lg px-3 py-2 text-sm", className)} />
    </label>
  );
}

export function Select({ label, options, className, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span> : null}
      <select {...props} className={cn("soft-inset w-full rounded-lg px-3 py-2 text-sm", className)}>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Button({ children, variant = "primary", className, ...props }) {
  const variants = {
    primary: "bg-primary-gradient text-white shadow-diffusion",
    secondary: "bg-surface-container-low text-on-surface ring-1 ring-outline-variant/40",
    danger: "bg-error text-white",
  };

  return (
    <button
      {...props}
      className={cn("rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function DataTable({ columns, data, renderRow, pageSize }) {
  const [page, setPage] = useState(0);

  const usePagination = pageSize && data.length > pageSize;
  const totalPages = usePagination ? Math.ceil(data.length / pageSize) : 1;
  const displayData = usePagination ? data.slice(page * pageSize, (page + 1) * pageSize) : data;

  // Reset to page 0 when data changes
  const dataLen = data.length;
  const [prevLen, setPrevLen] = useState(dataLen);
  if (dataLen !== prevLen) {
    setPrevLen(dataLen);
    if (page !== 0) setPage(0);
  }

  const maxButtons = 5;
  let startPage = Math.max(0, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons);
  if (endPage - startPage < maxButtons) {
    startPage = Math.max(0, endPage - maxButtons);
  }

  return (
    <div>
      <div className="overflow-auto rounded-[1.15rem] bg-surface-container-lowest shadow-ambient ring-1 ring-outline-variant/30">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead className="bg-surface-container-low">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length ? (
              displayData.map((item, index) => renderRow(item, index))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-on-surface-variant" colSpan={columns.length}>
                  No records in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {usePagination && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                  p === page
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                )}
              >
                {p + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-[1.3rem] bg-surface-container-lowest p-6 shadow-diffusion ring-1 ring-white/50" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline text-xl font-extrabold text-primary">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-low transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const label = orderStatusMap[status] || status;
  const tone = {
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
    Completed: "bg-emerald-100 text-emerald-700",
  };

  return <span className={cn("rounded-full px-3 py-1 text-xs font-bold", tone[label] || "bg-slate-100 text-slate-700")}>{label}</span>;
}
