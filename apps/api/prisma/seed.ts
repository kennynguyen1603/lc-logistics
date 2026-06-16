import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcrypt"

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! })
const prisma = new PrismaClient({ adapter })

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 3600 * 1000)
}

function addHours(d: Date, h: number): Date {
  return new Date(d.getTime() + h * 3600 * 1000)
}

const DELIVERY_STEPS: Record<string, string[]> = {
  PENDING: ["PENDING"],
  CONFIRMED: ["PENDING", "CONFIRMED"],
  PACKED: ["PENDING", "CONFIRMED", "PACKED"],
  IN_TRANSIT: ["PENDING", "CONFIRMED", "PACKED", "IN_TRANSIT"],
  OUT_FOR_DELIVERY: [
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
  ],
  DELIVERED: [
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ],
  RETURNED: ["PENDING", "CONFIRMED", "PACKED", "IN_TRANSIT", "RETURNED"],
  CANCELLED: ["PENDING", "CANCELLED"],
}

const STEP_NOTES: Record<string, string> = {
  PENDING: "Đơn hàng được tiếp nhận",
  CONFIRMED: "Đã xác nhận thông tin đơn hàng",
  PACKED: "Đóng gói hoàn tất, chờ xuất kho",
  IN_TRANSIT: "Hàng đã xuất kho, đang trên đường vận chuyển",
  OUT_FOR_DELIVERY: "Hàng đến bưu cục địa phương, đang giao cuối",
  DELIVERED: "Giao hàng thành công, khách đã nhận",
  RETURNED: "Khách hàng từ chối nhận, đang hoàn hàng về kho",
  CANCELLED: "Đơn hàng đã bị hủy",
}

const STEP_LOCATIONS: Record<string, string[]> = {
  PENDING: ["Trung tâm xử lý TP.HCM", "Văn phòng Hà Nội", "Chi nhánh Đà Nẵng"],
  CONFIRMED: ["Trung tâm xử lý TP.HCM", "Văn phòng Hà Nội"],
  PACKED: [
    "Kho Cát Lái, TP.HCM",
    "Kho Sóng Thần, Bình Dương",
    "Kho Nội Bài, Hà Nội",
    "Kho Tiên Sa, Đà Nẵng",
  ],
  IN_TRANSIT: [
    "Quốc lộ 1A, Bình Dương",
    "Cao tốc TP.HCM - Long Thành",
    "Quốc lộ 5, Hưng Yên",
    "Cảng Cát Lái, TP.HCM",
    "Cảng Hải Phòng",
  ],
  OUT_FOR_DELIVERY: [
    "Bưu cục Q.1, TP.HCM",
    "Bưu cục Hoàn Kiếm, HN",
    "Bưu cục Hải Châu, ĐN",
    "Bưu cục Ninh Kiều, CT",
  ],
  DELIVERED: ["Địa chỉ giao hàng"],
  RETURNED: ["Trung tâm hoàn hàng TP.HCM", "Kho trả hàng Hà Nội"],
  CANCELLED: ["Hệ thống"],
}

async function makeDeliveryHistory(
  orderId: string,
  finalStatus: string,
  baseTime: Date,
  staffId: string
) {
  const steps = DELIVERY_STEPS[finalStatus] ?? ["PENDING"]
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!
    const locs = STEP_LOCATIONS[step] ?? ["Hệ thống"]
    await prisma.delivery.create({
      data: {
        orderId,
        status: step as any,
        location: locs[Math.floor(Math.random() * locs.length)]!,
        note: STEP_NOTES[step] ?? step,
        updatedBy: staffId,
        createdAt: addHours(baseTime, i * 4),
      },
    })
  }
}

