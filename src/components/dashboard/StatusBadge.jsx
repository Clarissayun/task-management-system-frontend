export default function StatusBadge({ status }) {
  const statusConfig = {
    TODO: { label: 'To Do', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-600' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-600' },
    DONE: { label: 'Done', bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-600' },
  }

  const config = statusConfig[status] || statusConfig.TODO

  return (
    <span className={`inline-flex items-center rounded-full border ${config.border} ${config.bg} px-2.5 py-0.5 text-xs font-medium ${config.text}`}>
      {config.label}
    </span>
  )
}
