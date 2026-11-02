'use client'

import { useTranslations } from 'next-intl'
import { useStateAction } from 'next-safe-action/stateful-hooks'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { documentStatuses } from '../schemas'
import type { DocumentFormAction } from '../actions'
import type { Document } from '../types'

interface Props {
  action: DocumentFormAction
  defaultValues?: Partial<Pick<Document, 'title' | 'content' | 'status'>>
  mode: 'create' | 'edit'
}

const messages = (errors?: string[]) => errors?.map((message) => ({ message }))

export function DocumentForm({ action, defaultValues, mode }: Props) {
  const { formAction, result, isPending } = useStateAction(action)
  const t = useTranslations('documents.form')
  const tStatus = useTranslations('documents.status')
  const translate = useTranslations()

  // Base UI renders the raw value in SelectValue unless the labels are given here.
  const statusLabels = Object.fromEntries(
    documentStatuses.map((status) => [status, tStatus(status)]),
  )

  const fieldErrors = result.validationErrors?.fieldErrors

  return (
    <form action={formAction}>
      <FieldGroup>
        {result.serverError && <FieldError>{translate(result.serverError.messageKey)}</FieldError>}

        <Field>
          <FieldLabel htmlFor="title">{t('title')}</FieldLabel>
          <Input id="title" name="title" defaultValue={defaultValues?.title} />
          <FieldError errors={messages(fieldErrors?.title)} />
        </Field>

        <Field>
          <FieldLabel htmlFor="content">{t('content')}</FieldLabel>
          <Textarea
            id="content"
            name="content"
            className="min-h-32"
            defaultValue={defaultValues?.content}
          />
          <FieldError errors={messages(fieldErrors?.content)} />
        </Field>

        <Field>
          <FieldLabel htmlFor="status">{t('status')}</FieldLabel>
          <Select
            name="status"
            items={statusLabels}
            defaultValue={defaultValues?.status ?? 'draft'}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              {documentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {tStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={messages(fieldErrors?.status)} />
        </Field>

        <Button type="submit" disabled={isPending}>
          {isPending ? t('saving') : mode === 'create' ? t('createSubmit') : t('editSubmit')}
        </Button>
      </FieldGroup>
    </form>
  )
}
