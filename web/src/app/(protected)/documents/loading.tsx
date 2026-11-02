import { DocumentTableSkeleton } from '@/modules/documents/components/document-table-skeleton'

export default function Loading() {
  return (
    <div className="container py-8 space-y-6">
      <DocumentTableSkeleton />
    </div>
  )
}
