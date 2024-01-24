"use server"

export async function uppercase(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000))
  return (formData.get("text")?.toString() || "").toUpperCase()
}
