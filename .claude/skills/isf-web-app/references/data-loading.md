# Data Loading & Loading States

## Two mechanisms, two purposes

### `loading.tsx` — route-level transitions

Place a `loading.tsx` next to a page to show a skeleton during full route navigations (clicking a link, browser back/forward). Next.js wraps the page in a Suspense boundary automatically.

```
app/(protected)/products/
  page.tsx
  loading.tsx       ← shown while the entire route loads
```

Use it when the whole page is loading (no partial content to show yet). Keep the layout identical to the real page so there's no layout shift.

### `<Suspense>` — streaming within a page

Wrap an async sub-component to stream it in while the rest of the page renders immediately.

```tsx
// page.tsx (synchronous shell — renders instantly)
export default async function ProductsPage() {
  const t = await getTranslations('products')
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <Link href="/products/new" ...>New Product</Link>
      </div>
      <Suspense fallback={<ProductTableSkeleton />}>
        <ProductList />        {/* async — streams in when data is ready */}
      </Suspense>
    </div>
  )
}

// Async sub-component (fetches data)
async function ProductList() {
  const { items, totalCount } = await getProducts()
  const t = await getTranslations('products')
  return (
    <>
      <p className="text-sm text-muted-foreground">{t('count', { count: totalCount })}</p>
      <ProductTable products={items} />
    </>
  )
}
```

The header and "New Product" button appear immediately. The table streams in when the fetch resolves.

## When to use each

| Scenario | Mechanism |
|---|---|
| Navigating to a new route | `loading.tsx` |
| Part of a page fetches data | `<Suspense>` |
| Multiple independent data fetches on one page | Multiple `<Suspense>` boundaries |
| Form page (single fetch, simple) | `loading.tsx` is sufficient |
| Edit page | `loading.tsx` — await the entity fetch before rendering the form |

## Skeleton components

Skeletons mirror the shape of the real content. Keep them co-located with the component they stand in for:

```
modules/products/components/
  ProductTable.tsx
  ProductTableSkeleton.tsx    ← reused in both Suspense fallback and loading.tsx
```

A `loading.tsx` may inline its own skeleton or import a shared one — use shared skeletons when `loading.tsx` and a `<Suspense>` fallback need to look the same.

Skeleton components use shadcn's `Skeleton` component:

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ProductTableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
```

## Parallel data fetching

When a page needs multiple independent fetches, fan them out in parallel rather than waterfalling:

```tsx
// Bad — sequential, 2× latency
async function DocumentEditPage({ params }) {
  const { id } = await params
  const document = await getDocumentById(id)
  const roles = await getRoles()         // waits for user fetch to complete first
  ...
}

// Good — parallel
async function DocumentEditPage({ params }) {
  const { id } = await params
  const [document, templates] = await Promise.all([getDocumentById(id), getTemplates()])
  ...
}
```

Or split into separate `<Suspense>` boundaries so each section streams independently.

## Error handling with Suspense

`error.tsx` catches errors thrown by async components inside Suspense. The existing `(protected)/error.tsx` covers all protected routes. Add a local `error.tsx` next to a page only when you need custom error UI for that specific route.

Errors thrown by Next.js internals (`redirect()`, `notFound()`) are not caught by `error.tsx` — they are handled by the framework directly. The pattern `catch (error) { if (error instanceof ApiError) ...; throw error }` in Server Actions ensures these propagate correctly through the call stack.

## Why the page shell must be synchronous

The outer `export default async function ProductsPage()` must not `await` any data fetches — it only reads translations (which are fast, in-memory from `next-intl`) and returns the JSX shell. All data fetching happens in the `ProductList` async sub-component inside `<Suspense>`.

If the page itself were to `await getProducts()`, the header and button would also be blocked until data arrived, defeating the purpose of streaming.
