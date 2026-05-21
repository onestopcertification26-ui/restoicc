export interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string; // 'mains' | 'appetizers' | 'drinks' | 'desserts'
  badge?: string;    // 'Best Seller' | 'Chef Special' | 'Spicy' | 'New'
  visualGradient: string; // Beautiful gradients in place of placeholder images
  available: boolean;
  imageUrl?: string; // thumbnail image URL
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id?: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  status: 'pending' | 'cooking' | 'served' | 'completed';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: string;
  createdAt: Date;
}
