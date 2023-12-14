import type { Metadata } from "next"
import Boundary from "~/components/Boundary"
import Consumer from "~/components/Consumer"
import "./globals.css"

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Boundary>
          <Consumer />
          <Boundary>
            <Boundary>
              <Boundary>{children}</Boundary>
            </Boundary>
          </Boundary>
        </Boundary>
      </body>
    </html>
  )
}
