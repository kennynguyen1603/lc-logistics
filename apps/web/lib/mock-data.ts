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
} from "@workspace/shared"

export const mockWarehouses: IWarehouse[] = [
  { id: "wh1", code: "CLai",   name: "Cảng Cát Lái",       city: "TP.HCM",     address: "Đường Nguyễn Thị Định, Q.2, TP.HCM",              type: "CFS",     createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "wh2", code: "ICD-LB", name: "ICD Long Bình",       city: "Đồng Nai",   address: "KCN Long Bình, TP. Biên Hòa, Đồng Nai",           type: "ICD",     createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "wh3", code: "SThan",  name: "Kho Sóng Thần",       city: "Bình Dương", address: "KCN Sóng Thần 2, Thuận An, Bình Dương",           type: "GENERAL", createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "wh4", code: "NBai",   name: "Kho Nội Bài (Bonded)",city: "Hà Nội",     address: "KCN Nội Bài, H. Sóc Sơn, Hà Nội",                type: "BONDED",  createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "wh5", code: "HPg",    name: "Cảng Hải Phòng",      city: "Hải Phòng",  address: "Đường Lạch Tray, Q. Ngô Quyền, Hải Phòng",        type: "CFS",     createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "wh6", code: "TSa",    name: "Cảng Tiên Sa",        city: "Đà Nẵng",    address: "Đường Yết Kiêu, Q. Sơn Trà, Đà Nẵng",            type: "CFS",     createdAt: "2025-01-01T00:00:00.000Z" },
]

