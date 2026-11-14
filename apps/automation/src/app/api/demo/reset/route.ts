import { NextResponse } from "next/server"
import { db } from "@workspace/db/client"
import { isDemo } from "@workspace/db/demo-mode"
import { seedDemo } from "@workspace/db/demo-seed"

/**
 * GET /api/demo/reset — wipe the demo database and lay the fictional world
 * back down, shifted to today. Vercel Cron calls it nightly (vercel.json).
 *
 * Only in demo mode (DEMO_MODE=1), and only with the cron secret: Vercel sends
 * "Authorization: Bearer $CRON_SECRET" on its own when CRON_SECRET is set.
 * Anywhere else this route does not exist.
 */

// A full reseed is a few thousand rows; give it room.
export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  if (!isDemo()) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const started = Date.now()
  const counts = await seedDemo(db)
  return NextResponse.json({ ok: true, seconds: Math.round((Date.now() - started) / 100) / 10, counts })
}
