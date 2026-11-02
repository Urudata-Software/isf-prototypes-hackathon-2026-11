import { describe, it, expect } from 'vitest'
import { createDocumentSchema, updateDocumentSchema } from './schemas'

describe('createDocumentSchema', () => {
  it('passes with valid input', () => {
    const result = createDocumentSchema.safeParse({
      title: 'Remito 4821',
      content: 'Arrived without a purchase order.',
      status: 'draft',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = createDocumentSchema.safeParse({
      title: '',
      content: 'Arrived without a purchase order.',
      status: 'draft',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('title')
  })

  it('rejects empty content', () => {
    const result = createDocumentSchema.safeParse({
      title: 'Remito 4821',
      content: '',
      status: 'draft',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('content')
  })

  it('rejects unknown status', () => {
    const result = createDocumentSchema.safeParse({
      title: 'Remito 4821',
      content: 'Arrived without a purchase order.',
      status: 'archived',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('status')
  })
})

describe('updateDocumentSchema', () => {
  it('allows all fields to be optional', () => {
    expect(updateDocumentSchema.safeParse({}).success).toBe(true)
  })

  it('still validates provided fields', () => {
    const result = updateDocumentSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('title')
  })
})
