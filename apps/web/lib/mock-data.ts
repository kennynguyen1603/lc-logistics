import type {
  IUser,
  IProduct,
  IWarehouse,
  IOrder,
  IInventory,
  IStockMovement,
  IDashboardSummary,
  IOrdersByStatus,
  IOrdersByDay,
  ILowStockAlert,
} from "@/types"

export const mockWarehouses: IWarehouse[] = [
  { id: "wh1", code: "CLai", name: "Cảng Cát Lái", city: "TP.HCM", address: "Đường Nguyễn Thị Định, Q2, TP.HCM" },
  { id: "wh2", code: "ICD-LB", name: "ICD Long Bình", city: "Đồng Nai", address: "KCN Long Bình, Biên Hòa, Đồng Nai" },
  { id: "wh3", code: "SThan", name: "Kho Sóng Thần", city: "Bình Dương", address: "KCN Sóng Thần, Thuận An, Bình Dương" },
  { id: "wh4", code: "NBai", name: "Kho Nội Bài", city: "Hà Nội", address: "KCN Nội Bài, Sóc Sơn, Hà Nội" },
  { id: "wh5", code: "HPg", name: "Cảng Hải Phòng", city: "Hải Phòng", address: "Đường Lạch Tray, Ngô Quyền, Hải Phòng" },
]

export const mockProducts: IProduct[] = [
  { id: "p1", sku: "GST25-001", name: "Gạo ST25", category: "Lương thực", unit: "Tấn", lowThreshold: 50, weight: 1000 },
  { id: "p2", sku: "CF-001", name: "Cà phê Robusta", category: "Nông sản", unit: "Tấn", lowThreshold: 20, weight: 1000 },
  { id: "p3", sku: "TOM-001", name: "Tôm đông lạnh", category: "Thủy sản", unit: "Tấn", lowThreshold: 10, weight: 1000 },
  { id: "p4", sku: "HCA-001", name: "Hạt cacao", category: "Nông sản", unit: "Tấn", lowThreshold: 15, weight: 1000 },
  { id: "p5", sku: "DCA-001", name: "Điều cashew", category: "Nông sản", unit: "Tấn", lowThreshold: 30, weight: 1000 },
]

export const mockUsers: IUser[] = [
  { id: "u1", email: "admin@logistics.vn", name: "Nguyễn Văn Admin", role: "ADMIN", phone: "0901234567", createdAt: new Date("2025-01-01") },
  { id: "u2", email: "staff1@logistics.vn", name: "Trần Thị Staff", role: "STAFF", phone: "0912345678", createdAt: new Date("2025-02-01") },
  { id: "u3", email: "staff2@logistics.vn", name: "Lê Văn Kho", role: "STAFF", phone: "0923456789", createdAt: new Date("2025-03-01") },
]

