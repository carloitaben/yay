import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export default function Boundary({ children }: Props) {
  return (
    <div className="m-4 border rounded border-black/10 bg-black/10">
      <div className="p-4">Nested component</div>
      <div className="p-4">{children}</div>
    </div>
  )
}
