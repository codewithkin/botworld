import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/__layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/__layout"!</div>
}
