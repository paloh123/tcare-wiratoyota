const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const pricingData = [
  { type: "CAMRY", prices: [233100, 1355976, 1412475, 1355976, 1638471, 1355976, 1412475] },
  { type: "C-HR", prices: [233100, 1392384, 1442112, 1392384, 1591296, 1392384, 1442112] },
  { type: "COROLLA", prices: [233100, 1193472, 1243200, 1193472, 1442112, 1193472, 1243200] },
  { type: "COROLLA CROSS", prices: [233100, 845376, 1143744, 845376, 1392384, 845376, 1143744] },
  { type: "CROWN", prices: [233100, 1525473, 1581972, 1525473, 1694970, 1525473, 1581972] },
  { type: "DYNA", prices: [233100, 825507, 1160172, 825507, 1204794, 825507, 1160172] },
  { type: "ETIOS", prices: [233100, 564102, 572649, 564102, 675213, 564102, 572649] },
  { type: "FJ - CRUISER", prices: [233100, 1525473, 1864467, 1525473, 2146962, 1525473, 1864467] },
  { type: "FORTUNER", prices: [233100, 1392384, 1392384, 1392384, 1790208, 1392384, 1392384] },
  { type: "FT 86", prices: [233100, 2203461, 2259960, 2203461, 2542455, 2203461, 2259960] },
  { type: "GR Corolla", prices: [233100, 1016982, 1638471, 1016982, 1977465, 1016982, 1638471] },
  { type: "GR Yaris", prices: [233100, 1016982, 1638471, 1016982, 1977465, 1016982, 1638471] },
  { type: "HARRIER", prices: [233100, 1525473, 1864467, 1525473, 2146962, 1525473, 1864467] },
  { type: "HI-ACE", prices: [233100, 1219779, 1219779, 1219779, 1483515, 1219779, 1219779] },
  { type: "HILUX", prices: [233100, 923076, 923076, 923076, 1186812, 923076, 923076] },
  { type: "HILUX RANGGA", prices: [233100, 624708, 624708, 624708, 803196, 624708, 624708] },
  { type: "INNOVA", prices: [233100, 824175, 956043, 824175, 1021977, 824175, 956043] },
  { type: "INNOVA ZENIX", prices: [233100, 857142, 923076, 857142, 989010, 857142, 923076] },
  { type: "LAND CRUISER", prices: [233100, 3344652, 4087908, 3344652, 4707288, 3344652, 4087908] },
  { type: "LAND CRUISER 200", prices: [233100, 1525473, 1864467, 1525473, 2146962, 1525473, 1864467] },
  { type: "LAND CRUISER 300", prices: [233100, 1242978, 1299477, 1242978, 1638471, 1242978, 1299477] },
  { type: "MARK - X", prices: [233100, 1355976, 1581972, 1355976, 1751469, 1355976, 1581972] },
  { type: "NAV1", prices: [233100, 1392384, 1392384, 1392384, 1541568, 1392384, 1392384] },
  { type: "PRIUS", prices: [233100, 1242978, 1525473, 1242978, 2146962, 1242978, 1525473] },
  { type: "RAIZE", prices: [233100, 564102, 564102, 564102, 666666, 564102, 564102] },
  { type: "RAV4", prices: [233100, 960483, 1242978, 960483, 1751469, 960483, 1242978] },
  { type: "RUSH", prices: [233100, 538461, 564102, 538461, 717948, 538461, 564102] },
  { type: "SIENTA", prices: [233100, 725274, 758241, 725274, 890109, 725274, 758241] },
  { type: "SUPRA", prices: [233100, 903984, 960483, 1073481, 1468974, 1073481, 960483] },
  { type: "VELLFIRE", prices: [233100, 1581972, 1581972, 1581972, 1751469, 1581972, 1581972] },
  { type: "VIOS", prices: [233100, 791208, 824175, 791208, 956043, 791208, 824175] },
  { type: "VOXY", prices: [233100, 1392384, 1392384, 1392384, 1541568, 1392384, 1392384] },
  { type: "YARIS", prices: [233100, 725274, 725274, 725274, 857142, 725274, 725274] },
  { type: "YARIS CROSS", prices: [233100, 824175, 857142, 824175, 989010, 824175, 857142] }
];

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const smPassword = await bcrypt.hash("sm123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const serviceManager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      username: "manager",
      password: smPassword,
      role: "SERVICE_MANAGER",
    },
  });

  console.log("Seeding pricing matrix...");
  for (const car of pricingData) {
    await prisma.price.upsert({
      where: {
        category_type: {
          category: "LABOUR",
          type: car.type
        }
      },
      update: {
        month_1: car.prices[0],
        month_6: car.prices[1],
        month_12: car.prices[2],
        month_18: car.prices[3],
        month_24: car.prices[4],
        month_30: car.prices[5],
        month_36: car.prices[6],
      },
      create: {
        category: "LABOUR",
        type: car.type,
        month_1: car.prices[0],
        month_6: car.prices[1],
        month_12: car.prices[2],
        month_18: car.prices[3],
        month_24: car.prices[4],
        month_30: car.prices[5],
        month_36: car.prices[6],
      }
    });
  }

  console.log("Seed complete. Default users:");
  console.log(`Admin - Username: admin, Password: admin123`);
  console.log(`Service Manager - Username: manager, Password: sm123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

