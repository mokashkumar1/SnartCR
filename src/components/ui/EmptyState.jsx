import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', subtitle = 'Add some items to get started.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-slate-50 dark:bg-[#131B2F] p-4 rounded-full mb-4">
        <Inbox size={32} className="text-slate-500" />
      </div>
      <h3 className="text-base font-medium text-slate-600 dark:text-slate-300">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  )
}