export const mockOrders: IOrder[] = [
  {
    id: "ord1",
    trackingNo: "VN20260616001",
    status: "IN_TRANSIT",
    customerName: "Nguyễn Văn A",
    customerPhone: "0931234567",
    customerEmail: "nguyenvana@gmail.com",
    deliveryAddress: "123 Nguyễn Huệ, P. Bến Nghé",
    city: "TP.HCM",
    totalAmount: 185000000,
    items: [
      { id: "i1", orderId: "ord1", productId: "p1", product: mockProducts[0]!, quantity: 50, unitPrice: 3000000 },
      { id: "i2", orderId: "ord1", productId: "p2", product: mockProducts[1]!, quantity: 10, unitPrice: 3500000 },
    ],
    deliveries: [
      { id: "d1", orderId: "ord1", status: "PENDING", location: "VP Hà Nội", note: "Tiếp nhận đơn hàng", updatedBy: "u2", createdAt: new Date("2026-06-16T09:00:00") },
      { id: "d2", orderId: "ord1", status: "CONFIRMED", location: "VP Hà Nội", note: "Xác nhận thông tin", updatedBy: "u2", createdAt: new Date("2026-06-16T10:30:00") },
      { id: "d3", orderId: "ord1", status: "PACKED", location: "Kho Sóng Thần", note: "Đóng gói hoàn tất", updatedBy: "u3", createdAt: new Date("2026-06-16T11:30:00") },
      { id: "d4", orderId: "ord1", status: "IN_TRANSIT", location: "Quốc lộ 1A, Bình Dương", note: "Xuất kho, đang trên đường", updatedBy: "u3", createdAt: new Date("2026-06-16T14:00:00") },
    ],
    shipments: [
      {
        id: "s1", orderId: "ord1", trackingCode: "VN-SHP-001", carrier: "Logistics Express",
        estimatedDelivery: new Date("2026-06-18"),
        legs: [
          { id: "l1", shipmentId: "s1", fromWarehouseId: "wh3", fromWarehouse: mockWarehouses[2]!, toWarehouseId: "wh1", toWarehouse: mockWarehouses[0]!, departedAt: new Date("2026-06-16T14:00:00"), vehicleNo: "51D-12345" },
        ],
      },
    ],
    createdAt: new Date("2026-06-16T09:00:00"),
    updatedAt: new Date("2026-06-16T14:00:00"),
  },
  {
    id: "ord2",
    trackingNo: "VN20260615002",
    status: "DELIVERED",
    customerName: "Trần Thị B",
    customerPhone: "0941234567",
    customerEmail: "tranthibee@gmail.com",
    deliveryAddress: "456 Lê Lợi, P. Bến Thành",
    city: "TP.HCM",
    totalAmount: 75000000,
    items: [
      { id: "i3", orderId: "ord2", productId: "p3", product: mockProducts[2]!, quantity: 15, unitPrice: 5000000 },
    ],
    deliveries: [
      { id: "d5", orderId: "ord2", status: "PENDING", location: "", note: "", updatedBy: "u2", createdAt: new Date("2026-06-15T08:00:00") },
      { id: "d6", orderId: "ord2", status: "CONFIRMED", location: "", note: "", updatedBy: "u2", createdAt: new Date("2026-06-15T09:00:00") },
      { id: "d7", orderId: "ord2", status: "PACKED", location: "Kho Cát Lái", note: "", updatedBy: "u3", createdAt: new Date("2026-06-15T10:00:00") },
      { id: "d8", orderId: "ord2", status: "IN_TRANSIT", location: "Xa lộ Hà Nội", note: "", updatedBy: "u3", createdAt: new Date("2026-06-15T11:30:00") },
      { id: "d9", orderId: "ord2", status: "OUT_FOR_DELIVERY", location: "Q. Bến Thành, TP.HCM", note: "", updatedBy: "u2", createdAt: new Date("2026-06-15T15:00:00") },
      { id: "d10", orderId: "ord2", status: "DELIVERED", location: "456 Lê Lợi, Q1", note: "Khách hàng nhận hàng", updatedBy: "u2", createdAt: new Date("2026-06-15T17:30:00") },
    ],
    shipments: [],
    createdAt: new Date("2026-06-15T08:00:00"),
    updatedAt: new Date("2026-06-15T17:30:00"),
  },
  {
    id: "ord3",
    trackingNo: "VN20260616003",
    status: "PENDING",
    customerName: "Lê Văn C",
    customerPhone: "0951234567",
    deliveryAddress: "789 Trần Hưng Đạo",
    city: "Hà Nội",
    totalAmount: 210000000,
    items: [
      { id: "i4", orderId: "ord3", productId: "p4", product: mockProducts[3]!, quantity: 30, unitPrice: 4000000 },
      { id: "i5", orderId: "ord3", productId: "p5", product: mockProducts[4]!, quantity: 20, unitPrice: 4500000 },
    ],
    deliveries: [
      { id: "d11", orderId: "ord3", status: "PENDING", location: "VP Hà Nội", note: "Chờ xác nhận", updatedBy: "u2", createdAt: new Date("2026-06-16T08:00:00") },
    ],
    shipments: [],
    createdAt: new Date("2026-06-16T08:00:00"),
    updatedAt: new Date("2026-06-16T08:00:00"),
  },
  {
    id: "ord4",
    trackingNo: "VN20260614004",
    status: "RETURNED",
    customerName: "Phạm Thị D",
    customerPhone: "0961234567",
    deliveryAddress: "321 Hai Bà Trưng",
    city: "TP.HCM",
    totalAmount: 42000000,
    items: [
      { id: "i6", orderId: "ord4", productId: "p1", product: mockProducts[0]!, quantity: 14, unitPrice: 3000000 },
    ],
    deliveries: [
      { id: "d12", orderId: "ord4", status: "RETURNED", location: "Kho Cát Lái", note: "Khách hàng không nhận hàng", updatedBy: "u2", createdAt: new Date("2026-06-14T16:00:00") },
    ],
    shipments: [],
    createdAt: new Date("2026-06-14T08:00:00"),
    updatedAt: new Date("2026-06-14T16:00:00"),
  },
  {
    id: "ord5",
    trackingNo: "VN20260616005",
    status: "CONFIRMED",
    customerName: "Hoàng Văn E",
    customerPhone: "0971234567",
    deliveryAddress: "555 Đinh Tiên Hoàng",
    city: "Hà Nội",
    totalAmount: 95000000,
    items: [
      { id: "i7", orderId: "ord5", productId: "p2", product: mockProducts[1]!, quantity: 20, unitPrice: 3500000 },
      { id: "i8", orderId: "ord5", productId: "p3", product: mockProducts[2]!, quantity: 5, unitPrice: 5000000 },
    ],
    deliveries: [
      { id: "d13", orderId: "ord5", status: "PENDING", location: "", note: "", updatedBy: "u2", createdAt: new Date("2026-06-16T07:30:00") },
      { id: "d14", orderId: "ord5", status: "CONFIRMED", location: "VP Hà Nội", note: "", updatedBy: "u2", createdAt: new Date("2026-06-16T08:30:00") },
    ],
    shipments: [],
    createdAt: new Date("2026-06-16T07:30:00"),
    updatedAt: new Date("2026-06-16T08:30:00"),
  },
]

