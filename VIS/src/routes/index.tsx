import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
  loader: () => {
    redirect({
      to: "/system",
      throw: true,
    });
  },
});

function App() {
  return <></>;
}
