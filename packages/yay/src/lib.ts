export type ServerAction = (...args: any[]) => Promise<any>

export type FormAction = (formData: FormData) => Promise<any>

export type Action = ServerAction | FormAction

export type ActionResult<T extends Action> = Awaited<ReturnType<T>>

type ActionDataPending<T extends Action> = {
  pending: true
  args: Parameters<T>
  data: null
}

type ActionDataNotPending<T extends Action> = {
  pending: false
  args: null
  data: ActionResult<T> | null
}

export type ActionData<T extends FormAction> =
  | ActionDataPending<T>
  | ActionDataNotPending<T>

export type ActionReducer<T extends Action> = (
  ...args: Parameters<T>
) => ActionResult<Action>

export const event = new CustomEvent("yay:notify")


const eventTarget = new EventTarget()

export function subscribe(action: Action, callback: VoidFunction) {
  const key = `${action.name}:update`
  eventTarget.addEventListener(key, callback)
  return function unsubscribe() {
    eventTarget.removeEventListener(key, callback)
  }
}

function update(action: Action) {
  eventTarget.dispatchEvent(new CustomEvent(`${action.name}:update`))
}

export const store = new Map<string, ActionData<any>>()

export const initialStatus: ActionDataNotPending<any> = {
  pending: false,
  args: null,
  data: null,
}

export function upsert<T extends Action>(
  action: T,
  reducer: (current: ActionData<T>) => ActionData<T> | void,
) {
  const value = reducer(get(action))
  if (typeof value !== "undefined") {
    store.set(action.name, value)
    update(action)
  }
}

export function get<T extends Action>(action: T): ActionData<T> {
  return store.get(action.name) || initialStatus
}
