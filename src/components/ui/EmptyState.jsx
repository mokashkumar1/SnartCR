import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', subtitle = 'Add some items to get started.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-surface-muted p-4 rounded-full mb-4">
        <Inbox size={32} className="text-dark-60" />
      </div>
      <h3 className="text-base font-semibold text-dark">{title}</h3>
      <p className="text-sm text-dark-60 mt-1">{subtitle}</p>
    </div>
  )
}