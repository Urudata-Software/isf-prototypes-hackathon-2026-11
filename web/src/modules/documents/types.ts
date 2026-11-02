export type DocumentStatus = 'draft' | 'review' | 'published'

export type Document = {
  id: string
  title: string
  content: string
  status: DocumentStatus
  summary: string | null
  createdAt: string
}
