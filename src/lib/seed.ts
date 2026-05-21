import clientPromise, { isMockMode } from "./mongodb";
import { MenuItem } from "@/types";

export const mockMenuItems: MenuItem[] = [
  {
    name: "Wagyu Beef Burger",
    description: "A juicy 200g Wagyu beef patty, toasted brioche bun, sharp cheddar, caramelized onions, smoked beef bacon, and signature house burger sauce.",
    price: 185000,
    category: "mains",
    badge: "Best Seller",
    visualGradient: "linear-gradient(135deg, #4b1212, #1b0505)",
    available: true,
  },
  {
    name: "Signature Grilled Ribeye",
    description: "300g premium USDA choice ribeye steak grilled to order, served with buttery mashed potatoes, seasonal vegetables, and creamy peppercorn sauce.",
    price: 345000,
    category: "mains",
    badge: "Chef Special",
    visualGradient: "linear-gradient(135deg, #2c3e50, #000000)",
    available: true,
  },
  {
    name: "Fettuccine Truffle Carbonara",
    description: "Al dente fettuccine tossed in a rich, creamy carbonara sauce with crispy pancetta, wild mushrooms, parmesan cheese, and truffle essence.",
    price: 145000,
    category: "mains",
    badge: "Spicy",
    visualGradient: "linear-gradient(135deg, #4338ca, #1e1b4b)",
    available: true,
  },
  {
    name: "Truffle Parmesan Fries",
    description: "Golden crispy shoestring potatoes tossed in premium black truffle oil and freshly grated parmesan, served with garlic aioli.",
    price: 75000,
    category: "appetizers",
    badge: "Best Seller",
    visualGradient: "linear-gradient(135deg, #b45309, #451a03)",
    available: true,
  },
  {
    name: "Crispy Calamari Rings",
    description: "Tender calamari rings dusted in seasoned flour, fried to golden perfection, served with spicy marinara and fresh lemon wedge.",
    price: 85000,
    category: "appetizers",
    badge: "New",
    visualGradient: "linear-gradient(135deg, #0369a1, #082f49)",
    available: true,
  },
  {
    name: "Luxe Matcha Latte",
    description: "Ceremonial grade Japanese matcha whisked with velvety steamed oat milk and sweetened with organic blue agave.",
    price: 55000,
    category: "drinks",
    badge: "New",
    visualGradient: "linear-gradient(135deg, #065f46, #022c22)",
    available: true,
  },
  {
    name: "Smoked Rosemary Lemonade",
    description: "Freshly squeezed lemons blended with sparkling mineral water and raw cane sugar, cold-infused with rosemary woodsmoke.",
    price: 48000,
    category: "drinks",
    badge: "Best Seller",
    visualGradient: "linear-gradient(135deg, #ca8a04, #451a03)",
    available: true,
  },
  {
    name: "Salted Caramel Lava Cake",
    description: "Warm dark chocolate cake with a molten salted caramel core, served with a scoop of Madagascar vanilla bean gelato.",
    price: 68000,
    category: "desserts",
    badge: "Best Seller",
    visualGradient: "linear-gradient(135deg, #be123c, #4c0519)",
    available: true,
  },
  {
    name: "Premium Cocoa Tiramisu",
    description: "Classic layers of espresso-soaked ladyfingers, velvety mascarpone cheese cream, and a rich dusting of premium dark cocoa powder.",
    price: 72000,
    category: "desserts",
    badge: "Chef Special",
    visualGradient: "linear-gradient(135deg, #78350f, #451a03)",
    available: true,
  },
];

// Seeder function
export async function seedDatabase() {
  if (isMockMode || !clientPromise) {
    return mockMenuItems;
  }

  try {
    const client = await clientPromise;
    const db = client.db("restoicc");
    const count = await db.collection("menu").countDocuments();

    if (count === 0) {
      console.log("🌱 Database is empty. Seeding premium menu items...");
      // Cast to any to bypass string vs ObjectId conflict in MenuItem._id
      await (db.collection("menu") as any).insertMany(mockMenuItems);
      console.log("✅ Seeded menu items successfully.");
    }
    
    const items = await db.collection("menu").find({}).toArray();
    return items.map(item => ({
      ...item,
      _id: item._id.toString()
    })) as unknown as MenuItem[];
  } catch (error) {
    console.error("❌ Failed to connect/seed database. Falling back to Mock data.", error);
    return mockMenuItems;
  }
}
