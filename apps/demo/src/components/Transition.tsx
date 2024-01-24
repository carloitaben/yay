"use client"

import { useOptimistic, useOptimisticTransition } from "yay"
import { uppercase } from "~/actions"

export default function Transition() {
  const [isPending, startTransition] = useOptimisticTransition(uppercase)
  const submission = useOptimistic(uppercase)

  const value = submission.pending
    ? (submission.args[0].get("text")?.toString() || "").toUpperCase()
    : submission.data || ""

  return (
    <div>
      <span>Optimistic value: {value}</span>
      <button
        className=" bg-black text-white rounded px-2 py-1"
        onClick={() =>
          startTransition(async (uppercase) => {
            const formData = new FormData()
            formData.set("text", "transition")
            await uppercase(formData)
          })
        }
        disabled={isPending}
      >
        {isPending ? "pending..." : "call (transition)"}
      </button>
    </div>
  )
}
