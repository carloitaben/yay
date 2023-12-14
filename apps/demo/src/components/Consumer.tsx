"use client"

import { useOptimistic } from "yay/client"
import { uppercase } from "~/actions"

export default function Consumer() {
  const state = useOptimistic(uppercase, (_, formData) =>
    (formData?.get("text")?.toString() || "").toUpperCase(),
  )

  return <div>Optimistic value: {state}</div>
}
