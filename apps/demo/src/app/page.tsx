import { OptimisticForm } from "yay"
import { uppercase } from "~/actions"

export default function Page() {
  return (
    <OptimisticForm action={uppercase}>
      <label className="grid">
        Uppercaseify
        <input name="text" placeholder="Write something" required />
      </label>
    </OptimisticForm>
  )
}
