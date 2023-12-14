"use server"

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function uppercase(formData: FormData) {
  await wait(Math.random() * 3000)
  return (formData.get("text")?.toString() || "").toUpperCase()
}
