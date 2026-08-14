import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { User } from "./models/user.model.js";
import { Partner } from "./models/partner.model.js";
import { Expense } from "./models/expense.model.js";
import NepaliDateModule from "nepali-date-converter";
const NepaliDate = NepaliDateModule.default || NepaliDateModule;

dotenv.config();

const bsPartsFromToday = () => {
  const today = new NepaliDate();
  return {
    bsYear: today.getYear(),
    bsMonth: today.getMonth() + 1,
    bsDay: today.getDate(),
  };
};

const bsDateString = (year, month, day) => {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}/${m}/${d}`;
};

const seed = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Partner.deleteMany({}),
      Expense.deleteMany({}),
    ]);

    const { bsYear, bsMonth, bsDay } = bsPartsFromToday();
    console.log(`📅 Current BS month: ${bsYear}/${bsMonth}`);

    console.log("👤 Creating admin user...");
    const admin = await User.create({
      name: "Room Admin",
      email: "admin@room.local",
      phone: "9800000000",
      password: "Admin@1234",
      role: "admin",
    });

    console.log("🧑‍🤝‍🧑 Creating room partners...");
    const partnerData = [
      { name: "Sanikant Kushwaha", phone: "9811111111", email: "sanikant@example.com", bsJoiningDate: "2080/04/01" },
      { name: "Sushil Kushwaha", phone: "9822222222", email: "sushil@example.com", bsJoiningDate: "2080/04/02" },
      { name: "Narendra Kumar Shah Teli", phone: "9833333333", email: "narendra@example.com", bsJoiningDate: "2080/05/10" },
      { name: "Rupendra Yeadav", phone: "9844444444", email: "rupendra@example.com", bsJoiningDate: "2080/05/15" },
      { name: "Mandesh Yadav", phone: "9855555555", email: "mandesh@example.com", bsJoiningDate: "2080/06/01" },
    ];
    const partners = await Partner.insertMany(
      partnerData.map((p) => ({ ...p, status: "active", createdBy: admin._id }))
    );

    const [p1, p2, p3, p4] = partners;

    console.log("🧾 Creating sample expenses...");
    const allIds = partners.map((p) => p._id);

    const month = { bsYear, bsMonth };
    const prev = bsMonth === 1
      ? { bsYear: bsYear - 1, bsMonth: 12 }
      : { bsYear, bsMonth: bsMonth - 1 };

    const seedExpenses = (target, dayStart) => {
      const d1 = bsDateString(target.bsYear, target.bsMonth, dayStart);
      const d2 = bsDateString(target.bsYear, target.bsMonth, Math.min(dayStart + 2, 29));
      const d3 = bsDateString(target.bsYear, target.bsMonth, Math.min(dayStart + 5, 29));
      const d4 = bsDateString(target.bsYear, target.bsMonth, Math.min(dayStart + 8, 29));

      return [
        {
          title: "Monthly Grocery Run",
          amount: 5200.5,
          category: "primary",
          paidBy: p1._id,
          applicablePartners: allIds,
          excludedPartners: [],
          bsDate: d1,
          bsYear: target.bsYear,
          bsMonth: target.bsMonth,
          description: "Groceries for the shared kitchen",
          createdBy: admin._id,
        },
        {
          title: "Electricity Bill",
          amount: 1450.75,
          category: "primary",
          paidBy: p2._id,
          applicablePartners: allIds,
          excludedPartners: [],
          bsDate: d2,
          bsYear: target.bsYear,
          bsMonth: target.bsMonth,
          description: "NEA bill for the room",
          createdBy: admin._id,
        },
        {
          title: "Home Internet",
          amount: 1500,
          category: "primary",
          paidBy: p3._id,
          applicablePartners: allIds,
          excludedPartners: [],
          bsDate: d3,
          bsYear: target.bsYear,
          bsMonth: target.bsMonth,
          createdBy: admin._id,
        },
        {
          title: "Cleaning Supplies",
          amount: 800,
          category: "secondary",
          paidBy: p1._id,
          applicablePartners: [p1._id, p2._id],
          excludedPartners: [p3._id, p4._id],
          bsDate: d4,
          bsYear: target.bsYear,
          bsMonth: target.bsMonth,
          notes: "Shared between Sanikant and Sushil only",
          createdBy: admin._id,
        },
      ];
    };

    const currentExpenses = seedExpenses(month, Math.max(1, bsDay - 10));
    const previousExpenses = seedExpenses(prev, 5).slice(0, 2);

    await Expense.insertMany([...currentExpenses, ...previousExpenses]);

    console.log("✅ Seed complete!");
    console.log("----------------------------------------");
    console.log("Admin login: admin@room.local / Admin@1234");
    console.log("----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
