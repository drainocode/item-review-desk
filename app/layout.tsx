import type {ReactNode} from 'react'
import './globals.css'

export const metadata = {title: 'Item Review Desk', description: 'Certification exam items that move from draft to live through a logged review workflow.'}

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
