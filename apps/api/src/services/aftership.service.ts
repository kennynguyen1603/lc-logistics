import { env } from "../config/env"
import { logger } from "../utils/logger"

export interface AfterShipEvent {
  timestamp: Date
  location: string
  description: string
}

export interface AfterShipResult {
  trackingNo: string
  carrier: string
  status: string
  events: AfterShipEvent[]
}

export async function trackShipment(
  trackingNo: string,
  slug?: string
): Promise<AfterShipResult | null> {
  if (!env.AFTERSHIP_API_KEY) {
    logger.warn("AFTERSHIP_API_KEY not set — skipping external lookup")
    return null
  }

  const path = slug
    ? `/trackings/${slug}/${trackingNo}`
    : `/trackings/${trackingNo}`
  const url = `https://api.aftership.com/v4${path}`

  try {
    const response = await fetch(url, {
      headers: {
        "aftership-api-key": env.AFTERSHIP_API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      logger.warn(`AfterShip returned ${response.status} for ${trackingNo}`)
      return null
    }

    const body = (await response.json()) as {
      data?: {
        tracking?: {
          tracking_number: string
          slug?: string
          tag?: string
          checkpoints?: Array<{
            checkpoint_time?: string
            city?: string
            state?: string
            country_iso3?: string
            message?: string
          }>
        }
      }
    }
    const tracking = body?.data?.tracking

    if (!tracking) return null

    return {
      trackingNo: tracking.tracking_number,
      carrier: tracking.slug ?? "unknown",
      status: tracking.tag ?? "Unknown",
      events: (tracking.checkpoints ?? []).map((cp) => ({
        timestamp: new Date(cp.checkpoint_time ?? ""),
        location: [cp.city, cp.state, cp.country_iso3]
          .filter(Boolean)
          .join(", "),
        description: cp.message ?? "",
      })),
    }
  } catch (err) {
    logger.error(`AfterShip fetch failed for ${trackingNo}`, err)
    return null
  }
}
