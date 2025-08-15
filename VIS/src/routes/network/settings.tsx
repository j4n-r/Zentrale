import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/network/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/network/settings"!</div>
}