export const mockInventory: IInventory[] = [
  { id: "inv1", productId: "p1", product: mockProducts[0]!, warehouseId: "wh1", warehouse: mockWarehouses[0]!, stock: 1500, reserved: 100, lowThreshold: 50 },
  { id: "inv2", productId: "p1", product: mockProducts[0]!, warehouseId: "wh2", warehouse: mockWarehouses[1]!, stock: 80, reserved: 20, lowThreshold: 50 },
  { id: "inv3", productId: "p1", product: mockProducts[0]!, warehouseId: "wh3", warehouse: mockWarehouses[2]!, stock: 200, reserved: 50, lowThreshold: 50 },
  { id: "inv4", productId: "p1", product: mockProducts[0]!, warehouseId: "wh4", warehouse: mockWarehouses[3]!, stock: 50, reserved: 0, lowThreshold: 50 },
  { id: "inv5", productId: "p2", product: mockProducts[1]!, warehouseId: "wh1", warehouse: mockWarehouses[0]!, stock: 300, reserved: 50, lowThreshold: 20 },
  { id: "inv6", productId: "p2", product: mockProducts[1]!, warehouseId: "wh2", warehouse: mockWarehouses[1]!, stock: 5, reserved: 0, lowThreshold: 20 },
  { id: "inv7", productId: "p2", product: mockProducts[1]!, warehouseId: "wh3", warehouse: mockWarehouses[2]!, stock: 100, reserved: 30, lowThreshold: 20 },
  { id: "inv8", productId: "p2", product: mockProducts[1]!, warehouseId: "wh5", warehouse: mockWarehouses[4]!, stock: 20, reserved: 0, lowThreshold: 20 },
  { id: "inv9", productId: "p3", product: mockProducts[2]!, warehouseId: "wh1", warehouse: mockWarehouses[0]!, stock: 80, reserved: 15, lowThreshold: 10 },
  { id: "inv10", productId: "p3", product: mockProducts[2]!, warehouseId: "wh3", warehouse: mockWarehouses[2]!, stock: 45, reserved: 5, lowThreshold: 10 },
  { id: "inv11", productId: "p4", product: mockProducts[3]!, warehouseId: "wh1", warehouse: mockWarehouses[0]!, stock: 120, reserved: 30, lowThreshold: 15 },
  { id: "inv12", productId: "p4", product: mockProducts[3]!, warehouseId: "wh4", warehouse: mockWarehouses[3]!, stock: 8, reserved: 0, lowThreshold: 15 },
  { id: "inv13", productId: "p5", product: mockProducts[4]!, warehouseId: "wh1", warehouse: mockWarehouses[0]!, stock: 250, reserved: 20, lowThreshold: 30 },
  { id: "inv14", productId: "p5", product: mockProducts[4]!, warehouseId: "wh2", warehouse: mockWarehouses[1]!, stock: 60, reserved: 0, lowThreshold: 30 },
  { id: "inv15", productId: "p5", product: mockProducts[4]!, warehouseId: "wh5", warehouse: mockWarehouses[4]!, stock: 15, reserved: 0, lowThreshold: 30 },
]

