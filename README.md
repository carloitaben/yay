# yay

Optimistic updates for RSC

## Installation

```shell
npm install yay@npm:@carloitaben/yay
```

## Usage

```tsx
// actions.ts

"use server"

export async function uppercaseify(formData: FormData) {
  return formData.get("text").toString()?.toUppercase()
}
```

```tsx
import { OptimisticForm } from "yay"
import { uppercaseify } from "./actions"

function Component() {
  return (
    <OptimisticForm action={uppercaseify}>
      <input name="text" />
    </OptimisticForm>
  )
}
```

Then, in your consumer:

```tsx
import { useOptimistic } from "yay"
import { uppercaseify } from "./actions"

function Consumer() {
  const submission = useOptimistic(uppercaseify)

  const value = submission.pending
    ? (submission.args[0].get("text")?.toString() || "").toUpperCase()
    : submission.data || ""

  return <div>{value}</div>
}
```

You can also pass a reducer to `useOptimistic` to derive the value:

```tsx
import { useOptimistic } from "yay"
import { uppercaseify } from "./actions"

function Consumer() {
  const value = useOptimistic(uppercaseify, (formData) => 
    (formData.get("text")?.toString() || "").toUpperCase()
  )

  return <div>{value}</div>
}
```

## Optimistic transitions

```tsx
"use client"

import { useOptimisticTransition } from "yay"
import { uppercase } from "~/actions"

export default function Component() {
  const [isPending, startTransition] = useOptimisticTransition(uppercase)

  return (
    <button
      onClick={() =>
        startTransition(async (action) => {
          const formData = new FormData()
          formData.set("text", "transition")
          await action(formData)
        })
      }
      disabled={isPending}
    >
      {isPending ? "pending..." : "Call transition"}
    </button>
  )
}
```

## Integrating with third-party form libraries

### `@tanstack/react-form`

TODO

### `react-hook-form`

TODO

### `formik`

TODO

## License

[MIT](LICENSE)
