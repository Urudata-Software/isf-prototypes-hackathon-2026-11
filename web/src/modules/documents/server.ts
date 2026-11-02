import 'server-only'
import { api } from '@/lib/api'
import type { PaginatedResult } from '@/lib/types'
import type { Document } from './types'
import type { CreateDocumentInput, UpdateDocumentInput } from './schemas'

export function getDocuments(page = 1, pageSize = 20): Promise<PaginatedResult<Document>> {
  return api.get(`/documents?page=${page}&pageSize=${pageSize}`)
}

export function getDocumentById(id: string): Promise<Document> {
  return api.get(`/documents/${id}`)
}

export function createDocument(input: CreateDocumentInput): Promise<Document> {
  return api.post('/documents', input)
}

export function updateDocument(id: string, input: UpdateDocumentInput): Promise<Document> {
  return api.patch(`/documents/${id}`, input)
}

export function deleteDocument(id: string): Promise<void> {
  return api.delete(`/documents/${id}`)
}

export function summarizeDocument(id: string): Promise<Document> {
  return api.post(`/documents/${id}/summarize`)
}
