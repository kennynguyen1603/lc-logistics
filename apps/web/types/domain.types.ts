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

export type MovementType = "IN" | "OUT" | "ADJUSTMENT"

export interface IUser {
  id: string
  email: string
  name: string
  role: Role
  phone?: string
  createdAt: Date
}

export interface IProduct {
  id: string
  sku: string
  name: string
  category: string
  unit: string
  weight?: number
  lowThreshold: number
}

export interface IWarehouse {
  id: string
  code: string
  name: string
  city: string
  address: string
}

export interface IOrderItem {
  id: string
  orderId: string
  productId: string
  product: IProduct
  quantity: number
  unitPrice: number
}

export interface IDelivery {
  id: string
  orderId: string
  status: OrderStatus
  location?: string
  note?: string
  updatedBy: string
  updatedByUser?: IUser
  createdAt: Date
}

export interface ITransportLeg {
  id: string
  shipmentId: string
  fromWarehouseId: string
  fromWarehouse?: IWarehouse
  toWarehouseId: string
  toWarehouse?: IWarehouse
  departedAt?: Date
  arrivedAt?: Date
  vehicleNo?: string
}

export interface IShipment {
  id: string
  orderId: string
  trackingCode: string
  carrier: string
  legs: ITransportLeg[]
  estimatedDelivery?: Date
}

export interface IOrder {
  id: string
  trackingNo: string
  status: OrderStatus
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress: string
  city: string
  totalAmount: number
  note?: string
  items: IOrderItem[]
  deliveries: IDelivery[]
  shipments: IShipment[]
  createdAt: Date
  updatedAt: Date
}

export interface IInventory {
  id: string
  productId: string
  product: IProduct
  warehouseId: string
  warehouse: IWarehouse
  stock: number
  reserved: number
  lowThreshold: number
}

export interface IStockMovement {
  id: string
  productId: string
  product: IProduct
  warehouseId: string
  warehouse: IWarehouse
  type: MovementType
  quantity: number
  reason: string
  performedBy: string
  performedByUser?: IUser
  createdAt: Date
}

export interface ILowStockAlert {
  product: IProduct
  warehouse: IWarehouse
  stock: number
  lowThreshold: number
}
