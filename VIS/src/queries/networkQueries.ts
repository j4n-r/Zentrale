import { env } from "@/env";
import z from "zod";

let API_URL = env.VITE_API_URL;

export const networkDeviceSchema = z.object({
  data: z.number(),
});

export type NetworkDevice = z.infer<typeof networkDeviceSchema>;

export const networkDevicesSchema = z.array(networkDeviceSchema);
export type NetworkDevices = z.infer<typeof networkDevicesSchema>;

export async function getNetworkDevices(): Promise<NetworkDevices> {
  const res = await fetch(`${API_URL}/api/v1/network/devices`);
  return res.json();
}
