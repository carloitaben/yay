"use client"

import type { ComponentProps, ElementRef, ForwardedRef } from "react"
import {
  forwardRef,
  useEffect,
  useState,
  useOptimistic as useReactOptimistic,
  startTransition,
  useTransition,
  useCallback,
} from "react"
import { useFormState, useFormStatus } from "react-dom"
import type {
  Action,
  FormAction,
  ActionData,
  ActionReducer,
  ActionResult,
} from "./lib"
import { subscribe, upsert, get, initialStatus } from "./lib"

export type OptimisticFormProps<Action extends FormAction> = Omit<
  ComponentProps<"form">,
  "action"
> & {
  action: Action
}

function Status({
  action,
  data,
}: {
  action: FormAction
  data: ReturnType<Action> | null
}) {
  const status = useFormStatus()

  useEffect(() => {
    if (status.pending) {
      // `status.data` receives the latest formData.
      // We update the args only when status is pending
      // to get a fresh optimistic value.
      return upsert(action, () => ({
        pending: true,
        args: [status.data],
        data: null,
      }))
    }

    upsert(action, (current) => {
      if (!current.pending) return
      return {
        pending: false,
        args: null,
        data,
      }
    })
  }, [action, data, status])

  return null
}

export const OptimisticForm = forwardRef(function OptimisticForm<
  Action extends FormAction,
>(
  { action, children, ...props }: OptimisticFormProps<Action>,
  ref: ForwardedRef<ElementRef<"form">>,
) {
  const [data, formAction] = useFormState<ReturnType<Action> | null, FormData>(
    // At the moment, `formStateProxy` is called after every action invocation
    // in a sequential manner (ugh). We update the previous value and args
    // when transitioning to pending state
    async function formStateProxy(_, formData) {
      upsert(action, (current) => {
        if (current.pending) return
        return {
          pending: true,
          args: [formData] as Parameters<Action>,
          data: null,
        }
      })

      return action(formData)
    },
    null,
  )

  return (
    <form {...props} ref={ref} action={formAction}>
      {children}
      <Status action={action} data={data} />
    </form>
  )
})

export function useOptimistic<T extends Action>(action: T): ActionData<T>

export function useOptimistic<T extends Action>(
  action: T,
  reducer: ActionReducer<T>,
): ActionResult<T> | null

export function useOptimistic<T extends Action>(
  action: T,
  reducer?: ActionReducer<T>,
) {
  const [state, setState] = useState<null | ActionResult<T> | ActionData<T>>(
    reducer ? null : initialStatus,
  )

  const [optimistic, setOptimistic] = useReactOptimistic<
    null | ActionResult<T> | ActionData<T>
  >(state)

  useEffect(() => {
    function update() {
      const submission = get(action)

      if (submission.pending) {
        return setOptimistic(reducer ? reducer(...submission.args) : submission)
      }

      const result = reducer ? submission.data : submission

      startTransition(() => setOptimistic(result))
      return setState(result)
    }

    return subscribe(action, update)
  }, [action, reducer, setOptimistic])

  return optimistic
}

export function useOptimisticTransition<T extends Action>(action: T) {
  const [isPending, startTransition] = useTransition()

  const actionProxy = useCallback(
    async (...args: Parameters<T>) => {
      upsert(action, () => ({
        pending: true,
        data: null,
        args,
      }))

      const data = await action(...args)

      upsert(action, () => ({
        pending: false,
        data,
        args: null,
      }))

      return data
    },
    [action],
  )

  const call = useCallback(
    (callback: (action: T) => void) => {
      startTransition(async () => {
        if (isPending) return
        await callback(actionProxy)
      })
    },
    [actionProxy, isPending],
  )

  return [isPending, call] as const
}
