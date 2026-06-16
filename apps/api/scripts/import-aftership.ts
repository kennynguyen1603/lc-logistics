/**
 * One-time AfterShip data import script.
 *
 * Usage:
 *   npx ts-node scripts/import-aftership.ts [tracking-file.json]
 *
 * The tracking file is a JSON array of objects:
 *   [{ "trackingNo": "...", "slug": "ghn" }, ...]
 *
 * If no file is provided, the script reads all shipmentNo values from the DB.
 *
 * Each successful lookup is saved as Delivery records in the DB.
 * Run this script once before the demo. After that, the backend serves from DB only.
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import path from "path"

const prisma = new PrismaClient()

const AFTERSHIP_API_KEY = process.env["AFTERSHIP_API_KEY"] ?? ""
const AFTERSHIP_BASE = "https://api.aftership.com/v4"

if (!AFTERSHIP_API_KEY) {
  console.error("❌ AFTERSHIP_API_KEY not set in environment")
  process.exit(1)
}

interface TrackingInput { trackingNo: string; slug?: string }

interface CheckpointRaw {
  checkpoint_time: string
  message: string
  city?: string
  state?: string
  country_iso3?: string
}

async function fetchTracking(input: TrackingInput): Promise<{ status: string; events: { timestamp: Date; location: string; message: string }[] } | null> {
  const url = input.slug
    ? `${AFTERSHIP_BASE}/trackings/${input.slug}/${input.trackingNo}`
    : `${AFTERSHIP_BASE}/trackings/${input.trackingNo}`

  const res = await fetch(url, {
    headers: { "aftership-api-key": AFTERSHIP_API_KEY, "Content-Type": "application/json" },
  })

  if (!res.ok) {
    console.warn(`  ⚠️  AfterShip ${res.status} for ${input.trackingNo}`)
    return null
  }

  const body = await res.json() as any
  const tracking = body?.data?.tracking
  if (!tracking) return null

  const events = (tracking.checkpoints ?? []).map((cp: CheckpointRaw) => ({
    timestamp: new Date(cp.checkpoint_time),
    location: [cp.city, cp.state, cp.country_iso3].filter(Boolean).join(", ") || "N/A",
    message: cp.message ?? "",
  }))

  return { status: tracking.tag ?? "Unknown", events }
}

async function saveToDb(shipmentNo: string, result: NonNullable<Awaited<ReturnType<typeof fetchTracking>>>): Promise<number> {
  const shipment = await prisma.shipment.findUnique({ where: { shipmentNo }, include: { order: true } })
  if (!shipment) {
    console.warn(`  ⚠️  Shipment ${shipmentNo} not found in DB`)
    return 0
  }

  let saved = 0
  for (const event of result.events) {
    // Map AfterShip status tag to our OrderStatus
    const status = mapStatus(result.status)
    await prisma.delivery.upsert({
      where: {
        // Use compound unique if needed — here we use create only
        id: `aftership-${shipmentNo}-${event.timestamp.getTime()}`,
      },
      update: {},
      create: {
        id: `aftership-${shipmentNo}-${event.timestamp.getTime()}`,
        orderId: shipment.orderId,
        status,
        location: event.location,
        note: event.message,
        updatedBy: "AfterShip",
        createdAt: event.timestamp,
      },
    })
    saved++
  }
  return saved
}

function mapStatus(tag: string): "PENDING" | "CONFIRMED" | "PACKED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED" | "CANCELLED" {
  const map: Record<string, "PENDING" | "CONFIRMED" | "PACKED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED" | "CANCELLED"> = {
    Pending: "PENDING",
    InfoReceived: "CONFIRMED",
    InTransit: "IN_TRANSIT",
    OutForDelivery: "OUT_FOR_DELIVERY",
    AttemptFail: "OUT_FOR_DELIVERY",
    Delivered: "DELIVERED",
    Exception: "RETURNED",
    Expired: "RETURNED",
  }
  return map[tag] ?? "IN_TRANSIT"
}

async function main() {
  const filePath = process.argv[2]
  let inputs: TrackingInput[] = []

  if (filePath) {
    const raw = readFileSync(path.resolve(filePath), "utf-8")
    inputs = JSON.parse(raw) as TrackingInput[]
    console.log(`📂 Loaded ${inputs.length} tracking numbers from ${filePath}`)
  } else {
    // Read all shipments from DB
    const shipments = await prisma.shipment.findMany({ select: { shipmentNo: true } })
    inputs = shipments.map((s) => ({ trackingNo: s.shipmentNo }))
    console.log(`📦 Found ${inputs.length} shipments in DB to track`)
  }

  if (inputs.length > 100) {
    console.warn(`⚠️  You have ${inputs.length} tracking numbers but AfterShip free tier is 100 requests. Only first 100 will be processed.`)
    inputs = inputs.slice(0, 100)
  }

  let success = 0
  let failed = 0
  let totalEvents = 0

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]!
    process.stdout.write(`[${i + 1}/${inputs.length}] ${input.trackingNo} ... `)

    try {
      const result = await fetchTracking(input)
      if (!result) {
        console.log("not found")
        failed++
        continue
      }
      const saved = await saveToDb(input.trackingNo, result)
      console.log(`✅ ${saved} events saved`)
      totalEvents += saved
      success++
    } catch (err) {
      console.log(`❌ Error: ${(err as Error).message}`)
      failed++
    }

    // Respectful delay to avoid hitting rate limits
    if (i < inputs.length - 1) await new Promise((r) => setTimeout(r, 300))
  }

  console.log("\n── Summary ──────────────────────────────")
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed:  ${failed}`)
  console.log(`📋 Total events imported: ${totalEvents}`)
  console.log("\nAfterShip data import complete. You can now remove AFTERSHIP_API_KEY from .env.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
