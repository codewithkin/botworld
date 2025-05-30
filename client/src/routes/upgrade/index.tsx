import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upgrade/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/upgrade/"!</div>;
}