export const mockProducts: IProduct[] = [
  { id: "p1", sku: "RICE-ST25-001", name: "Gạo ST25 xuất khẩu",    category: { id: "c1", name: "Lương thực" }, unit: "Tấn",   unitPrice: 18_000_000, weight: 1000, hsCode: "1006.30", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "p2", sku: "CF-ROB-001",    name: "Cà phê Robusta nhân xô", category: { id: "c2", name: "Nông sản" },   unit: "Tấn",   unitPrice: 45_000_000, weight: 1000, hsCode: "0901.11", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "p3", sku: "TS-TOM-001",    name: "Tôm sú HOSO đông lạnh",  category: { id: "c3", name: "Thủy sản" },  unit: "Tấn",   unitPrice: 220_000_000,weight: 1000, hsCode: "0306.17", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "p4", sku: "CA-CAO-001",    name: "Hạt cacao khô lên men",  category: { id: "c2", name: "Nông sản" },   unit: "Tấn",   unitPrice: 55_000_000, weight: 1000, hsCode: "1801.00", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "p5", sku: "CA-DIE-001",    name: "Hạt điều nhân trắng W320",category:{ id: "c2", name: "Nông sản" },  unit: "Tấn",   unitPrice: 120_000_000,weight: 1000, hsCode: "0801.32", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
]

export const mockUsers: IUser[] = [
  { id: "u1", email: "admin@lclogistics.vn",    fullName: "Nguyễn Văn Admin",   role: "ADMIN",    phone: "0901234001", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "u2", email: "staff@lclogistics.vn",    fullName: "Trần Thị Nhân Viên", role: "STAFF",    phone: "0912345002", createdAt: "2025-02-01T00:00:00.000Z", updatedAt: "2025-02-01T00:00:00.000Z" },
  { id: "u3", email: "customer@lclogistics.vn", fullName: "Lê Văn Khách Hàng",  role: "CUSTOMER", phone: "0923456003", createdAt: "2025-03-01T00:00:00.000Z", updatedAt: "2025-03-01T00:00:00.000Z" },
]

export const mockOrders: IOrder[] = [
  {
    id: "ord1",
    trackingNo: "VN20260616001",
    status: "IN_TRANSIT",
    customer: { id: "cust1", fullName: "Nguyễn Văn A", phone: "0931234567", email: "nguyenvana@gmail.com" },
    createdBy: { id: "u2", fullName: "Trần Thị Nhân Viên" },
    totalAmount: 185_000_000,
    currency: "VND",
    shippingAddress: "123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM",
    items: [
      { id: "i1", orderId: "ord1", productId: "p1", product: { id: "p1", sku: "RICE-ST25-001", name: "Gạo ST25 xuất khẩu", unit: "Tấn", hsCode: "1006.30" }, quantity: 50, unitPrice: 3_000_000, subtotal: 150_000_000 },
      { id: "i2", orderId: "ord1", productId: "p2", product: { id: "p2", sku: "CF-ROB-001",    name: "Cà phê Robusta",     unit: "Tấn", hsCode: "0901.11" }, quantity: 10, unitPrice: 3_500_000, subtotal:  35_000_000 },
    ],
    deliveries: [
      { id: "d1", orderId: "ord1", status: "PENDING",    location: "Văn phòng Hà Nội",     note: "Tiếp nhận đơn hàng",         updatedBy: "u2", createdAt: "2026-06-16T09:00:00.000Z" },
      { id: "d2", orderId: "ord1", status: "CONFIRMED",  location: "Văn phòng Hà Nội",     note: "Xác nhận thông tin",         updatedBy: "u2", createdAt: "2026-06-16T10:30:00.000Z" },
      { id: "d3", orderId: "ord1", status: "PACKED",     location: "Kho Sóng Thần",         note: "Đóng gói hoàn tất",         updatedBy: "u3", createdAt: "2026-06-16T11:30:00.000Z" },
      { id: "d4", orderId: "ord1", status: "IN_TRANSIT", location: "Quốc lộ 1A, Bình Dương", note: "Xuất kho, đang vận chuyển", updatedBy: "u3", createdAt: "2026-06-16T14:00:00.000Z" },
    ],
    shipments: [
      {
        id: "s1", orderId: "ord1",
        carrier: { id: "carr1", code: "MSK", name: "Maersk Line", type: "SEA" },
        shipmentNo: "SHP-20260616-0001",
        mode: "MULTIMODAL",
        origin: "Cảng Cát Lái, TP.HCM",
        destination: "Hà Nội",
        etaDate: "2026-06-18T00:00:00.000Z",
        legs: [
          { id: "l1", shipmentId: "s1", sequence: 1, mode: "ROAD", fromPoint: "Kho Sóng Thần, Bình Dương", toPoint: "Cảng Cát Lái, TP.HCM", carrier: "Xe tải nội địa", startTime: "2026-06-16T14:00:00.000Z", endTime: "2026-06-16T20:00:00.000Z", status: "COMPLETED" },
          { id: "l2", shipmentId: "s1", sequence: 2, mode: "SEA",  fromPoint: "Cảng Cát Lái, TP.HCM",    toPoint: "Cảng Hải Phòng",         carrier: "MSK",           startTime: "2026-06-17T06:00:00.000Z", status: "IN_PROGRESS" },
        ],
        createdAt: "2026-06-16T10:00:00.000Z",
      },
    ],
    createdAt: "2026-06-16T09:00:00.000Z",
    updatedAt: "2026-06-16T14:00:00.000Z",
  },
  {
    id: "ord2",
    trackingNo: "VN20260615002",
    status: "DELIVERED",
    customer: { id: "cust2", fullName: "Trần Thị B", phone: "0941234567", email: "tranthibee@gmail.com" },
    createdBy: { id: "u2", fullName: "Trần Thị Nhân Viên" },
    totalAmount: 75_000_000,
    currency: "VND",
    shippingAddress: "456 Lê Lợi, P. Bến Thành, Q.1, TP.HCM",
    items: [
      { id: "i3", orderId: "ord2", productId: "p3", product: { id: "p3", sku: "TS-TOM-001", name: "Tôm sú HOSO đông lạnh", unit: "Tấn", hsCode: "0306.17" }, quantity: 15, unitPrice: 5_000_000, subtotal: 75_000_000 },
    ],
    deliveries: [
      { id: "d5", orderId: "ord2", status: "PENDING",          location: "", note: "", updatedBy: "u2", createdAt: "2026-06-15T08:00:00.000Z" },
      { id: "d6", orderId: "ord2", status: "CONFIRMED",        location: "", note: "", updatedBy: "u2", createdAt: "2026-06-15T09:00:00.000Z" },
      { id: "d7", orderId: "ord2", status: "PACKED",           location: "Kho Cát Lái", note: "", updatedBy: "u3", createdAt: "2026-06-15T10:00:00.000Z" },
      { id: "d8", orderId: "ord2", status: "IN_TRANSIT",       location: "Xa lộ Hà Nội", note: "", updatedBy: "u3", createdAt: "2026-06-15T11:30:00.000Z" },
      { id: "d9", orderId: "ord2", status: "OUT_FOR_DELIVERY", location: "Q. Bến Thành, TP.HCM", note: "", updatedBy: "u2", createdAt: "2026-06-15T15:00:00.000Z" },
      { id: "d10",orderId: "ord2", status: "DELIVERED",        location: "456 Lê Lợi, Q.1", note: "Khách hàng nhận hàng", updatedBy: "u2", createdAt: "2026-06-15T17:30:00.000Z" },
    ],
    shipments: [],
    createdAt: "2026-06-15T08:00:00.000Z",
    updatedAt: "2026-06-15T17:30:00.000Z",
  },
  {
    id: "ord3",
    trackingNo: "VN20260616003",
    status: "PENDING",
    customer: { id: "cust3", fullName: "Lê Văn C", phone: "0951234567", email: "" },
    createdBy: { id: "u2", fullName: "Trần Thị Nhân Viên" },
    totalAmount: 210_000_000,
    currency: "VND",
    shippingAddress: "789 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
    items: [
      { id: "i4", orderId: "ord3", productId: "p4", product: { id: "p4", sku: "CA-CAO-001", name: "Hạt cacao khô lên men", unit: "Tấn", hsCode: "1801.00" }, quantity: 30, unitPrice: 4_000_000, subtotal: 120_000_000 },
      { id: "i5", orderId: "ord3", productId: "p5", product: { id: "p5", sku: "CA-DIE-001", name: "Hạt điều nhân trắng", unit: "Tấn", hsCode: "0801.32" }, quantity: 20, unitPrice: 4_500_000, subtotal:  90_000_000 },
    ],
    deliveries: [
      { id: "d11", orderId: "ord3", status: "PENDING", location: "Văn phòng Hà Nội", note: "Chờ xác nhận", updatedBy: "u2", createdAt: "2026-06-16T08:00:00.000Z" },
    ],
    shipments: [],
    createdAt: "2026-06-16T08:00:00.000Z",
    updatedAt: "2026-06-16T08:00:00.000Z",
  },
]

export const mockInventory: IInventory[] = [
  { id: "inv1",  productId: "p1", product: { id: "p1", sku: "RICE-ST25-001", name: "Gạo ST25", unit: "Tấn" },   warehouseId: "wh1", warehouse: { id: "wh1", code: "CLai",  name: "Cảng Cát Lái",  city: "TP.HCM" },     stock: 1500, reserved: 100, available: 1400, lowThreshold: 200, updatedAt: "2026-06-16T00:00:00.000Z" },
  { id: "inv2",  productId: "p1", product: { id: "p1", sku: "RICE-ST25-001", name: "Gạo ST25", unit: "Tấn" },   warehouseId: "wh3", warehouse: { id: "wh3", code: "SThan", name: "Kho Sóng Thần", city: "Bình Dương" },  stock:  800, reserved:  50, available:  750, lowThreshold: 200, updatedAt: "2026-06-16T00:00:00.000Z" },
  { id: "inv3",  productId: "p2", product: { id: "p2", sku: "CF-ROB-001",    name: "Cà phê Robusta", unit: "Tấn" }, warehouseId: "wh1", warehouse: { id: "wh1", code: "CLai",  name: "Cảng Cát Lái",  city: "TP.HCM" }, stock:  400, reserved:  60, available:  340, lowThreshold:  80, updatedAt: "2026-06-16T00:00:00.000Z" },
  { id: "inv4",  productId: "p3", product: { id: "p3", sku: "TS-TOM-001",    name: "Tôm sú đông lạnh", unit: "Tấn" }, warehouseId: "wh1", warehouse: { id: "wh1", code: "CLai",  name: "Cảng Cát Lái", city: "TP.HCM" }, stock:  200, reserved:  30, available:  170, lowThreshold:  40, updatedAt: "2026-06-16T00:00:00.000Z" },
  { id: "inv5",  productId: "p4", product: { id: "p4", sku: "CA-CAO-001",    name: "Hạt cacao khô", unit: "Tấn" },   warehouseId: "wh1", warehouse: { id: "wh1", code: "CLai",  name: "Cảng Cát Lái", city: "TP.HCM" },  stock:  200, reserved:  30, available:  170, lowThreshold:  40, updatedAt: "2026-06-16T00:00:00.000Z" },
  { id: "inv6",  productId: "p5", product: { id: "p5", sku: "CA-DIE-001",    name: "Hạt điều W320", unit: "Tấn" },   warehouseId: "wh1", warehouse: { id: "wh1", code: "CLai",  name: "Cảng Cát Lái", city: "TP.HCM" },  stock:  300, reserved:  40, available:  260, lowThreshold:  60, updatedAt: "2026-06-16T00:00:00.000Z" },
]

export const mockMovements: IStockMovement[] = [
  { id: "mv1", inventoryId: "inv1", product: { id: "p1", sku: "RICE-ST25-001", name: "Gạo ST25" },       warehouse: { id: "wh1", code: "CLai",  name: "Cảng Cát Lái" },   type: "INBOUND",    quantity:  200, reason: "Nhập khẩu lô gạo tháng 6 từ An Giang",       referenceNo: "PO-2026-051", performedBy: { id: "u3", fullName: "Lê Văn Kho" }, createdAt: "2026-06-14T08:00:00.000Z" },
  { id: "mv2", inventoryId: "inv3", product: { id: "p2", sku: "CF-ROB-001",    name: "Cà phê Robusta" }, warehouse: { id: "wh2", code: "ICD-LB", name: "ICD Long Bình" },   type: "OUTBOUND",   quantity:  -15, reason: "Xuất đơn VN20260614004 — Maersk/EU",          referenceNo: "VN20260614004", performedBy: { id: "u2", fullName: "Trần Thị Nhân Viên" }, createdAt: "2026-06-14T10:00:00.000Z" },
  { id: "mv3", inventoryId: "inv4", product: { id: "p3", sku: "TS-TOM-001",    name: "Tôm sú đông lạnh" },warehouse: { id: "wh3", code: "SThan", name: "Kho Sóng Thần" }, type: "INBOUND",    quantity:   50, reason: "Nhập hàng từ nhà máy Minh Phú Cà Mau",       referenceNo: "PO-2026-053", performedBy: { id: "u3", fullName: "Lê Văn Kho" }, createdAt: "2026-06-15T09:00:00.000Z" },
  { id: "mv4", inventoryId: "inv1", product: { id: "p1", sku: "RICE-ST25-001", name: "Gạo ST25" },       warehouse: { id: "wh3", code: "SThan", name: "Kho Sóng Thần" },   type: "OUTBOUND",   quantity:  -50, reason: "Xuất kho đơn VN20260616001",                 referenceNo: "VN20260616001", performedBy: { id: "u3", fullName: "Lê Văn Kho" }, createdAt: "2026-06-16T14:00:00.000Z" },
  { id: "mv5", inventoryId: "inv5", product: { id: "p4", sku: "CA-CAO-001",    name: "Hạt cacao khô" },  warehouse: { id: "wh4", code: "NBai",  name: "Kho Nội Bài" },     type: "ADJUSTMENT", quantity:   -3, reason: "Kiểm kê phát hiện hàng ẩm mốc cần xử lý",    referenceNo: "AUDIT-062601", performedBy: { id: "u2", fullName: "Trần Thị Nhân Viên" }, createdAt: "2026-06-16T11:00:00.000Z" },
]

export const mockDashboardSummary: IDashboardSummary = {
  totalOrders: 100,
  inTransit: 37,
  delivered: 25,
  totalRevenue: 8_750_000_000,
  period: "month",
}

export const mockOrdersByStatus: IOrdersByStatus[] = [
  { status: "PENDING",          count: 10, percentage: 10 },
  { status: "CONFIRMED",        count: 10, percentage: 10 },
  { status: "PACKED",           count:  8, percentage:  8 },
  { status: "IN_TRANSIT",       count: 25, percentage: 25 },
  { status: "OUT_FOR_DELIVERY", count: 12, percentage: 12 },
  { status: "DELIVERED",        count: 25, percentage: 25 },
  { status: "RETURNED",         count:  5, percentage:  5 },
  { status: "CANCELLED",        count:  5, percentage:  5 },
]

export const mockOrdersByDay: IOrdersByDay[] = [
  { date: "10/06", count: 18, revenue: 1_200_000_000 },
  { date: "11/06", count: 22, revenue: 1_800_000_000 },
  { date: "12/06", count: 15, revenue:   950_000_000 },
  { date: "13/06", count: 28, revenue: 2_100_000_000 },
  { date: "14/06", count: 24, revenue: 1_750_000_000 },
  { date: "15/06", count: 31, revenue: 2_400_000_000 },
  { date: "16/06", count: 19, revenue: 1_350_000_000 },
]

export const mockLowStockAlerts: ILowStockAlert[] = [
  { productId: "p2", productName: "Cà phê Robusta nhân xô", sku: "CF-ROB-001",    warehouseId: "wh2", warehouseName: "ICD Long Bình",  currentStock:  5, threshold: 30 },
  { productId: "p4", productName: "Hạt cacao khô lên men",  sku: "CA-CAO-001",    warehouseId: "wh4", warehouseName: "Kho Nội Bài",    currentStock:  8, threshold: 15 },
  { productId: "p5", productName: "Hạt điều nhân trắng W320",sku: "CA-DIE-001",   warehouseId: "wh5", warehouseName: "Cảng Hải Phòng", currentStock: 15, threshold: 30 },
  { productId: "p1", productName: "Gạo ST25 xuất khẩu",     sku: "RICE-ST25-001", warehouseId: "wh4", warehouseName: "Kho Nội Bài",   currentStock: 50, threshold: 50 },
]
