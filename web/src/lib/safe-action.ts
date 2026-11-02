import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import { ApiError } from './errors'

const UNEXPECTED_ERROR = 'errors.unexpectedError'

export type ActionServerError = { messageKey: string }

export function handleServerError(
  error: Error,
  { metadata }: { metadata: { errorKey: string } },
): ActionServerError {
  if (error instanceof ApiError) {
    return { messageKey: metadata.errorKey }
  }

  console.error(error)
  return { messageKey: UNEXPECTED_ERROR }
}

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => z.object({ errorKey: z.string() }),
  defaultValidationErrorsShape: 'flattened',
  handleServerError,
})

export function fromFormData<S extends z.ZodType>(schema: S) {
  return z.preprocess(
    (value) => (value instanceof FormData ? Object.fromEntries(value) : value),
    schema,
  )
}
