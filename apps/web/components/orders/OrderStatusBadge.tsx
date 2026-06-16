import { Badge } from "@workspace/ui/components/badge"
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/utils"
import type { OrderStatus } from "@/types"
import { cn } from "@workspace/ui/lib/utils"

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ORDER_STATUS_COLOR[status]
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
