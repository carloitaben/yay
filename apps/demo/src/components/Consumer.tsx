"use client"

import { useOptimistic } from "yay"
import { uppercase } from "~/actions"

export default function Consumer() {
  const value = useOptimistic(uppercase, (formData) =>
    (formData.get("text")?.toString() || "").toUpperCase(),
  )

  return <div>Optimistic value: {value || ""}</div>
}
