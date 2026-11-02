# Actions and forms

Every mutation is a server action in `web/src/modules/<plural>/actions.ts`. The
worked example is `modules/documents/actions.ts` — read it alongside this.

## The client does the boilerplate

`web/src/lib/safe-action.ts` builds one `actionClient` for the whole app. Never
hand-roll parsing, try/catch and error shaping per action.

```ts
export const createDocumentAction = actionClient
  .metadata({ errorKey: 'documents.form.failedToCreate' })
  .inputSchema(documentInput)
  .stateAction(async ({ parsedInput }) => {
    await createDocument(parsedInput)

    revalidatePath('/documents')
    redirect('/documents')
  })
```

The action body is the happy path only.

`handleServerError` turns an `ApiError` into the `errorKey` the action declared in
`.metadata()`, and anything else into `errors.unexpectedError` after logging it. A
bug reaches the logs, never the user. The key comes from metadata rather than from
the error because an `ApiError` cannot say whether a create or an update failed.

`redirect()` and `notFound()` still work inside an action: Next signals them by
throwing, and the library re-throws navigation errors rather than reporting them.

`.inputSchema()`, not the deprecated `.schema()`. `pnpm lint` catches that.

## FormData

The Zod schemas describe the parsed object, so `fromFormData()` in `lib/safe-action.ts`
adapts what React hands a form action. Pass a schema through it when wiring an action.

## Binding an id

`bindArgsSchemas([z.string()])` plus `.bind(null, id)` at the call site. No wrapper
closure, and the bound id is validated like any other input.

```tsx
<DocumentForm action={updateDocumentAction.bind(null, id)} defaultValues={document} mode="edit" />
```

## Actions with no user input

Delete, or any one-click operation, stays a plain server function — nothing to
validate and no message to show, so a failure belongs in the error boundary.

```tsx
<form action={deleteDocumentAction.bind(null, document.id)}>
  <Button type="submit" variant="destructive" size="sm">{t('table.delete')}</Button>
</form>
```

Leave `FormData` off the signature when the action does not use it. React passes it,
extra arguments are dropped, and lint stays clean.

## The client form

`useStateAction` is next-safe-action's `useActionState`. It returns a `formAction`,
so the form still submits without JavaScript. The form takes the action as a prop,
which is what lets one component serve create and edit.

```tsx
const { formAction, result, isPending } = useStateAction(action)
const fieldErrors = result.validationErrors?.fieldErrors
```

`result.serverError` carries a message **key**, not a message. The server never
formats user-facing text, so every string stays in `messages/`.
