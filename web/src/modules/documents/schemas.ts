import { z } from 'zod'

export const documentStatuses = ['draft', 'review', 'published'] as const

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(documentStatuses, { message: 'Status is required' }),
})

export const updateDocumentSchema = createDocumentSchema.partial()

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
