import { CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { ORDER_STATUS_LABEL, ORDER_STATUS_SEQUENCE, formatDateTime } from "@/lib/utils"
import type { IDelivery, OrderStatus } from "@/types"

interface OrderTimelineProps {
  deliveries: IDelivery[]
  currentStatus: OrderStatus
}

export function OrderTimeline({ deliveries, currentStatus }: OrderTimelineProps) {
  const completedStatuses = new Set(deliveries.map((d) => d.status))
  const deliveryMap = new Map(deliveries.map((d) => [d.status, d]))

  const isTerminal = currentStatus === "RETURNED" || currentStatus === "CANCELLED"
  const displayStatuses: OrderStatus[] = isTerminal
    ? [...ORDER_STATUS_SEQUENCE, currentStatus]
    : ORDER_STATUS_SEQUENCE

  return (
    <ol className="relative border-l border-border ml-3 space-y-1">
      {displayStatuses.map((status, idx) => {
        const delivery = deliveryMap.get(status)
        const isCompleted = completedStatuses.has(status) && status !== currentStatus
        const isCurrent = status === currentStatus
        const isPending = !completedStatuses.has(status) && !isCurrent

        return (
          <li key={status} className="mb-6 ml-6">
            <span
              className={cn(
                "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                isCurrent && "bg-yellow-400",
                isCompleted && "bg-green-500",
                isPending && "bg-muted"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              ) : isCurrent ? (
                <Clock className="h-3.5 w-3.5 text-white" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </span>

            <div className={cn("pt-0.5", isPending && "opacity-40")}>
              <h3 className={cn("text-sm font-semibold", isCurrent && "text-yellow-600 dark:text-yellow-400")}>
                {ORDER_STATUS_LABEL[status]}
                {isCurrent && <span className="ml-2 text-xs font-normal">(Hiện tại)</span>}
              </h3>
              {delivery && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateTime(delivery.createdAt)}
                  {delivery.location && ` · ${delivery.location}`}
                </p>
              )}
              {delivery?.note && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">{delivery.note}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
