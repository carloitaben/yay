import { Form } from "yay/client"
import { uppercase } from "~/actions"

export default function Page() {
  return (
    <Form action={uppercase}>
      <label className="grid">
        Uppercaseify
        <input name="text" placeholder="Write something" required />
      </label>
    </Form>
  )
}
