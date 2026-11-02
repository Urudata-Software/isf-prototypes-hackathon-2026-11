import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError } from './errors'
import { fromFormData, handleServerError } from './safe-action'

describe('handleServerError', () => {
  it('reports the message the action declared when the API rejects it', () => {
    const result = handleServerError(new ApiError(500, 'boom'), {
      metadata: { errorKey: 'documents.form.failedToCreate' },
    })

    expect(result).toEqual({ messageKey: 'documents.form.failedToCreate' })
  })

  it('falls back to a generic message for anything else, and logs it', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const bug = new TypeError('undefined is not a function')

    const result = handleServerError(bug, { metadata: { errorKey: 'documents.form.failedToSave' } })

    expect(result).toEqual({ messageKey: 'errors.unexpectedError' })
    expect(consoleError).toHaveBeenCalledWith(bug)
    consoleError.mockRestore()
  })
})

describe('fromFormData', () => {
  const schema = fromFormData(z.object({ title: z.string().min(1, 'Title is required') }))

  it('parses the FormData a form action receives', () => {
    const formData = new FormData()
    formData.set('title', 'Delivery note')

    expect(schema.parse(formData)).toEqual({ title: 'Delivery note' })
  })

  it('still reports field errors by name', () => {
    const formData = new FormData()
    formData.set('title', '')

    const result = schema.safeParse(formData)

    expect(result.success).toBe(false)
    expect(z.flattenError(result.error!).fieldErrors.title).toEqual(['Title is required'])
  })
})
