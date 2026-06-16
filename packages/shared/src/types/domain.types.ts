import type {
  CarrierType,
  LegStatus,
  MovementType,
  OrderStatus,
  Role,
  ShippingMode,
  WarehouseType,
} from "./enums.js"

export interface IUser {
  id: string
  email: string
  fullName: string
  role: Role
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface IAddress {
  id: string
  customerId: string
  line1: string
  ward?: string
  district: string
  city: string
  country: string
  postalCode?: string
  isDefault: boolean
}

export interface ICustomer {
  id: string
  fullName: string
  email: string
  phone: string
  addresses?: IAddress[]
  createdAt: string
}

export interface ICategory {
  id: string
  name: string
  parentId?: string
  children?: ICategory[]
}

export interface IProduct {
  id: string
  sku: string
  name: string
  description?: string
  category: {
    id: string
    name: string
  }
  unitPrice: number
  unit: string
  weight?: number
  hsCode?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface IWarehouse {
  id: string
  code: string
  name: string
  address: string
  city: string
  type: WarehouseType
  createdAt: string
}

export interface IInventory {
  id: string
  productId: string
  product: {
    id: string
    sku: string
    name: string
    unit: string
  }
  warehouseId: string
  warehouse: {
    id: string
    code: string
    name: string
    city: string
  }
  stock: number
  reserved: number
  available: number
  lowThreshold: number
  updatedAt: string
}

export interface IStockMovement {
  id: string
  inventoryId: string
  product: {
    id: string
    sku: string
    name: string
  }
  warehouse: {
    id: string
    code: string
    name: string
  }
  type: MovementType
  quantity: number
  reason: string
  referenceNo?: string
  performedBy?: {
    id: string
    fullName: string
  }
  createdAt: string
}

export interface ICarrier {
  id: string
  code: string
  name: string
  type: CarrierType
  contact?: string
}

export interface ITransportLeg {
  id: string
  shipmentId: string
  sequence: number
  mode: ShippingMode
  fromPoint: string
  toPoint: string
  carrier?: string
  startTime?: string
  endTime?: string
  status: LegStatus
}

export interface IShipment {
  id: string
  orderId: string
  carrier: {
    id: string
    code: string
    name: string
    type: CarrierType
  }
  shipmentNo: string
  mode: ShippingMode
  origin: string
  destination: string
  etaDate?: string
  actualDate?: string
  cost?: number
  legs: ITransportLeg[]
  createdAt: string
}

export interface IDelivery {
  id: string
  orderId: string
  status: OrderStatus
  location?: string
  note?: string
  updatedBy?: string
  createdAt: string
}

export interface IOrderItem {
  id: string
  orderId: string
  productId: string
  product: {
    id: string
    sku: string
    name: string
    unit: string
    hsCode?: string
  }
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface IOrder {
  id: string
  trackingNo: string
  customer: {
    id: string
    fullName: string
    phone: string
    email: string
  }
  createdBy: {
    id: string
    fullName: string
  }
  status: OrderStatus
  totalAmount: number
  currency: string
  shippingAddress: string
  notes?: string
  items: IOrderItem[]
  shipments?: IShipment[]
  deliveries?: IDelivery[]
  createdAt: string
  updatedAt: string
}
