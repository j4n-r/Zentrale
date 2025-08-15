import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/network/devices')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/network/devices"!</div>
}
