export default function PriorityBadge({ priority }) {
  const priorityConfig = {
    LOW: { label: 'Low', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', leftBorder: 'border-l-2 border-l-slate-500' },
    MEDIUM: { label: 'Medium', bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-300', leftBorder: 'border-l-2 border-l-amber-500' },
    HIGH: { label: 'High', bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', leftBorder: 'border-l-2 border-l-red-500' },
  }

  const config = priorityConfig[priority] || priorityConfig.LOW

  return (
    <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold ${config.leftBorder} ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
