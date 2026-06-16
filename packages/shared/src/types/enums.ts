export type Role = "CUSTOMER" | "STAFF" | "ADMIN"

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED"

export type WarehouseType = "GENERAL" | "BONDED" | "CFS" | "ICD" | "COLD_STORAGE"

export type MovementType = "INBOUND" | "OUTBOUND" | "ADJUSTMENT" | "TRANSFER" | "RETURN"

export type ShippingMode = "ROAD" | "RAIL" | "SEA" | "AIR" | "MULTIMODAL"

export type CarrierType = "ROAD" | "RAIL" | "SEA" | "AIR" | "INLAND_WATERWAY"

export type LegStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED"