export const mockMovements: IStockMovement[] = [
  { id: "mv1", productId: "p1", product: mockProducts[0]!, warehouseId: "wh1", warehouse: mockWarehouses[0]!, type: "IN", quantity: 200, reason: "Nhập khẩu lô hàng tháng 6", performedBy: "u3", performedByUser: mockUsers[2]!, createdAt: new Date("2026-06-14T08:00:00") },
  { id: "mv2", productId: "p2", product: mockProducts[1]!, warehouseId: "wh2", warehouse: mockWarehouses[1]!, type: "OUT", quantity: 15, reason: "Xuất đơn VN20260614004", performedBy: "u2", performedByUser: mockUsers[1]!, createdAt: new Date("2026-06-14T10:00:00") },
  { id: "mv3", productId: "p3", product: mockProducts[2]!, warehouseId: "wh3", warehouse: mockWarehouses[2]!, type: "IN", quantity: 50, reason: "Nhập hàng từ nhà cung cấp", performedBy: "u3", performedByUser: mockUsers[2]!, createdAt: new Date("2026-06-15T09:00:00") },
  { id: "mv4", productId: "p1", product: mockProducts[0]!, warehouseId: "wh3", warehouse: mockWarehouses[2]!, type: "OUT", quantity: 50, reason: "Xuất đơn VN20260616001", performedBy: "u3", performedByUser: mockUsers[2]!, createdAt: new Date("2026-06-16T14:00:00") },
  { id: "mv5", productId: "p4", product: mockProducts[3]!, warehouseId: "wh4", warehouse: mockWarehouses[3]!, type: "ADJUSTMENT", quantity: -2, reason: "Kiểm kê phát hiện hàng hỏng", performedBy: "u2", performedByUser: mockUsers[1]!, createdAt: new Date("2026-06-16T11:00:00") },
]

export const mockDashboardSummary: IDashboardSummary = {
  totalOrders: 142,
  inTransit: 38,
  delivered: 95,
  totalRevenue: 8750000000,
}

export const mockOrdersByStatus: IOrdersByStatus[] = [
  { status: "PENDING", count: 12 },
  { status: "CONFIRMED", count: 8 },
  { status: "PACKED", count: 5 },
  { status: "IN_TRANSIT", count: 38 },
  { status: "OUT_FOR_DELIVERY", count: 14 },
  { status: "DELIVERED", count: 95 },
  { status: "RETURNED", count: 6 },
  { status: "CANCELLED", count: 4 },
]

export const mockOrdersByDay: IOrdersByDay[] = [
  { date: "10/06", count: 18 },
  { date: "11/06", count: 22 },
  { date: "12/06", count: 15 },
  { date: "13/06", count: 28 },
  { date: "14/06", count: 24 },
  { date: "15/06", count: 31 },
  { date: "16/06", count: 19 },
]

export const mockLowStockAlerts: ILowStockAlert[] = [
  { product: mockProducts[1]!, warehouse: mockWarehouses[1]!, stock: 5, lowThreshold: 20 },
  { product: mockProducts[3]!, warehouse: mockWarehouses[3]!, stock: 8, lowThreshold: 15 },
  { product: mockProducts[4]!, warehouse: mockWarehouses[4]!, stock: 15, lowThreshold: 30 },
  { product: mockProducts[0]!, warehouse: mockWarehouses[3]!, stock: 50, lowThreshold: 50 },
]
