import type { NextConfig } from "next"
import { networkInterfaces } from "node:os"

/**
 * Hosts allowed to pull dev resources.
 *
 * Next 16 blocks /_next/* for any origin but the one the server started on, so
 * opening this app on a phone or tablet over the LAN renders the page and then
 * never hydrates it — every control is dead and a tap only draws the browser's
 * own focus ring. It reads as a broken button rather than a blocked request.
 *
 * Addresses are detected rather than listed, so this keeps working on whatever
 * network the machine joins. NEXT_DEV_ORIGINS adds anything unusual. This has
 * no effect on `next build` or `next start`.
 */
function devOrigins(): string[] {
  const own: string[] = []
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      const isV4 = address.family === "IPv4" || (address.family as unknown as number) === 4
      if (isV4 && !address.internal) own.push(address.address)
    }
  }
  return [
    ...(process.env.NEXT_DEV_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
    ...own,
    "192.168.0.*",
    "192.168.1.*",
    "192.168.29.*",
    "10.0.0.*",
    "172.20.10.*",
  ]
}


const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins(),
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
