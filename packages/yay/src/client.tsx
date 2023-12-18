"use client"

import type { ComponentProps, ElementRef, ForwardedRef } from "react"
import {
  forwardRef,
  useEffect,
  useState,
  useOptimistic as useReactOptimistic,
  startTransition,
} from "react"
import { useFormState, useFormStatus } from "react-dom"
import type { Action, ActionReducer, FormAction } from "./lib"
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
    // `status.data` receives the latest formData.
    // We update the args only when status is pending
    // to get a fresh optimistic value.
    if (!status.pending) return

    upsert(action, (current) => ({
      state: "pending",
      args: [status.data],
      data: current.data,
      prev: current.prev,
    }))
  }, [action, status])

  return null
}

export const Form = forwardRef(function Form<Action extends FormAction>(
  { action, children, ...props }: FormProps<Action>,
  ref: ForwardedRef<ElementRef<"form">>,
) {
  const [data, formAction] = useFormState<ReturnType<Action> | null, FormData>(
    // At the moment, `formStateProxy` is called after every action invocation
    // in a sequential manner (ugh). We update the previous value and args
    // when transitioning to pending state
    async function formStateProxy(prev, formData) {
      upsert(action, (current) => {
        if (current.state === "pending") return
        return {
          state: "pending",
          args: [formData] as Parameters<Action>,
          data: null,
          prev: prev,
        }
      })

      return action(formData)
    },
    null,
  )

  useEffect(() => {
    // `data` changes when the action transition is finished,
    // so we resolve any pending state here.
    upsert(action, (current) => {
      if (current.state !== "pending") return
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

  return Array.from(state.values())
}

export function useOptimistic<T extends Action, R>(
  action: T,
  reducer: ActionReducer<T, R>,
) {
  const [state, setState] = useState<R | null>(null)
  const [optimistic, setOptimistic] = useReactOptimistic<R | null>(state)

  useEffect(() => {
    function update() {
      const data = get(action)
      switch (data.state) {
        case "initial":
          return setState(null)
        case "pending":
          return setOptimistic(reducer(data.prev, ...data.args))
        case "resolved":
          const result = reducer(data.prev, ...data.args)
          startTransition(() => setOptimistic(result))
          return setState(result)
      }
    }

    return subscribe(update)
  }, [action, reducer, setOptimistic])

  return optimistic
}
