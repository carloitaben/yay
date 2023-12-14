export type ServerAction = (...args: any[]) => Promise<any>

export type FormAction = (formData: FormData) => Promise<any>

export type Action = ServerAction | FormAction

export type ActionResult<T extends Action> = Awaited<ReturnType<T>>

type ActionDataInitial = {
  state: "initial"
  args: null
  prev: null
  data: null
}

type ActionDataPending<T extends Action> = {
  state: "pending"
  args: Parameters<T>
  prev: ActionResult<T> | null
  data: null
}

type ActionDataResolved<T extends Action> = {
  state: "resolved"
  args: Parameters<T>
  prev: ActionResult<T> | null
  data: ActionResult<T> | null
}

export type ActionData<T extends FormAction> =
  | ActionDataInitial
  | ActionDataPending<T>
  | ActionDataResolved<T>

export type ActionReducer<T extends Action> = (
  prev: ActionData<T>["prev"],
  ...args: Parameters<T>
) => ActionResult<T>

export const event = new CustomEvent("yay:notify")

export const store = new Map<string, ActionData<any>>()

export const initialStatus: ActionDataInitial = {
  state: "initial",
  args: null,
  prev: null,
  data: null,
}

export function upsert<T extends Action>(
  action: T,
  reducer: (current: ActionData<T>) => ActionData<T>,
) {
  store.set(action.name, reducer(get(action)))
  window.dispatchEvent(event)
}

export function get<T extends Action>(action: T): ActionData<T> {
  return store.get(action.name) || initialStatus
}

export function subscribe(callback: (...args: any[]) => any) {
  window.addEventListener(event.type, callback)
  return () => window.removeEventListener(event.type, callback)
}
