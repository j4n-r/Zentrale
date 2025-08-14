import { deviceCollection } from "@/collections/network";
import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/network")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: devices } = useLiveQuery((q) =>
    q.from({ devices: deviceCollection }).select(({ devices }) => ({
      ...devices,
    })),
  );

  return (
    <>
      <div>/network</div>
      <ul>
        {devices.map((device) => (
          <div>{device.data}</div>
        ))}
      </ul>
    </>
  );
}
