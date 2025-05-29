import { createFileRoute } from '@tanstack/react-router'
import ClientComponent from './components/ClientComponent'

export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (<ClientComponent />)
}