// ── Main seed ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...")

  // ── 1. Users ──────────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hash(p, 10)

  const [admin, staff, _customer] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@lclogistics.vn" },
      update: {},
      create: {
        email: "admin@lclogistics.vn",
        passwordHash: await hash("Admin@123"),
        fullName: "Nguyễn Văn Admin",
        role: "ADMIN",
        phone: "0901234001",
      },
    }),
    prisma.user.upsert({
      where: { email: "staff@lclogistics.vn" },
      update: {},
      create: {
        email: "staff@lclogistics.vn",
        passwordHash: await hash("Staff@123"),
        fullName: "Trần Thị Nhân Viên",
        role: "STAFF",
        phone: "0912345002",
      },
    }),
    prisma.user.upsert({
      where: { email: "customer@lclogistics.vn" },
      update: {},
      create: {
        email: "customer@lclogistics.vn",
        passwordHash: await hash("Cust@123"),
        fullName: "Lê Văn Khách Hàng",
        role: "CUSTOMER",
        phone: "0923456003",
      },
    }),
  ])

  console.log("✅ Users created")

  // ── 2. Categories ─────────────────────────────────────────────────────────
  const catNames = ["Lương thực", "Nông sản", "Thủy sản", "Dệt may", "Điện tử"]
  const catMap: Record<string, string> = {}
  for (const name of catNames) {
    const c = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    catMap[name] = c.id
  }
  console.log("✅ Categories created")

  // ── 3. Warehouses ─────────────────────────────────────────────────────────
  const warehouseData = [
    {
      code: "CLai",
      name: "Cảng Cát Lái",
      address: "Đường Nguyễn Thị Định, P. Thạnh Mỹ Lợi, Q.2",
      city: "TP.HCM",
      type: "CFS",
    },
    {
      code: "ICD-LB",
      name: "ICD Long Bình",
      address: "KCN Long Bình, TP. Biên Hòa",
      city: "Đồng Nai",
      type: "ICD",
    },
    {
      code: "SThan",
      name: "Kho Sóng Thần",
      address: "KCN Sóng Thần 2, Thuận An",
      city: "Bình Dương",
      type: "GENERAL",
    },
    {
      code: "NBai",
      name: "Kho Nội Bài (Bonded)",
      address: "KCN Nội Bài, H. Sóc Sơn",
      city: "Hà Nội",
      type: "BONDED",
    },
    {
      code: "HPg",
      name: "Cảng Hải Phòng",
      address: "Đường Lạch Tray, Q. Ngô Quyền",
      city: "Hải Phòng",
      type: "CFS",
    },
    {
      code: "TSa",
      name: "Cảng Tiên Sa",
      address: "Đường Yết Kiêu, Q. Sơn Trà",
      city: "Đà Nẵng",
      type: "CFS",
    },
  ]
  const warehouses: Record<string, string> = {}
  for (const w of warehouseData) {
    const rec = await prisma.warehouse.upsert({
      where: { code: w.code },
      update: {},
      create: w as any,
    })
    warehouses[w.code] = rec.id
  }
  console.log("✅ Warehouses created")

  // ── 4. Carriers ───────────────────────────────────────────────────────────
  const carrierData = [
    { code: "VTP", name: "Viettel Post", type: "ROAD", contact: "1800.8098" },
    {
      code: "GHN",
      name: "Giao Hàng Nhanh",
      type: "ROAD",
      contact: "1900.636677",
    },
    {
      code: "MSK",
      name: "Maersk Line",
      type: "SEA",
      contact: "+84.28.3821.2600",
    },
    {
      code: "ONE",
      name: "Ocean Network Express",
      type: "SEA",
      contact: "+84.28.3826.8888",
    },
    {
      code: "VAC",
      name: "Vietnam Airlines Cargo",
      type: "AIR",
      contact: "1900.1100",
    },
  ]
  const carriers: Record<string, string> = {}
  for (const c of carrierData) {
    const rec = await prisma.carrier.upsert({
      where: { code: c.code },
      update: {},
      create: c as any,
    })
    carriers[c.code] = rec.id
  }
  console.log("✅ Carriers created")

  // ── 5. Products (30) ──────────────────────────────────────────────────────
  const productData = [
    // Lương thực
    {
      sku: "RICE-ST25-001",
      name: "Gạo ST25 xuất khẩu",
      cat: "Lương thực",
      price: 18_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "1006.30",
      desc: "Gạo thơm ngon hàng đầu VN, giải thưởng gạo ngon nhất thế giới",
    },
    {
      sku: "RICE-JAS-002",
      name: "Gạo Jasmine 100%",
      cat: "Lương thực",
      price: 16_500_000,
      unit: "Tấn",
      weight: 1000,
      hs: "1006.30",
      desc: "Gạo hoa nhài thơm dịu, xuất khẩu sang thị trường Mỹ và EU",
    },
    {
      sku: "RICE-NAH-003",
      name: "Gạo Nàng Hương Chợ Đào",
      cat: "Lương thực",
      price: 15_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "1006.30",
      desc: "Đặc sản vùng Chợ Đào, Long An",
    },
    {
      sku: "RICE-OM5451",
      name: "Gạo OM5451",
      cat: "Lương thực",
      price: 12_500_000,
      unit: "Tấn",
      weight: 1000,
      hs: "1006.20",
      desc: "Gạo trắng hạt dài phổ thông, thị trường đại trà",
    },
    {
      sku: "SAN-LAT-001",
      name: "Sắn lát khô",
      cat: "Lương thực",
      price: 8_500_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0714.10",
      desc: "Sắn lát phơi khô xuất khẩu sang Trung Quốc",
    },
    // Nông sản
    {
      sku: "CF-ROB-001",
      name: "Cà phê Robusta nhân xô",
      cat: "Nông sản",
      price: 45_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0901.11",
      desc: "Cà phê Robusta Tây Nguyên grade 1",
    },
    {
      sku: "CF-ARA-002",
      name: "Cà phê Arabica Cầu Đất",
      cat: "Nông sản",
      price: 85_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0901.11",
      desc: "Cà phê Arabica Đà Lạt, hương thơm đặc trưng",
    },
    {
      sku: "CF-CHA-003",
      name: "Cà phê Chari Sơn La",
      cat: "Nông sản",
      price: 38_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0901.11",
      desc: "Giống cà phê Chari kháng bệnh, phù hợp vùng cao",
    },
    {
      sku: "CA-DIE-001",
      name: "Hạt điều nhân trắng W320",
      cat: "Nông sản",
      price: 120_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0801.32",
      desc: "Hạt điều nhân trắng cỡ W320 tiêu chuẩn xuất khẩu",
    },
    {
      sku: "CA-DIE-002",
      name: "Hạt điều rang muối",
      cat: "Nông sản",
      price: 140_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0801.32",
      desc: "Điều rang muối đóng gói sẵn tiêu dùng",
    },
    {
      sku: "CA-CAO-001",
      name: "Hạt cacao khô lên men",
      cat: "Nông sản",
      price: 55_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "1801.00",
      desc: "Cacao lên men 5 ngày tiêu chuẩn Châu Âu, Bến Tre",
    },
    {
      sku: "NN-CAO-001",
      name: "Cao su RSS3",
      cat: "Nông sản",
      price: 35_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "4001.22",
      desc: "Cao su tấm xông khói RSS3 xuất khẩu",
    },
    {
      sku: "NN-HO-001",
      name: "Hồ tiêu đen Phú Quốc",
      cat: "Nông sản",
      price: 95_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0904.11",
      desc: "Tiêu đen hạt tròn đều, chất lượng cao",
    },
    {
      sku: "PT-PHN-001",
      name: "Phân urea Cà Mau 46%",
      cat: "Nông sản",
      price: 12_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "3102.10",
      desc: "Phân đạm ure hạt đục nhà máy Cà Mau",
    },
    {
      sku: "PT-DAU-001",
      name: "Dầu nhờn động cơ 10W40",
      cat: "Nông sản",
      price: 45_000_000,
      unit: "Tấn",
      weight: 900,
      hs: "2710.19",
      desc: "Dầu bôi trơn động cơ xăng và diesel",
    },
    // Thủy sản
    {
      sku: "TS-TOM-001",
      name: "Tôm sú HOSO đông lạnh",
      cat: "Thủy sản",
      price: 220_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0306.17",
      desc: "Tôm sú size 20/30, còn đầu vỏ, đông IQF",
    },
    {
      sku: "TS-TOM-002",
      name: "Tôm thẻ chân trắng PD",
      cat: "Thủy sản",
      price: 180_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0306.17",
      desc: "Tôm thẻ bóc vỏ bỏ chỉ size 41/50",
    },
    {
      sku: "TS-CAT-001",
      name: "Cá tra philê đông lạnh",
      cat: "Thủy sản",
      price: 55_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0304.62",
      desc: "Philê cá tra trắng, không xương, đông IQF",
    },
    {
      sku: "TS-CAT-002",
      name: "Cá basa đông lạnh nguyên con",
      cat: "Thủy sản",
      price: 60_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0304.62",
      desc: "Cá basa nguyên con cấp đông nhanh",
    },
    {
      sku: "TS-MUC-001",
      name: "Mực khô một nắng",
      cat: "Thủy sản",
      price: 350_000_000,
      unit: "Tấn",
      weight: 1000,
      hs: "0307.43",
      desc: "Mực khô Phan Thiết phơi một nắng",
    },
    // Dệt may
    {
      sku: "DM-VAI-001",
      name: "Vải cotton dệt thoi 40s",
      cat: "Dệt may",
      price: 95_000_000,
      unit: "Tấn",
      weight: 500,
      hs: "5208.21",
      desc: "Vải cotton 100% khổ 150cm",
    },
    {
      sku: "DM-SOI-001",
      name: "Sợi polyester DTY 150D",
      cat: "Dệt may",
      price: 42_000_000,
      unit: "Tấn",
      weight: 500,
      hs: "5402.47",
      desc: "Sợi polyester kéo giãn dùng dệt kim",
    },
    {
      sku: "DM-AO-001",
      name: "Áo sơ mi nam 100% cotton",
      cat: "Dệt may",
      price: 180_000,
      unit: "Chiếc",
      weight: 0.3,
      hs: "6205.20",
      desc: "Áo sơ mi công sở xuất khẩu thị trường Nhật",
    },
    {
      sku: "DM-QUA-001",
      name: "Quần jean denim 12oz",
      cat: "Dệt may",
      price: 250_000,
      unit: "Chiếc",
      weight: 0.7,
      hs: "6203.42",
      desc: "Quần jeans nam denim 12oz xuất khẩu",
    },
    // Điện tử
    {
      sku: "DT-DT-001",
      name: "Điện thoại Samsung A35",
      cat: "Điện tử",
      price: 7_500_000,
      unit: "Chiếc",
      weight: 0.19,
      hs: "8517.12",
      desc: "Samsung Galaxy A35 5G 128GB, hàng mới 100%",
    },
    {
      sku: "DT-LAP-001",
      name: "Laptop Dell Vostro 3520",
      cat: "Điện tử",
      price: 18_000_000,
      unit: "Chiếc",
      weight: 1.8,
      hs: "8471.30",
      desc: "Core i5-1235U, 8GB RAM, 512GB SSD",
    },
    {
      sku: "DT-TAI-001",
      name: "Tai nghe TWS JBL Tune",
      cat: "Điện tử",
      price: 800_000,
      unit: "Chiếc",
      weight: 0.05,
      hs: "8518.30",
      desc: "Tai nghe không dây true wireless, chống ồn",
    },
    {
      sku: "DT-SAC-001",
      name: "Sạc dự phòng Anker 10000mAh",
      cat: "Điện tử",
      price: 450_000,
      unit: "Chiếc",
      weight: 0.22,
      hs: "8507.60",
      desc: "Sạc nhanh 22.5W, 2 cổng USB-A + USB-C",
    },
    // Gỗ
    {
      sku: "GO-MDF-001",
      name: "Tấm gỗ MDF 18mm 1220x2440",
      cat: "Nông sản",
      price: 5_200_000,
      unit: "Tờ",
      weight: 45,
      hs: "4411.12",
      desc: "Gỗ MDF công nghiệp chống ẩm phủ melamine",
    },
    {
      sku: "GO-PLY-001",
      name: "Ván ép Birch BB/CC 18mm",
      cat: "Nông sản",
      price: 8_000_000,
      unit: "Tờ",
      weight: 50,
      hs: "4412.31",
      desc: "Ván ép birch nhập khẩu 9 lớp, phủ veneer",
    },
  ]

  const productMap: Record<string, string> = {}
  for (const p of productData) {
    const rec = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        description: p.desc,
        categoryId: catMap[p.cat]!,
        unitPrice: p.price,
        unit: p.unit,
        weight: p.weight,
        hsCode: p.hs,
      },
    })
    productMap[p.sku] = rec.id
  }
  console.log("✅ Products (30) created")

  // ── 6. Customers (20) ─────────────────────────────────────────────────────
  const customerData = [
    // TP.HCM
    {
      name: "Cty TNHH XNK Phú Lộc",
      email: "phloc@xnk.vn",
      phone: "0281234001",
      addr: { line1: "12 Đinh Tiên Hoàng", district: "Quận 1", city: "TP.HCM" },
    },
    {
      name: "Cty CP Thủy sản Biển Đông",
      email: "biendong@seafood.vn",
      phone: "0281234002",
      addr: { line1: "88 Bến Vân Đồn", district: "Quận 4", city: "TP.HCM" },
    },
    {
      name: "Cty CP Dệt may Phương Nam",
      email: "pnam@textile.vn",
      phone: "0281234003",
      addr: { line1: "24 Trường Chinh", district: "Tân Bình", city: "TP.HCM" },
    },
    {
      name: "Cty TNHH Nông sản Mekong",
      email: "mekong@nongsan.vn",
      phone: "0281234004",
      addr: { line1: "45 Hùng Vương", district: "Quận 5", city: "TP.HCM" },
    },
    {
      name: "Cty CP Điện tử Sài Gòn Tech",
      email: "sgtech@electronics.vn",
      phone: "0281234005",
      addr: {
        line1: "300 Nguyễn Văn Linh",
        district: "Quận 7",
        city: "TP.HCM",
      },
    },
    {
      name: "Nguyễn Văn Bình",
      email: "nvbinh@gmail.com",
      phone: "0901234006",
      addr: { line1: "55 Lý Tự Trọng", district: "Quận 1", city: "TP.HCM" },
    },
    {
      name: "Cty TNHH Logistic ABC",
      email: "abc@logistics.vn",
      phone: "0281234007",
      addr: {
        line1: "200 Nguyễn Thị Minh Khai",
        district: "Quận 3",
        city: "TP.HCM",
      },
    },
    {
      name: "Trần Thị Kim Anh",
      email: "kimanh.tran@mail.vn",
      phone: "0909234008",
      addr: {
        line1: "18 Phan Xích Long",
        district: "Phú Nhuận",
        city: "TP.HCM",
      },
    },
    // Hà Nội
    {
      name: "Cty CP Xuất khẩu Hà Thành",
      email: "hathanh@export.vn",
      phone: "0241234009",
      addr: {
        line1: "36 Lý Thường Kiệt",
        district: "Hoàn Kiếm",
        city: "Hà Nội",
      },
    },
    {
      name: "Cty TNHH Gạo Việt Hưng",
      email: "viethung@rice.vn",
      phone: "0241234010",
      addr: { line1: "15 Kim Ngưu", district: "Hai Bà Trưng", city: "Hà Nội" },
    },
    {
      name: "Cty CP Thực phẩm Hương Sen",
      email: "huongsen@food.vn",
      phone: "0241234011",
      addr: { line1: "78 Bạch Mai", district: "Hai Bà Trưng", city: "Hà Nội" },
    },
    {
      name: "Phạm Tuấn Anh",
      email: "ptanh@gmail.com",
      phone: "0983234012",
      addr: { line1: "10 Ngõ Huyện", district: "Hoàn Kiếm", city: "Hà Nội" },
    },
    {
      name: "Cty TNHH TM Đại Dương",
      email: "daiduong@trade.vn",
      phone: "0241234013",
      addr: { line1: "52 Trần Quý Cáp", district: "Đống Đa", city: "Hà Nội" },
    },
    {
      name: "Lê Thị Hoàng Yến",
      email: "hyen.le@email.vn",
      phone: "0912234014",
      addr: { line1: "23 Đội Cấn", district: "Ba Đình", city: "Hà Nội" },
    },
    {
      name: "Cty CP Cao su Hà Nội",
      email: "hanoi@rubber.vn",
      phone: "0241234015",
      addr: { line1: "99 Giải Phóng", district: "Hoàng Mai", city: "Hà Nội" },
    },
    // Đà Nẵng
    {
      name: "Cty TNHH Hải sản Bình Nguyên",
      email: "binhnguyen@seafood.vn",
      phone: "0236234016",
      addr: { line1: "40 Lê Duẩn", district: "Hải Châu", city: "Đà Nẵng" },
    },
    {
      name: "Cty CP XNK Miền Trung",
      email: "mientrung@xnk.vn",
      phone: "0236234017",
      addr: {
        line1: "112 Nguyễn Văn Linh",
        district: "Thanh Khê",
        city: "Đà Nẵng",
      },
    },
    {
      name: "Hoàng Minh Tuấn",
      email: "hmtuan@danang.vn",
      phone: "0905234018",
      addr: {
        line1: "7 Phan Châu Trinh",
        district: "Hải Châu",
        city: "Đà Nẵng",
      },
    },
    // Cần Thơ
    {
      name: "Cty TNHH Lương thực Cần Thơ",
      email: "cantho@luongthuc.vn",
      phone: "0292234019",
      addr: { line1: "25 Hòa Bình", district: "Ninh Kiều", city: "Cần Thơ" },
    },
    // Hải Phòng
    {
      name: "Cty CP Cảng Đình Vũ",
      email: "dinhvu@port.vn",
      phone: "0225234020",
      addr: { line1: "18 Trần Phú", district: "Ngô Quyền", city: "Hải Phòng" },
    },
  ]

  const customerIds: string[] = []
  for (const c of customerData) {
    const existing = await prisma.customer.findUnique({
      where: { email: c.email },
    })
    if (existing) {
      customerIds.push(existing.id)
      continue
    }
    const rec = await prisma.customer.create({
      data: {
        fullName: c.name,
        email: c.email,
        phone: c.phone,
        addresses: {
          create: [{ ...c.addr, ward: undefined, isDefault: true }],
        },
      },
    })
    customerIds.push(rec.id)
  }
  console.log("✅ Customers (20) created")

  // ── 7. Inventory ──────────────────────────────────────────────────────────
  // Product × Warehouse pairings (realistic — not full cross-join)
  const wCLai = warehouses["CLai"]!
  const wICD = warehouses["ICD-LB"]!
  const wSThan = warehouses["SThan"]!
  const wNBai = warehouses["NBai"]!
  const wHPg = warehouses["HPg"]!
  const wTSa = warehouses["TSa"]!

  const inventoryPairs: {
    sku: string
    wCode: string
    stock: number
    reserved: number
    low: number
  }[] = [
    // Gạo — kho miền Nam là chính
    {
      sku: "RICE-ST25-001",
      wCode: "CLai",
      stock: 1500,
      reserved: 80,
      low: 200,
    },
    {
      sku: "RICE-ST25-001",
      wCode: "SThan",
      stock: 800,
      reserved: 50,
      low: 200,
    },
    // ⚠️ LOW STOCK: gạo ST25 kho Nội Bài sắp hết (35 < 50)
    { sku: "RICE-ST25-001", wCode: "NBai", stock: 35, reserved: 20, low: 50 },
    { sku: "RICE-JAS-002", wCode: "CLai", stock: 600, reserved: 30, low: 100 },
    // ⚠️ LOW STOCK: gạo Jasmine cảng Hải Phòng cạn (60 < 80)
    { sku: "RICE-JAS-002", wCode: "HPg", stock: 60, reserved: 20, low: 80 },
    { sku: "RICE-NAH-003", wCode: "CLai", stock: 900, reserved: 40, low: 150 },
    { sku: "RICE-OM5451", wCode: "CLai", stock: 2000, reserved: 100, low: 300 },
    { sku: "RICE-OM5451", wCode: "SThan", stock: 500, reserved: 30, low: 80 },
    { sku: "SAN-LAT-001", wCode: "CLai", stock: 3000, reserved: 200, low: 500 },
    // Cà phê
    { sku: "CF-ROB-001", wCode: "CLai", stock: 400, reserved: 60, low: 80 },
    // ⚠️ LOW STOCK: Robusta ICD Long Bình tồn ít (20 < 30)
    { sku: "CF-ROB-001", wCode: "ICD-LB", stock: 20, reserved: 5, low: 30 },
    // ⚠️ LOW STOCK: Arabica Cầu Đất sắp cạn (14 < 20)
    { sku: "CF-ARA-002", wCode: "CLai", stock: 14, reserved: 8, low: 20 },
    // ⚠️ LOW STOCK: Cà phê Chari Sơn La gần hết (8 < 15)
    { sku: "CF-CHA-003", wCode: "NBai", stock: 8, reserved: 3, low: 15 },
    // Điều & Cacao
    { sku: "CA-DIE-001", wCode: "CLai", stock: 300, reserved: 40, low: 60 },
    // ⚠️ LOW STOCK: điều W320 ICD cạn (18 < 25)
    { sku: "CA-DIE-001", wCode: "ICD-LB", stock: 18, reserved: 8, low: 25 },
    // ⚠️ LOW STOCK: điều rang muối tồn kho thấp (8 < 15)
    { sku: "CA-DIE-002", wCode: "CLai", stock: 8, reserved: 2, low: 15 },
    { sku: "CA-CAO-001", wCode: "CLai", stock: 200, reserved: 30, low: 40 },
    // Cao su, Tiêu
    { sku: "NN-CAO-001", wCode: "CLai", stock: 500, reserved: 50, low: 80 },
    // ⚠️ LOW STOCK: hồ tiêu đen Phú Quốc (6 < 12)
    { sku: "NN-HO-001", wCode: "CLai", stock: 6, reserved: 2, low: 12 },
    // ⚠️ LOW STOCK: hồ tiêu kho Nội Bài gần hết (3 < 8)
    { sku: "NN-HO-001", wCode: "NBai", stock: 3, reserved: 0, low: 8 },
    // Phân bón, Dầu nhờn
    { sku: "PT-PHN-001", wCode: "CLai", stock: 2000, reserved: 100, low: 300 },
    { sku: "PT-PHN-001", wCode: "HPg", stock: 800, reserved: 50, low: 150 },
    { sku: "PT-DAU-001", wCode: "SThan", stock: 300, reserved: 20, low: 50 },
    // Thủy sản — kho lạnh (dùng CFS gần nhất)
    { sku: "TS-TOM-001", wCode: "CLai", stock: 200, reserved: 30, low: 40 },
    // ⚠️ LOW STOCK: tôm sú cảng Tiên Sa gần hết (14 < 20)
    { sku: "TS-TOM-001", wCode: "TSa", stock: 14, reserved: 8, low: 20 },
    { sku: "TS-TOM-002", wCode: "CLai", stock: 300, reserved: 50, low: 60 },
    // ⚠️ LOW STOCK: cá tra philê Cát Lái tồn thấp (82 < 100)
    { sku: "TS-CAT-001", wCode: "CLai", stock: 82, reserved: 40, low: 100 },
    { sku: "TS-CAT-002", wCode: "CLai", stock: 400, reserved: 60, low: 80 },
    // ⚠️ LOW STOCK: mực khô Cát Lái gần hết (5 < 8)
    { sku: "TS-MUC-001", wCode: "CLai", stock: 5, reserved: 2, low: 8 },
    // ⚠️ LOW STOCK: mực khô Tiên Sa cực thấp (2 < 5)
    { sku: "TS-MUC-001", wCode: "TSa", stock: 2, reserved: 0, low: 5 },
    // Dệt may
    // ⚠️ LOW STOCK: vải cotton Sóng Thần tồn thấp (72 < 100)
    { sku: "DM-VAI-001", wCode: "SThan", stock: 72, reserved: 30, low: 100 },
    // ⚠️ LOW STOCK: sợi polyester tồn thấp (58 < 80)
    { sku: "DM-SOI-001", wCode: "SThan", stock: 58, reserved: 20, low: 80 },
    { sku: "DM-AO-001", wCode: "SThan", stock: 5000, reserved: 200, low: 500 },
    { sku: "DM-AO-001", wCode: "NBai", stock: 2000, reserved: 80, low: 200 },
    { sku: "DM-QUA-001", wCode: "SThan", stock: 4000, reserved: 150, low: 400 },
    // Điện tử
    { sku: "DT-DT-001", wCode: "SThan", stock: 2000, reserved: 100, low: 200 },
    { sku: "DT-DT-001", wCode: "NBai", stock: 800, reserved: 50, low: 100 },
    // ⚠️ LOW STOCK: Dell Vostro 3520 tồn kho thấp (38 < 60)
    { sku: "DT-LAP-001", wCode: "SThan", stock: 38, reserved: 15, low: 60 },
    { sku: "DT-TAI-001", wCode: "SThan", stock: 3000, reserved: 150, low: 300 },
    { sku: "DT-SAC-001", wCode: "SThan", stock: 4000, reserved: 200, low: 400 },
    // Gỗ
    { sku: "GO-MDF-001", wCode: "ICD-LB", stock: 500, reserved: 30, low: 60 },
    // ⚠️ LOW STOCK: ván ép birch Hải Phòng tồn thấp (28 < 40)
    { sku: "GO-PLY-001", wCode: "HPg", stock: 28, reserved: 10, low: 40 },
  ]

  const inventoryMap: Record<string, string> = {}
  for (const p of inventoryPairs) {
    const prodId = productMap[p.sku]
    const whId = warehouses[p.wCode]
    if (!prodId || !whId) continue
    const rec = await prisma.inventory.upsert({
      where: {
        productId_warehouseId: { productId: prodId, warehouseId: whId },
      },
      update: { stock: p.stock, reserved: p.reserved, lowThreshold: p.low },
      create: {
        productId: prodId,
        warehouseId: whId,
        stock: p.stock,
        reserved: p.reserved,
        lowThreshold: p.low,
      },
    })
    inventoryMap[`${p.sku}-${p.wCode}`] = rec.id
  }
  console.log("✅ Inventory (43 records) created — 15 low-stock alerts")

  // ── 8. Stock Movements (history) ──────────────────────────────────────────
  const movementData = [
    {
      key: "RICE-ST25-001-CLai",
      type: "INBOUND",
      qty: 500,
      reason: "Nhập lô gạo ST25 tháng 5 từ An Giang",
      ref: "PO-2026-051",
      daysA: 25,
    },
    {
      key: "CF-ROB-001-CLai",
      type: "INBOUND",
      qty: 200,
      reason: "Nhập cà phê Robusta lô xuất khẩu EU",
      ref: "PO-2026-052",
      daysA: 22,
    },
    {
      key: "TS-TOM-001-CLai",
      type: "INBOUND",
      qty: 80,
      reason: "Nhập tôm sú từ nhà máy Minh Phú",
      ref: "PO-2026-053",
      daysA: 20,
    },
    {
      key: "DT-DT-001-SThan",
      type: "INBOUND",
      qty: 500,
      reason: "Nhập Samsung A35 lô Q2-2026",
      ref: "PO-2026-054",
      daysA: 18,
    },
    {
      key: "DM-AO-001-SThan",
      type: "INBOUND",
      qty: 2000,
      reason: "Nhập áo sơ mi lô hàng xuất Nhật",
      ref: "PO-2026-055",
      daysA: 16,
    },
    {
      key: "RICE-ST25-001-CLai",
      type: "OUTBOUND",
      qty: -50,
      reason: "Xuất cho đơn VN20260520001 (Maersk/EU)",
      ref: "VN20260520001",
      daysA: 15,
    },
    {
      key: "CF-ROB-001-CLai",
      type: "OUTBOUND",
      qty: -30,
      reason: "Xuất cho đơn VN20260521002 (Maersk/EU)",
      ref: "VN20260521002",
      daysA: 14,
    },
    {
      key: "TS-TOM-001-CLai",
      type: "OUTBOUND",
      qty: -15,
      reason: "Xuất cho đơn VN20260522003 (Air/Nhật)",
      ref: "VN20260522003",
      daysA: 13,
    },
    {
      key: "CA-DIE-001-CLai",
      type: "INBOUND",
      qty: 100,
      reason: "Nhập điều W320 từ Bình Phước",
      ref: "PO-2026-056",
      daysA: 12,
    },
    {
      key: "PT-PHN-001-CLai",
      type: "INBOUND",
      qty: 500,
      reason: "Nhập phân urea Cà Mau quý 2",
      ref: "PO-2026-057",
      daysA: 11,
    },
    {
      key: "RICE-JAS-002-CLai",
      type: "OUTBOUND",
      qty: -20,
      reason: "Xuất gạo Jasmine cho khách Malaysia",
      ref: "VN20260525004",
      daysA: 10,
    },
    {
      key: "DT-LAP-001-SThan",
      type: "INBOUND",
      qty: 100,
      reason: "Nhập Dell Vostro 3520 từ FPT Retail",
      ref: "PO-2026-058",
      daysA: 9,
    },
    {
      key: "TS-CAT-001-CLai",
      type: "OUTBOUND",
      qty: -80,
      reason: "Xuất cá tra cho đơn Mỹ",
      ref: "VN20260527005",
      daysA: 8,
    },
    {
      key: "DM-VAI-001-SThan",
      type: "INBOUND",
      qty: 200,
      reason: "Nhập vải cotton từ Thái Lan",
      ref: "PO-2026-059",
      daysA: 7,
    },
    {
      key: "NN-CAO-001-CLai",
      type: "OUTBOUND",
      qty: -50,
      reason: "Xuất cao su RSS3 sang Malaysia",
      ref: "VN20260529006",
      daysA: 6,
    },
    {
      key: "CF-ARA-002-CLai",
      type: "ADJUSTMENT",
      qty: -3,
      reason: "Kiểm kê phát hiện hàng ẩm mốc xử lý",
      ref: "AUDIT-062601",
      daysA: 5,
    },
    {
      key: "DT-TAI-001-SThan",
      type: "INBOUND",
      qty: 1000,
      reason: "Nhập tai nghe JBL lô mới",
      ref: "PO-2026-060",
      daysA: 5,
    },
    {
      key: "RICE-ST25-001-NBai",
      type: "INBOUND",
      qty: 100,
      reason: "Chuyển gạo từ kho CLai ra NBai",
      ref: "TRANS-0626",
      daysA: 4,
    },
    {
      key: "PT-PHN-001-HPg",
      type: "INBOUND",
      qty: 200,
      reason: "Nhập phân urea qua cảng Hải Phòng",
      ref: "PO-2026-061",
      daysA: 4,
    },
    {
      key: "DM-QUA-001-SThan",
      type: "OUTBOUND",
      qty: -100,
      reason: "Xuất quần jean cho đơn xuất EU",
      ref: "VN20260612007",
      daysA: 3,
    },
    {
      key: "TS-MUC-001-CLai",
      type: "OUTBOUND",
      qty: -5,
      reason: "Xuất mực khô cho đơn Nhật Bản",
      ref: "VN20260613008",
      daysA: 2,
    },
    {
      key: "CA-CAO-001-CLai",
      type: "OUTBOUND",
      qty: -20,
      reason: "Xuất cacao cho đơn Bỉ",
      ref: "VN20260614009",
      daysA: 2,
    },
    {
      key: "DT-DT-001-NBai",
      type: "INBOUND",
      qty: 300,
      reason: "Chuyển Samsung A35 từ kho SThan ra HN",
      ref: "TRANS-0616",
      daysA: 1,
    },
    {
      key: "TS-TOM-002-CLai",
      type: "INBOUND",
      qty: 100,
      reason: "Nhập tôm thẻ từ nhà máy Stapimex",
      ref: "PO-2026-062",
      daysA: 1,
    },
    {
      key: "GO-MDF-001-ICD-LB",
      type: "INBOUND",
      qty: 100,
      reason: "Nhập gỗ MDF từ Malaysia qua cảng",
      ref: "PO-2026-063",
      daysA: 0,
    },
  ]

  for (const m of movementData) {
    const invId = inventoryMap[m.key]
    if (!invId) continue
    await prisma.stockMovement.create({
      data: {
        inventoryId: invId,
        type: m.type as any,
        quantity: m.qty,
        reason: m.reason,
        referenceNo: m.ref,
        performedById: m.qty > 0 ? staff.id : admin.id,
        createdAt: daysAgo(m.daysA),
      },
    })
  }
  console.log("✅ Stock movements (25) created")

  // ── 9. Orders (100) ───────────────────────────────────────────────────────

  const getCustomer = (i: number) => customerIds[i % customerIds.length]!

  type OrderDef = {
    custIdx: number
    status: string
    items: { sku: string; qty: number }[]
    daysAgo: number
    hasShipment?: boolean
    shipMode?: string
    carrier?: string
    multimodal?: boolean
  }

  const STATUSES_DIST = [
    ...Array(10).fill("PENDING"),
    ...Array(10).fill("CONFIRMED"),
    ...Array(8).fill("PACKED"),
    ...Array(25).fill("IN_TRANSIT"),
    ...Array(12).fill("OUT_FOR_DELIVERY"),
    ...Array(25).fill("DELIVERED"),
    ...Array(5).fill("RETURNED"),
    ...Array(5).fill("CANCELLED"),
  ]

  const orderDefs: OrderDef[] = [
    // PENDING (10)
    {
      custIdx: 0,
      status: "PENDING",
      items: [
        { sku: "RICE-ST25-001", qty: 50 },
        { sku: "CF-ROB-001", qty: 10 },
      ],
      daysAgo: 0,
    },
    {
      custIdx: 1,
      status: "PENDING",
      items: [{ sku: "TS-TOM-001", qty: 20 }],
      daysAgo: 0,
    },
    {
      custIdx: 2,
      status: "PENDING",
      items: [{ sku: "DM-AO-001", qty: 500 }],
      daysAgo: 1,
    },
    {
      custIdx: 3,
      status: "PENDING",
      items: [
        { sku: "CA-DIE-001", qty: 15 },
        { sku: "CA-CAO-001", qty: 8 },
      ],
      daysAgo: 1,
    },
    {
      custIdx: 4,
      status: "PENDING",
      items: [{ sku: "DT-DT-001", qty: 50 }],
      daysAgo: 1,
    },
    {
      custIdx: 5,
      status: "PENDING",
      items: [{ sku: "PT-PHN-001", qty: 100 }],
      daysAgo: 2,
    },
    {
      custIdx: 6,
      status: "PENDING",
      items: [{ sku: "TS-CAT-001", qty: 30 }],
      daysAgo: 2,
    },
    {
      custIdx: 7,
      status: "PENDING",
      items: [
        { sku: "RICE-JAS-002", qty: 40 },
        { sku: "RICE-NAH-003", qty: 20 },
      ],
      daysAgo: 2,
    },
    {
      custIdx: 8,
      status: "PENDING",
      items: [{ sku: "DT-LAP-001", qty: 20 }],
      daysAgo: 3,
    },
    {
      custIdx: 9,
      status: "PENDING",
      items: [{ sku: "GO-MDF-001", qty: 50 }],
      daysAgo: 3,
    },
    // CONFIRMED (10)
    {
      custIdx: 10,
      status: "CONFIRMED",
      items: [{ sku: "CF-ARA-002", qty: 5 }],
      daysAgo: 3,
    },
    {
      custIdx: 11,
      status: "CONFIRMED",
      items: [{ sku: "TS-TOM-002", qty: 25 }],
      daysAgo: 4,
    },
    {
      custIdx: 12,
      status: "CONFIRMED",
      items: [{ sku: "DM-VAI-001", qty: 10 }],
      daysAgo: 4,
    },
    {
      custIdx: 13,
      status: "CONFIRMED",
      items: [{ sku: "DT-TAI-001", qty: 200 }],
      daysAgo: 4,
    },
    {
      custIdx: 14,
      status: "CONFIRMED",
      items: [{ sku: "RICE-OM5451", qty: 80 }],
      daysAgo: 5,
    },
    {
      custIdx: 15,
      status: "CONFIRMED",
      items: [{ sku: "CA-DIE-002", qty: 12 }],
      daysAgo: 5,
    },
    {
      custIdx: 16,
      status: "CONFIRMED",
      items: [{ sku: "TS-MUC-001", qty: 3 }],
      daysAgo: 5,
    },
    {
      custIdx: 17,
      status: "CONFIRMED",
      items: [{ sku: "NN-CAO-001", qty: 20 }],
      daysAgo: 6,
    },
    {
      custIdx: 18,
      status: "CONFIRMED",
      items: [{ sku: "DT-SAC-001", qty: 500 }],
      daysAgo: 6,
    },
    {
      custIdx: 19,
      status: "CONFIRMED",
      items: [{ sku: "GO-PLY-001", qty: 30 }],
      daysAgo: 6,
    },
    // PACKED (8)
    {
      custIdx: 0,
      status: "PACKED",
      items: [{ sku: "TS-CAT-002", qty: 40 }],
      daysAgo: 7,
    },
    {
      custIdx: 1,
      status: "PACKED",
      items: [{ sku: "DM-QUA-001", qty: 300 }],
      daysAgo: 7,
    },
    {
      custIdx: 2,
      status: "PACKED",
      items: [
        { sku: "RICE-ST25-001", qty: 30 },
        { sku: "CF-ROB-001", qty: 5 },
      ],
      daysAgo: 8,
    },
    {
      custIdx: 3,
      status: "PACKED",
      items: [{ sku: "DT-DT-001", qty: 80 }],
      daysAgo: 8,
    },
    {
      custIdx: 4,
      status: "PACKED",
      items: [{ sku: "PT-PHN-001", qty: 200 }],
      daysAgo: 9,
    },
    {
      custIdx: 5,
      status: "PACKED",
      items: [{ sku: "NN-HO-001", qty: 8 }],
      daysAgo: 9,
    },
    {
      custIdx: 6,
      status: "PACKED",
      items: [{ sku: "TS-TOM-001", qty: 10 }],
      daysAgo: 10,
    },
    {
      custIdx: 7,
      status: "PACKED",
      items: [{ sku: "CA-CAO-001", qty: 6 }],
      daysAgo: 10,
    },
    // IN_TRANSIT (25)
    {
      custIdx: 8,
      status: "IN_TRANSIT",
      items: [{ sku: "RICE-ST25-001", qty: 100 }],
      daysAgo: 10,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 9,
      status: "IN_TRANSIT",
      items: [{ sku: "CF-ROB-001", qty: 20 }],
      daysAgo: 11,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 10,
      status: "IN_TRANSIT",
      items: [{ sku: "TS-TOM-001", qty: 15 }],
      daysAgo: 11,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 11,
      status: "IN_TRANSIT",
      items: [{ sku: "DM-AO-001", qty: 1000 }],
      daysAgo: 12,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
      multimodal: true,
    },
    {
      custIdx: 12,
      status: "IN_TRANSIT",
      items: [{ sku: "CA-DIE-001", qty: 25 }],
      daysAgo: 12,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 13,
      status: "IN_TRANSIT",
      items: [{ sku: "TS-CAT-001", qty: 60 }],
      daysAgo: 13,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 14,
      status: "IN_TRANSIT",
      items: [{ sku: "DT-LAP-001", qty: 30 }],
      daysAgo: 13,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
      multimodal: true,
    },
    {
      custIdx: 15,
      status: "IN_TRANSIT",
      items: [{ sku: "RICE-JAS-002", qty: 50 }],
      daysAgo: 14,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 16,
      status: "IN_TRANSIT",
      items: [{ sku: "NN-CAO-001", qty: 30 }],
      daysAgo: 14,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 17,
      status: "IN_TRANSIT",
      items: [{ sku: "DM-QUA-001", qty: 500 }],
      daysAgo: 14,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
      multimodal: true,
    },
    {
      custIdx: 18,
      status: "IN_TRANSIT",
      items: [{ sku: "PT-PHN-001", qty: 300 }],
      daysAgo: 15,
      hasShipment: true,
      shipMode: "ROAD",
      carrier: "VTP",
    },
    {
      custIdx: 19,
      status: "IN_TRANSIT",
      items: [{ sku: "DT-DT-001", qty: 100 }],
      daysAgo: 15,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 0,
      status: "IN_TRANSIT",
      items: [{ sku: "SAN-LAT-001", qty: 500 }],
      daysAgo: 16,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 1,
      status: "IN_TRANSIT",
      items: [{ sku: "CF-CHA-003", qty: 10 }],
      daysAgo: 16,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
      multimodal: true,
    },
    {
      custIdx: 2,
      status: "IN_TRANSIT",
      items: [{ sku: "GO-MDF-001", qty: 80 }],
      daysAgo: 17,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 3,
      status: "IN_TRANSIT",
      items: [{ sku: "TS-TOM-002", qty: 30 }],
      daysAgo: 17,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 4,
      status: "IN_TRANSIT",
      items: [{ sku: "DM-VAI-001", qty: 15 }],
      daysAgo: 18,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
      multimodal: true,
    },
    {
      custIdx: 5,
      status: "IN_TRANSIT",
      items: [{ sku: "NN-HO-001", qty: 5 }],
      daysAgo: 18,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 6,
      status: "IN_TRANSIT",
      items: [{ sku: "CA-CAO-001", qty: 15 }],
      daysAgo: 19,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 7,
      status: "IN_TRANSIT",
      items: [{ sku: "RICE-NAH-003", qty: 60 }],
      daysAgo: 19,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 8,
      status: "IN_TRANSIT",
      items: [{ sku: "DT-TAI-001", qty: 300 }],
      daysAgo: 20,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
      multimodal: true,
    },
    {
      custIdx: 9,
      status: "IN_TRANSIT",
      items: [{ sku: "DT-SAC-001", qty: 600 }],
      daysAgo: 20,
      hasShipment: true,
      shipMode: "ROAD",
      carrier: "GHN",
    },
    // OUT_FOR_DELIVERY (12)
    {
      custIdx: 10,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "DT-DT-001", qty: 20 }],
      daysAgo: 20,
    },
    {
      custIdx: 11,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "TS-CAT-001", qty: 10 }],
      daysAgo: 21,
      hasShipment: true,
      shipMode: "ROAD",
      carrier: "GHN",
    },
    {
      custIdx: 12,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "CF-ROB-001", qty: 8 }],
      daysAgo: 21,
    },
    {
      custIdx: 13,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "DM-AO-001", qty: 200 }],
      daysAgo: 22,
    },
    {
      custIdx: 14,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "RICE-ST25-001", qty: 20 }],
      daysAgo: 22,
      hasShipment: true,
      shipMode: "ROAD",
      carrier: "VTP",
    },
    {
      custIdx: 15,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "DT-LAP-001", qty: 5 }],
      daysAgo: 22,
    },
    {
      custIdx: 16,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "CA-DIE-002", qty: 4 }],
      daysAgo: 23,
    },
    {
      custIdx: 17,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "TS-TOM-002", qty: 8 }],
      daysAgo: 23,
      hasShipment: true,
      shipMode: "ROAD",
      carrier: "GHN",
    },
    {
      custIdx: 18,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "GO-PLY-001", qty: 10 }],
      daysAgo: 24,
    },
    {
      custIdx: 19,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "DM-QUA-001", qty: 100 }],
      daysAgo: 24,
    },
    {
      custIdx: 0,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "PT-PHN-001", qty: 80 }],
      daysAgo: 25,
    },
    {
      custIdx: 1,
      status: "OUT_FOR_DELIVERY",
      items: [{ sku: "DT-TAI-001", qty: 100 }],
      daysAgo: 25,
    },
    // DELIVERED (25)
    {
      custIdx: 2,
      status: "DELIVERED",
      items: [{ sku: "RICE-ST25-001", qty: 30 }],
      daysAgo: 25,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 3,
      status: "DELIVERED",
      items: [{ sku: "TS-TOM-001", qty: 12 }],
      daysAgo: 26,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 4,
      status: "DELIVERED",
      items: [{ sku: "CF-ROB-001", qty: 15 }],
      daysAgo: 26,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 5,
      status: "DELIVERED",
      items: [{ sku: "DM-AO-001", qty: 300 }],
      daysAgo: 27,
    },
    {
      custIdx: 6,
      status: "DELIVERED",
      items: [{ sku: "CA-DIE-001", qty: 10 }],
      daysAgo: 27,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
      multimodal: true,
    },
    {
      custIdx: 7,
      status: "DELIVERED",
      items: [{ sku: "DT-DT-001", qty: 40 }],
      daysAgo: 28,
    },
    {
      custIdx: 8,
      status: "DELIVERED",
      items: [{ sku: "TS-CAT-001", qty: 50 }],
      daysAgo: 28,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 9,
      status: "DELIVERED",
      items: [{ sku: "RICE-JAS-002", qty: 25 }],
      daysAgo: 29,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 10,
      status: "DELIVERED",
      items: [{ sku: "NN-CAO-001", qty: 18 }],
      daysAgo: 29,
    },
    {
      custIdx: 11,
      status: "DELIVERED",
      items: [{ sku: "DM-VAI-001", qty: 8 }],
      daysAgo: 30,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 12,
      status: "DELIVERED",
      items: [{ sku: "DT-LAP-001", qty: 15 }],
      daysAgo: 30,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
      multimodal: true,
    },
    {
      custIdx: 13,
      status: "DELIVERED",
      items: [{ sku: "PT-PHN-001", qty: 150 }],
      daysAgo: 31,
    },
    {
      custIdx: 14,
      status: "DELIVERED",
      items: [{ sku: "CA-CAO-001", qty: 10 }],
      daysAgo: 31,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 15,
      status: "DELIVERED",
      items: [{ sku: "RICE-OM5451", qty: 60 }],
      daysAgo: 32,
      hasShipment: true,
      shipMode: "ROAD",
      carrier: "VTP",
    },
    {
      custIdx: 16,
      status: "DELIVERED",
      items: [{ sku: "DM-QUA-001", qty: 200 }],
      daysAgo: 32,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
      multimodal: true,
    },
    {
      custIdx: 17,
      status: "DELIVERED",
      items: [{ sku: "DT-TAI-001", qty: 150 }],
      daysAgo: 33,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 18,
      status: "DELIVERED",
      items: [{ sku: "GO-MDF-001", qty: 30 }],
      daysAgo: 33,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 19,
      status: "DELIVERED",
      items: [{ sku: "SAN-LAT-001", qty: 200 }],
      daysAgo: 34,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "ONE",
    },
    {
      custIdx: 0,
      status: "DELIVERED",
      items: [{ sku: "TS-TOM-002", qty: 20 }],
      daysAgo: 35,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 1,
      status: "DELIVERED",
      items: [{ sku: "CF-ARA-002", qty: 3 }],
      daysAgo: 35,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
      multimodal: true,
    },
    {
      custIdx: 2,
      status: "DELIVERED",
      items: [{ sku: "NN-HO-001", qty: 4 }],
      daysAgo: 36,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    {
      custIdx: 3,
      status: "DELIVERED",
      items: [{ sku: "DT-SAC-001", qty: 400 }],
      daysAgo: 36,
    },
    {
      custIdx: 4,
      status: "DELIVERED",
      items: [{ sku: "GO-PLY-001", qty: 20 }],
      daysAgo: 37,
      hasShipment: true,
      shipMode: "SEA",
      carrier: "MSK",
    },
    {
      custIdx: 5,
      status: "DELIVERED",
      items: [{ sku: "CF-CHA-003", qty: 6 }],
      daysAgo: 37,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
      multimodal: true,
    },
    {
      custIdx: 6,
      status: "DELIVERED",
      items: [{ sku: "TS-MUC-001", qty: 2 }],
      daysAgo: 38,
      hasShipment: true,
      shipMode: "AIR",
      carrier: "VAC",
    },
    // RETURNED (5)
    {
      custIdx: 7,
      status: "RETURNED",
      items: [{ sku: "DT-DT-001", qty: 10 }],
      daysAgo: 22,
    },
    {
      custIdx: 8,
      status: "RETURNED",
      items: [{ sku: "DM-AO-001", qty: 50 }],
      daysAgo: 25,
    },
    {
      custIdx: 9,
      status: "RETURNED",
      items: [{ sku: "RICE-ST25-001", qty: 5 }],
      daysAgo: 28,
    },
    {
      custIdx: 10,
      status: "RETURNED",
      items: [{ sku: "CA-DIE-001", qty: 2 }],
      daysAgo: 30,
    },
    {
      custIdx: 11,
      status: "RETURNED",
      items: [{ sku: "TS-CAT-001", qty: 8 }],
      daysAgo: 35,
    },
    // CANCELLED (5)
    {
      custIdx: 12,
      status: "CANCELLED",
      items: [{ sku: "DT-LAP-001", qty: 5 }],
      daysAgo: 15,
    },
    {
      custIdx: 13,
      status: "CANCELLED",
      items: [{ sku: "PT-PHN-001", qty: 200 }],
      daysAgo: 18,
    },
    {
      custIdx: 14,
      status: "CANCELLED",
      items: [{ sku: "TS-TOM-001", qty: 8 }],
      daysAgo: 20,
    },
    {
      custIdx: 15,
      status: "CANCELLED",
      items: [{ sku: "CF-ROB-001", qty: 3 }],
      daysAgo: 25,
    },
    {
      custIdx: 16,
      status: "CANCELLED",
      items: [{ sku: "DM-QUA-001", qty: 50 }],
      daysAgo: 30,
    },
  ]

  let orderCount = 0
  for (const def of orderDefs) {
    orderCount++
    const custId = getCustomer(def.custIdx)
    const baseTime = daysAgo(def.daysAgo)
    const paddedNum = String(orderCount).padStart(4, "0")
    const dateStr = baseTime.toISOString().slice(0, 10).replace(/-/g, "")
    const trackingNo = `VN${dateStr}${paddedNum}`

    const items = def.items.map((it) => {
      const unitPrice = productData.find((p) => p.sku === it.sku)?.price ?? 0
      const quantity = it.qty
      return {
        productId: productMap[it.sku]!,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
      }
    })
    const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)


    const order = await prisma.order.create({
      data: {
        trackingNo,
        customerId: custId,
        createdById: staff.id,
        status: def.status as any,
        totalAmount,
        shippingAddress:
          customerData[def.custIdx % customerData.length]!.addr.line1 +
          ", " +
          customerData[def.custIdx % customerData.length]!.addr.district +
          ", " +
          customerData[def.custIdx % customerData.length]!.addr.city,
        notes:
          orderCount % 5 === 0 ? "Giao ngoài giờ hành chính được" : undefined,
        createdAt: baseTime,
        updatedAt: baseTime,
        items: {
          create: items,
        },
      },
    })

    // Delivery history
    await makeDeliveryHistory(
      order.id,
      def.status,
      baseTime,
      def.status === "DELIVERED" ? admin.id : staff.id
    )

    // Shipment
    if (def.hasShipment && def.carrier && def.shipMode) {
      const carrierId = carriers[def.carrier]!
      const shipmentNo = `SHP-${dateStr}-${paddedNum}`
      const origin =
        def.carrier === "VAC"
          ? "Sân bay Tân Sơn Nhất, TP.HCM"
          : def.carrier === "GHN" || def.carrier === "VTP"
            ? "Kho Sóng Thần, Bình Dương"
            : "Cảng Cát Lái, TP.HCM"
      const destination =
        def.custIdx < 8
          ? "TP.HCM"
          : def.custIdx < 15
            ? "Hà Nội"
            : def.custIdx < 18
              ? "Đà Nẵng"
              : "Cần Thơ"

      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id,
          carrierId,
          shipmentNo,
          mode: def.multimodal ? "MULTIMODAL" : (def.shipMode as any),
          origin,
          destination,
          etaDate: addHours(baseTime, 96),
          actualDate:
            def.status === "DELIVERED" ? addHours(baseTime, 88) : undefined,
          cost:
            def.shipMode === "AIR"
              ? totalAmount * 0.08
              : def.shipMode === "SEA"
                ? totalAmount * 0.04
                : totalAmount * 0.02,
        },
      })

      if (def.multimodal) {
        // 3 legs: road → hub → main mode
        await prisma.transportLeg.createMany({
          data: [
            {
              shipmentId: shipment.id,
              sequence: 1,
              mode: "ROAD",
              fromPoint: "Kho Sóng Thần, Bình Dương",
              toPoint: origin,
              carrier: "Xe tải nội địa",
              startTime: baseTime,
              endTime: addHours(baseTime, 6),
              status: def.status === "DELIVERED" ? "COMPLETED" : "COMPLETED",
            },
            {
              shipmentId: shipment.id,
              sequence: 2,
              mode: def.shipMode === "AIR" ? "AIR" : ("SEA" as any),
              fromPoint: origin,
              toPoint:
                destination === "Hà Nội" ? "Sân bay Nội Bài" : "Cảng Hải Phòng",
              carrier: def.carrier,
              startTime: addHours(baseTime, 8),
              endTime: addHours(baseTime, 72),
              status:
                def.status === "DELIVERED"
                  ? "COMPLETED"
                  : def.status === "IN_TRANSIT"
                    ? "IN_PROGRESS"
                    : "PLANNED",
            },
            {
              shipmentId: shipment.id,
              sequence: 3,
              mode: "ROAD",
              fromPoint:
                destination === "Hà Nội" ? "Sân bay Nội Bài" : "Cảng Hải Phòng",
              toPoint: destination,
              carrier: "Viettel Post",
              startTime: addHours(baseTime, 74),
              endTime: addHours(baseTime, 88),
              status: def.status === "DELIVERED" ? "COMPLETED" : "PLANNED",
            },
          ],
        })
      } else {
        // Single leg
        await prisma.transportLeg.create({
          data: {
            shipmentId: shipment.id,
            sequence: 1,
            mode: def.shipMode as any,
            fromPoint: origin,
            toPoint: destination,
            carrier: def.carrier,
            startTime: addHours(baseTime, 8),
            endTime:
              def.status === "DELIVERED" ? addHours(baseTime, 80) : undefined,
            status:
              def.status === "DELIVERED"
                ? "COMPLETED"
                : def.status === "IN_TRANSIT"
                  ? "IN_PROGRESS"
                  : "PLANNED",
          },
        })
      }
    }

    if (orderCount % 10 === 0)
      console.log(`  📦 ${orderCount}/100 orders created...`)
  }

  console.log("✅ Orders (100) + deliveries + shipments created")
  console.log("\n🎉 Seed completed successfully!")
  console.log("\nLogin credentials:")
  console.log("  Admin:  admin@lclogistics.vn / Admin@123")
  console.log("  Staff:  staff@lclogistics.vn / Staff@123")
  console.log("  Customer: customer@lclogistics.vn / Cust@123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
