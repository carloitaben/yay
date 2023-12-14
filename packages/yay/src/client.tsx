"use client"

import type { ComponentProps, ForwardedRef } from "react"
import {
  forwardRef,
  useEffect,
  useState,
  useOptimistic as useReactOptimistic,
} from "react"
import { useFormState, useFormStatus } from "react-dom"
import type { Action, ActionResult, FormAction } from "./lib"
import { get, store, subscribe, upsert } from "./lib"

export type FormProps<Action extends FormAction> = Omit<
  ComponentProps<"form">,
  "action"
> & {
  action: Action
}

function Status({ action }: { action: FormAction }) {
  const status = useFormStatus()

  useEffect(() => {
    if (status.pending) {
      upsert(action, (current) => ({
        state: "pending",
        args: [status.data],
        data: null,
        prev: current.prev,
      }))
    }
  }, [action, status])

  return null
}

export const Form = forwardRef(function Form<Action extends FormAction>(
  { action, children, ...props }: FormProps<Action>,
  ref: ForwardedRef<HTMLFormElement>,
) {
  const [data, formAction] = useFormState<ReturnType<Action> | null, FormData>(
    (_, formData) => action(formData),
    null,
  )

  useEffect(() => {
    upsert(action, (current) => {
      if (current.state !== "pending") {
        return current
      }

      return {
        state: "resolved",
        args: current.args,
        data: data,
        prev: current.prev,
      }
    })
  }, [action, data])

  return (
    <form {...props} ref={ref} action={formAction}>
      {children}
      <Status action={action} />
    </form>
  )
})

export function useOptimisticStore() {
  const [state, setState] = useState(store)

  useEffect(() => {
    function update() {
      setState(new Map(store))
    }

    return subscribe(update)
  }, [])

  return state
}

/**
 * hacer reducer opcional y si no hay reducer devolver payload de la store a pelo
 * hacer action opcional y si no hay action devolver store a pelo
 */
export function useOptimistic<T extends Action, R>(
  action: T,
  reducer: (previous: ActionResult<T> | null, ...args: Parameters<T>) => R,
) {
  const [state, setState] = useState<R | null>(null)
  const [optimistic, setOptimistic] = useReactOptimistic<R | null>(state)

  useEffect(() => {
    function update() {
      const data = get(action)

      switch (data.state) {
        case "pending":
          return setOptimistic(reducer(data.prev, ...data.args))
        case "resolved":
          return setState(reducer(data.prev, ...data.args))
      }
    }

    return subscribe(update)
  }, [action, reducer, setOptimistic])

  return optimistic || state
}
