import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/auth/__layout')({
  component: RouteComponent,
})

function RouteComponent({ children }: { children: ReactNode }) {
  return (
    <>{children}</>
  )
}
