"use server";

import clientPromise, { isMockMode } from "@/lib/mongodb";
import { seedDatabase } from "@/lib/seed";
import { Order, MenuItem } from "@/types";
import { ObjectId } from "mongodb";

// Global cache for mock orders to persist across Hot Module Replacement (HMR) during local development
const globalWithMockOrders = global as typeof globalThis & {
  _mockOrders?: Order[];
};

if (!globalWithMockOrders._mockOrders) {
  globalWithMockOrders._mockOrders = [];
}

const mockOrders = globalWithMockOrders._mockOrders;

/**
 * Fetch all available menu items (Seeds automatically if collection is empty)
 */
export async function getMenuItemsAction(): Promise<MenuItem[]> {
  try {
    return await seedDatabase();
  } catch (error) {
    console.error("Error in getMenuItemsAction Server Action:", error);
    // Absolute fallback in case of errors
    const { mockMenuItems } = await import("@/lib/seed");
    return mockMenuItems;
  }
}

/**
 * Place a new restaurant booking order
 */
export async function placeOrderAction(orderData: {
  tableId: string;
  items: any[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const newOrder: Order = {
      tableId: orderData.tableId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      serviceCharge: orderData.serviceCharge,
      total: orderData.total,
      status: "pending", // pending -> cooking -> served -> completed
      paymentStatus: "unpaid",
      createdAt: new Date(),
    };

    if (isMockMode || !clientPromise) {
      // Running in Mock Mode - persist to global memory
      const generatedId = "mock_" + Math.random().toString(36).substring(2, 9);
      const savedOrder = { ...newOrder, _id: generatedId };
      mockOrders.push(savedOrder);
      
      console.log(`📝 [Mock Mode] Placed Order ${generatedId} for Table ${orderData.tableId}`);
      return { success: true, orderId: generatedId };
    }

    // Connect to Atlas
    const client = await clientPromise;
    const db = client.db("restoicc");
    // Omit string _id so MongoDB generates its own ObjectId
    const { _id, ...orderToInsert } = newOrder;
    const result = await db.collection("orders").insertOne(orderToInsert);

    console.log(`🔋 [DB Mode] Placed Order ${result.insertedId.toString()} for Table ${orderData.tableId}`);
    return { success: true, orderId: result.insertedId.toString() };
  } catch (error: any) {
    console.error("Error placing order:", error);
    return { success: false, error: error.message || "Failed to submit order." };
  }
}

/**
 * Fetch a single order's details and real-time status
 */
export async function getOrderAction(orderId: string): Promise<Order | null> {
  try {
    if (isMockMode || !clientPromise || orderId.startsWith("mock_")) {
      const order = mockOrders.find((o) => o._id === orderId);
      return order ? JSON.parse(JSON.stringify(order)) : null;
    }

    const client = await clientPromise;
    const db = client.db("restoicc");
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

    if (!order) return null;

    // Convert MongoDB ObjectId to string for safe rendering in client components
    return {
      ...order,
      _id: order._id.toString(),
    } as unknown as Order;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return null;
  }
}

/**
 * Handle mockup payment settlement for order checkout confirmation
 */
export async function payOrderAction(
  orderId: string,
  paymentMethod: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isMockMode || !clientPromise || orderId.startsWith("mock_")) {
      const orderIndex = mockOrders.findIndex((o) => o._id === orderId);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].paymentStatus = "paid";
        mockOrders[orderIndex].paymentMethod = paymentMethod;
        mockOrders[orderIndex].status = "cooking"; // Order starts cooking after paid or checked out
        return { success: true };
      }
      return { success: false, error: "Order not found." };
    }

    const client = await clientPromise;
    const db = client.db("restoicc");
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: "paid",
          paymentMethod: paymentMethod,
          status: "cooking",
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Order not found." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error paying order:", error);
    return { success: false, error: error.message || "Payment process failed." };
  }
}
