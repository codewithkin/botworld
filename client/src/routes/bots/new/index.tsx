import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/bots/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/bots/new/"!</div>
}
