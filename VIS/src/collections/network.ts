import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
  getNetworkDevices,
  networkDevicesSchema,
} from "@/queries/networkQueries";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const deviceCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["todoItems"],
    queryFn: getNetworkDevices,
    queryClient,
    getKey: (device) => device.data,
    schema: networkDevicesSchema,
  }),
);
